export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  images: ImageAttachment[];
  createdAt: number;
  updatedAt: number;
}

export interface ImageAttachment {
  id: string;
  name: string;
  dataUrl: string;
}
