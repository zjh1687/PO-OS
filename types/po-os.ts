export type TaskStatus = "inbox" | "backlog" | "doing" | "waiting" | "done";
export type TaskPriority = "high" | "medium" | "low";
export type ProjectStatus = "green" | "yellow" | "red";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  goal: string;
  status: ProjectStatus;
  due_date: string | null;
  progress: number;
  risk: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  source: string;
  memo: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type Decision = {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  date: string;
  topic: string;
  decision: string;
  reason: string;
  requested_by: string;
  next_action: string;
  created_at: string;
  updated_at: string;
};

export type Meeting = {
  id: string;
  user_id: string;
  date: string;
  title: string;
  attendees: string;
  summary: string;
  actions: string;
  created_at: string;
  updated_at: string;
};

export type BackupPayload = {
  version: 1;
  owner?: string;
  tasks: Array<Partial<Task> & { project?: string; dueDate?: string; createdAt?: string; updatedAt?: string; completedAt?: string | null }>;
  projects: Array<Partial<Project> & { dueDate?: string; createdAt?: string; updatedAt?: string }>;
  decisions: Array<Partial<Decision> & { project?: string; requestedBy?: string; nextAction?: string }>;
  meetings: Array<Partial<Meeting>>;
};

export type AppData = {
  projects: Project[];
  tasks: Task[];
  decisions: Decision[];
  meetings: Meeting[];
};

export const taskStatuses: Array<{ id: TaskStatus; label: string; hint: string }> = [
  { id: "inbox", label: "Inbox", hint: "새로 들어온 업무" },
  { id: "backlog", label: "Backlog", hint: "정리된 대기 업무" },
  { id: "doing", label: "Doing", hint: "진행 중" },
  { id: "waiting", label: "Waiting", hint: "응답 또는 결정 대기" },
  { id: "done", label: "Done", hint: "완료" },
];

export const priorityLabel: Record<TaskPriority, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export const priorityWeight: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};
