import type { Note } from "../types/Note";

interface NoteListProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NoteList({
  notes,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}: NoteListProps) {
  return (
    <aside className="note-list">
      <div className="note-list-header">
        <h2>ノート</h2>
        <button className="btn-add" onClick={onAdd} title="新規作成">
          +
        </button>
      </div>
      <div className="note-list-items">
        {notes.length === 0 && (
          <p className="empty-message">ノートがありません</p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className={`note-item ${note.id === selectedId ? "active" : ""}`}
            onClick={() => onSelect(note.id)}
          >
            <div className="note-item-header">
              <span className="note-item-title">
                {note.title || "無題"}
              </span>
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                title="削除"
              >
                ×
              </button>
            </div>
            <span className="note-item-date">
              {formatDate(note.updatedAt)}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
