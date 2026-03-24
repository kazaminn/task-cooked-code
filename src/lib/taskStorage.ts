import type { Task, TaskLabel, TaskMilestone, TaskComment } from "../types/Task";
import { DEFAULT_LABELS } from "../types/Task";

const DB_NAME = "notes-app";
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("tasks")) {
        db.createObjectStore("tasks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("taskLabels")) {
        db.createObjectStore("taskLabels", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("taskMilestones")) {
        db.createObjectStore("taskMilestones", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("taskComments")) {
        db.createObjectStore("taskComments", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Tasks
export async function loadTasks(): Promise<Task[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as Task[]).sort((a, b) => b.updatedAt - a.updatedAt));
    req.onerror = () => reject(req.error);
  });
}

export async function saveTask(task: Task): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").put(task);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteTask(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("tasks", "readwrite");
    tx.objectStore("tasks").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Labels
export async function loadLabels(): Promise<TaskLabel[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("taskLabels", "readonly");
    const req = tx.objectStore("taskLabels").getAll();
    req.onsuccess = () => {
      const labels = req.result as TaskLabel[];
      if (labels.length === 0) {
        // Initialize defaults
        const writeTx = db.transaction("taskLabels", "readwrite");
        const writeStore = writeTx.objectStore("taskLabels");
        for (const l of DEFAULT_LABELS) writeStore.put(l);
        writeTx.oncomplete = () => resolve(DEFAULT_LABELS);
        writeTx.onerror = () => resolve(DEFAULT_LABELS);
      } else {
        resolve(labels);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveLabel(label: TaskLabel): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("taskLabels", "readwrite");
    tx.objectStore("taskLabels").put(label);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Milestones
export async function loadMilestones(): Promise<TaskMilestone[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("taskMilestones", "readonly");
    const req = tx.objectStore("taskMilestones").getAll();
    req.onsuccess = () => resolve(req.result as TaskMilestone[]);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMilestone(ms: TaskMilestone): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("taskMilestones", "readwrite");
    tx.objectStore("taskMilestones").put(ms);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Comments
export async function loadComments(taskId: string): Promise<TaskComment[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("taskComments", "readonly");
    const req = tx.objectStore("taskComments").getAll();
    req.onsuccess = () => {
      const all = req.result as TaskComment[];
      resolve(all.filter((c) => c.taskId === taskId).sort((a, b) => a.createdAt - b.createdAt));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveComment(comment: TaskComment): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("taskComments", "readwrite");
    tx.objectStore("taskComments").put(comment);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
