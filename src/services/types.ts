import type { Note } from "../types/Note";
import type { Task, TaskLabel, TaskMilestone, TaskComment } from "../types/Task";
import type { Project } from "../types/Project";
import type { User, Team, TeamMembership, TeamRole } from "../types/User";

// ── Note Service ──

export interface NoteService {
  loadAll(): Promise<Note[]>;
  save(note: Note): Promise<void>;
  delete(id: string): Promise<void>;
}

// ── Task Service ──

export interface TaskService {
  loadTasks(): Promise<Task[]>;
  saveTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
  loadLabels(): Promise<TaskLabel[]>;
  saveLabel(label: TaskLabel): Promise<void>;
  loadMilestones(): Promise<TaskMilestone[]>;
  saveMilestone(ms: TaskMilestone): Promise<void>;
  loadComments(taskId: string): Promise<TaskComment[]>;
  saveComment(comment: TaskComment): Promise<void>;
}

// ── Project Service ──

export interface ProjectService {
  loadAll(): Promise<Project[]>;
  save(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
}

// ── Auth Service ──

export interface AuthService {
  getCurrentUser(): User;
  // 将来: login, logout, onAuthStateChange
}

// ── Team Service ──

export interface TeamService {
  loadTeams(): Promise<Team[]>;
  saveTeam(team: Team): Promise<void>;
  deleteTeam(id: string): Promise<void>;
  loadMembers(teamId: string): Promise<TeamMembership[]>;
  addMember(membership: TeamMembership): Promise<void>;
  updateMember(membership: TeamMembership): Promise<void>;
  removeMember(id: string): Promise<void>;
}

// ── Service Container ──

export interface Services {
  notes: NoteService;
  tasks: TaskService;
  projects: ProjectService;
  auth: AuthService;
  teams: TeamService;
}
