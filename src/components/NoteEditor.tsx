import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Note } from "../types/Note";
import { TagInput } from "./TagInput";
import { ImageGallery } from "./ImageGallery";

interface NoteEditorProps {
  note: Note;
  allTags: string[];
  preview: boolean;
  onTogglePreview: () => void;
  onUpdate: (id: string, updates: Partial<Pick<Note, "title" | "content" | "tags">>) => void;
  onAddImage: (noteId: string, file: File) => void;
  onRemoveImage: (noteId: string, imageId: string) => void;
  onExport: (note: Note) => void;
}

export function NoteEditor({
  note,
  allTags,
  preview,
  onTogglePreview,
  onUpdate,
  onAddImage,
  onRemoveImage,
  onExport,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        onAddImage(note.id, file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <main
      className={`editor ${isDragOver ? "drag-over" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="main"
      aria-label="ノートエディタ"
    >
      {/* Toolbar */}
      <header className="editor-toolbar">
        <label htmlFor="note-title" className="sr-only">タイトル</label>
        <input
          id="note-title"
          className="editor-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
        />
        <div className="toolbar-actions" role="toolbar" aria-label="エディタ操作">
          <button
            className={`btn-toolbar ${preview ? "active" : ""}`}
            onClick={onTogglePreview}
            title="プレビュー切替 (Ctrl+Shift+P)"
            aria-pressed={preview}
          >
            {preview ? "編集" : "プレビュー"}
          </button>
          <button
            className="btn-toolbar"
            onClick={() => fileInputRef.current?.click()}
            title="画像を添付"
            aria-label="画像を添付"
          >
            画像
          </button>
          <button
            className="btn-toolbar"
            onClick={() => onExport(note)}
            title="Markdownでエクスポート"
            aria-label="Markdownでエクスポート"
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
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Tags */}
      <TagInput
        tags={note.tags}
        allTags={allTags}
        onChange={(tags) => onUpdate(note.id, { tags })}
      />

      {/* Content */}
      {preview ? (
        <div className="markdown-preview" role="article" aria-label="Markdownプレビュー">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || "*まだ内容がありません*"}
          </ReactMarkdown>
        </div>
      ) : (
        <>
          <label htmlFor="note-content" className="sr-only">本文</label>
          <textarea
            id="note-content"
            className="editor-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Markdownで書けます..."
          />
        </>
      )}

      {/* Images */}
      {note.images.length > 0 && (
        <ImageGallery
          images={note.images}
          onRemove={(imageId) => onRemoveImage(note.id, imageId)}
        />
      )}

      {/* Drop zone indicator */}
      {isDragOver && (
        <div className="drop-overlay" aria-hidden="true">
          <p>画像をドロップして添付</p>
        </div>
      )}
    </main>
  );
}
