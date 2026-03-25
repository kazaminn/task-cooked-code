import type { Note } from "../../types/Note";
import type { NoteService } from "../types";
import { getAll, put, remove } from "./db";

const STORE = "notes";

export function createLocalNoteService(): NoteService {
  return {
    async loadAll() {
      // Migrate from localStorage if legacy data exists
      const legacy = localStorage.getItem("notes-app-data");
      if (legacy) {
        try {
          const parsed: Note[] = JSON.parse(legacy);
          const migrated = parsed.map((n) => ({
            ...n,
            tags: n.tags ?? [],
            images: n.images ?? [],
            pinned: n.pinned ?? false,
            trashed: n.trashed ?? false,
          }));
          for (const note of migrated) {
            await put(STORE, note);
          }
          localStorage.removeItem("notes-app-data");
          return migrated;
        } catch {
          localStorage.removeItem("notes-app-data");
        }
      }
      const notes = await getAll<Note>(STORE);
      return notes.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    save: (note) => put(STORE, note),
    delete: (id) => remove(STORE, id),
  };
}
