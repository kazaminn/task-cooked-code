import { useState, useRef, useCallback, useMemo } from "react";
import { useAppContext } from "./context/useAppContext";
import { useKeyboard } from "./hooks/useKeyboard";
import { NoteList } from "./components/NoteList";
import { NoteEditor } from "./components/NoteEditor";
import { ThemePanel } from "./components/ThemePanel";
import { ToastContainer } from "./components/ToastContainer";
import { TemplatePanel } from "./components/TemplatePanel";
import { StatsPanel } from "./components/StatsPanel";
import { TaskBoard } from "./components/TaskBoard";
import { ProjectView } from "./components/ProjectView";
import { exportAsMarkdown } from "./lib/export";
import { exportAllAsJSON, importFromJSON, importFromMarkdown } from "./lib/backup";
import type { NoteTemplate } from "./lib/templates";
import "highlight.js/styles/github-dark.min.css";
import "./App.css";

type AppView = "notes" | "tasks" | "projects";

function App() {
  const { notes: n, tasks: t, projects: p, teams: tm, theme, toast, crossRef } = useAppContext();

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
      const note = n.notes.find((x) => x.id === id);
      n.moveToTrash(id);
      if (note) {
        toast.addToast(`「${note.title || "無題"}」をゴミ箱に移動しました`, {
          label: "元に戻す",
          onClick: () => n.restoreFromTrash(id),
        });
      }
    },
    [n, toast]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      n.duplicateNote(id);
      toast.addToast("ノートを複製しました");
    },
    [n, toast]
  );

  const handleEmptyTrash = useCallback(() => {
    n.emptyTrash();
    toast.addToast("ゴミ箱を空にしました");
  }, [n, toast]);

  const handleTemplate = useCallback(
    (template: NoteTemplate) => {
      n.addNoteFromTemplate(template.title, template.content, template.tags);
      toast.addToast(`「${template.name}」テンプレートから作成しました`);
    },
    [n, toast]
  );

  const handleExportJSON = useCallback(() => {
    exportAllAsJSON(n.getAllNotes());
    toast.addToast("JSONバックアップをダウンロードしました");
  }, [n, toast]);

  const handleImportJSON = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const imported = await importFromJSON(file);
        n.importNotes(imported);
        toast.addToast(`${imported.length}件のノートをインポートしました`);
      } catch {
        toast.addToast("インポートに失敗しました。ファイル形式を確認してください。");
      }
      e.target.value = "";
    },
    [n, toast]
  );

  const handleImportMarkdown = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      let count = 0;
      for (const file of Array.from(files)) {
        try {
          const note = await importFromMarkdown(file);
          n.importNotes([note]);
          count++;
        } catch { /* skip */ }
      }
      if (count > 0) toast.addToast(`${count}件のMarkdownをインポートしました`);
      e.target.value = "";
    },
    [n, toast]
  );

  const handleBatchMoveToTrash = useCallback(
    (ids: string[]) => {
      n.batchMoveToTrash(ids);
      toast.addToast(`${ids.length}件のノートをゴミ箱に移動しました`);
    },
    [n, toast]
  );

  const handleBatchAddTag = useCallback(
    (ids: string[], tag: string) => {
      n.batchAddTag(ids, tag);
      toast.addToast(`${ids.length}件に「${tag}」タグを追加しました`);
    },
    [n, toast]
  );

  // Cross-reference handlers
  const handleCreateIssueFromNote = useCallback(
    (noteId: string) => {
      const note = n.getAllNotes().find((x) => x.id === noteId);
      if (note) crossRef.createIssueFromNote(note);
    },
    [n, crossRef]
  );

  const handleNavigateToLinkedNote = useCallback(
    (taskId: string) => {
      const note = crossRef.getLinkedNote(taskId);
      if (note) {
        setAppView("notes");
        n.setSelectedId(note.id);
      }
    },
    [crossRef, n]
  );

  const handleNavigateToLinkedTask = useCallback(
    (noteId: string) => {
      const tasks = crossRef.getLinkedTasks(noteId);
      if (tasks.length > 0) {
        setAppView("tasks");
        t.setSelectedTaskId(tasks[0].id);
      }
    },
    [crossRef, t]
  );

  const keyHandlers = useMemo(
    () => ({
      onNewNote: n.addNote,
      onSearch: () => searchInputRef.current?.focus(),
      onTogglePreview: () => setPreview((p) => !p),
    }),
    [n.addNote]
  );

  useKeyboard(keyHandlers);

  const handleTogglePreview = useCallback(() => setPreview((p) => !p), []);
  const handleToggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  // Project navigation handlers
  const handleProjectNavigateToNote = useCallback(
    (noteId: string) => {
      setAppView("notes");
      n.setSelectedId(noteId);
    },
    [n]
  );

  const handleProjectNavigateToTask = useCallback(
    (taskId: string) => {
      setAppView("tasks");
      t.setSelectedTaskId(taskId);
    },
    [t]
  );

  const handleLinkTaskToProject = useCallback(
    (taskId: string, projectId: string) => {
      t.updateTask(taskId, { projectId });
    },
    [t]
  );

  const handleUnlinkTaskFromProject = useCallback(
    (taskId: string) => {
      t.updateTask(taskId, { projectId: null });
    },
    [t]
  );

  // All tasks (unfiltered) for project view
  const allTasksForProjects = useMemo(() => {
    const { open, in_progress, done, closed } = t.tasksByStatus;
    return [...open, ...in_progress, ...done, ...closed];
  }, [t.tasksByStatus]);

  // Compute linked tasks for selected note
  const linkedTasksForSelectedNote = useMemo(() => {
    if (!n.selectedNote) return [];
    return crossRef.getLinkedTasks(n.selectedNote.id);
  }, [n.selectedNote, crossRef]);

  if (n.loading) {
    return (
      <div className="app loading-state" role="status" aria-label="読み込み中">
        <div className="spinner" />
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="app-nav" role="navigation" aria-label="メインナビゲーション">
        <button className={`app-nav-tab ${appView === "notes" ? "active" : ""}`} onClick={() => setAppView("notes")}>
          ノート
        </button>
        <button className={`app-nav-tab ${appView === "tasks" ? "active" : ""}`} onClick={() => setAppView("tasks")}>
          Issues
        </button>
        <button className={`app-nav-tab ${appView === "projects" ? "active" : ""}`} onClick={() => setAppView("projects")}>
          プロジェクト
        </button>
        <div className="app-nav-spacer" />
        <button className="app-nav-btn" onClick={() => setTemplateOpen(true)} title="テンプレートから作成">テンプレート</button>
        <button className="app-nav-btn" onClick={() => setStatsOpen(true)} title="統計ダッシュボード">統計</button>
        <button className="app-nav-btn" onClick={handleExportJSON} title="JSONエクスポート">エクスポート</button>
        <button className="app-nav-btn" onClick={() => importFileRef.current?.click()} title="JSONインポート">インポート</button>
        <button className="app-nav-btn" onClick={() => mdImportRef.current?.click()} title="Markdownインポート">.md取込</button>
        <input ref={importFileRef} type="file" accept=".json" hidden onChange={handleImportJSON} />
        <input ref={mdImportRef} type="file" accept=".md,.markdown" multiple hidden onChange={handleImportMarkdown} />
      </nav>

      {appView === "projects" ? (
        <ProjectView
          projects={p.projects}
          selectedProject={p.selectedProject}
          notes={n.getAllNotes()}
          allTasks={allTasksForProjects}
          labels={t.labels}
          teams={tm.teams}
          members={tm.members}
          canManageMembers={tm.canManageMembers}
          canEdit={tm.canEdit}
          onSelectProject={p.setSelectedProjectId}
          onCreateProject={p.createProject}
          onUpdateProject={p.updateProject}
          onRemoveProject={p.removeProject}
          onNavigateToNote={handleProjectNavigateToNote}
          onNavigateToTask={handleProjectNavigateToTask}
          onLinkTaskToProject={handleLinkTaskToProject}
          onUnlinkTaskFromProject={handleUnlinkTaskFromProject}
          onAssignTeam={(projectId, teamId) => p.updateProject(projectId, { teamId })}
          onCreateTeam={tm.createTeam}
          onAddMember={tm.addMember}
          onUpdateMemberRole={tm.updateMemberRole}
          onRemoveMember={tm.removeMember}
          onSelectTeam={tm.setSelectedTeamId}
        />
      ) : appView === "tasks" ? (
        <TaskBoard
          tasks={t.tasks}
          tasksByStatus={t.tasksByStatus}
          labels={t.labels}
          milestones={t.milestones}
          selectedTask={t.selectedTask}
          comments={t.comments}
          filterLabel={t.filterLabel}
          filterStatus={t.filterStatus}
          searchQuery={t.searchQuery}
          onFilterLabel={t.setFilterLabel}
          onFilterStatus={t.setFilterStatus}
          onSearchChange={t.setSearchQuery}
          onSelectTask={t.setSelectedTaskId}
          onCreateTask={t.createTask}
          onUpdateTask={t.updateTask}
          onRemoveTask={t.removeTask}
          onAddComment={t.addComment}
          onAddLabel={t.addLabel}
          onAddMilestone={t.addMilestone}
          onClose={() => setAppView("notes")}
          onNavigateToLinkedNote={handleNavigateToLinkedNote}
          onCreateNoteFromIssue={crossRef.createNoteFromIssue}
          getLinkedNote={crossRef.getLinkedNote}
        />
      ) : (
        <div className="notes-layout">
          <NoteList
            notes={n.notes}
            selectedId={n.selectedId}
            allTags={n.allTags}
            filterTag={n.filterTag}
            searchQuery={n.searchQuery}
            sortMode={n.sortMode}
            viewMode={n.viewMode}
            trashCount={n.trashCount}
            sidebarCollapsed={sidebarCollapsed}
            onFilterTag={n.setFilterTag}
            onSearchChange={n.setSearchQuery}
            onSortChange={n.setSortMode}
            onViewChange={n.setViewMode}
            onSelect={n.setSelectedId}
            onAdd={n.addNote}
            onTogglePin={n.togglePin}
            onDuplicate={handleDuplicate}
            onMoveToTrash={handleMoveToTrash}
            onRestore={n.restoreFromTrash}
            onPermanentDelete={n.permanentDelete}
            onEmptyTrash={handleEmptyTrash}
            onOpenTheme={() => setThemeOpen(true)}
            onToggleSidebar={handleToggleSidebar}
            onBatchMoveToTrash={handleBatchMoveToTrash}
            onBatchAddTag={handleBatchAddTag}
            searchInputRef={searchInputRef}
          />
          {n.selectedNote ? (
            <NoteEditor
              key={n.selectedNote.id}
              note={n.selectedNote}
              allTags={n.allTags}
              preview={preview}
              onTogglePreview={handleTogglePreview}
              onUpdate={n.updateNote}
              onAddImage={n.addImage}
              onRemoveImage={n.removeImage}
              onExport={exportAsMarkdown}
              linkedTasks={linkedTasksForSelectedNote}
              onCreateIssue={handleCreateIssueFromNote}
              onNavigateToTask={handleNavigateToLinkedTask}
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

      <ThemePanel open={themeOpen} mode={theme.mode} colorHue={theme.colorHue} onModeChange={theme.setMode} onColorChange={theme.setColorHue} onClose={() => setThemeOpen(false)} />
      <TemplatePanel open={templateOpen} onSelect={handleTemplate} onClose={() => setTemplateOpen(false)} />
      <StatsPanel open={statsOpen} notes={n.getAllNotes()} onClose={() => setStatsOpen(false)} />
      <ToastContainer toasts={toast.toasts} onDismiss={toast.removeToast} />
    </div>
  );
}

export default App;
