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
  Trash2
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
  DifficultyLevel 
} from "./types";

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

  const [teacherView, setTeacherView] = useState<"analytics" | "question_bank">("analytics");
  const [allQuestions, setAllQuestions] = useState<ExerciseEntry[]>([]);

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
  }, [token]);

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
      }
    } catch (err) {
      console.error(err);
    }
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
              <button onClick={() => setShowSectionModal(true)} className="w-full bg-white text-linkedin-blue border border-linkedin-blue py-2 rounded-lg font-bold text-xs shadow-sm active:scale-95">Add New Section</button>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {teacherView === "question_bank" ? (
             <div className="bg-white p-8 rounded-xl border border-linkedin-border shadow-sm">
               <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                 <Code2 className="text-linkedin-blue" />
                 Question Bank ({allQuestions.length} items)
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
                        <span className="text-[10px] font-bold text-linkedin-text-muted flex items-center gap-1">
                          <UserIcon size={10} /> 
                          {q.authorId?.role === 'Admin' || !q.authorId ? 'System Admin' : q.authorId.name}
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
      </div>
    </div>
  );
}

function AdminDashboard({ user, token }: { user: User, token: string }) {
  return (
    <div className="max-w-[1128px] mx-auto px-4 py-12 text-center bg-white rounded-xl border border-linkedin-border shadow-sm">
      <Lock size={48} className="mx-auto text-linkedin-blue mb-4" />
      <h2 className="text-2xl font-black text-linkedin-text tracking-tighter">ADMIN CONSOLE</h2>
      <p className="text-linkedin-text-muted mt-2">Manage the entire FIITS network from here.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
           <Users className="mx-auto mb-2 text-linkedin-blue" />
           <p className="font-bold">Manage Users</p>
        </div>
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
           <GraduationCap className="mx-auto mb-2 text-linkedin-blue" />
           <p className="font-bold">Manage Sections</p>
        </div>
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
           <Code2 className="mx-auto mb-2 text-linkedin-blue" />
           <p className="font-bold">Global Question Bank</p>
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
  const [appState, setAppState] = useState<"solving" | "reflecting" | "complete" | "teacher_dashboard" | "admin_dashboard">("solving");
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
        const exData = await exRes.json();
        setExercises(exData);
        
        if (token && exData.length > 0) {
          const progRes = await fetch("/api/progress/me", { 
            headers: { "Authorization": `Bearer ${token}` } 
          });
          const progData = await progRes.json();
          
          if (progData.length > 0) {
            const completedIds = new Set(progData.map((p: any) => p.exerciseId));
            const nextIdx = exData.findIndex((ex: any) => !completedIds.has(ex._id || ex.id));
            
            if (nextIdx !== -1) {
              setCurrentIdx(nextIdx);
              setCode(exData[nextIdx].template);
            } else {
              setCurrentIdx(exData.length - 1);
              setCode(exData[exData.length - 1].template);
              setAppState("complete");
            }
          } else {
            setCode(exData[0].template);
          }
        } else if (exData.length > 0) {
          setCode(exData[0].template);
        }
      } catch (err) {
        console.error("Failed to load exercises or progress:", err);
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
            exerciseId: (currentExercise as any)?._id || currentExercise?.id
          })
        })
        .then(res => res.json())
        .then(data => setFeedback(data))
        .finally(() => setIsSubmitting(false));
      }
    }
  }, [code, currentExercise, attempts, feedbackLogs, token]);

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
          exerciseId: (currentExercise as any)?._id || currentExercise?.id
        })
      });
      const data = await res.json();
      setFeedback(data);
      setAppState("complete");
      // Auto-transition to next after a delay if mentor says it's okay or just always load next
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
        {appState === "teacher_dashboard" ? (
          <TeacherDashboard user={user} token={token} />
        ) : appState === "admin_dashboard" ? (
          <AdminDashboard user={user} token={token} />
        ) : !currentExercise ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl border border-linkedin-border shadow-sm w-full">
            <RefreshCcw className="animate-spin text-linkedin-blue mb-4" size={48} />
            <p className="text-lg font-bold text-gray-400 tracking-tight">Syncing exercises with mentor bank...</p>
            <p className="text-xs text-gray-400 mt-2">If this takes too long, ensure exercises are seeded in the database.</p>
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
