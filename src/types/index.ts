export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption: string;
}

export interface Post {
  id: number;
  caption: string;
  type: string;
  publishDateTime: string;
  isPublished: boolean;
  typeCount: number;
  isVideo: boolean;
  files?: PostFileType[];
  createdAt: string;
  updatedAt: string;
}

export interface PostFileType {
  id: string;
  url: string;
  caption: string;
}

export interface Stats {
  total: number;
  published: number;
  pending: number;
  thisWeek: number;
  thisMonth: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
}
