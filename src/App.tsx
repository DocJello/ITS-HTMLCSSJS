import { useState, useEffect, useCallback, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import Editor from "@monaco-editor/react";
import { 
  BookOpen, 
  Code2, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  BrainCircuit, 
  ArrowRight,
  RefreshCcw,
  Sparkles,
  BarChart3,
  History,
  Info,
  Maximize2,
  Lock,
  LogOut,
  User as UserIcon,
  Users,
  PlusCircle,
  GraduationCap,
  Trash2,
  Check,
  ClipboardCheck
} from "lucide-react";
import { 
  ExerciseEntry, 
  DisregardLabel, 
  DetectionResult, 
  Attempt, 
  FeedbackLog, 
  User, 
  UserRole, 
  Section, 
  DifficultyLevel,
  Module,
  Submodule,
  Assessment
} from "./types";

const MODULES: Module[] = [
  {
    id: "m1",
    title: "HTML Introduction",
    topic: "HTML",
    submodules: [
      { 
        id: "m1-s1", 
        title: "Introduction", 
        content: "HTML (HyperText Markup Language) is the most basic building block of the Web. It defines the meaning and structure of web content.",
        videos: ["https://www.youtube.com/embed/kUMe1FH4CHE", "https://www.youtube.com/embed/ok-plXXHlWw"],
        link: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics"
      },
      { 
        id: "m1-s2", 
        title: "Getting Started", 
        content: "To get started with HTML, you only need a text editor and a web browser. Every HTML file must start with a <!DOCTYPE html> declaration.",
        videos: ["https://www.youtube.com/embed/vLnPwxZdW4Y", "https://www.youtube.com/embed/88PLf4-tpxU"],
        link: "https://www.w3schools.com/html/html_intro.asp"
      }
    ]
  },
  {
    id: "m2",
    title: "HTML Structure",
    topic: "HTML",
    submodules: [
      { id: "m2-s1", title: "Carriage returns and thematic break lines", content: "The <br> tag inserts a single line break. The <hr> tag defines a thematic break in an HTML page.", videos: [], link: "" },
      { id: "m2-s2", title: "Commenting", content: "HTML comments are not displayed by the browser, but they can help document your HTML source code.", videos: [], link: "" },
      { id: "m2-s3", title: "Special characters", content: "Special characters in HTML are represented using character entities like &nbsp; for space or &lt; for less than.", videos: [], link: "" }
    ]
  },
  {
    id: "m3",
    title: "HTML Connectivity",
    topic: "HTML",
    submodules: [
      { id: "m3-s1", title: "Hyperlinks", content: "HTML links are hyperlinks. You can click on a link and jump to another document.", videos: [], link: "" },
      { id: "m3-s2", title: "HTML elements (and their attributes)", content: "An HTML element is defined by a start tag, some content, and an end tag. Attributes provide additional information about elements.", videos: [], link: "" },
      { id: "m3-s3", title: "Browser feature detection", content: "Feature detection involves testing whether a browser supports a certain block of code, and running different code if it doesn't.", videos: [], link: "" }
    ]
  },
  {
    id: "m4",
    title: "CSS Fundamentals",
    topic: "CSS",
    submodules: [
      { id: "m4-s1", title: "Introduction", content: "CSS is the language we use to style an HTML document. CSS describes how HTML elements should be displayed.", videos: ["https://www.youtube.com/embed/1Rs2ND1RYYc"], link: "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps/What_is_CSS" }
    ]
  },
  {
    id: "m5",
    title: "CSS Selectors",
    topic: "CSS",
    submodules: [
      { id: "m5-s1", title: "Selectors", content: "CSS selectors are used to 'find' (or select) the HTML elements you want to style.", videos: ["https://www.youtube.com/embed/l1mER1ZHTn8"], link: "https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors" }
    ]
  },
  {
    id: "m6",
    title: "CSS Advanced",
    topic: "CSS",
    submodules: [
      { id: "m6-s1", title: "Hints and further information", content: "Deep dive into cascading, specificity, and the inheritance of styles.", videos: [], link: "" }
    ]
  },
  {
    id: "m7",
    title: "JavaScript Basics",
    topic: "JavaScript",
    submodules: [
      { id: "m7-s1", title: "Introduction", content: "JavaScript is the world's most popular programming language. It is the language of the Web.", videos: ["https://www.youtube.com/embed/W6NZfCO5SIk"], link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript" },
      { id: "m7-s2", title: "Variables", content: "Variables are containers for storing data (storing data values).", videos: ["https://www.youtube.com/embed/edWbHp_k_9Y"], link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Variables" },
      { id: "m7-s3", title: "Statements", content: "A computer program is a list of 'instructions' to be 'executed' by a computer. In a programming language, these programming instructions are called statements.", videos: [], link: "" }
    ]
  },
  {
    id: "m8",
    title: "JavaScript Logic",
    topic: "JavaScript",
    submodules: [
      { id: "m8-s1", title: "Functions", content: "A JavaScript function is a block of code designed to perform a particular task.", videos: [], link: "" },
      { id: "m8-s2", title: "Event handling", content: "HTML events are 'things' that happen to HTML elements. When JavaScript is used in HTML pages, JavaScript can 'react' on these events.", videos: [], link: "" }
    ]
  },
  {
    id: "m9",
    title: "JavaScript DOM",
    topic: "JavaScript",
    submodules: [
      { id: "m9-s1", title: "The Document Object Model (DOM)", content: "With the HTML DOM, JavaScript can access and change all the elements of an HTML document.", videos: ["https://www.youtube.com/embed/0ik6X4DJKCc"], link: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents" },
      { id: "m9-s2", title: "Miscellaneous", content: "Advanced JS concepts like closures, promises, and async/await.", videos: ["https://www.youtube.com/embed/H24Sipxv5nk"], link: "" }
    ]
  }
];

function Login({ onLogin }: { onLogin: (user: any, token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [sectionId, setSectionId] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<any>(null);

  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => setBackendStatus(data))
      .catch(err => console.error("Health check failed", err));

    fetch("/api/sections")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch sections");
        return res.json();
      })
      .then(data => {
        console.log("Sections fetched for login:", data);
        setSections(data || []);
      })
      .catch(err => {
        console.error("Section fetch error:", err);
        setError("Could not load sections. Please try again.");
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const url = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const body = isRegistering ? { email, password, name, role, sectionId } : { email, password };
    
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Action failed");
        
        if (isRegistering) {
          setIsRegistering(false);
          setError("Account created! Please login.");
        } else {
          onLogin(data.user, data.token);
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server returned non-JSON response (${res.status}). Check logs.`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linkedin-bg px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="bg-linkedin-blue p-2 rounded-xl shadow-lg">
            <BrainCircuit className="text-white" size={32} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-linkedin-blue tracking-tighter">FIITS</h1>
            {backendStatus && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${backendStatus.database === 'connected' ? 'bg-green-500' : 'bg-orange-500'}`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  API: {backendStatus.database === 'connected' ? 'Online' : 'DB Disconnected'}
                </span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-linkedin-blue"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-linkedin-blue"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-linkedin-blue"
            required
          />
          
          {isRegistering && (
            <div className="grid grid-cols-2 gap-4">
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-linkedin-blue"
              >
                <option value={UserRole.STUDENT}>Student</option>
                <option value={UserRole.TEACHER}>Teacher</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
              {role === UserRole.STUDENT && (
                <select 
                  value={sectionId} 
                  onChange={(e) => setSectionId(e.target.value)}
                  className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-linkedin-blue bg-white"
                  required={isRegistering}
                >
                  <option value="">Select Section</option>
                  {sections.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.teacherId?.name})</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {error && (
            <p className={`text-xs font-bold text-center ${error.includes("created") ? "text-green-500" : "text-red-500"}`}>
              {error}
            </p>
          )}

          <button type="submit" className="w-full bg-linkedin-blue text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95">
            {isRegistering ? "Create Account" : "Sign In"}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full mt-4 text-sm text-linkedin-text-muted hover:text-linkedin-blue transition-colors font-semibold"
        >
          {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </button>
      </motion.div>
    </div>
  );
}

function TeacherDashboard({ user, token }: { user: User, token: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<ExerciseEntry>>({
    topic: 'HTML',
    difficulty: DifficultyLevel.EASY,
    level: 1,
    title: '',
    description: '',
    template: '',
    solution: '',
    hint: '',
    expectedOutput: ''
  });

  const [teacherView, setTeacherView] = useState<"analytics" | "question_bank" | "all_sections" | "assessments">("analytics");
  const [allQuestions, setAllQuestions] = useState<ExerciseEntry[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    type: "formative" as "formative" | "summative",
    moduleId: MODULES[0].id,
    topic: MODULES[0].topic,
    questionIds: [] as string[]
  });

  useEffect(() => {
    fetch("/api/sections", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        console.log("Teacher dashboard sections:", data);
        setSections(data || []);
      })
      .catch(err => console.error("Teacher section fetch error:", err));

    fetch("/api/exercises")
      .then(res => res.json())
      .then(data => setAllQuestions(data))
      .catch(err => console.error("Exercises fetch error:", err));

    fetch("/api/assessments", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAssessments(data || []))
      .catch(err => console.error("Assessments fetch error:", err));
  }, [token, teacherView]);

  const toggleClaim = async (sectionId: string, currentTeacherId: string | null) => {
    const isClaiming = currentTeacherId !== user.id;
    if (isClaiming && currentTeacherId && !confirm("This section is already assigned to someone else. Do you want to take over?")) return;
    
    try {
      const res = await fetch(`/api/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ teacherId: isClaiming ? user.id : null })
      });
      if (res.ok) {
        const refreshRes = await fetch("/api/sections", { headers: { "Authorization": `Bearer ${token}` } });
        setSections(await refreshRes.json());
        alert(isClaiming ? "Section claimed!" : "Section released!");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  const loadAnalytics = (sectionId: string) => {
    setSelectedSection(sectionId);
    fetch(`/api/analytics/section/${sectionId}`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAnalytics(data));
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section? All student progress linked to it will remain but won't be easily accessible.")) return;
    try {
      const res = await fetch(`/api/sections/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const refreshRes = await fetch("/api/sections", { headers: { "Authorization": `Bearer ${token}` } });
        const data = await refreshRes.json();
        setSections(data || []);
        if (selectedSection === id) setSelectedSection(null);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to delete section");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const addQuestion = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newQuestion)
      });
      if (res.ok) {
        setShowCreateModal(false);
        const refreshRes = await fetch("/api/exercises");
        setAllQuestions(await refreshRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createAssessment = async (e: FormEvent) => {
    e.preventDefault();
    if (newAssessment.questionIds.length === 0) return alert("Select at least one question");
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newAssessment)
      });
      if (res.ok) {
        setShowAssessmentModal(false);
        setNewAssessment({ ...newAssessment, title: "", questionIds: [] });
        const refreshRes = await fetch("/api/assessments", { headers: { "Authorization": `Bearer ${token}` } });
        setAssessments(await refreshRes.json());
        alert("Assessment created successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleQuestionSelection = (qId: string) => {
    setNewAssessment(prev => ({
      ...prev,
      questionIds: prev.questionIds.includes(qId) 
        ? prev.questionIds.filter(id => id !== qId)
        : [...prev.questionIds, qId]
    }));
  };

  const addSection = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: newSectionName })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create section");
      }
      
      const refreshRes = await fetch("/api/sections", { headers: { "Authorization": `Bearer ${token}` } });
      const data = await refreshRes.json();
      console.log("Sections refreshed after addition:", data);
      setSections(data || []);
      setShowSectionModal(false);
      setNewSectionName("");
      alert("Section created successfully!");
    } catch (err: any) {
      console.error(err.message);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-[1128px] mx-auto px-4">
      {showSectionModal && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Create New Section</h2>
            <form onSubmit={addSection} className="space-y-4">
              <input 
                type="text" 
                placeholder="Section Name (e.g. CS101 - Fall 2024)" 
                className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-linkedin-blue"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                required
              />
              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 bg-linkedin-blue text-white py-2 rounded-full font-bold text-sm">Create</button>
                <button type="button" onClick={() => setShowSectionModal(false)} className="px-6 py-2 border rounded-full font-bold text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">Create New Exercise</h2>
            <form onSubmit={addQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={newQuestion.topic} 
                  onChange={(e) => setNewQuestion({...newQuestion, topic: e.target.value as any})}
                  className="p-3 border rounded-lg"
                >
                  <option value="HTML">HTML</option>
                  <option value="CSS">CSS</option>
                  <option value="JavaScript">JavaScript</option>
                </select>
                <select 
                  value={newQuestion.difficulty} 
                  onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value as any})}
                  className="p-3 border rounded-lg"
                >
                  <option value={DifficultyLevel.EASY}>Easy</option>
                  <option value={DifficultyLevel.MEDIUM}>Medium</option>
                  <option value={DifficultyLevel.HARD}>Hard</option>
                </select>
              </div>
              <input 
                type="text" 
                placeholder="Title" 
                className="w-full p-3 border rounded-lg"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                required
              />
              <textarea 
                placeholder="Description" 
                className="w-full p-3 border rounded-lg h-24"
                value={newQuestion.description}
                onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})}
                required
              />
              <textarea 
                placeholder="Template Code" 
                className="w-full p-3 border rounded-lg font-mono text-sm h-32"
                value={newQuestion.template}
                onChange={(e) => setNewQuestion({...newQuestion, template: e.target.value})}
                required
              />
              <textarea 
                placeholder="Target Solution Snippet" 
                className="w-full p-3 border rounded-lg font-mono text-sm h-24"
                value={newQuestion.solution}
                onChange={(e) => setNewQuestion({...newQuestion, solution: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Hint" 
                className="w-full p-3 border rounded-lg"
                value={newQuestion.hint}
                onChange={(e) => setNewQuestion({...newQuestion, hint: e.target.value})}
                required
              />
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-linkedin-blue text-white py-3 rounded-lg font-bold">Save Exercise</button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 border rounded-lg font-bold">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showAssessmentModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">Create Custom Assessment</h2>
            <form onSubmit={createAssessment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 pl-1">Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. HTML Quiz 1" 
                    className="w-full p-3 border rounded-lg"
                    value={newAssessment.title}
                    onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 pl-1">Type</label>
                  <select 
                    value={newAssessment.type} 
                    onChange={(e) => setNewAssessment({...newAssessment, type: e.target.value as any})}
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    <option value="formative">Formative (Pre-test)</option>
                    <option value="summative">Summative (Post-test)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 pl-1">Topic</label>
                  <select 
                    value={newAssessment.topic} 
                    onChange={(e) => setNewAssessment({...newAssessment, topic: e.target.value as any})}
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    <option value="HTML">HTML</option>
                    <option value="CSS">CSS</option>
                    <option value="JavaScript">JavaScript</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 pl-1">Module Alignment</label>
                  <select 
                    value={newAssessment.moduleId} 
                    onChange={(e) => setNewAssessment({...newAssessment, moduleId: e.target.value})}
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    {MODULES.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 pl-1 flex justify-between">
                  <span>Question Selection ({newAssessment.questionIds.length} selected)</span>
                  <span className="text-linkedin-blue">Filter: {newAssessment.topic}</span>
                </label>
                <div className="border border-linkedin-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {allQuestions.filter(q => q.topic === newAssessment.topic).map(q => (
                    <div 
                      key={(q as any)._id || q.id} 
                      onClick={() => toggleQuestionSelection((q as any)._id || q.id)}
                      className={`p-3 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${newAssessment.questionIds.includes((q as any)._id || q.id) ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{q.title}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">{q.difficulty}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${newAssessment.questionIds.includes((q as any)._id || q.id) ? 'bg-linkedin-blue border-linkedin-blue text-white' : 'border-gray-200'}`}>
                        {newAssessment.questionIds.includes((q as any)._id || q.id) && <Check size={14} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-linkedin-blue text-white py-3 rounded-lg font-bold shadow-md hover:bg-blue-700">Create Assessment</button>
                <button type="button" onClick={() => setShowAssessmentModal(false)} className="px-6 py-3 border rounded-lg font-bold text-gray-500">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-linkedin-border shadow-sm mb-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-linkedin-text-muted mb-4 flex items-center gap-2">
              <Code2 size={14} /> View mode
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setTeacherView("analytics")}
                className={`w-full text-left p-3 rounded-lg text-sm font-bold border transition-all ${teacherView === 'analytics' ? 'bg-blue-50 border-linkedin-blue text-linkedin-blue' : 'hover:bg-gray-50 border-transparent'}`}
              >
                Analytics
              </button>
              <button 
                onClick={() => setTeacherView("question_bank")}
                className={`w-full text-left p-3 rounded-lg text-sm font-bold border transition-all ${teacherView === 'question_bank' ? 'bg-blue-50 border-linkedin-blue text-linkedin-blue' : 'hover:bg-gray-50 border-transparent'}`}
              >
                Question Bank
              </button>
              <button 
                onClick={() => setTeacherView("all_sections")}
                className={`w-full text-left p-3 rounded-lg text-sm font-bold border transition-all ${teacherView === 'all_sections' ? 'bg-blue-50 border-linkedin-blue text-linkedin-blue' : 'hover:bg-gray-50 border-transparent'}`}
              >
                Browse Sections
              </button>
              <button 
                onClick={() => setTeacherView("assessments")}
                className={`w-full text-left p-3 rounded-lg text-sm font-bold border transition-all ${teacherView === 'assessments' ? 'bg-blue-50 border-linkedin-blue text-linkedin-blue' : 'hover:bg-gray-50 border-transparent'}`}
              >
                Assessments
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-linkedin-border shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest text-linkedin-text-muted mb-4 flex items-center gap-2">
              <Users size={14} /> My Sections
            </h3>
            <div className="space-y-2">
              {sections.map(s => (
                <div key={(s as any)._id || s.id} className="group relative">
                  <button 
                    onClick={() => loadAnalytics((s as any)._id || s.id)}
                    className={`w-full text-left p-3 pr-10 rounded-lg text-sm font-bold border transition-all ${selectedSection === ((s as any)._id || s.id) ? 'bg-blue-50 border-linkedin-blue text-linkedin-blue' : 'hover:bg-gray-50 border-transparent'}`}
                  >
                    {s.name}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSection((s as any)._id || s.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Section"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-linkedin-border shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-widest text-linkedin-text-muted mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><PlusCircle size={14} /> Creator Tools</span>
            </h3>
            <div className="space-y-2">
              <button onClick={() => setShowCreateModal(true)} className="w-full bg-linkedin-blue text-white py-2 rounded-lg font-bold text-xs shadow-md active:scale-95">Create New Question</button>
              <button onClick={() => setShowAssessmentModal(true)} className="w-full bg-blue-50 text-linkedin-blue border border-linkedin-blue py-2 rounded-lg font-bold text-xs shadow-sm active:scale-95">Create Assessment</button>
              <button onClick={() => setShowSectionModal(true)} className="w-full bg-white text-linkedin-blue border border-linkedin-blue py-2 rounded-lg font-bold text-xs shadow-sm active:scale-95">Add New Section</button>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-2 space-y-6">
          {teacherView === "assessments" ? (
            <div className="bg-white p-8 rounded-xl border border-linkedin-border shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black flex items-center gap-3">
                  <ClipboardCheck className="text-linkedin-blue" />
                  Custom Assessments ({assessments.length})
                </h2>
                <button onClick={() => setShowAssessmentModal(true)} className="bg-linkedin-blue text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                  New Assessment
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {assessments.map((a: any) => (
                  <div key={a._id} className="p-5 border border-linkedin-border rounded-lg hover:border-linkedin-blue transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase mr-2 ${a.type === 'formative' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                          {a.type}
                        </span>
                        <span className="text-[10px] font-bold text-linkedin-text-muted uppercase">{a.topic} • Module {a.moduleId}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">Created by {a.authorId?.name || "System"}</span>
                    </div>
                    <h3 className="text-sm font-black mb-2">{a.title}</h3>
                    <p className="text-[10px] text-linkedin-text-muted mb-4">{a.questionIds?.length || 0} Questions included</p>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[10px] font-black text-linkedin-blue uppercase">Edit</button>
                      <button className="text-[10px] font-black text-red-500 uppercase">Delete</button>
                    </div>
                  </div>
                ))}
                {assessments.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                    <History className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm font-bold text-gray-400">No custom assessments created yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : teacherView === "all_sections" ? (
             <div className="bg-white p-8 rounded-xl border border-linkedin-border shadow-sm">
               <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                 <GraduationCap className="text-linkedin-blue" />
                 Global Section List ({sections.length})
               </h2>
               <div className="grid grid-cols-1 gap-4">
                 {sections.map((s: any, i: number) => (
                   <div key={i} className="p-5 border border-linkedin-border rounded-lg flex items-center justify-between hover:border-linkedin-blue transition-all">
                     <div>
                       <h4 className="font-black text-sm">{s.name}</h4>
                       <p className="text-[10px] text-linkedin-text-muted mt-1 uppercase font-bold">
                         Managed by: <span className={s.teacherId?._id === user.id ? 'text-linkedin-blue' : ''}>{s.teacherId?.name || "Unassigned"}</span>
                       </p>
                     </div>
                     <button 
                       onClick={() => toggleClaim(s._id, s.teacherId?._id)}
                       className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                         s.teacherId?._id === user.id 
                           ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
                           : 'bg-blue-50 text-linkedin-blue border border-blue-100 hover:bg-blue-100'
                       }`}
                     >
                       {s.teacherId?._id === user.id ? 'Release Section' : s.teacherId ? 'Take Over' : 'Claim Section'}
                     </button>
                   </div>
                 ))}
               </div>
             </div>
          ) : teacherView === "question_bank" ? (
             <div className="bg-white p-8 rounded-xl border border-linkedin-border shadow-sm">
               <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                 <Code2 className="text-linkedin-blue" />
                 Question Bank <span className="text-linkedin-text-muted font-normal text-xs">({allQuestions.length} total curated items)</span>
               </h2>
               <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
                 {allQuestions.map((q: any, i: number) => (
                   <div key={i} className="p-4 border border-linkedin-border rounded-lg hover:border-linkedin-blue transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[10px] font-black bg-blue-50 text-linkedin-blue px-2 py-0.5 rounded mr-2 uppercase">{q.topic}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${q.difficulty === DifficultyLevel.HARD ? 'border-red-100 bg-red-50 text-red-600' : q.difficulty === DifficultyLevel.MEDIUM ? 'border-yellow-100 bg-yellow-50 text-yellow-600' : 'border-green-100 bg-green-50 text-green-600'}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${!q.authorId || q.authorId === 'admin' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-linkedin-blue border-blue-100'}`}>
                          {!q.authorId || q.authorId === 'admin' ? 'ADMIN' : (typeof q.authorId === 'object' ? q.authorId.name : 'TEACHER')}
                        </span>
                      </div>
                      <h4 className="font-black text-sm">{q.title}</h4>
                      <p className="text-xs text-linkedin-text-muted mt-1 line-clamp-1">{q.description}</p>
                   </div>
                 ))}
               </div>
             </div>
          ) : analytics ? (
            <div className="bg-white p-8 rounded-xl border border-linkedin-border shadow-sm">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                <BarChart3 className="text-linkedin-blue" />
                Section Performance: <span className="text-linkedin-blue">{sections.find(s => ((s as any)._id || s.id) === selectedSection)?.name}</span>
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Students</p>
                  <p className="text-2xl font-black">{analytics.students.length}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Avg Progression</p>
                  <p className="text-2xl font-black">{Math.round(analytics.progression.length / (analytics.students.length || 1))} pts</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-linkedin-text-muted font-black border-b border-linkedin-border uppercase tracking-widest">
                      <th className="p-4">Student</th>
                      <th className="p-4">Topic</th>
                      <th className="p-4">Behavior</th>
                      <th className="p-4">Attempts</th>
                      <th className="p-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.progression.map((p: any, i: number) => (
                      <tr key={i} className="border-b border-linkedin-border hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold">{p.userId?.name}</td>
                        <td className="p-4">{p.exerciseId}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-black text-[9px] border ${p.label === 'APPLY' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                            {p.label}
                          </span>
                        </td>
                        <td className="p-4 font-mono">{p.attemptsCount}</td>
                        <td className="p-4 text-gray-400">{new Date(p.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-20 rounded-xl border border-linkedin-border shadow-sm text-center">
              <GraduationCap size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Select a section to view analytics</h3>
            </div>
          )}
        </section>

        {/* Right Side Stats Container */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-linkedin-border shadow-sm border-t-4 border-t-linkedin-blue">
            <h3 className="font-black text-xs uppercase tracking-widest mb-4">My Contributor Stats</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-linkedin-text-muted uppercase">Authored Questions</span>
                  <span className="text-sm font-black text-linkedin-blue">
                    {allQuestions.filter(q => q.authorId?._id === user.id || q.authorId === user.id).length}
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-linkedin-blue h-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (allQuestions.filter(q => q.authorId?._id === user.id || q.authorId === user.id).length / 20) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-linkedin-text-muted uppercase">Section Reach</span>
                  <span className="text-sm font-black text-linkedin-blue">
                    {sections.filter(s => s.teacherId?._id === user.id || s.teacherId === user.id).length}
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-linkedin-blue h-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (sections.filter(s => s.teacherId?._id === user.id || s.teacherId === user.id).length / 10) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <p className="text-[9px] font-black text-linkedin-blue uppercase tracking-widest mb-1">Total Verified Students</p>
                <p className="text-2xl font-black text-linkedin-blue">
                   {analytics?.students?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-linkedin-border shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-yellow-500" />
                <h3 className="font-black text-xs uppercase tracking-widest text-black">Pedagogical Insights</h3>
             </div>
             <p className="text-xs leading-relaxed text-black font-semibold">
               Your authored questions are contributing to the global bank accessible by all students in the FIITS network.
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StudentModules({ user, token, onStartAssessment }: { user: User; token: string; onStartAssessment: (topic: string, type: 'formative' | 'summative', subId: string, customAssessment?: Assessment) => void }) {
  const [selectedSubmodule, setSelectedSubmodule] = useState<Submodule | null>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/progress/me", { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch("/api/assessments", { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ]).then(([progressData, assessmentData]) => {
      setProgress(progressData || []);
      setAssessments(assessmentData || []);
      setLoading(false);
    });
  }, [token]);

  const isCompleted = (submoduleId: string) => progress.some(p => p.exerciseId === submoduleId);
  const isModuleAssessPassed = (moduleId: string, type: string) => progress.some(p => p.exerciseId === `${moduleId}-${type}` && (p.label === 'APPLY' || p.label === 'Success'));

  const canAccessSubmodule = (moduleIdx: number, subIdx: number) => {
    if (moduleIdx === 0 && subIdx === 0) return true;
    
    let prevModuleIdx = moduleIdx;
    let prevSubIdx = subIdx - 1;
    
    if (prevSubIdx < 0) {
      // Check if previous module's summative assessment is passed
      return isModuleAssessPassed(MODULES[moduleIdx - 1].id, 'summative');
    }
    
    return isCompleted(MODULES[prevModuleIdx].submodules[prevSubIdx].id);
  };

  const markViewed = async (subId: string) => {
    if (isCompleted(subId)) return;
    try {
      await fetch("/api/adaptive/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          reflection: "Module content viewed.",
          attempts: [{ isCorrect: true, timestamp: new Date().toISOString() }],
          feedbackLogs: [],
          exerciseId: subId
        })
      });
      // Refresh progress
      const res = await fetch("/api/progress/me", { headers: { Authorization: `Bearer ${token}` } });
      setProgress(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Loading modules...</div>;

  return (
    <div className="max-w-[1128px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
      <div className="space-y-6">
        {selectedSubmodule ? (
          <div className="bg-white rounded-xl border border-linkedin-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-linkedin-border flex items-center justify-between">
              <button 
                onClick={() => setSelectedSubmodule(null)}
                className="text-xs font-bold text-linkedin-blue flex items-center gap-2 hover:underline"
              >
                <ArrowRight className="rotate-180" size={14} /> Back to Modules
              </button>
              <h2 className="text-sm font-black uppercase tracking-widest">{selectedSubmodule.title}</h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-xl font-bold mb-4">Topic Guide</h3>
                <p className="text-gray-600 leading-relaxed">{selectedSubmodule.content}</p>
              </div>

              {selectedSubmodule.videos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-linkedin-text-muted">Supplementary Tutorials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubmodule.videos.map((v, i) => (
                      <div key={i} className="aspect-video bg-black rounded-lg overflow-hidden border border-linkedin-border">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={v} 
                          title="YouTube video player" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmodule.link && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info className="text-linkedin-blue" size={20} />
                    <div>
                      <p className="text-xs font-bold text-linkedin-text">Curated Web Resource</p>
                      <p className="text-[10px] text-linkedin-text-muted">Detailed documentation for this module</p>
                    </div>
                  </div>
                  <a href={selectedSubmodule.link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-linkedin-blue text-[10px] font-bold rounded-full hover:bg-linkedin-blue hover:text-white transition-all">
                    View Resource
                  </a>
                </div>
              )}

              <div className="pt-8 border-t border-linkedin-border">
                 <button 
                  onClick={() => { markViewed(selectedSubmodule.id); setSelectedSubmodule(null); }}
                  className="w-full bg-linkedin-blue text-white py-3 rounded-lg font-bold text-sm shadow-md"
                 >
                   Complete & Move to Next
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-linkedin-border shadow-sm flex items-center gap-4">
               <div className="p-3 bg-linkedin-blue rounded-xl text-white">
                  <GraduationCap size={24} />
               </div>
               <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">Modules Overview</h2>
                  <p className="text-xs text-linkedin-text-muted font-bold">Access submodules sequentially to reach module assessments</p>
               </div>
            </div>

            {MODULES.map((m, mIdx) => {
              const allSubsViewed = m.submodules.every(s => isCompleted(s.id));
              const moduleUnlocked = mIdx === 0 || isModuleAssessPassed(MODULES[mIdx-1].id, 'summative');

              return (
                <div key={m.id} className={`bg-white rounded-xl border border-linkedin-border shadow-sm overflow-hidden ${!moduleUnlocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                  <div className="px-6 py-4 border-b border-linkedin-border bg-gray-50 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-linkedin-text flex items-center gap-2">
                      <span className="w-6 h-6 bg-linkedin-blue text-white rounded-full flex items-center justify-center text-[10px] font-black">{mIdx + 1}</span>
                      {m.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isModuleAssessPassed(m.id, 'summative') && <span className="text-[9px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100 uppercase">Passed</span>}
                      <span className="text-[10px] font-bold text-linkedin-text-muted">{m.topic}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {m.submodules.map((s, sIdx) => {
                      const accessible = canAccessSubmodule(mIdx, sIdx);
                      const completed = isCompleted(s.id);
                      return (
                        <div key={s.id} className={`p-4 flex items-center justify-between transition-colors ${accessible ? 'hover:bg-blue-50/30' : 'opacity-60'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${completed ? 'bg-green-100 text-green-600' : accessible ? 'bg-blue-50 text-linkedin-blue' : 'bg-gray-100 text-gray-400'}`}>
                              {completed ? <CheckCircle2 size={16} /> : accessible ? <BookOpen size={16} /> : <Lock size={16} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-linkedin-text">{s.title}</p>
                              <p className="text-[10px] text-linkedin-text-muted">Part {sIdx + 1}</p>
                            </div>
                          </div>
                          <button 
                            disabled={!accessible}
                            onClick={() => setSelectedSubmodule(s)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                              accessible 
                                ? 'border-linkedin-blue text-linkedin-blue hover:bg-linkedin-blue hover:text-white' 
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {completed ? 'Review' : 'Start'}
                          </button>
                        </div>
                      );
                    })}

                    {/* Module Assessments Footer */}
                    <div className={`px-6 py-4 bg-gray-50 flex gap-4 transition-all ${allSubsViewed ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                      <button 
                        onClick={() => {
                          const custom = assessments.find(a => a.moduleId === m.id && a.topic === m.topic && a.type === 'formative');
                          onStartAssessment(m.topic, 'formative', m.id, custom);
                        }}
                        className={`flex-1 py-2 rounded-lg border font-black text-[10px] uppercase tracking-widest transition-all ${isModuleAssessPassed(m.id, 'formative') ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-linkedin-border text-linkedin-text hover:border-linkedin-blue'}`}
                      >
                        {isModuleAssessPassed(m.id, 'formative') ? 'Formative Passed' : assessments.some(a => a.moduleId === m.id && a.type === 'formative') ? 'Start Custom Formative' : 'Start Formative (Pre-test)'}
                      </button>
                      <button 
                        onClick={() => {
                          const custom = assessments.find(a => a.moduleId === m.id && a.topic === m.topic && a.type === 'summative');
                          onStartAssessment(m.topic, 'summative', m.id, custom);
                        }}
                        className={`flex-1 py-2 rounded-lg border font-black text-[10px] uppercase tracking-widest transition-all ${isModuleAssessPassed(m.id, 'summative') ? 'bg-green-50 border-green-200 text-green-600' : 'bg-linkedin-blue border-linkedin-blue text-white hover:bg-blue-800'}`}
                      >
                        {isModuleAssessPassed(m.id, 'summative') ? 'Summative Passed' : assessments.some(a => a.moduleId === m.id && a.type === 'summative') ? 'Start Custom Summative' : 'Start Summative (Post-test)'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-linkedin-border shadow-sm text-center">
           <div className="w-20 h-20 bg-linkedin-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-linkedin-blue/20">
              <Sparkles className="text-linkedin-blue" size={32} />
           </div>
           <h4 className="font-black text-sm uppercase tracking-tight">Your Progress</h4>
           <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>COMPLETION</span>
                  <span>{Math.round((progress.length / MODULES.reduce((acc, m) => acc + m.submodules.length, 0)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                   <div 
                    className="bg-linkedin-blue h-full transition-all duration-1000" 
                    style={{ width: `${(progress.length / MODULES.reduce((acc, m) => acc + m.submodules.length, 0)) * 100}%` }}
                   />
                </div>
              </div>
              <p className="text-[10px] text-linkedin-text-muted font-medium italic">
                "Small steps lead to mastery. Keep pushing your boundaries!"
              </p>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-linkedin-border shadow-sm">
           <h4 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
             <History size={14} /> Recent Footprints
           </h4>
           <div className="space-y-3">
              {progress.slice(-3).reverse().map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-linkedin-blue" />
                   <p className="text-[10px] font-bold text-linkedin-text truncate capitalize">{p.exerciseId.replace(/-/g, ' ')}</p>
                </div>
              ))}
           </div>
        </div>
      </aside>
    </div>
  );
}

function AdminDashboard({ user, token }: { user: User; token: string }) {
  const [sections, setSections] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [secRes, teachRes] = await Promise.all([
          fetch("/api/sections", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/users/teachers", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const secData = await secRes.json();
        const teachData = await teachRes.json();
        setSections(secData || []);
        setTeachers(teachData || []);
      } catch (err) {
        console.error("Admin data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleAssign = async (sectionId: string, teacherId: string) => {
    try {
      const res = await fetch(`/api/sections/${sectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacherId }),
      });
      if (res.ok) {
        const refreshRes = await fetch("/api/sections", { headers: { Authorization: `Bearer ${token}` } });
        const data = await refreshRes.json();
        setSections(data || []);
        alert("Teacher assigned successfully!");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCcw className="animate-spin text-linkedin-blue mb-4" />
        <p className="text-sm font-bold text-gray-400">Loading Admin Console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1128px] mx-auto px-4 space-y-6">
      <div className="bg-white p-8 rounded-xl border border-linkedin-border shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-linkedin-blue p-3 rounded-xl shadow-lg">
            <Lock className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-linkedin-text tracking-tighter uppercase">Admin Console</h2>
            <p className="text-xs text-linkedin-text-muted font-bold">Override and manage teacher-section assignments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden">
            <div className="px-6 py-4 border-b border-linkedin-border bg-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-linkedin-text-muted flex items-center gap-2">
                <Users size={14} /> Section Assignments
              </h3>
              <span className="text-[10px] font-bold text-linkedin-blue">{sections.length} Sections Total</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-linkedin-border text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-4">Section Name</th>
                    <th className="px-6 py-4">Assigned Teacher</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sections.map((section) => (
                    <tr key={section._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold">{section.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-linkedin-text">{section.teacherId?.name || "Unassigned"}</span>
                          <span className="text-[10px] text-gray-400">{section.teacherId?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <select 
                            className="text-xs p-2 border rounded-lg outline-none focus:ring-1 focus:ring-linkedin-blue"
                            defaultValue={section.teacherId?._id || ""}
                            onChange={(e) => handleAssign(section._id, e.target.value)}
                          >
                            <option value="">Re-assign Teacher</option>
                            {teachers.map(t => (
                              <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sections.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold">No sections found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl border border-linkedin-border shadow-sm">
           <Users className="mb-2 text-linkedin-blue" />
           <p className="font-black text-sm uppercase">Manage Users</p>
           <p className="text-xs text-linkedin-text-muted mt-1">Student and teacher records.</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-linkedin-border shadow-sm">
           <GraduationCap className="mb-2 text-linkedin-blue" />
           <p className="font-black text-sm uppercase">Manage Sections</p>
           <p className="text-xs text-linkedin-text-muted mt-1">Create or remove student groups.</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-linkedin-border shadow-sm">
           <Code2 className="mb-2 text-linkedin-blue" />
           <p className="font-black text-sm uppercase">Global Bank</p>
           <p className="text-xs text-linkedin-text-muted mt-1">Core exercise curriculum.</p>
        </div>
      </div>
    </div>
  );
}

function MiniBrowser({ html }: { html?: string }) {
  if (!html) return null;
  
  return (
    <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden shadow-inner mt-4 flex flex-col h-48">
      <div className="bg-gray-100 px-3 py-1.5 border-b border-linkedin-border flex items-center gap-2 shrink-0">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="bg-white rounded border border-linkedin-border px-2 py-0.5 text-[8px] flex-1 text-linkedin-text-muted truncate">
          preview://target-output
        </div>
      </div>
      <div className="p-4 flex-1 overflow-auto bg-white prose prose-sm max-w-none" 
           dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("fiits_token"));
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [code, setCode] = useState("");
  const [reflection, setReflection] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<DetectionResult | null>(null);
  const [appState, setAppState] = useState<"solving" | "reflecting" | "complete" | "teacher_dashboard" | "admin_dashboard" | "modules">("modules");
  const [assessmentMode, setAssessmentMode] = useState<{ topic: string, type: 'formative' | 'summative', id: string } | null>(null);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentTotalPoints, setAssessmentTotalPoints] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  const currentExercise = exercises[currentIdx];

  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error();
          setUser(data);
          if (data.role === UserRole.TEACHER) setAppState("teacher_dashboard");
          if (data.role === UserRole.ADMIN) setAppState("admin_dashboard");
        })
        .catch(() => {
          localStorage.removeItem("fiits_token");
          setToken(null);
        });
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const exRes = await fetch("/api/exercises");
        if (!exRes.ok) throw new Error(`Fetch failed: ${exRes.status}`);
        const exData = await exRes.json();
        
        // Ensure exData is an array
        const validatedExData = Array.isArray(exData) ? exData : [];
        setExercises(validatedExData);
        
        if (token && validatedExData.length > 0) {
          try {
            const progRes = await fetch("/api/progress/me", { 
              headers: { "Authorization": `Bearer ${token}` } 
            });
            if (progRes.ok) {
              const progData = await progRes.json();
              if (progData.length > 0) {
                const completedIds = new Set(progData.map((p: any) => p.exerciseId));
                const nextIdx = validatedExData.findIndex((ex: any) => !completedIds.has(ex._id || ex.id));
                
                if (nextIdx !== -1) {
                  setCurrentIdx(nextIdx);
                  setCode(validatedExData[nextIdx].template);
                } else {
                  setCurrentIdx(validatedExData.length - 1);
                  setCode(validatedExData[validatedExData.length - 1].template);
                  setAppState("complete");
                }
              } else {
                setCode(validatedExData[0].template);
              }
            } else {
              setCode(validatedExData[0].template);
            }
          } catch (progErr) {
            console.warn("Progress fetch failed, defaulting to first exercise");
            setCode(validatedExData[0].template);
          }
        } else if (validatedExData.length > 0) {
          setCode(validatedExData[0].template);
        }
      } catch (err) {
        console.error("Failed to load exercises or progress:", err);
        setError("Connection issue. Please ensure your database is online.");
      }
    };
    loadData();
  }, [token]);

  const handleLogin = (u: User, t: string) => {
    localStorage.setItem("fiits_token", t);
    setToken(t);
    setUser(u);
    if (u.role === UserRole.TEACHER) setAppState("teacher_dashboard");
    else if (u.role === UserRole.ADMIN) setAppState("admin_dashboard");
    else setAppState("solving");
  };

  const handleLogout = () => {
    localStorage.removeItem("fiits_token");
    setToken(null);
    setUser(null);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setAnalyticsData(data);
      setAppState("analytics");
    } catch (e) {
      setError("Failed to load analytics.");
    }
  };

  const startAssessment = async (topic: string, type: 'formative' | 'summative', subId: string, customAssessment?: Assessment) => {
    try {
      let filtered: ExerciseEntry[] = [];
      if (customAssessment && customAssessment.questionIds) {
        filtered = customAssessment.questionIds;
      } else {
        const res = await fetch("/api/exercises");
        const allEx = await res.json();
        filtered = allEx.filter((ex: any) => {
          const topicMatch = ex.topic.toLowerCase() === topic.toLowerCase();
          if (type === 'formative') return topicMatch && ex.difficulty === DifficultyLevel.EASY;
          return topicMatch && (ex.difficulty === DifficultyLevel.MEDIUM || ex.difficulty === DifficultyLevel.HARD);
        });
      }

      if (filtered.length === 0) {
        alert("No questions found for this assessment level in the bank.");
        return;
      }

      setExercises(filtered);
      setCurrentIdx(0);
      setCode(filtered[0].template);
      setAssessmentMode({ topic, type, id: subId });
      setAssessmentScore(0);
      const total = filtered.reduce((acc, q) => acc + (q.difficulty === DifficultyLevel.HARD ? 3 : q.difficulty === DifficultyLevel.MEDIUM ? 2 : 1), 0);
      setAssessmentTotalPoints(total);
      setAppState("solving");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssessment = useCallback(() => {
    if (!currentExercise) return;
    
    const normalizedCode = code.replace(/\s+/g, ' ').trim().toLowerCase();
    const normalizedSolution = currentExercise.solution.replace(/\s+/g, ' ').trim().toLowerCase();
    const isCorrect = normalizedCode.includes(normalizedSolution);
    
    const lastFeedbackTime = feedbackLogs.length > 0 
      ? (new Date().getTime() - new Date(feedbackLogs[feedbackLogs.length - 1].timestamp).getTime()) / 1000 
      : undefined;

    const newAttempt: Attempt = {
      timestamp: new Date().toISOString(),
      code,
      isCorrect,
      timeSinceLastFeedback: lastFeedbackTime
    };

    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);

    if (isCorrect) {
      setAppState("reflecting");
      setError(null);
    } else {
      setError("The solution is not yet correct. See the Interaction Log or Mentor Hint for guidance.");
      setFeedbackLogs(prev => [...prev, { 
        timestamp: new Date().toISOString(), 
        feedbackText: "Incorrect submission detected.", 
        type: 'error' 
      }]);

      // Proactive Adaptive Feedback after 2 failures
      if (updatedAttempts.length >= 2) {
        setIsSubmitting(true);
        fetch("/api/adaptive/analyze", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            reflection: "User is struggling with multiple incorrect attempts.",
            attempts: updatedAttempts,
            feedbackLogs,
            exerciseId: (currentExercise as any)?._id || currentExercise?.id,
            assessmentType: assessmentMode?.type || 'standard'
          })
        })
        .then(res => res.json())
        .then(data => setFeedback(data))
        .finally(() => setIsSubmitting(false));
      }
    }
  }, [code, currentExercise, attempts, feedbackLogs, token, assessmentMode]);

  const handleReflectionSubmit = async () => {
    if (!reflection.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/adaptive/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          reflection,
          attempts,
          feedbackLogs,
          exerciseId: assessmentMode ? `${assessmentMode.id}-${assessmentMode.type}` : ((currentExercise as any)?._id || currentExercise?.id),
          assessmentType: assessmentMode?.type || 'standard',
          score: assessmentMode ? assessmentScore : undefined,
          totalPoints: assessmentMode ? assessmentTotalPoints : undefined
        })
      });
      const data = await res.json();
      setFeedback(data);
      setAppState("complete");
      if (data.label === 'APPLY' || data.suggestedAction === 'next') {
        setTimeout(handleNext, 3000);
      }
    } catch (err: any) {
      setError("AI analysis failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    // Point system integration
    if (assessmentMode && (feedback?.label === 'APPLY' || feedback?.suggestedAction === 'next')) {
       const difficulty = currentExercise?.difficulty;
       const points = difficulty === DifficultyLevel.HARD ? 3 : difficulty === DifficultyLevel.MEDIUM ? 2 : 1;
       setAssessmentScore(prev => prev + points);
    }

    if (currentIdx < exercises.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setCode(exercises[nextIdx].template);
      setReflection("");
      setFeedback(null);
      setAttempts([]);
      setFeedbackLogs([]);
      setAppState("solving");
      setError(null);
      setShowHint(false);
    } else {
      setAppState("complete");
      if (assessmentMode) {
        alert(`${assessmentMode.topic} - ${assessmentMode.type} assessment completed! Score: ${assessmentScore}/${assessmentTotalPoints}`);
        setAssessmentMode(null);
        setAppState("modules");
      }
    }
  };

  const disregardMeta = useMemo(() => {
    if (!feedback) return null;
    const colors: Record<DisregardLabel, string> = {
      [DisregardLabel.APPLY]: 'bg-green-100 text-green-700 border-green-200',
      [DisregardLabel.IGNORE]: 'bg-red-100 text-red-700 border-red-200',
      [DisregardLabel.MISUNDERSTAND]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      [DisregardLabel.DELAY]: 'bg-purple-100 text-purple-700 border-purple-200',
      [DisregardLabel.IDLE]: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return { color: colors[feedback.label] || colors[DisregardLabel.IDLE] };
  }, [feedback]);

  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen font-sans bg-linkedin-bg text-linkedin-text">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-linkedin-border h-14 flex items-center shadow-sm px-4 lg:px-12">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-linkedin-blue p-1.5 rounded-md shadow-sm">
              <BrainCircuit className="text-white" size={20} />
            </div>
            <span className="font-bold text-linkedin-blue text-xl tracking-tight">FIITS</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {user.role === UserRole.STUDENT && (
              <button 
                onClick={() => setAppState("modules")} 
                className={`flex flex-col items-center justify-center h-14 w-20 transition-all ${appState === 'modules' ? 'border-b-2 border-linkedin-blue text-linkedin-blue' : 'text-linkedin-text-muted hover:text-linkedin-text'}`}
              >
                <BookOpen size={18} />
                <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Modules</span>
              </button>
            )}
            {user.role === UserRole.STUDENT && (
              <button 
                onClick={() => setAppState("solving")} 
                className={`flex flex-col items-center justify-center h-14 w-20 transition-all ${appState === 'solving' ? 'border-b-2 border-linkedin-blue text-linkedin-blue' : 'text-linkedin-text-muted hover:text-linkedin-text'}`}
              >
                <Code2 size={18} />
                <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Tutor</span>
              </button>
            )}
            {(user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) && (
              <button 
                onClick={() => setAppState("teacher_dashboard")} 
                className={`flex flex-col items-center justify-center h-14 w-24 transition-all ${appState === 'teacher_dashboard' ? 'border-b-2 border-linkedin-blue text-linkedin-blue' : 'text-linkedin-text-muted hover:text-linkedin-text'}`}
              >
                <BarChart3 size={18} />
                <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Analytics</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-linkedin-text">{user.name}</span>
              <span className="text-[9px] uppercase font-black text-linkedin-blue bg-blue-50 px-2 rounded-full border border-blue-100">{user.role}</span>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors border border-transparent hover:border-red-100">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 lg:px-12 pb-12 pt-6 overflow-x-hidden">
        {appState === "modules" ? (
          <StudentModules user={user} token={token} onStartAssessment={startAssessment} />
        ) : appState === "teacher_dashboard" ? (
          <TeacherDashboard user={user} token={token} />
        ) : appState === "admin_dashboard" ? (
          <AdminDashboard user={user} token={token} />
        ) : !currentExercise ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-linkedin-border shadow-sm w-full">
            <RefreshCcw className={`${!error ? 'animate-spin' : ''} text-linkedin-blue mb-4`} size={48} />
            <p className="text-lg font-bold text-gray-400 tracking-tight">
              {error ? "Problem Syncing Exercises" : "Syncing exercises with mentor bank..."}
            </p>
            <p className="text-xs text-gray-400 mt-2 max-w-md text-center px-6 leading-relaxed">
              {error 
                ? "We're having trouble connecting to the database. Please ensure your MongoDB Atlas cluster is active and not paused." 
                : "If this takes too long, ensure your MONGODB_URI is correct and your database is online."}
            </p>
            {error && (
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-8 py-2 bg-linkedin-blue text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-md hover:bg-blue-800 transition-all active:scale-95"
              >
                Retry Connection
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[30%_40%_30%] gap-6 items-start w-full max-w-none">
            {/* Left Column: Task & Preview */}
            <section id="task-column" className="lg:sticky lg:top-20 space-y-6">
              <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden shadow-sm flex flex-col border-t-2 border-t-linkedin-blue w-full">
                <div className="p-4 border-b border-linkedin-border flex items-center justify-between bg-white min-h-[64px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-linkedin-blue/5 flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-linkedin-blue" />
                    </div>
                    <span className="font-bold text-sm text-linkedin-text uppercase tracking-widest text-linkedin-text">TASK</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-6 shrink-0">
                    <p className="text-sm font-bold text-linkedin-blue uppercase tracking-tighter mb-1">
                      {currentExercise?.topic || "HTML"} Fundamentals • Level {currentExercise?.level || 1}
                    </p>
                    <h2 className="text-sm font-bold text-linkedin-text uppercase tracking-widest leading-tight mb-4">{currentExercise?.title}</h2>
                    
                    <div className="bg-blue-50/20 p-5 rounded-xl border border-blue-100/50 mb-6">
                       <p className="text-sm font-normal text-linkedin-text leading-relaxed">
                         {currentExercise?.description}
                       </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-linkedin-blue fill-linkedin-blue/20" />
                        <span className="font-bold text-sm text-linkedin-text uppercase tracking-widest text-linkedin-text">TARGET OUTPUT</span>
                      </div>
                    </div>

                    <MiniBrowser html={currentExercise?.expectedOutputHtml} />
                    
                    <div className="mt-6 pt-4 border-t border-linkedin-border flex flex-col gap-2">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-linkedin-text-muted uppercase">
                         <Lock size={12} />
                         Reference
                       </div>
                       <p className="text-[10px] leading-relaxed text-linkedin-text-muted opacity-80">
                         Use exactly the elements specified to pass verification.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Middle Column: Editor */}
            <section id="editor-column" className="lg:sticky lg:top-20 space-y-6">
              <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden shadow-sm flex flex-col min-h-[600px] border-t-2 border-t-linkedin-blue w-full">
                <div className="p-4 border-b border-linkedin-border flex items-center justify-between bg-white min-h-[64px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-linkedin-blue/5 flex items-center justify-center shrink-0">
                      <Code2 className="text-linkedin-blue" size={18} />
                    </div>
                    <span className="font-bold text-sm text-linkedin-text uppercase tracking-widest">INTERACTIVE EDITOR</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {appState === "solving" && (
                      <button
                        onClick={handleAssessment}
                        className="bg-linkedin-blue text-white hover:bg-blue-800 px-6 py-1.5 rounded-full font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
                      >
                        Run Assessment <ArrowRight size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className="text-linkedin-text-muted hover:bg-gray-100 px-4 py-1.5 rounded-full font-bold text-xs border border-linkedin-border transition-colors flex items-center gap-2"
                    >
                      <Info size={14} />
                      Hint 
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1">
                  <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#333] shadow-lg h-[450px]">
                    <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">editor.js</span>
                      <Maximize2 size={12} className="text-gray-500" />
                    </div>
                    <Editor
                      height="100%"
                      language={currentExercise?.topic?.toLowerCase() === 'javascript' ? 'javascript' : 'html'}
                      theme="vs-dark"
                      value={code}
                      onChange={(val) => setCode(val || "")}
                      options={{
                        fontSize: 16,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: appState !== "solving",
                        autoClosingBrackets: "always",
                        autoClosingTags: true,
                        autoIndent: "full",
                        padding: { top: 20 },
                        lineNumbers: "on",
                        renderLineHighlight: "all"
                      }}
                    />
                  </div>

                  {error && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold flex items-center gap-3 rounded-r-lg">
                      <AlertCircle size={16} />
                      {error}
                    </motion.div>
                  )}

                  {showHint && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-blue-800 text-sm flex items-start gap-3">
                      <BrainCircuit size={18} className="shrink-0 mt-0.5 text-linkedin-blue" />
                      <p>Mentor Hint: {currentExercise?.hint}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            {/* Right Column: Sidebar / Adaptive Engine */}
            <aside id="interaction-column" className="lg:sticky lg:top-20 space-y-6">
              <div className="bg-white rounded-lg border border-linkedin-border overflow-hidden shadow-sm flex flex-col border-t-2 border-t-linkedin-blue w-full">
                <div className="p-4 border-b border-linkedin-border flex items-center justify-between bg-white min-h-[64px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-linkedin-blue/5 flex items-center justify-center shrink-0">
                      <History size={18} className="text-linkedin-blue" />
                    </div>
                    <span className="font-bold text-sm text-linkedin-text uppercase tracking-widest text-linkedin-text">INTERACTION LOG</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {attempts.length === 0 && <p className="text-[10px] text-linkedin-text-muted opacity-50">Waiting for code interaction...</p>}
                    {attempts.map((att, i) => (
                      <div key={i} className="flex gap-3 items-start relative pb-4 border-l border-gray-100 pl-4 before:content-[''] before:absolute before:-left-[5.5px] before:top-0 before:w-2.5 before:h-2.5 before:rounded-full before:bg-gray-200">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase">{att.isCorrect ? 'Success' : 'Attempt ' + (i+1)}</p>
                          <p className="text-[10px] text-linkedin-text-muted">{new Date(att.timestamp).toLocaleTimeString()}</p>
                          {att.timeSinceLastFeedback && (
                            <p className="text-[9px] text-blue-600 font-bold">Δ Response: {Math.round(att.timeSinceLastFeedback)}s</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reflection Card */}
              <AnimatePresence>
                {appState === "reflecting" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, times: [0, 0.25, 0.5, 0.75, 1], opacity: [1, 0.3, 1, 0.3, 1] }} className="bg-white rounded-lg border-2 border-linkedin-blue p-6 shadow-lg ring-4 ring-linkedin-blue/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
                        <Sparkles size={20} className="text-linkedin-blue" />
                      </div>
                      <h4 className="font-bold text-sm text-linkedin-blue uppercase tracking-wider">REFLECTIVE LOOP</h4>
                    </div>
                    <p className="text-sm text-linkedin-text mb-4 font-semibold leading-relaxed">
                      "Success! Did the mentor's input actually guide your solution, or did you ignore it?"
                    </p>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="My previous feedback was..."
                      className="w-full h-28 p-4 border border-linkedin-border rounded-lg outline-none text-sm bg-gray-50 focus:border-linkedin-blue transition-all mb-4"
                      autoFocus
                    />
                    <button onClick={handleReflectionSubmit} disabled={isSubmitting} className="w-full bg-linkedin-blue text-white py-3 rounded-full font-bold text-sm shadow-md active:scale-95 disabled:opacity-50">
                      {isSubmitting ? "Generating Analysis..." : "Submit Experience"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feedback Disregard Analysis Result */}
              <AnimatePresence>
                {feedback && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg border p-6 shadow-md border-l-4 ${disregardMeta?.color || 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="font-bold text-xs uppercase tracking-widest">MENTOR ANALYSIS</h4>
                       <span className="text-[9px] px-2 py-0.5 rounded-full font-black border uppercase tracking-tighter bg-white shadow-sm">
                         {feedback.label}
                       </span>
                    </div>
                    <p className="text-[10px] font-bold text-linkedin-text-muted mb-3 uppercase tracking-tighter">Inference: {feedback.reason}</p>
                    <div className="relative mb-6">
                      <span className="absolute -top-3 -left-2 text-4xl opacity-10">"</span>
                      <p className="text-sm relative z-10 leading-relaxed font-medium">
                        {feedback.feedback}
                      </p>
                    </div>
                    {feedback.suggestedAction === 'next' ? (
                      <button onClick={handleNext} className="w-full bg-linkedin-blue text-white py-2 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-lg transition-all">
                        Unlock Next Module <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button onClick={() => { setAppState("solving"); setFeedback(null); }} className="w-full bg-white text-linkedin-text py-2 rounded-full font-bold text-xs border border-linkedin-border flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                        Resume Task <RefreshCcw size={14} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </aside>
          </div>
        )}

      </main>
    </div>
  );
}
