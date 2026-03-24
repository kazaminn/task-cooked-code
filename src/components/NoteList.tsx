import type { Note } from "../types/Note";
import type { SortMode, ViewMode } from "../hooks/useNotes";

interface NoteListProps {
  notes: Note[];
  selectedId: string | null;
  allTags: string[];
  filterTag: string | null;
  searchQuery: string;
  sortMode: SortMode;
  viewMode: ViewMode;
  trashCount: number;
  sidebarCollapsed: boolean;
  onFilterTag: (tag: string | null) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortMode) => void;
  onViewChange: (view: ViewMode) => void;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onTogglePin: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
  onOpenTheme: () => void;
  onToggleSidebar: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSnippet(content: string, maxLen = 60): string {
  if (!content) return "";
  const line = content.split("\n").find((l) => l.trim() !== "") || "";
  const clean = line.replace(/[#*`~>\-[\]()!]/g, "").trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + "…" : clean;
}

const sortLabels: Record<SortMode, string> = {
  updated: "更新順",
  created: "作成順",
  title: "タイトル順",
};

export function NoteList({
  notes,
  selectedId,
  allTags,
  filterTag,
  searchQuery,
  sortMode,
  viewMode,
  trashCount,
  sidebarCollapsed,
  onFilterTag,
  onSearchChange,
  onSortChange,
  onViewChange,
  onSelect,
  onAdd,
  onTogglePin,
  onDuplicate,
  onMoveToTrash,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
  onOpenTheme,
  onToggleSidebar,
  searchInputRef,
}: NoteListProps) {
  if (sidebarCollapsed) {
    return (
      <aside className="sidebar collapsed" role="complementary" aria-label="サイドバー（折りたたみ）">
        <button
          className="btn-icon sidebar-expand-btn"
          onClick={onToggleSidebar}
          title="サイドバーを開く"
          aria-label="サイドバーを展開"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-90 8 8)"/>
          </svg>
        </button>
        <button
          className="btn-icon btn-accent sidebar-expand-btn"
          onClick={onAdd}
          title="新規ノート"
          aria-label="新しいノートを作成"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar" role="complementary" aria-label="ノート一覧">
      {/* Header */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">ノート</h2>
        <div className="sidebar-header-actions">
          <button
            className="btn-icon"
            onClick={onToggleSidebar}
            title="サイドバーを閉じる"
            aria-label="サイドバーを折りたたむ"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 8 8)"/>
            </svg>
          </button>
          <button
            className="btn-icon"
            onClick={onOpenTheme}
            title="テーマ設定"
            aria-label="テーマ設定を開く"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            className="btn-icon btn-accent"
            onClick={onAdd}
            title="新規ノート (Ctrl+N)"
            aria-label="新しいノートを作成"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <label htmlFor="note-search" className="sr-only">ノートを検索</label>
        <svg className="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          id="note-search"
          ref={searchInputRef}
          className="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="検索... (Ctrl+K)"
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => onSearchChange("")}
            aria-label="検索をクリア"
          >
            ×
          </button>
        )}
      </div>

      {/* View toggle & sort */}
      <div className="sidebar-controls">
        <div className="view-toggle" role="tablist" aria-label="表示切替">
          <button
            className={`view-tab ${viewMode === "notes" ? "active" : ""}`}
            onClick={() => onViewChange("notes")}
            role="tab"
            aria-selected={viewMode === "notes"}
          >
            ノート
          </button>
          <button
            className={`view-tab ${viewMode === "trash" ? "active" : ""}`}
            onClick={() => onViewChange("trash")}
            role="tab"
            aria-selected={viewMode === "trash"}
          >
            ゴミ箱{trashCount > 0 && <span className="badge">{trashCount}</span>}
          </button>
        </div>
        {viewMode === "notes" && (
          <select
            className="sort-select"
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            aria-label="ソート順"
          >
            {(Object.entries(sortLabels) as [SortMode, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tag filter */}
      {viewMode === "notes" && allTags.length > 0 && (
        <div className="tag-filter" role="group" aria-label="タグフィルター">
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

      {/* Trash actions */}
      {viewMode === "trash" && trashCount > 0 && (
        <div className="trash-actions">
          <button className="btn-danger-text" onClick={onEmptyTrash}>
            ゴミ箱を空にする
          </button>
        </div>
      )}

      {/* Note list */}
      <nav className="note-items" role="list" aria-label="ノート一覧">
        {notes.length === 0 && (
          <p className="empty-message">
            {viewMode === "trash"
              ? "ゴミ箱は空です"
              : searchQuery
                ? "見つかりませんでした"
                : filterTag
                  ? `「${filterTag}」タグのノートはありません`
                  : "ノートがありません"}
          </p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className={`note-item ${note.id === selectedId ? "active" : ""}`}
            onClick={() => onSelect(note.id)}
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(note.id);
              }
            }}
            aria-current={note.id === selectedId ? "true" : undefined}
          >
            <div className="note-item-header">
              {note.pinned && <span className="pin-indicator" aria-label="ピン留め済み" title="ピン留め済み">&#x1F4CC;</span>}
              <span className="note-item-title">{note.title || "無題"}</span>
              <div className="note-item-actions">
                {viewMode === "notes" ? (
                  <>
                    <button
                      className="btn-icon-sm"
                      onClick={(e) => { e.stopPropagation(); onDuplicate(note.id); }}
                      title="複製"
                      aria-label="ノートを複製"
                    >
                      ⧉
                    </button>
                    <button
                      className="btn-icon-sm"
                      onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
                      title={note.pinned ? "ピン解除" : "ピン留め"}
                      aria-label={note.pinned ? "ピンを外す" : "ピンで固定する"}
                    >
                      {note.pinned ? "◉" : "○"}
                    </button>
                    <button
                      className="btn-icon-sm btn-danger-icon"
                      onClick={(e) => { e.stopPropagation(); onMoveToTrash(note.id); }}
                      title="ゴミ箱に移動"
                      aria-label="ゴミ箱に移動"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-icon-sm"
                      onClick={(e) => { e.stopPropagation(); onRestore(note.id); }}
                      title="復元"
                      aria-label="ノートを復元"
                    >
                      ↩
                    </button>
                    <button
                      className="btn-icon-sm btn-danger-icon"
                      onClick={(e) => { e.stopPropagation(); onPermanentDelete(note.id); }}
                      title="完全に削除"
                      aria-label="完全に削除"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
            {note.content && (
              <p className="note-item-snippet">{getSnippet(note.content)}</p>
            )}
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
      </nav>

      {/* Keyboard hint */}
      <div className="sidebar-footer" aria-hidden="true">
        <span className="kbd">Ctrl+N</span> 新規
        <span className="kbd">Ctrl+K</span> 検索
      </div>
    </aside>
  );
}
