import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Note, ImageAttachment } from "../types/Note";
import { useServices } from "../services/ServiceProvider";

export type SortMode = "updated" | "created" | "title";
export type ViewMode = "notes" | "trash";

function sortNotes(notes: Note[], sort: SortMode): Note[] {
  const sorted = [...notes];
  switch (sort) {
    case "updated":
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
      break;
    case "created":
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ja"));
      break;
  }
  // Pinned notes always on top
  sorted.sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));
  return sorted;
}

export function useNotes() {
  const { notes: noteService } = useServices();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("updated");
  const [viewMode, setViewMode] = useState<ViewMode>("notes");
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    noteService
      .loadAll()
      .then((loaded) => {
        const migrated = loaded.map((n) => ({
          ...n,
          pinned: n.pinned ?? false,
          trashed: n.trashed ?? false,
        }));
        setNotes(migrated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [noteService]);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const allTags = useMemo(
    () => Array.from(new Set(notes.filter((n) => !n.trashed).flatMap((n) => n.tags))).sort(),
    [notes]
  );

  const filteredNotes = useMemo(() => {
    let result = notes.filter((n) =>
      viewMode === "trash" ? n.trashed : !n.trashed
    );

    if (filterTag && viewMode === "notes") {
      result = result.filter((n) => n.tags.includes(filterTag));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return sortNotes(result, sortMode);
  }, [notes, filterTag, searchQuery, sortMode, viewMode]);

  const trashCount = useMemo(() => notes.filter((n) => n.trashed).length, [notes]);

  const persistNote = useCallback((updated: Note) => {
    noteService.save(updated);
  }, [noteService]);

  const addNote = useCallback(() => {
    const now = Date.now();
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "新しいノート",
      content: "",
      tags: [],
      images: [],
      pinned: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setViewMode("notes");
    persistNote(newNote);
  }, [persistNote]);

  const addNoteFromTemplate = useCallback(
    (title: string, content: string, tags: string[]) => {
      const now = Date.now();
      const newNote: Note = {
        id: crypto.randomUUID(),
        title,
        content,
        tags,
        images: [],
        pinned: false,
        trashed: false,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedId(newNote.id);
      setViewMode("notes");
      persistNote(newNote);
    },
    [persistNote]
  );

  const importNotes = useCallback(
    (imported: Note[]) => {
      setNotes((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newNotes = imported.filter((n) => !existingIds.has(n.id));
        for (const n of newNotes) persistNote(n);
        return [...newNotes, ...prev];
      });
    },
    [persistNote]
  );

  const getAllNotes = useCallback(() => notes, [notes]);

  const duplicateNote = useCallback(
    (id: string) => {
      const source = notes.find((n) => n.id === id);
      if (!source) return;
      const now = Date.now();
      const copy: Note = {
        ...source,
        id: crypto.randomUUID(),
        title: `${source.title} (コピー)`,
        pinned: false,
        trashed: false,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [copy, ...prev]);
      setSelectedId(copy.id);
      setViewMode("notes");
      persistNote(copy);
    },
    [notes, persistNote]
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<Pick<Note, "title" | "content" | "tags">>) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const updated = { ...n, ...updates, updatedAt: Date.now() };
          persistNote(updated);
          return updated;
        })
      );
    },
    [persistNote]
  );

  const togglePin = useCallback(
    (id: string) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const updated = { ...n, pinned: !n.pinned, updatedAt: Date.now() };
          persistNote(updated);
          return updated;
        })
      );
    },
    [persistNote]
  );

  const moveToTrash = useCallback(
    (id: string) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const updated = { ...n, trashed: true, pinned: false, updatedAt: Date.now() };
          persistNote(updated);
          return updated;
        })
      );
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId, persistNote]
  );

  const restoreFromTrash = useCallback(
    (id: string) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== id) return n;
          const updated = { ...n, trashed: false, updatedAt: Date.now() };
          persistNote(updated);
          return updated;
        })
      );
    },
    [persistNote]
  );

  const permanentDelete = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) setSelectedId(null);
      noteService.delete(id);
    },
    [selectedId, noteService]
  );

  const emptyTrash = useCallback(() => {
    setNotes((prev) => {
      const trashed = prev.filter((n) => n.trashed);
      for (const n of trashed) {
        noteService.delete(n.id);
      }
      return prev.filter((n) => !n.trashed);
    });
    setSelectedId(null);
  }, [noteService]);

  const addImage = useCallback(
    (noteId: string, file: File) => {
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
            persistNote(updated);
            return updated;
          })
        );
      };
      reader.readAsDataURL(file);
    },
    [persistNote]
  );

  const removeImage = useCallback(
    (noteId: string, imageId: string) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id !== noteId) return n;
          const updated = {
            ...n,
            images: n.images.filter((img) => img.id !== imageId),
            updatedAt: Date.now(),
          };
          persistNote(updated);
          return updated;
        })
      );
    },
    [persistNote]
  );

  const batchMoveToTrash = useCallback(
    (ids: string[]) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (!ids.includes(n.id)) return n;
          const updated = { ...n, trashed: true, pinned: false, updatedAt: Date.now() };
          persistNote(updated);
          return updated;
        })
      );
      if (selectedId && ids.includes(selectedId)) setSelectedId(null);
    },
    [selectedId, persistNote]
  );

  const batchAddTag = useCallback(
    (ids: string[], tag: string) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (!ids.includes(n.id) || n.tags.includes(tag)) return n;
          const updated = { ...n, tags: [...n.tags, tag], updatedAt: Date.now() };
          persistNote(updated);
          return updated;
        })
      );
    },
    [persistNote]
  );

  return {
    notes: filteredNotes,
    allTags,
    filterTag,
    setFilterTag,
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    viewMode,
    setViewMode,
    trashCount,
    selectedNote,
    selectedId,
    setSelectedId,
    addNote,
    duplicateNote,
    updateNote,
    togglePin,
    moveToTrash,
    restoreFromTrash,
    permanentDelete,
    emptyTrash,
    addImage,
    removeImage,
    addNoteFromTemplate,
    importNotes,
    getAllNotes,
    batchMoveToTrash,
    batchAddTag,
    loading,
  };
}
