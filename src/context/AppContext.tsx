import { useCallback, type ReactNode } from "react";
import { useNotes } from "../hooks/useNotes";
import { useTasks } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";
import { useTeams } from "../hooks/useTeams";
import { useTheme } from "../hooks/useTheme";
import { useToast } from "../hooks/useToast";
import type { Note } from "../types/Note";
import type { Task } from "../types/Task";
import { AppContext } from "./appContextValue";
import type { CrossRefHelpers } from "./appContextValue";

export function AppProvider({ children }: { children: ReactNode }) {
  const notes = useNotes();
  const tasks = useTasks();
  const projects = useProjects();
  const teams = useTeams();
  const theme = useTheme();
  const toast = useToast();

  const linkNoteToTask = useCallback(
    (noteId: string, taskId: string) => {
      tasks.updateTask(taskId, { linkedNoteId: noteId });
    },
    [tasks]
  );

  const unlinkNoteFromTask = useCallback(
    (taskId: string) => {
      tasks.updateTask(taskId, { linkedNoteId: null });
    },
    [tasks]
  );

  const createIssueFromNote = useCallback(
    (note: Note) => {
      const task = tasks.createTask(
        note.title || "無題のノートから作成",
        note.content,
        "medium"
      );
      tasks.updateTask(task.id, { linkedNoteId: note.id });
      toast.addToast(`Issue #${task.number} を作成し、ノートとリンクしました`);
      return task;
    },
    [tasks, toast]
  );

  const createNoteFromIssue = useCallback(
    (task: Task) => {
      const content = [
        task.body,
        "",
        `---`,
        `> このノートは Issue #${task.number} から作成されました`,
      ].join("\n");

      notes.addNoteFromTemplate(
        task.title,
        content,
        ["Issue"]
      );
      setTimeout(() => {
        const allNotes = notes.getAllNotes();
        const latestNote = allNotes.find((n) => n.title === task.title && !n.trashed);
        if (latestNote) {
          tasks.updateTask(task.id, { linkedNoteId: latestNote.id });
        }
      }, 100);
      toast.addToast(`ノートを作成し、Issue #${task.number} とリンクしました`);
    },
    [notes, tasks, toast]
  );

  const getLinkedTasks = useCallback(
    (noteId: string): Task[] => {
      const allTasks = [
        ...tasks.tasksByStatus.open,
        ...tasks.tasksByStatus.in_progress,
        ...tasks.tasksByStatus.done,
        ...tasks.tasksByStatus.closed,
      ];
      return allTasks.filter((t) => t.linkedNoteId === noteId);
    },
    [tasks.tasksByStatus]
  );

  const getLinkedNote = useCallback(
    (taskId: string): Note | null => {
      const allTasks = [
        ...tasks.tasksByStatus.open,
        ...tasks.tasksByStatus.in_progress,
        ...tasks.tasksByStatus.done,
        ...tasks.tasksByStatus.closed,
      ];
      const task = allTasks.find((t) => t.id === taskId);
      if (!task?.linkedNoteId) return null;
      const allNotes = notes.getAllNotes();
      return allNotes.find((n) => n.id === task.linkedNoteId) ?? null;
    },
    [tasks.tasksByStatus, notes]
  );

  const crossRef: CrossRefHelpers = {
    linkNoteToTask,
    unlinkNoteFromTask,
    createIssueFromNote,
    createNoteFromIssue,
    getLinkedTasks,
    getLinkedNote,
  };

  return (
    <AppContext.Provider value={{ notes, tasks, projects, teams, theme, toast, crossRef }}>
      {children}
    </AppContext.Provider>
  );
}
