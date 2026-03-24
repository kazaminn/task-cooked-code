import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Note } from "../types/Note";
import { TagInput } from "./TagInput";
import { ImageGallery } from "./ImageGallery";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { FindReplace } from "./FindReplace";

type SaveStatus = "saved" | "saving" | "idle";

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

function countStats(text: string) {
  const chars = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const lines = text === "" ? 0 : text.split("\n").length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { chars, words, lines, readingTime };
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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setSaveStatus("idle");
  }, [note.id, note.title, note.content]);

  useEffect(() => {
    if (title === note.title && content === note.content) return;

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      onUpdate(note.id, { title, content });
      setSaveStatus("saved");
      const resetTimer = setTimeout(() => setSaveStatus("idle"), 1500);
      return () => clearTimeout(resetTimer);
    }, 300);
    return () => clearTimeout(timer);
  }, [title, content, note.id, note.title, note.content, onUpdate]);

  const stats = useMemo(() => countStats(content), [content]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const mod = e.metaKey || e.ctrlKey;

    // Ctrl+H: Find & Replace
    if (mod && e.key === "h") {
      e.preventDefault();
      setShowFindReplace((v) => !v);
      return;
    }

    // Tab indent
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value } = ta;
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf("\n", s - 1) + 1;
        if (value.startsWith("  ", lineStart)) {
          const newValue = value.slice(0, lineStart) + value.slice(lineStart + 2);
          setContent(newValue);
          requestAnimationFrame(() => {
            ta.setSelectionRange(Math.max(s - 2, lineStart), Math.max(end - 2, lineStart));
          });
        }
      } else {
        const newValue = value.slice(0, s) + "  " + value.slice(s);
        setContent(newValue);
        requestAnimationFrame(() => {
          ta.setSelectionRange(s + 2, s + 2);
        });
      }
    }

    // Ctrl+B: bold
    if (mod && e.key === "b") {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value } = ta;
      const selected = value.slice(s, end) || "太字テキスト";
      const newValue = value.slice(0, s) + `**${selected}**` + value.slice(end);
      setContent(newValue);
      requestAnimationFrame(() => {
        ta.setSelectionRange(s + 2, s + 2 + selected.length);
      });
    }

    // Ctrl+I: italic
    if (mod && e.key === "i") {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value } = ta;
      const selected = value.slice(s, end) || "斜体テキスト";
      const newValue = value.slice(0, s) + `*${selected}*` + value.slice(end);
      setContent(newValue);
      requestAnimationFrame(() => {
        ta.setSelectionRange(s + 1, s + 1 + selected.length);
      });
    }
  };

  const handleReplace = useCallback(
    (find: string, replace: string, all: boolean) => {
      if (!find) return;
      if (all) {
        setContent((c) => c.split(find).join(replace));
      } else {
        setContent((c) => {
          const idx = c.indexOf(find);
          if (idx === -1) return c;
          return c.slice(0, idx) + replace + c.slice(idx + find.length);
        });
      }
    },
    []
  );

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
        <div className="toolbar-right">
          {saveStatus !== "idle" && (
            <span className={`save-indicator ${saveStatus}`} aria-live="polite">
              {saveStatus === "saving" ? "保存中..." : "保存済み ✓"}
            </span>
          )}
          <div className="toolbar-actions" role="toolbar" aria-label="エディタ操作">
            <button
              className={`btn-toolbar ${showFindReplace ? "active" : ""}`}
              onClick={() => setShowFindReplace((v) => !v)}
              title="検索＆置換 (Ctrl+H)"
              aria-pressed={showFindReplace}
            >
              検索
            </button>
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
        </div>
      </header>

      {/* Find & Replace */}
      {showFindReplace && (
        <FindReplace
          content={content}
          onReplace={handleReplace}
          onClose={() => setShowFindReplace(false)}
        />
      )}

      {/* Tags */}
      <TagInput
        tags={note.tags}
        allTags={allTags}
        onChange={(tags) => onUpdate(note.id, { tags })}
      />

      {/* Markdown Toolbar */}
      {!preview && (
        <MarkdownToolbar
          textareaRef={textareaRef}
          onContentChange={handleContentChange}
        />
      )}

      {/* Content */}
      {preview ? (
        <div className="markdown-preview" role="article" aria-label="Markdownプレビュー">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {content || "*まだ内容がありません*"}
          </ReactMarkdown>
        </div>
      ) : (
        <>
          <label htmlFor="note-content" className="sr-only">本文</label>
          <textarea
            id="note-content"
            ref={textareaRef}
            className="editor-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
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

      {/* Status Bar */}
      <footer className="editor-statusbar" aria-label="エディタステータス">
        <span>{stats.chars} 文字</span>
        <span>{stats.words} 単語</span>
        <span>{stats.lines} 行</span>
        <span>約{stats.readingTime}分で読了</span>
      </footer>

      {/* Drop zone indicator */}
      {isDragOver && (
        <div className="drop-overlay" aria-hidden="true">
          <p>画像をドロップして添付</p>
        </div>
      )}
    </main>
  );
}
