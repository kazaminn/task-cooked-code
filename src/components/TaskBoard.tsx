import { useState, useEffect, useRef } from "react";
import type { Task, TaskLabel, TaskMilestone, TaskComment, TaskStatus, TaskPriority } from "../types/Task";
import type { Note } from "../types/Note";
import { DEFAULT_COLUMNS, STATUS_LABELS, PRIORITY_COLORS } from "../types/Task";

function useDebouncedTaskBody(
  task: Task | null,
  onUpdate: (id: string, updates: Partial<Task>) => void
) {
  const [localBody, setLocalBody] = useState(task?.body ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const taskIdRef = useRef(task?.id);
  const onUpdateRef = useRef(onUpdate);
  const pendingRef = useRef<{ taskId: string; body: string } | null>(null);
  onUpdateRef.current = onUpdate;

  const flush = () => {
    clearTimeout(timerRef.current);
    if (pendingRef.current) {
      onUpdateRef.current(pendingRef.current.taskId, { body: pendingRef.current.body });
      pendingRef.current = null;
    }
  };

  // Flush & reset when task switches
  if (taskIdRef.current !== task?.id) {
    flush();
    taskIdRef.current = task?.id;
    setLocalBody(task?.body ?? "");
  }

  // Flush on unmount
  useEffect(() => () => { flush(); }, []);

  const handleChange = (value: string) => {
    setLocalBody(value);
    clearTimeout(timerRef.current);
    const taskId = task?.id;
    if (!taskId) return;
    pendingRef.current = { taskId, body: value };
    timerRef.current = setTimeout(() => {
      onUpdateRef.current(taskId, { body: value });
      pendingRef.current = null;
    }, 400);
  };

  return [localBody, handleChange] as const;
}

type BoardView = "list" | "board";

interface TaskBoardProps {
  tasks: Task[];
  tasksByStatus: Record<TaskStatus, Task[]>;
  labels: TaskLabel[];
  milestones: TaskMilestone[];
  selectedTask: Task | null;
  comments: TaskComment[];
  filterLabel: string | null;
  filterStatus: TaskStatus | "all";
  searchQuery: string;
  onFilterLabel: (id: string | null) => void;
  onFilterStatus: (s: TaskStatus | "all") => void;
  onSearchChange: (q: string) => void;
  onSelectTask: (id: string | null) => void;
  onCreateTask: (title: string, body?: string, priority?: TaskPriority) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onRemoveTask: (id: string) => void;
  onAddComment: (taskId: string, body: string) => void;
  onAddLabel: (name: string, color: string) => void;
  onAddMilestone: (title: string, dueDate: number | null) => void;
  onClose: () => void;
  onNavigateToLinkedNote: (taskId: string) => void;
  onCreateNoteFromIssue: (task: Task) => void;
  getLinkedNote: (taskId: string) => Note | null;
}

function TaskLabelBadge({ label }: { label: TaskLabel }) {
  return (
    <span
      className="task-label-badge"
      style={{
        background: label.color + "22",
        color: label.color,
        borderColor: label.color + "44",
      }}
    >
      {label.name}
    </span>
  );
}

function PriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className="priority-dot"
      style={{ background: PRIORITY_COLORS[priority] }}
      title={priority}
    />
  );
}

