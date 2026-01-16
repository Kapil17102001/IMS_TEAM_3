export interface Intern {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  startDate: string;
  skills: string[];
  performanceScore: number;
  status: "good" | "average" | "needs-improvement";
  mentor: string;
  avatar?: string;
  bio?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedIntern: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "review" | "done";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceRecord {
  id: string;
  internId: string;
  date: string;
  score: number;
  feedback: string;
  category: string;
}
