import type { Note } from "../types/Note";

const DB_NAME = "notes-app";
const DB_VERSION = 1;
const STORE_NAME = "notes";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadNotes(): Promise<Note[]> {
  // Migrate from localStorage if data exists there
  const legacy = localStorage.getItem("notes-app-data");
  if (legacy) {
    try {
      const parsed: Note[] = JSON.parse(legacy);
      const migrated = parsed.map((n) => ({
        ...n,
        tags: n.tags ?? [],
        images: n.images ?? [],
      }));
      for (const note of migrated) {
        await saveNote(note);
      }
      localStorage.removeItem("notes-app-data");
      return migrated;
    } catch {
      localStorage.removeItem("notes-app-data");
    }
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const notes = (request.result as Note[]).sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
      resolve(notes);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveNote(note: Note): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(note);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteNoteFromDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
