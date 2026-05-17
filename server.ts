import express from "express";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { DisregardLabel, UserRole, DifficultyLevel } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "flits-secret-key-2024";

app.use(cors());
app.use(express.json());

// --- Database Schemas ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
});

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const questionSchema = new mongoose.Schema({
  topic: { type: String, enum: ['HTML', 'CSS', 'JavaScript'], required: true },
  level: { type: Number, required: true },
  difficulty: { type: String, enum: Object.values(DifficultyLevel), required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  template: { type: String, required: true },
  solution: { type: String, required: true },
  hint: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  expectedOutputHtml: { type: String },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: String, required: true },
  attemptsCount: { type: Number, required: true },
  label: { type: String, required: true },
  reason: { type: String },
  sentiment: { type: String },
  reflection: { type: String },
  assessmentType: { type: String, enum: ['formative', 'summative', 'standard'], default: 'standard' },
  score: { type: Number },
  totalPoints: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['formative', 'summative'], required: true },
  moduleId: { type: String, required: true },
  topic: { type: String, enum: ['HTML', 'CSS', 'JavaScript'], required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Section = mongoose.model("Section", sectionSchema);
const Question = mongoose.model("Question", questionSchema);
const Progress = mongoose.model("Progress", progressSchema);
const Assessment = mongoose.model("Assessment", assessmentSchema);

// --- MongoDB Connection ---
let cachedConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined.");
  }

  try {
    const opts = {
      bufferCommands: false, // Don't hang if connection isn't ready
      serverSelectionTimeoutMS: 15000, 
      heartbeatFrequencyMS: 10000,
    };
    cachedConnection = await mongoose.connect(mongoUri, opts);
    console.log("Connected to MongoDB via Mongoose (No Buffering)");
    return cachedConnection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

// Initial connection
async function seedDatabase() {
  try {
    const count = await Question.countDocuments();
    if (count === 0) {
      console.log("No questions found in DB. Seeding initial data...");
      await Question.insertMany(SEED_QUESTIONS.map(q => {
        const { id, ...rest } = q;
        return { ...rest };
      }));
      console.log("Database seeded successfully!");
    }
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

if (!process.env.VERCEL && process.env.MONGODB_URI) {
  connectToDatabase().then(() => {
    seedDatabase();
  });
}

const checkDbConnection = async (req: any, res: any, next: any) => {
  try {
    // If connecting, wait up to 8 seconds
    if (mongoose.connection.readyState === 2) {
      console.log("Database connection in progress (state 2). Waiting...");
      for (let i = 0; i < 16; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if ((mongoose.connection.readyState as any) === 1) break;
      }
    }

    const connected = mongoose.connection.readyState === 1;
    if (!connected) {
      if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
        console.log("Database disconnected or disconnecting. Reconnecting...");
        await connectToDatabase();
      }
    }
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: "Database is warming up (State: " + mongoose.connection.readyState + "). Please try again in a few moments.",
        state: mongoose.connection.readyState,
        retryAfter: 3
      });
    }
    next();
  } catch (err: any) {
    console.error("Critical database error in middleware:", err);
    return res.status(500).json({ 
      error: "Critical Database Error. Check MONGODB_URI.",
      details: err.message 
    });
  }
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- AI Client ---
let groq: Groq | null = null;
function getGroq(): Groq {
  if (groq) return groq;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing.");
  groq = new Groq({ apiKey });
  return groq;
}

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    database: mongoose.connection.readyState === 1 ? "connected" : "connecting/disconnected",
    dbState: mongoose.connection.readyState,
    uptime: process.uptime()
  });
});

// Auth Routes
app.post("/api/auth/register", checkDbConnection, async (req, res) => {
  try {
    const { email, password, name, role, sectionId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Fix: Remove sectionId if it's an empty string to avoid Mongoose casting errors
    const userData: any = { 
      email, 
      password: hashedPassword, 
      name, 
      role 
    };
    
    if (sectionId && sectionId.trim() !== "") {
      userData.sectionId = sectionId;
    }

    const user = new User(userData);
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", checkDbConnection, async (req, res) => {
  console.log(`Login attempt for: ${req.body?.email}`);
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Login failed: Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: User not found - ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Incorrect password for - ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email, name: user.name }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log(`Login success: ${email}`);
    res.json({ token, user: { id: user._id, role: user.role, name: user.name, email: user.email, sectionId: user.sectionId } });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error: " + err.message });
  }
});

