export interface Project {
  id: string;
  name: string;
  description: string;
  /** ノートをこのタグでフィルタリング */
  tag: string;
  color: string; // hex color
  teamId: string | null;
  createdBy: string; // userId
  createdAt: number;
  updatedAt: number;
}
