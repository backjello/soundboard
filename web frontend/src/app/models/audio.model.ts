import { User } from './user.model';

export interface Audio {
  id: number;
  name: string;
  path: string;
  uploadedById: number;
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
}

export interface AudioUploadRequest {
  name: string;
  file: File;
}

export interface AudioPlayResponse {
  message: string;
  file: string;
  volume: number;
}

export interface AudioListResponse {
  data: Audio[];
}