export function TaskBoard({
  tasks,
  tasksByStatus,
  labels,
  milestones,
  selectedTask,
  comments,
  filterLabel,
  filterStatus,
  searchQuery,
  onFilterLabel,
  onFilterStatus,
  onSearchChange,
  onSelectTask,
  onCreateTask,
  onUpdateTask,
  onRemoveTask,
  onAddComment,
  onAddLabel,
  onAddMilestone,
  onClose,
  onNavigateToLinkedNote,
  onCreateNoteFromIssue,
  getLinkedNote,
}: TaskBoardProps) {
  const [view, setView] = useState<BoardView>("list");
  const [newTitle, setNewTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [taskBody, setTaskBody] = useDebouncedTaskBody(selectedTask, onUpdateTask);
  const [showNewLabel, setShowNewLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#0075ca");
  const [showNewMilestone, setShowNewMilestone] = useState(false);
  const [newMsTitle, setNewMsTitle] = useState("");

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreateTask(newTitle.trim());
    setNewTitle("");
  };

  const handleComment = () => {
    if (!commentText.trim() || !selectedTask) return;
    onAddComment(selectedTask.id, commentText.trim());
    setCommentText("");
  };

  // Detail view
  if (selectedTask) {
    const taskLabels = labels.filter((l) => selectedTask.labels.includes(l.id));
    const milestone = milestones.find((m) => m.id === selectedTask.milestone);

    return (
      <div className="task-board">
        <header className="task-board-header">
          <button className="btn-toolbar" onClick={() => onSelectTask(null)}>← 戻る</button>
          <h2 className="task-detail-title">
            <span className="task-number">#{selectedTask.number}</span>
            {selectedTask.title}
          </h2>
          <button className="btn-toolbar btn-danger-text" onClick={() => { onRemoveTask(selectedTask.id); }}>
            削除
          </button>
        </header>

        <div className="task-detail-layout">
          {/* Main content */}
          <div className="task-detail-main">
            {/* Editable body */}
            <textarea
              className="task-detail-body"
              value={taskBody}
              onChange={(e) => setTaskBody(e.target.value)}
              placeholder="説明を追加... (Markdown対応)"
            />

            {/* Comments */}
            <div className="task-comments">
              <h4 className="task-comments-title">コメント ({comments.length})</h4>
              {comments.map((c) => (
                <div key={c.id} className="task-comment">
                  <span className="task-comment-date">
                    {new Date(c.createdAt).toLocaleString("ja-JP")}
                  </span>
                  <p className="task-comment-body">{c.body}</p>
                </div>
              ))}
              <div className="task-comment-form">
                <textarea
                  className="task-comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="コメントを追加..."
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleComment();
                  }}
                />
                <button className="btn-toolbar" onClick={handleComment} disabled={!commentText.trim()}>
                  投稿
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="task-detail-sidebar">
            {/* Status */}
            <div className="task-sidebar-section">
              <span className="task-sidebar-label">ステータス</span>
              <select
                className="sort-select"
                value={selectedTask.status}
                onChange={(e) => onUpdateTask(selectedTask.id, { status: e.target.value as TaskStatus })}
              >
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="task-sidebar-section">
              <span className="task-sidebar-label">優先度</span>
              <select
                className="sort-select"
                value={selectedTask.priority}
                onChange={(e) => onUpdateTask(selectedTask.id, { priority: e.target.value as TaskPriority })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Labels */}
            <div className="task-sidebar-section">
              <span className="task-sidebar-label">ラベル</span>
              <div className="task-label-list">
                {labels.map((l) => (
                  <label key={l.id} className="task-label-check">
                    <input
                      type="checkbox"
                      checked={selectedTask.labels.includes(l.id)}
                      onChange={(e) => {
                        const newLabels = e.target.checked
                          ? [...selectedTask.labels, l.id]
                          : selectedTask.labels.filter((x) => x !== l.id);
                        onUpdateTask(selectedTask.id, { labels: newLabels });
                      }}
                    />
                    <TaskLabelBadge label={l} />
                  </label>
                ))}
              </div>
            </div>

            {/* Milestone */}
            <div className="task-sidebar-section">
              <span className="task-sidebar-label">マイルストーン</span>
              <select
                className="sort-select"
                value={selectedTask.milestone || ""}
                onChange={(e) => onUpdateTask(selectedTask.id, { milestone: e.target.value || null })}
              >
                <option value="">なし</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div className="task-sidebar-section">
              <span className="task-sidebar-label">担当者</span>
              <input
                className="task-assignee-input"
                type="text"
                value={selectedTask.assignee}
                onChange={(e) => onUpdateTask(selectedTask.id, { assignee: e.target.value })}
                placeholder="担当者名"
              />
            </div>

            {/* Linked Note */}
            <div className="task-sidebar-section">
              <span className="task-sidebar-label">リンクされたノート</span>
              {(() => {
                const linkedNote = getLinkedNote(selectedTask.id);
                if (linkedNote) {
                  return (
                    <button
                      className="cross-ref-item"
                      onClick={() => onNavigateToLinkedNote(selectedTask.id)}
                      title="リンクされたノートを開く"
                    >
                      <span className="cross-ref-item-title">{linkedNote.title || "無題"}</span>
                    </button>
                  );
                }
                return (
                  <button
                    className="btn-toolbar"
                    onClick={() => onCreateNoteFromIssue(selectedTask)}
                    style={{ width: "100%" }}
                  >
                    + ノートを作成
                  </button>
                );
              })()}
            </div>

            {/* Meta */}
            <div className="task-sidebar-section">
              <span className="task-sidebar-label">詳細</span>
              <div className="task-meta">
                {taskLabels.length > 0 && (
                  <div className="task-meta-row">
                    {taskLabels.map((l) => <TaskLabelBadge key={l.id} label={l} />)}
                  </div>
                )}
                {milestone && (
                  <div className="task-meta-row">🏁 {milestone.title}</div>
                )}
                <div className="task-meta-row">
                  作成: {new Date(selectedTask.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // List / Board view
  return (
    <div className="task-board">
      <header className="task-board-header">
        <h2 className="sidebar-title">Issues</h2>
        <div className="task-board-actions">
          <div className="view-toggle">
            <button
              className={`view-tab ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              リスト
            </button>
            <button
              className={`view-tab ${view === "board" ? "active" : ""}`}
              onClick={() => setView("board")}
            >
              ボード
            </button>
          </div>
          <button className="btn-toolbar" onClick={() => setShowNewLabel(!showNewLabel)}>ラベル</button>
          <button className="btn-toolbar" onClick={() => setShowNewMilestone(!showNewMilestone)}>マイルストーン</button>
          <button className="btn-toolbar" onClick={onClose}>× 閉じる</button>
        </div>
      </header>

      {/* New label form */}
      {showNewLabel && (
        <div className="task-inline-form">
          <input
            className="find-replace-input"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="ラベル名"
          />
          <input
            type="color"
            value={newLabelColor}
            onChange={(e) => setNewLabelColor(e.target.value)}
            className="color-picker"
          />
          <button
            className="btn-toolbar"
            onClick={() => {
              if (newLabelName.trim()) {
                onAddLabel(newLabelName.trim(), newLabelColor);
                setNewLabelName("");
                setShowNewLabel(false);
              }
            }}
          >
            追加
          </button>
        </div>
      )}

      {/* New milestone form */}
      {showNewMilestone && (
        <div className="task-inline-form">
          <input
            className="find-replace-input"
            value={newMsTitle}
            onChange={(e) => setNewMsTitle(e.target.value)}
            placeholder="マイルストーン名"
          />
          <button
            className="btn-toolbar"
            onClick={() => {
              if (newMsTitle.trim()) {
                onAddMilestone(newMsTitle.trim(), null);
                setNewMsTitle("");
                setShowNewMilestone(false);
              }
            }}
          >
            追加
          </button>
        </div>
      )}

      {/* Create new issue */}
      <div className="task-create-bar">
        <input
          className="task-create-input"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しいIssueを作成..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <button className="btn-icon btn-accent" onClick={handleCreate} disabled={!newTitle.trim()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div className="task-filters">
        <select
          className="sort-select"
          value={filterStatus}
          onChange={(e) => onFilterStatus(e.target.value as TaskStatus | "all")}
        >
          <option value="all">すべてのステータス</option>
          {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className="sort-select"
          value={filterLabel || ""}
          onChange={(e) => onFilterLabel(e.target.value || null)}
        >
          <option value="">すべてのラベル</option>
          {labels.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <input
          className="search-input task-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Issue検索..."
        />
      </div>

      {/* Board view */}
      {view === "board" ? (
        <div className="kanban-board">
          {DEFAULT_COLUMNS.map((col) => {
            const colTasks = tasksByStatus[col.status];
            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title">{col.title}</span>
                  <span className="kanban-column-count">{colTasks.length}</span>
                </div>
                <div className="kanban-column-body">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="kanban-card"
                      onClick={() => onSelectTask(task.id)}
                    >
                      <div className="kanban-card-header">
                        <PriorityDot priority={task.priority} />
                        <span className="task-number">#{task.number}</span>
                      </div>
                      <span className="kanban-card-title">{task.title}</span>
                      {task.labels.length > 0 && (
                        <div className="kanban-card-labels">
                          {task.labels.map((lid) => {
                            const l = labels.find((x) => x.id === lid);
                            return l ? <TaskLabelBadge key={l.id} label={l} /> : null;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="task-list">
          {tasks.length === 0 && (
            <p className="empty-message">Issueがありません</p>
          )}
          {tasks.map((task) => {
            const taskLabels = labels.filter((l) => task.labels.includes(l.id));
            return (
              <div
                key={task.id}
                className="task-list-item"
                onClick={() => onSelectTask(task.id)}
              >
                <div className="task-list-item-left">
                  <PriorityDot priority={task.priority} />
                  <span
                    className={`task-status-icon ${task.status}`}
                    title={STATUS_LABELS[task.status]}
                  >
                    {task.status === "open" ? "○" : task.status === "in_progress" ? "◐" : task.status === "done" ? "●" : "⊘"}
                  </span>
                  <span className="task-number">#{task.number}</span>
                  <span className="task-list-title">{task.title}</span>
                  {taskLabels.map((l) => <TaskLabelBadge key={l.id} label={l} />)}
                </div>
                <div className="task-list-item-right">
                  {task.assignee && <span className="task-assignee-tag">{task.assignee}</span>}
                  <span className="note-item-date">
                    {new Date(task.updatedAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
