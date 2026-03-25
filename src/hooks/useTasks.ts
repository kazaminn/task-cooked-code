import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Task, TaskLabel, TaskMilestone, TaskComment, TaskStatus, TaskPriority } from "../types/Task";
import {
  loadTasks, saveTask, deleteTask as deleteTaskDB,
  loadLabels, saveLabel,
  loadMilestones, saveMilestone,
  loadComments, saveComment,
} from "../lib/taskStorage";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [milestones, setMilestones] = useState<TaskMilestone[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const nextNumber = useRef(1);

  useEffect(() => {
    Promise.all([loadTasks(), loadLabels(), loadMilestones()]).then(
      ([t, l, m]) => {
        setTasks(t);
        setLabels(l);
        setMilestones(m);
        if (t.length > 0) {
          nextNumber.current = Math.max(...t.map((x) => x.number)) + 1;
        }
      }
    );
  }, []);

  // Load comments when selected task changes
  useEffect(() => {
    if (!selectedTaskId) {
      setComments([]);
      return;
    }
    loadComments(selectedTaskId).then(setComments);
  }, [selectedTaskId]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId]
  );

  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (filterLabel) {
      result = result.filter((t) => t.labels.includes(filterLabel));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q) ||
          `#${t.number}`.includes(q)
      );
    }
    return result;
  }, [tasks, filterStatus, filterLabel, searchQuery]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { open: [], in_progress: [], done: [], closed: [] };
    for (const t of tasks) {
      map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  const createTask = useCallback((title: string, body = "", priority: TaskPriority = "medium") => {
    const now = Date.now();
    const task: Task = {
      id: crypto.randomUUID(),
      number: nextNumber.current++,
      title,
      body,
      status: "open",
      priority,
      labels: [],
      milestone: null,
      assignee: "",
      linkedNoteId: null,
      projectId: null,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [task, ...prev]);
    setSelectedTaskId(task.id);
    saveTask(task);
    return task;
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, "id" | "number" | "createdAt">>) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const updated = { ...t, ...updates, updatedAt: Date.now() };
          saveTask(updated);
          return updated;
        })
      );
    },
    []
  );

  const removeTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (selectedTaskId === id) setSelectedTaskId(null);
      deleteTaskDB(id);
    },
    [selectedTaskId]
  );

  const moveTask = useCallback(
    (id: string, status: TaskStatus) => {
      updateTask(id, { status });
    },
    [updateTask]
  );

  const addComment = useCallback(
    (taskId: string, body: string) => {
      const comment: TaskComment = {
        id: crypto.randomUUID(),
        taskId,
        body,
        createdAt: Date.now(),
      };
      setComments((prev) => [...prev, comment]);
      saveComment(comment);
      updateTask(taskId, {});
    },
    [updateTask]
  );

  const addLabel = useCallback((name: string, color: string) => {
    const label: TaskLabel = { id: crypto.randomUUID(), name, color };
    setLabels((prev) => [...prev, label]);
    saveLabel(label);
    return label;
  }, []);

  const addMilestone = useCallback((title: string, dueDate: number | null) => {
    const ms: TaskMilestone = { id: crypto.randomUUID(), title, dueDate };
    setMilestones((prev) => [...prev, ms]);
    saveMilestone(ms);
    return ms;
  }, []);

  return {
    tasks: filteredTasks,
    tasksByStatus,
    labels,
    milestones,
    selectedTask,
    selectedTaskId,
    setSelectedTaskId,
    comments,
    filterLabel,
    setFilterLabel,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    createTask,
    updateTask,
    removeTask,
    moveTask,
    addComment,
    addLabel,
    addMilestone,
  };
}
