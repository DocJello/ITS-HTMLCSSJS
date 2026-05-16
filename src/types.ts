export enum DisregardLabel {
  APPLY = 'APPLY',           // Fixed after feedback
  IGNORE = 'IGNORE',         // Same error repeated
  MISUNDERSTAND = 'MISUNDERSTAND', // Different incorrect fix
  DELAY = 'DELAY',           // Long inactivity before retry
  IDLE = 'IDLE'              // Initial state
}

export interface FeedbackLog {
  timestamp: string;
  feedbackText: string;
  type: 'hint' | 'error' | 'success';
}

export interface Attempt {
  timestamp: string;
  code: string;
  isCorrect: boolean;
  timeSinceLastFeedback?: number; // In seconds
  errorPattern?: string;
}

export interface ProgressModule {
  exerciseId: string;
  attempts: Attempt[];
  feedbackLogs: FeedbackLog[];
  finalLabel: DisregardLabel;
  reflection: string;
  sentiment: string;
  sensitivityScore: number; // 0 to 1
}

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sectionId?: string; // For students
}

export interface Section {
  id: string;
  name: string;
  teacherId: string;
}

export interface ExerciseEntry {
  id: string;
  topic: 'HTML' | 'CSS' | 'JavaScript';
  level: number;
  difficulty: DifficultyLevel; // Added difficulty mapping
  title: string;
  description: string;
  template: string;
  solution: string;
  hint: string;
  expectedOutput: string;
  expectedOutputHtml?: string;
  authorId?: string; // Who created it
}

export interface DetectionResult {
  label: DisregardLabel;
  reason: string;
  feedback: string;
  suggestedAction: 'next' | 'retry' | 'review' | 'motivate';
}
