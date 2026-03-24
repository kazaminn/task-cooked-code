import { useState, useRef, useCallback, useMemo } from "react";
import { useNotes } from "./hooks/useNotes";
import { useTheme } from "./hooks/useTheme";
import { useKeyboard } from "./hooks/useKeyboard";
import { useToast } from "./hooks/useToast";
import { useTasks } from "./hooks/useTasks";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import { ThemePanel } from "./components/ThemePanel";
import { ToastContainer } from "./components/ToastContainer";
import { TemplatePanel } from "./components/TemplatePanel";
import { StatsPanel } from "./components/StatsPanel";
import { TaskBoard } from "./components/TaskBoard";
import { exportAsMarkdown } from "./lib/export";
import { exportAllAsJSON, importFromJSON, importFromMarkdown } from "./lib/backup";
import type { NoteTemplate } from "./lib/templates";
import "highlight.js/styles/github-dark.min.css";
import "./App.css";

type AppView = "notes" | "tasks";

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
    duplicateNote,
    updateNote,
    togglePin,
    moveToTrash,
    restoreFromTrash,
    permanentDelete,
    emptyTrash,
    addImage,
    removeImage,
    addNoteFromTemplate,
    importNotes,
    getAllNotes,
    batchMoveToTrash,
    batchAddTag,
    loading,
  } = useNotes();

  const taskStore = useTasks();
  const { mode, setMode, colorHue, setColorHue } = useTheme();
  const { toasts, addToast, removeToast } = useToast();
  const [themeOpen, setThemeOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appView, setAppView] = useState<AppView>("notes");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const mdImportRef = useRef<HTMLInputElement>(null);

  const handleMoveToTrash = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id);
      moveToTrash(id);
      if (note) {
        addToast(`「${note.title || "無題"}」をゴミ箱に移動しました`, {
          label: "元に戻す",
          onClick: () => restoreFromTrash(id),
        });
      }
    },
    [notes, moveToTrash, restoreFromTrash, addToast]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateNote(id);
      addToast("ノートを複製しました");
    },
    [duplicateNote, addToast]
  );

  const handleEmptyTrash = useCallback(() => {
    emptyTrash();
    addToast("ゴミ箱を空にしました");
  }, [emptyTrash, addToast]);

  const handleTemplate = useCallback(
    (template: NoteTemplate) => {
      addNoteFromTemplate(template.title, template.content, template.tags);
      addToast(`「${template.name}」テンプレートから作成しました`);
    },
    [addNoteFromTemplate, addToast]
  );

  const handleExportJSON = useCallback(() => {
    exportAllAsJSON(getAllNotes());
    addToast("JSONバックアップをダウンロードしました");
  }, [getAllNotes, addToast]);

  const handleImportJSON = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const imported = await importFromJSON(file);
        importNotes(imported);
        addToast(`${imported.length}件のノートをインポートしました`);
      } catch {
        addToast("インポートに失敗しました。ファイル形式を確認してください。");
      }
      e.target.value = "";
    },
    [importNotes, addToast]
  );

  const handleImportMarkdown = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      let count = 0;
      for (const file of Array.from(files)) {
        try {
          const note = await importFromMarkdown(file);
          importNotes([note]);
          count++;
        } catch {
          // skip invalid files
        }
      }
      if (count > 0) addToast(`${count}件のMarkdownをインポートしました`);
      e.target.value = "";
    },
    [importNotes, addToast]
  );

  const handleBatchMoveToTrash = useCallback(
    (ids: string[]) => {
      batchMoveToTrash(ids);
      addToast(`${ids.length}件のノートをゴミ箱に移動しました`);
    },
    [batchMoveToTrash, addToast]
  );

  const handleBatchAddTag = useCallback(
    (ids: string[], tag: string) => {
      batchAddTag(ids, tag);
      addToast(`${ids.length}件に「${tag}」タグを追加しました`);
    },
    [batchAddTag, addToast]
  );

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
  const handleToggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

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
      {/* App-level navigation tabs */}
      <nav className="app-nav" role="navigation" aria-label="メインナビゲーション">
        <button
          className={`app-nav-tab ${appView === "notes" ? "active" : ""}`}
          onClick={() => setAppView("notes")}
        >
          ノート
        </button>
        <button
          className={`app-nav-tab ${appView === "tasks" ? "active" : ""}`}
          onClick={() => setAppView("tasks")}
        >
          Issues
        </button>
        <div className="app-nav-spacer" />
        <button className="app-nav-btn" onClick={() => setTemplateOpen(true)} title="テンプレートから作成">
          テンプレート
        </button>
        <button className="app-nav-btn" onClick={() => setStatsOpen(true)} title="統計ダッシュボード">
          統計
        </button>
        <button className="app-nav-btn" onClick={handleExportJSON} title="JSONエクスポート">
          エクスポート
        </button>
        <button className="app-nav-btn" onClick={() => importFileRef.current?.click()} title="JSONインポート">
          インポート
        </button>
        <button className="app-nav-btn" onClick={() => mdImportRef.current?.click()} title="Markdownインポート">
          .md取込
        </button>
        <input ref={importFileRef} type="file" accept=".json" hidden onChange={handleImportJSON} />
        <input ref={mdImportRef} type="file" accept=".md,.markdown" multiple hidden onChange={handleImportMarkdown} />
      </nav>

      {appView === "tasks" ? (
        <TaskBoard
          tasks={taskStore.tasks}
          tasksByStatus={taskStore.tasksByStatus}
          labels={taskStore.labels}
          milestones={taskStore.milestones}
          selectedTask={taskStore.selectedTask}
          comments={taskStore.comments}
          filterLabel={taskStore.filterLabel}
          filterStatus={taskStore.filterStatus}
          searchQuery={taskStore.searchQuery}
          onFilterLabel={taskStore.setFilterLabel}
          onFilterStatus={taskStore.setFilterStatus}
          onSearchChange={taskStore.setSearchQuery}
          onSelectTask={taskStore.setSelectedTaskId}
          onCreateTask={taskStore.createTask}
          onUpdateTask={taskStore.updateTask}
          onRemoveTask={taskStore.removeTask}

          onAddComment={taskStore.addComment}
          onAddLabel={taskStore.addLabel}
          onAddMilestone={taskStore.addMilestone}
          onClose={() => setAppView("notes")}
        />
      ) : (
        <div className="notes-layout">
          <NoteList
            notes={notes}
            selectedId={selectedId}
            allTags={allTags}
            filterTag={filterTag}
            searchQuery={searchQuery}
            sortMode={sortMode}
            viewMode={viewMode}
            trashCount={trashCount}
            sidebarCollapsed={sidebarCollapsed}
            onFilterTag={setFilterTag}
            onSearchChange={setSearchQuery}
            onSortChange={setSortMode}
            onViewChange={setViewMode}
            onSelect={setSelectedId}
            onAdd={addNote}
            onTogglePin={togglePin}
            onDuplicate={handleDuplicate}
            onMoveToTrash={handleMoveToTrash}
            onRestore={restoreFromTrash}
            onPermanentDelete={permanentDelete}
            onEmptyTrash={handleEmptyTrash}
            onOpenTheme={() => setThemeOpen(true)}
            onToggleSidebar={handleToggleSidebar}
            onBatchMoveToTrash={handleBatchMoveToTrash}
            onBatchAddTag={handleBatchAddTag}
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
        </div>
      )}

      <ThemePanel open={themeOpen} mode={mode} colorHue={colorHue} onModeChange={setMode} onColorChange={setColorHue} onClose={() => setThemeOpen(false)} />
      <TemplatePanel open={templateOpen} onSelect={handleTemplate} onClose={() => setTemplateOpen(false)} />
      <StatsPanel open={statsOpen} notes={getAllNotes()} onClose={() => setStatsOpen(false)} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
