import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { DisregardLabel, UserRole, DifficultyLevel } from "./src/types";

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
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Section = mongoose.model("Section", sectionSchema);
const Question = mongoose.model("Question", questionSchema);
const Progress = mongoose.model("Progress", progressSchema);

// --- MongoDB Connection ---
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log("Connected to MongoDB Atlas via Mongoose"))
    .catch(err => {
      console.error("MongoDB connection error:", err);
      // In serverless, we might want to know if it failed
    });
} else {
  console.warn("MONGODB_URI not defined. File persistence disabled.");
}

const checkDbConnection = (req: any, res: any, next: any) => {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: "Database configuration error (MONGODB_URI missing). Please check your Vercel Environment Variables." });
    }
    return res.status(503).json({ error: "Database connecting... please try again in a moment." });
  }
  next();
};

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
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user._id, role: user.role, name: user.name, email: user.email, sectionId: user.sectionId } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
    const sections = await Section.find().populate("teacherId", "name");
    res.json(sections);
  } catch (err: any) {
    console.error("Error fetching sections:", err);
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
app.get("/api/exercises", async (req, res) => {
  const questions = await Question.find();
  // If no questions in DB, return default ones (optional migration)
  if (questions.length === 0) {
    // Seed logic could go here or just return a static list for now to avoid empty UI
    // For this POC, I'll return the hardcoded list if DB is empty
    return res.json(SEED_QUESTIONS);
  }
  res.json(questions);
});

app.post("/api/exercises", authenticateToken, async (req: any, res) => {
  if (req.user.role !== UserRole.TEACHER && req.user.role !== UserRole.ADMIN) return res.sendStatus(403);
  const question = new Question({ ...req.body, authorId: req.user.id });
  await question.save();
  res.status(201).json(question);
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
    const { reflection, attempts, feedbackLogs, exerciseId } = req.body;
    
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
      reflection
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
  if (attempts.length < 2) return { label: DisregardLabel.IDLE, reason: "Initial attempt" };
  const last = attempts[attempts.length - 1];
  const prev = attempts[attempts.length - 2];
  if (last.timeSinceLastFeedback && last.timeSinceLastFeedback > 300) return { label: DisregardLabel.DELAY, reason: "Inactivity." };
  if (last.code === prev.code) return { label: DisregardLabel.IGNORE, reason: "Identical submission." };
  if (!last.isCorrect && last.code !== prev.code) return { label: DisregardLabel.MISUNDERSTAND, reason: "Core issue not addressed." };
  if (last.isCorrect) return { label: DisregardLabel.APPLY, reason: "Feedback applied." };
  return { label: DisregardLabel.IDLE, reason: "No pattern." };
}

const SEED_QUESTIONS = [
  {
    id: "html-1",
    topic: "HTML",
    level: 1,
    difficulty: DifficultyLevel.EASY,
    title: "Document Headers",
    description: "Create a main heading (H1) for 'Portfolio' and a sub-heading (H2) for 'About Me'.",
    template: "<!-- Write your headers here -->",
    solution: "<h1>Portfolio</h1>\n<h2>About Me</h2>",
    hint: "Use <h1> and <h2> tags for primary and secondary headings.",
    expectedOutput: "A main heading (H1) 'Portfolio' and a sub-heading (H2) 'About Me'.",
    expectedOutputHtml: "<h1>Portfolio</h1>\n<h2>About Me</h2>"
  }
];

// --- Vite Middleware ---
export async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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
