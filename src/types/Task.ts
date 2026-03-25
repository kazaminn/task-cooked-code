export type TaskStatus = "open" | "in_progress" | "done" | "closed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskLabel {
  id: string;
  name: string;
  color: string; // hex color
}

export interface TaskMilestone {
  id: string;
  title: string;
  dueDate: number | null;
}

export interface Task {
  id: string;
  number: number;
  title: string;
  body: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[]; // label ids
  milestone: string | null; // milestone id
  assignee: string;
  linkedNoteId: string | null;
  projectId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  body: string;
  createdAt: number;
}

export interface ProjectBoard {
  columns: ProjectColumn[];
}

export interface ProjectColumn {
  id: string;
  title: string;
  status: TaskStatus;
}

export const DEFAULT_COLUMNS: ProjectColumn[] = [
  { id: "col-open", title: "Open", status: "open" },
  { id: "col-progress", title: "In Progress", status: "in_progress" },
  { id: "col-done", title: "Done", status: "done" },
  { id: "col-closed", title: "Closed", status: "closed" },
];

export const DEFAULT_LABELS: TaskLabel[] = [
  { id: "lbl-bug", name: "bug", color: "#d73a4a" },
  { id: "lbl-feature", name: "feature", color: "#0075ca" },
  { id: "lbl-docs", name: "docs", color: "#0e8a16" },
  { id: "lbl-enhancement", name: "enhancement", color: "#a2eeef" },
  { id: "lbl-question", name: "question", color: "#d876e3" },
  { id: "lbl-wontfix", name: "wontfix", color: "#ffffff" },
];

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "#0e8a16",
  medium: "#fbca04",
  high: "#e4e669",
  urgent: "#d73a4a",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  done: "Done",
  closed: "Closed",
};
