import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Note } from "../types/Note";
import { TagInput } from "./TagInput";
import { ImageGallery } from "./ImageGallery";

interface NoteEditorProps {
  note: Note;
  allTags: string[];
  onUpdate: (id: string, updates: Partial<Pick<Note, "title" | "content" | "tags">>) => void;
  onAddImage: (noteId: string, file: File) => void;
  onRemoveImage: (noteId: string, imageId: string) => void;
  onExport: (note: Note) => void;
}

export function NoteEditor({
  note,
  allTags,
  onUpdate,
  onAddImage,
  onRemoveImage,
  onExport,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [preview, setPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onUpdate(note.id, { title, content });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [title, content, note.id, note.title, note.content, onUpdate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        onAddImage(note.id, file);
      }
    }
    e.target.value = "";
  };

  return (
    <main className="note-editor">
      <div className="editor-toolbar">
        <input
          className="note-editor-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
        />
        <div className="toolbar-actions">
          <button
            className={`btn-toolbar ${preview ? "active" : ""}`}
            onClick={() => setPreview(!preview)}
            title={preview ? "編集モード" : "プレビュー"}
          >
            {preview ? "編集" : "プレビュー"}
          </button>
          <button
            className="btn-toolbar"
            onClick={() => fileInputRef.current?.click()}
            title="画像を添付"
          >
            画像
          </button>
          <button
            className="btn-toolbar"
            onClick={() => onExport(note)}
            title="Markdownとしてエクスポート"
          >
            保存
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileSelect}
          />
        </div>
      </div>

      <TagInput
        tags={note.tags}
        allTags={allTags}
        onChange={(tags) => onUpdate(note.id, { tags })}
      />

      {preview ? (
        <div className="markdown-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="note-editor-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Markdownで書けます..."
        />
      )}

      {note.images.length > 0 && (
        <ImageGallery
          images={note.images}
          onRemove={(imageId) => onRemoveImage(note.id, imageId)}
        />
      )}
    </main>
  );
}
