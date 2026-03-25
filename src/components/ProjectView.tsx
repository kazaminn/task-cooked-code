import { useState, useMemo } from "react";
import type { Project } from "../types/Project";
import type { Note } from "../types/Note";
import type { Task, TaskLabel } from "../types/Task";
import { STATUS_LABELS, PRIORITY_COLORS } from "../types/Task";

interface ProjectViewProps {
  projects: Project[];
  selectedProject: Project | null;
  notes: Note[];
  allTasks: Task[];
  labels: TaskLabel[];
  onSelectProject: (id: string | null) => void;
  onCreateProject: (name: string, tag: string, description?: string) => void;
  onUpdateProject: (id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => void;
  onRemoveProject: (id: string) => void;
  onNavigateToNote: (noteId: string) => void;
  onNavigateToTask: (taskId: string) => void;
  onLinkTaskToProject: (taskId: string, projectId: string) => void;
  onUnlinkTaskFromProject: (taskId: string) => void;
}

export function ProjectView({
  projects,
  selectedProject,
  notes,
  allTasks,
  labels,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onRemoveProject,
  onNavigateToNote,
  onNavigateToTask,
  onLinkTaskToProject,
  onUnlinkTaskFromProject,
}: ProjectViewProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTag, setEditTag] = useState("");
  const [linkingTask, setLinkingTask] = useState(false);

  const projectNotes = useMemo(() => {
    if (!selectedProject) return [];
    return notes.filter(
      (n) => !n.trashed && n.tags.includes(selectedProject.tag)
    );
  }, [notes, selectedProject]);

  const projectTasks = useMemo(() => {
    if (!selectedProject) return [];
    return allTasks.filter((t) => t.projectId === selectedProject.id);
  }, [allTasks, selectedProject]);

  const availableTasks = useMemo(() => {
    if (!selectedProject) return [];
    return allTasks.filter((t) => !t.projectId);
  }, [allTasks, selectedProject]);

  const handleCreate = () => {
    if (!newName.trim() || !newTag.trim()) return;
    onCreateProject(newName.trim(), newTag.trim(), newDesc.trim());
    setNewName("");
    setNewTag("");
    setNewDesc("");
    setCreating(false);
  };

