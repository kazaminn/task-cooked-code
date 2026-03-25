import { createContext } from "react";
import type { useNotes } from "../hooks/useNotes";
import type { useTasks } from "../hooks/useTasks";
import type { useProjects } from "../hooks/useProjects";
import type { useTeams } from "../hooks/useTeams";
import type { useTheme } from "../hooks/useTheme";
import type { useToast } from "../hooks/useToast";
import type { Note } from "../types/Note";
import type { Task } from "../types/Task";

export type NotesState = ReturnType<typeof useNotes>;
export type TasksState = ReturnType<typeof useTasks>;
export type ProjectsState = ReturnType<typeof useProjects>;
export type TeamsState = ReturnType<typeof useTeams>;
export type ThemeState = ReturnType<typeof useTheme>;
export type ToastState = ReturnType<typeof useToast>;

export interface CrossRefHelpers {
  linkNoteToTask: (noteId: string, taskId: string) => void;
  unlinkNoteFromTask: (taskId: string) => void;
  createIssueFromNote: (note: Note) => Task;
  createNoteFromIssue: (task: Task) => void;
  getLinkedTasks: (noteId: string) => Task[];
  getLinkedNote: (taskId: string) => Note | null;
}

export interface AppContextValue {
  notes: NotesState;
  tasks: TasksState;
  projects: ProjectsState;
  teams: TeamsState;
  theme: ThemeState;
  toast: ToastState;
  crossRef: CrossRefHelpers;
}

export const AppContext = createContext<AppContextValue | null>(null);
