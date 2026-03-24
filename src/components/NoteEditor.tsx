import { useState, useEffect } from "react";
import type { Note } from "../types/Note";

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, title: string, content: string) => void;
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onUpdate(note.id, title, content);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [title, content, note.id, note.title, note.content, onUpdate]);

  return (
    <main className="note-editor">
      <input
        className="note-editor-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
      />
      <textarea
        className="note-editor-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="ここにメモを書く..."
      />
    </main>
  );
}
