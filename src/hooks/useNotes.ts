import { useState, useEffect, useCallback, useRef } from "react";
import type { Note, ImageAttachment } from "../types/Note";
import { loadNotes, saveNote, deleteNoteFromDB } from "../lib/storage";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadNotes()
      .then((loaded) => {
        setNotes(loaded);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort();

  const filteredNotes = filterTag
    ? notes.filter((n) => n.tags.includes(filterTag))
    : notes;

  const addNote = useCallback(() => {
    const now = Date.now();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "新しいノート",
      content: "",
      tags: [],
      images: [],
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    saveNote(newNote);
  }, []);

  const updateNote = useCallback(
    (id: string, updates: Partial<Pick<Note, "title" | "content" | "tags">>) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const updated = { ...n, ...updates, updatedAt: Date.now() };
          saveNote(updated);
          return updated;
        })
      );
    },
    []
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) setSelectedId(null);
      deleteNoteFromDB(id);
    },
    [selectedId]
  );

  const addImage = useCallback((noteId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const attachment: ImageAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        dataUrl: reader.result as string,
      };
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== noteId) return n;
          const updated = {
            ...n,
            images: [...n.images, attachment],
            updatedAt: Date.now(),
          };
          saveNote(updated);
          return updated;
        })
      );
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback((noteId: string, imageId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        const updated = {
          ...n,
          images: n.images.filter((img) => img.id !== imageId),
          updatedAt: Date.now(),
        };
        saveNote(updated);
        return updated;
      })
    );
  }, []);

  return {
    notes: filteredNotes,
    allTags,
    filterTag,
    setFilterTag,
    selectedNote,
    selectedId,
    setSelectedId,
    addNote,
    updateNote,
    deleteNote,
    addImage,
    removeImage,
    loading,
  };
}