// User Info
app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Sections
app.get("/api/sections", async (req, res) => {
  try {
    const sections = await Section.find().populate("teacherId", "name email");
    res.json(sections);
  } catch (err: any) {
    console.error("Error fetching sections:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/teachers", authenticateToken, async (req: any, res) => {
  if (req.user.role !== UserRole.ADMIN) return res.sendStatus(403);
  try {
    const teachers = await User.find({ role: UserRole.TEACHER }).select("name email _id");
    res.json(teachers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/sections/:id", authenticateToken, async (req: any, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ error: "Section not found" });

    // Admin can update anything. Teacher can only update their own section (or take over if unassigned?)
    // User requested teachers can assign sections to themselves.
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.TEACHER) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (req.body.name) section.name = req.body.name;
    if (req.body.teacherId) section.teacherId = req.body.teacherId;

    await section.save();
    res.json(section);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/sections", authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== UserRole.TEACHER && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: "Access denied. Only teachers and admins can create sections." });
    }
    const section = new Section({ 
      name: req.body.name, 
      teacherId: req.user.id 
    });
    await section.save();
    console.log("Section created:", section.name, "by", req.user.name);
    res.status(201).json(section);
  } catch (err: any) {
    console.error("Error creating section:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/sections/:id", authenticateToken, async (req: any, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ error: "Section not found" });
    
    // Only teacher who created it or admin can delete
    if (section.teacherId.toString() !== req.user.id && req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    await Section.findByIdAndDelete(req.params.id);
    res.json({ message: "Section deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Questions
app.get("/api/exercises", checkDbConnection, async (req, res) => {
  try {
    const questions = await Question.find().populate("authorId", "name role").lean();
    console.log(`Fetched ${questions.length} questions from DB`);
    
    // Always include seed questions if DB is totally empty for some reason, 
    // or as a safety fallback handled by lean mapping
    if (questions.length === 0) {
      return res.json(SEED_QUESTIONS.map(q => ({ ...q, _id: q.id })));
    }
    res.json(questions);
  } catch (err: any) {
    console.error("Error fetching exercises:", err);
    // Explicitly return seed data if fetching fails but we want the app to work
    res.json(SEED_QUESTIONS.map(q => ({ ...q, _id: q.id })));
  }
});

app.post("/api/exercises", authenticateToken, async (req: any, res) => {
  if (req.user.role !== UserRole.TEACHER && req.user.role !== UserRole.ADMIN) return res.sendStatus(403);
  const question = new Question({ ...req.body, authorId: req.user.id });
  await question.save();
  res.status(201).json(question);
});

// Analytics and Progress
app.get("/api/progress/me", authenticateToken, async (req: any, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id });
    res.json(progress);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Assessment Routes
app.get("/api/assessments", authenticateToken, async (req: any, res) => {
  try {
    const { moduleId, topic, type } = req.query;
    const query: any = {};
    if (moduleId) query.moduleId = moduleId;
    if (topic) query.topic = topic;
    if (type) query.type = type;
    const assessments = await Assessment.find(query).populate("questionIds").populate("authorId", "name");
    res.json(assessments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/assessments", authenticateToken, async (req: any, res) => {
  if (req.user.role !== UserRole.TEACHER && req.user.role !== UserRole.ADMIN) return res.sendStatus(403);
  try {
    const assessment = new Assessment({ 
      ...req.body, 
      authorId: req.user.id 
    });
    await assessment.save();
    res.status(201).json(assessment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher Analytics
app.get("/api/analytics/section/:sectionId", authenticateToken, async (req: any, res) => {
  if (req.user.role !== UserRole.TEACHER && req.user.role !== UserRole.ADMIN) return res.sendStatus(403);
  const students = await User.find({ sectionId: req.params.sectionId, role: UserRole.STUDENT });
  const studentIds = students.map(s => s._id);
  const progression = await Progress.find({ userId: { $in: studentIds } }).populate("userId", "name email");
  res.json({ students, progression });
});

// Student Progress
app.post("/api/adaptive/analyze", authenticateToken, async (req: any, res) => {
  try {
    const { reflection, attempts, feedbackLogs, exerciseId, assessmentType, score, totalPoints } = req.body;
    
    // Rule-based classification (reused from previous version)
    const ruleResult = detectDisregard(attempts || [], feedbackLogs || []);
    
    // NLP Analysis
    let nlpResult = { sentiment: "unknown", human_like_mentoring: "Keep trying!", pedagogical_nudge: "" };
    try {
      const groqClient = getGroq();
      const nlpPrompt = `
        Analyze student reflection: "${reflection}"
        Rule Classification: ${ruleResult.label}
        Return JSON: { "sentiment": "...", "human_like_mentoring": "...", "pedagogical_nudge": "..." }
      `;
      const completion = await groqClient.chat.completions.create({
        messages: [{ role: "user", content: nlpPrompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
      });
      nlpResult = JSON.parse(completion.choices[0].message.content || "{}");
    } catch (e) {
      console.warn("AI Analysis skipped or failed", e.message);
    }

    const finalResponse = {
      label: ruleResult.label,
      reason: ruleResult.reason,
      feedback: nlpResult.human_like_mentoring,
      suggestedAction: ruleResult.label === DisregardLabel.APPLY ? 'next' : 'retry'
    };

    // Save to DB
    const progress = new Progress({
      userId: req.user.id,
      exerciseId,
      attemptsCount: attempts.length,
      label: ruleResult.label,
      reason: ruleResult.reason,
      sentiment: nlpResult.sentiment,
      reflection,
      assessmentType: assessmentType || 'standard',
      score,
      totalPoints
    });
    await progress.save();

    res.json(finalResponse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all for /api/ routes to ensure JSON response
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found on this server.` });
});

// Helper for detection
function detectDisregard(attempts: any[], feedbackLogs: any[]) {
  if (attempts.length === 0) return { label: DisregardLabel.IDLE, reason: "No attempts yet." };
  
  const last = attempts[attempts.length - 1];
  
  // High priority: If it's correct, they applied something (even if internally)
  if (last.isCorrect) return { label: DisregardLabel.APPLY, reason: "Success! Logic applied correctly." };

  if (attempts.length < 2) return { label: DisregardLabel.IDLE, reason: "Initial attempt." };
  
  const prev = attempts[attempts.length - 2];
  if (last.timeSinceLastFeedback && last.timeSinceLastFeedback > 300) return { label: DisregardLabel.DELAY, reason: "Inactivity." };
  if (last.code === prev.code) return { label: DisregardLabel.IGNORE, reason: "Identical submission." };
  if (!last.isCorrect && last.code !== prev.code) return { label: DisregardLabel.MISUNDERSTAND, reason: "Core issue not addressed." };
  
  return { label: DisregardLabel.IDLE, reason: "No pattern detected." };
}

const SEED_QUESTIONS = [
  {
    id: "html-1",
    topic: "HTML",
    level: 1,
    difficulty: DifficultyLevel.EASY,
    title: "Portfolio Header Structure",
    description: "Welcome to your first task! You need to establish the basic heading structure for a portfolio page. Create a main heading (H1) with the text 'Portfolio' and a secondary heading (H2) for 'About Me'. This provides the semantic hierarchy needed for screen readers and search engines.",
    template: "<!-- Write your <h1> and <h2> headers here -->\n",
    solution: "<h1>Portfolio</h1>\n<h2>About Me</h2>",
    hint: "Use the <h1> tag for your primary title and <h2> for the section subheading.",
    expectedOutput: "A main heading (H1) 'Portfolio' and a sub-heading (H2) 'About Me'.",
    expectedOutputHtml: "<div class='text-center border-b pb-4 mb-4'><h1 class='text-3xl font-black text-gray-900 mb-2'>Portfolio</h1><h2 class='text-xl font-bold text-blue-600'>About Me</h2></div>"
  },
  {
    id: "html-2",
    topic: "HTML",
    level: 1,
    difficulty: DifficultyLevel.EASY,
    title: "Lists and Links",
    description: "Every portfolio needs links! Create an unordered list (<ul>) with two list items (<li>). Each item should contain an anchor tag (<a>). Link the first one to '#' with text 'Projects' and the second to '#' with text 'Contact'.",
    template: "<ul>\n  <!-- Add your list items and links here -->\n</ul>",
    solution: "<ul>\n  <li><a href=\"#\">Projects</a></li>\n  <li><a href=\"#\">Contact</a></li>\n</ul>",
    hint: "Nest <a> tags inside <li> tags, and use the <ul> container.",
    expectedOutput: "An unordered list with two links: Projects and Contact.",
    expectedOutputHtml: "<ul class='flex gap-4 justify-center py-4 text-blue-500 font-bold'><li><a href='#'>Projects</a></li><li><a href='#'>Contact</a></li></ul>"
  },
  {
    id: "html-3",
    topic: "HTML",
    level: 2,
    difficulty: DifficultyLevel.EASY,
    title: "HTML Formatting",
    description: "Use the <strong> tag to create a simple bolded element. This helps emphasize important keywords for both users and search engines.",
    template: "<!-- Wrap important text in strong tags -->\n",
    solution: "<strong>",
    hint: "The <strong> tag is used specifically for strong importance.",
    expectedOutput: "A strong element.",
    expectedOutputHtml: "<div class='text-center py-4'><strong class='text-xl text-gray-800'>This is important!</strong></div>"
  }
];

// --- Vite Middleware ---
export async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback: ONLY if not on Vercel (Vercel uses vercel.json)
    if (!process.env.VERCEL) {
      app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    }
  }
  
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => console.log(`FIITS server running on port ${PORT}`));
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