  const handleStartEdit = () => {
    if (!selectedProject) return;
    setEditName(selectedProject.name);
    setEditDesc(selectedProject.description);
    setEditTag(selectedProject.tag);
    setEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedProject || !editName.trim() || !editTag.trim()) return;
    onUpdateProject(selectedProject.id, {
      name: editName.trim(),
      description: editDesc.trim(),
      tag: editTag.trim(),
    });
    setEditing(false);
  };

  const getLabel = (id: string) => labels.find((l) => l.id === id);

  return (
    <div className="project-view">
      {/* Sidebar: project list */}
      <aside className="project-sidebar">
        <div className="project-sidebar-header">
          <h2 className="project-sidebar-title">プロジェクト</h2>
          <button
            className="btn-icon"
            onClick={() => setCreating(true)}
            title="新規プロジェクト"
          >
            +
          </button>
        </div>

        {creating && (
          <div className="project-create-form">
            <input
              className="project-input"
              placeholder="プロジェクト名"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <input
              className="project-input"
              placeholder="関連タグ（ノートのフィルタ用）"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            />
            <textarea
              className="project-input project-textarea"
              placeholder="説明（任意）"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
            />
            <div className="project-create-actions">
              <button className="project-btn project-btn-primary" onClick={handleCreate}>
                作成
              </button>
              <button className="project-btn" onClick={() => setCreating(false)}>
                キャンセル
              </button>
            </div>
          </div>
        )}

        <div className="project-list">
          {projects.map((p) => (
            <button
              key={p.id}
              className={`project-list-item ${selectedProject?.id === p.id ? "active" : ""}`}
              onClick={() => onSelectProject(p.id)}
            >
              <span
                className="project-color-dot"
                style={{ background: p.color }}
              />
              <span className="project-list-name">{p.name}</span>
              <span className="project-list-tag">{p.tag}</span>
            </button>
          ))}
          {projects.length === 0 && !creating && (
            <p className="project-empty-hint">
              プロジェクトを作成して、ノートとIssueを集約しましょう
            </p>
          )}
        </div>
      </aside>

      {/* Main: project detail */}
      <main className="project-main">
        {selectedProject ? (
          <>
            {/* Header */}
            <div className="project-header">
              {editing ? (
                <div className="project-edit-form">
                  <input
                    className="project-input project-input-lg"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    className="project-input"
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    placeholder="関連タグ"
                  />
                  <textarea
                    className="project-input project-textarea"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    placeholder="説明"
                  />
                  <div className="project-create-actions">
                    <button className="project-btn project-btn-primary" onClick={handleSaveEdit}>
                      保存
                    </button>
                    <button className="project-btn" onClick={() => setEditing(false)}>
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="project-header-top">
                    <span
                      className="project-color-dot project-color-dot-lg"
                      style={{ background: selectedProject.color }}
                    />
                    <h1 className="project-title">{selectedProject.name}</h1>
                    <span className="project-header-tag">{selectedProject.tag}</span>
                    <div className="project-header-actions">
                      <button className="project-btn" onClick={handleStartEdit}>
                        編集
                      </button>
                      <button
                        className="project-btn project-btn-danger"
                        onClick={() => {
                          if (confirm(`「${selectedProject.name}」を削除しますか？`)) {
                            onRemoveProject(selectedProject.id);
                          }
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  {selectedProject.description && (
                    <p className="project-description">{selectedProject.description}</p>
                  )}
                </>
              )}
            </div>

            {/* Notes section */}
            <section className="project-section">
              <h3 className="project-section-title">
                ノート
                <span className="project-section-count">{projectNotes.length}</span>
              </h3>
              {projectNotes.length > 0 ? (
                <div className="project-card-list">
                  {projectNotes.map((note) => (
                    <button
                      key={note.id}
                      className="project-card"
                      onClick={() => onNavigateToNote(note.id)}
                    >
                      <span className="project-card-title">
                        {note.title || "無題"}
                      </span>
                      <span className="project-card-meta">
                        {note.content.slice(0, 80)}
                        {note.content.length > 80 ? "..." : ""}
                      </span>
                      <span className="project-card-date">
                        {new Date(note.updatedAt).toLocaleDateString("ja-JP")}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="project-section-empty">
                  「{selectedProject.tag}」タグを持つノートがありません
                </p>
              )}
            </section>

            {/* Issues section */}
            <section className="project-section">
              <h3 className="project-section-title">
                Issues
                <span className="project-section-count">{projectTasks.length}</span>
                <button
                  className="project-btn project-btn-sm"
                  onClick={() => setLinkingTask(!linkingTask)}
                >
                  {linkingTask ? "閉じる" : "+ Issueを追加"}
                </button>
              </h3>

              {linkingTask && availableTasks.length > 0 && (
                <div className="project-link-list">
                  {availableTasks.map((task) => (
                    <button
                      key={task.id}
                      className="project-link-item"
                      onClick={() => {
                        onLinkTaskToProject(task.id, selectedProject.id);
                      }}
                    >
                      <span className="project-link-number">#{task.number}</span>
                      <span>{task.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {linkingTask && availableTasks.length === 0 && (
                <p className="project-section-empty">
                  追加可能なIssueがありません
                </p>
              )}

              {projectTasks.length > 0 ? (
                <div className="project-card-list">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="project-task-card">
                      <button
                        className="project-card"
                        onClick={() => onNavigateToTask(task.id)}
                      >
                        <span className="project-card-title">
                          <span className="project-task-number">#{task.number}</span>
                          {task.title}
                        </span>
                        <span className="project-card-meta project-task-meta">
                          <span
                            className="project-task-status"
                            data-status={task.status}
                          >
                            {STATUS_LABELS[task.status]}
                          </span>
                          <span
                            className="project-task-priority"
                            style={{ color: PRIORITY_COLORS[task.priority] }}
                          >
                            {task.priority}
                          </span>
                          {task.labels.map((lid) => {
                            const label = getLabel(lid);
                            return label ? (
                              <span
                                key={lid}
                                className="project-task-label"
                                style={{ background: label.color + "22", color: label.color, borderColor: label.color + "44" }}
                              >
                                {label.name}
                              </span>
                            ) : null;
                          })}
                        </span>
                      </button>
                      <button
                        className="project-unlink-btn"
                        onClick={() => onUnlinkTaskFromProject(task.id)}
                        title="プロジェクトから外す"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !linkingTask && (
                  <p className="project-section-empty">
                    Issueが関連付けられていません
                  </p>
                )
              )}
            </section>
          </>
        ) : (
          <div className="project-empty-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="6" y="8" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M6 16h36" stroke="currentColor" strokeWidth="2" />
              <rect x="12" y="22" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="26" y="22" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="12" y="32" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="26" y="32" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p>プロジェクトを選択するか、新しいプロジェクトを作成してください</p>
          </div>
        )}
      </main>
    </div>
  );
}
