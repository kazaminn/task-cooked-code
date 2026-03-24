import { useState, useEffect, useCallback } from "react";
import type { Note } from "../types/Note";

const STORAGE_KEY = "notes-app-data";

function loadNotes(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const addNote = useCallback(() => {
    const now = Date.now();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "新しいノート",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
  }, []);

  const updateNote = useCallback((id: string, title: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, title, content, updatedAt: Date.now() } : n
      )
    );
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [selectedId]
  );

  return {
    notes,
    selectedNote,
    selectedId,
    setSelectedId,
    addNote,
    updateNote,
    deleteNote,
  };
}
