import type { GalleryCategory } from './index';

export interface OwnerGalleryMedia {
  id: string;
  title?: string;
  caption?: string;
  category: GalleryCategory;
  categoryLabel: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  filePath?: string;
  fileSize?: number;
  isPublished: boolean;
  isRealGymPhoto?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  mediaType: 'image' | 'video';
  title?: string;
  caption?: string;
  category?: GalleryCategory;
  progress: number;
  status: 'queued' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

