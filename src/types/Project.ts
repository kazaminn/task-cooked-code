export interface Project {
  id: string;
  name: string;
  description: string;
  /** ノートをこのタグでフィルタリング */
  tag: string;
  color: string; // hex color
  createdAt: number;
  updatedAt: number;
}
