import { useState, useRef, useCallback, useMemo } from "react";
import { useNotes } from "./hooks/useNotes";
import { useTheme } from "./hooks/useTheme";
import { useKeyboard } from "./hooks/useKeyboard";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import { ThemePanel } from "./components/ThemePanel";
import { exportAsMarkdown } from "./lib/export";
import "./App.css";

function App() {
  const {
    notes,
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
    updateNote,
    togglePin,
    moveToTrash,
    restoreFromTrash,
    permanentDelete,
    emptyTrash,
    addImage,
    removeImage,
    loading,
  } = useNotes();

  const { mode, setMode, colorHue, setColorHue } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const keyHandlers = useMemo(
    () => ({
      onNewNote: addNote,
      onSearch: () => searchInputRef.current?.focus(),
      onTogglePreview: () => setPreview((p) => !p),
    }),
    [addNote]
  );

  useKeyboard(keyHandlers);

  const handleTogglePreview = useCallback(() => setPreview((p) => !p), []);

  if (loading) {
    return (
      <div className="app loading-state" role="status" aria-label="読み込み中">
        <div className="spinner" />
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <NoteList
        notes={notes}
        selectedId={selectedId}
        allTags={allTags}
        filterTag={filterTag}
        searchQuery={searchQuery}
        sortMode={sortMode}
        viewMode={viewMode}
        trashCount={trashCount}
        onFilterTag={setFilterTag}
        onSearchChange={setSearchQuery}
        onSortChange={setSortMode}
        onViewChange={setViewMode}
        onSelect={setSelectedId}
        onAdd={addNote}
        onTogglePin={togglePin}
        onMoveToTrash={moveToTrash}
        onRestore={restoreFromTrash}
        onPermanentDelete={permanentDelete}
        onEmptyTrash={emptyTrash}
        onOpenTheme={() => setThemeOpen(true)}
        searchInputRef={searchInputRef}
      />
      {selectedNote ? (
        <NoteEditor
          note={selectedNote}
          allTags={allTags}
          preview={preview}
          onTogglePreview={handleTogglePreview}
          onUpdate={updateNote}
          onAddImage={addImage}
          onRemoveImage={removeImage}
          onExport={exportAsMarkdown}
        />
      ) : (
        <main className="editor empty-state" role="main">
          <div className="empty-content">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 16h16M16 24h10M16 32h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>ノートを選択するか、新しいノートを作成してください</p>
            <span className="empty-hint">
              <span className="kbd">Ctrl+N</span> で新規作成
            </span>
          </div>
        </main>
      )}
      <ThemePanel
        open={themeOpen}
        mode={mode}
        colorHue={colorHue}
        onModeChange={setMode}
        onColorChange={setColorHue}
        onClose={() => setThemeOpen(false)}
      />
    </div>
  );
}

export default App;
