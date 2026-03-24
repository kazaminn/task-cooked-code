import type { Note } from "../types/Note";

export function exportAllAsJSON(notes: Note[]) {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromJSON(file: File): Promise<Note[]> {
  const text = await file.text();
  const data = JSON.parse(text);

  let notes: Note[];
  if (Array.isArray(data)) {
    notes = data;
  } else if (data.notes && Array.isArray(data.notes)) {
    notes = data.notes;
  } else {
    throw new Error("Invalid backup format");
  }

  return notes.map((n: Partial<Note>) => ({
    id: n.id || crypto.randomUUID(),
    title: n.title || "インポートされたノート",
    content: n.content || "",
    tags: n.tags || [],
    images: n.images || [],
    pinned: n.pinned ?? false,
    trashed: n.trashed ?? false,
    createdAt: n.createdAt || Date.now(),
    updatedAt: n.updatedAt || Date.now(),
  }));
}

export async function importFromMarkdown(file: File): Promise<Note> {
  const text = await file.text();
  const name = file.name.replace(/\.md$/i, "");

  // Try to extract title from first H1
  const h1Match = text.match(/^#\s+(.+)$/m);
  const title = h1Match ? h1Match[1].trim() : name;
  const content = h1Match ? text.replace(/^#\s+.+\n?/, "").trim() : text;

  return {
    id: crypto.randomUUID(),
    title,
    content,
    tags: ["インポート"],
    images: [],
    pinned: false,
    trashed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
