export type TeamRole = "owner" | "editor" | "viewer";

export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdBy: string; // userId
  createdAt: number;
  updatedAt: number;
}

export interface TeamMembership {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: number;
}

export const ROLE_HIERARCHY: Record<TeamRole, number> = {
  viewer: 0,
  editor: 1,
  owner: 2,
};

export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "オーナー",
  editor: "編集者",
  viewer: "参加者",
};
