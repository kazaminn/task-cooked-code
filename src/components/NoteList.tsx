import type { Note } from "../types/Note";

interface NoteListProps {
  notes: Note[];
  selectedId: string | null;
  allTags: string[];
  filterTag: string | null;
  onFilterTag: (tag: string | null) => void;
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
  allTags,
  filterTag,
  onFilterTag,
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

      {allTags.length > 0 && (
        <div className="tag-filter">
          <button
            className={`tag-filter-btn ${filterTag === null ? "active" : ""}`}
            onClick={() => onFilterTag(null)}
          >
            すべて
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`tag-filter-btn ${filterTag === tag ? "active" : ""}`}
              onClick={() => onFilterTag(filterTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="note-list-items">
        {notes.length === 0 && (
          <p className="empty-message">
            {filterTag ? `「${filterTag}」タグのノートはありません` : "ノートがありません"}
          </p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className={`note-item ${note.id === selectedId ? "active" : ""}`}
            onClick={() => onSelect(note.id)}
          >
            <div className="note-item-header">
              <span className="note-item-title">{note.title || "無題"}</span>
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
            {note.tags.length > 0 && (
              <div className="note-item-tags">
                {note.tags.map((tag) => (
                  <span key={tag} className="note-item-tag">{tag}</span>
                ))}
              </div>
            )}
            <span className="note-item-date">{formatDate(note.updatedAt)}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
