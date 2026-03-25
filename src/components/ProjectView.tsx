import { useState, useMemo } from "react";
import type { Project } from "../types/Project";
import type { Note } from "../types/Note";
import type { Task, TaskLabel } from "../types/Task";
import type { Team, TeamMembership, TeamRole } from "../types/User";
import { STATUS_LABELS, PRIORITY_COLORS } from "../types/Task";
import { ROLE_LABELS } from "../types/User";

interface ProjectViewProps {
  projects: Project[];
  selectedProject: Project | null;
  notes: Note[];
  allTasks: Task[];
  labels: TaskLabel[];
  teams: Team[];
  members: TeamMembership[];
  canManageMembers: boolean;
  canEdit: boolean;
  onSelectProject: (id: string | null) => void;
  onCreateProject: (name: string, tag: string, description?: string) => void;
  onUpdateProject: (id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => void;
  onRemoveProject: (id: string) => void;
  onNavigateToNote: (noteId: string) => void;
  onNavigateToTask: (taskId: string) => void;
  onLinkTaskToProject: (taskId: string, projectId: string) => void;
  onUnlinkTaskFromProject: (taskId: string) => void;
  onAssignTeam: (projectId: string, teamId: string | null) => void;
  onCreateTeam: (name: string, description?: string) => Team;
  onAddMember: (userId: string, displayName: string, role?: TeamRole) => void;
  onUpdateMemberRole: (membershipId: string, role: TeamRole) => void;
  onRemoveMember: (membershipId: string) => void;
  onSelectTeam: (teamId: string | null) => void;
}

export function ProjectView({
  projects,
  selectedProject,
  notes,
  allTasks,
  labels,
  teams,
  members,
  canManageMembers,
  canEdit,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onRemoveProject,
  onNavigateToNote,
  onNavigateToTask,
  onLinkTaskToProject,
  onUnlinkTaskFromProject,
  onAssignTeam,
  onCreateTeam,
  onAddMember,
  onUpdateMemberRole,
  onRemoveMember,
  onSelectTeam,
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
  const [teamPanelOpen, setTeamPanelOpen] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamRole>("viewer");

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

  const assignedTeam = useMemo(() => {
    if (!selectedProject?.teamId) return null;
    return teams.find((t) => t.id === selectedProject.teamId) ?? null;
  }, [selectedProject, teams]);

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

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;
    const team = onCreateTeam(newTeamName.trim(), newTeamDesc.trim());
    if (selectedProject) {
      onAssignTeam(selectedProject.id, team.id);
    }
    setNewTeamName("");
    setNewTeamDesc("");
    setCreatingTeam(false);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const id = crypto.randomUUID();
    onAddMember(id, newMemberName.trim(), newMemberRole);
    setNewMemberName("");
    setNewMemberRole("viewer");
    setAddingMember(false);
  };

  const getLabel = (id: string) => labels.find((l) => l.id === id);

  const roleClass = (role: TeamRole) =>
    role === "owner" ? "role-owner" : role === "editor" ? "role-editor" : "role-viewer";

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
                      {canEdit && (
                        <button className="project-btn" onClick={handleStartEdit}>
                          編集
                        </button>
                      )}
                      <button
                        className="project-btn"
                        onClick={() => {
                          setTeamPanelOpen(!teamPanelOpen);
                          if (!teamPanelOpen && assignedTeam) {
                            onSelectTeam(assignedTeam.id);
                          }
                        }}
                      >
                        {assignedTeam ? assignedTeam.name : "チーム設定"}
                      </button>
                      {canManageMembers && (
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
                      )}
                    </div>
                  </div>
                  {selectedProject.description && (
                    <p className="project-description">{selectedProject.description}</p>
                  )}
                </>
              )}
            </div>

            {/* Team panel */}
            {teamPanelOpen && (
              <section className="project-section team-panel">
                <h3 className="project-section-title">
                  チーム
                  {assignedTeam && (
                    <span className="project-section-count">{members.length}人</span>
                  )}
                </h3>

                {assignedTeam ? (
                  <>
                    {/* Members list */}
                    <div className="team-members">
                      {members.map((m) => (
                        <div key={m.id} className="team-member">
                          <div className="team-member-avatar">
                            {m.userId.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="team-member-name">{m.userId}</span>
                          <span className={`team-role-badge ${roleClass(m.role)}`}>
                            {ROLE_LABELS[m.role]}
                          </span>
                          {canManageMembers && m.role !== "owner" && (
                            <div className="team-member-actions">
                              <select
                                className="team-role-select"
                                value={m.role}
                                onChange={(e) =>
                                  onUpdateMemberRole(m.id, e.target.value as TeamRole)
                                }
                              >
                                <option value="viewer">参加者</option>
                                <option value="editor">編集者</option>
                                <option value="owner">オーナー</option>
                              </select>
                              <button
                                className="project-btn project-btn-danger project-btn-sm"
                                onClick={() => onRemoveMember(m.id)}
                              >
                                除外
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add member */}
                    {canManageMembers && (
                      <>
                        {addingMember ? (
                          <div className="team-add-form">
                            <input
                              className="project-input"
                              placeholder="ユーザー名 or メールアドレス"
                              value={newMemberName}
                              onChange={(e) => setNewMemberName(e.target.value)}
                              autoFocus
                            />
                            <select
                              className="team-role-select"
                              value={newMemberRole}
                              onChange={(e) => setNewMemberRole(e.target.value as TeamRole)}
                            >
                              <option value="viewer">参加者</option>
                              <option value="editor">編集者</option>
                              <option value="owner">オーナー</option>
                            </select>
                            <button className="project-btn project-btn-primary" onClick={handleAddMember}>
                              追加
                            </button>
                            <button className="project-btn" onClick={() => setAddingMember(false)}>
                              キャンセル
                            </button>
                          </div>
                        ) : (
                          <button
                            className="project-btn project-btn-sm"
                            onClick={() => setAddingMember(true)}
                          >
                            + メンバーを追加
                          </button>
                        )}
                      </>
                    )}

                    {/* Unassign team */}
                    {canManageMembers && (
                      <button
                        className="project-btn project-btn-sm team-unassign"
                        onClick={() => onAssignTeam(selectedProject.id, null)}
                      >
                        チームを解除
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* Assign existing team or create new */}
                    {teams.length > 0 && (
                      <div className="team-assign-list">
                        <p className="project-section-empty">既存のチームを割り当て:</p>
                        {teams.map((team) => (
                          <button
                            key={team.id}
                            className="project-link-item"
                            onClick={() => {
                              onAssignTeam(selectedProject.id, team.id);
                              onSelectTeam(team.id);
                            }}
                          >
                            {team.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {creatingTeam ? (
                      <div className="team-add-form">
                        <input
                          className="project-input"
                          placeholder="チーム名"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          autoFocus
                        />
                        <input
                          className="project-input"
                          placeholder="説明（任意）"
                          value={newTeamDesc}
                          onChange={(e) => setNewTeamDesc(e.target.value)}
                        />
                        <div className="project-create-actions">
                          <button className="project-btn project-btn-primary" onClick={handleCreateTeam}>
                            作成
                          </button>
                          <button className="project-btn" onClick={() => setCreatingTeam(false)}>
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="project-btn"
                        onClick={() => setCreatingTeam(true)}
                      >
                        + 新規チームを作成
                      </button>
                    )}
                  </>
                )}
              </section>
            )}

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
                {canEdit && (
                  <button
                    className="project-btn project-btn-sm"
                    onClick={() => setLinkingTask(!linkingTask)}
                  >
                    {linkingTask ? "閉じる" : "+ Issueを追加"}
                  </button>
                )}
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
                      {canEdit && (
                        <button
                          className="project-unlink-btn"
                          onClick={() => onUnlinkTaskFromProject(task.id)}
                          title="プロジェクトから外す"
                        >
                          &times;
                        </button>
                      )}
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
