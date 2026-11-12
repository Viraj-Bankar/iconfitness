import { getSupabase, isSupabaseConfigured } from './supabase';
import { getActiveOwnerSession } from './authService';
import type { OwnerGalleryMedia } from '../types/gallery';
import type { GalleryCategory, GalleryItem } from '../types';

const STORAGE_BUCKET = 'gym-gallery';

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

/**
 * Validates file type and size
 */
export function validateMediaFile(file: File): { isValid: boolean; mediaType?: 'image' | 'video'; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: `Unsupported file type: "${file.type || file.name}". Only images and videos are supported.`,
    };
  }

  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';
  const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  const limitLabel = isVideo ? '50MB' : '15MB';

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max ${mediaType} size is ${limitLabel}.`,
    };
  }

  return { isValid: true, mediaType };
}

/**
 * Helper to ensure the current client has a verified gym owner session.
 * Throws an authorization error if unauthenticated or unauthorized.
 */
async function requireOwnerSession() {
  const session = await getActiveOwnerSession();
  if (!session) {
    throw new Error('Unauthorized: An active gym owner session is required for this action.');
  }
  return session;
}

/**
 * Uploads a photo or video to Supabase Storage and records metadata in database.
 * Requires authenticated owner session.
 * New uploads are set to is_published: false until the owner clicks PUBLISH TO WEBSITE.
 */
export async function uploadGalleryMedia(
  file: File,
  options?: { title?: string; caption?: string; category?: GalleryCategory }
): Promise<OwnerGalleryMedia> {
  await requireOwnerSession();

  const validation = validateMediaFile(file);
  if (!validation.isValid || !validation.mediaType) {
    throw new Error(validation.error || 'Invalid media file.');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase storage is not configured. Media upload is unavailable.');
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client is unavailable.');
  }

  const mediaType = validation.mediaType;

  // 1. Upload to Supabase Storage
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `uploads/${timestamp}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase storage upload error:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 2. Retrieve public URL
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  const mediaUrl = urlData.publicUrl;

  // 3. Insert record in gallery_items table with is_published = false (draft)
  const newRecord = {
    title: options?.title?.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    caption: options?.caption?.trim() || '',
    category: options?.category || 'interior',
    category_label: 'Gym Gallery',
    media_url: mediaUrl,
    media_type: mediaType,
    file_path: filePath,
    file_size: file.size,
    is_published: false, // KEPT UNPUBLISHED UNTIL OWNER CLICKS PUBLISH
    is_real_gym_photo: true,
  };

  const { data: dbData, error: dbError } = await supabase
    .from('gallery_items')
    .insert([newRecord])
    .select()
    .single();

  if (dbError) {
    console.error('Supabase gallery database insert error:', dbError);
    // Attempt rollback of uploaded file to prevent orphan storage objects
    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    } catch {
      // Ignore cleanup error
    }
    throw new Error(`Failed to save media metadata: ${dbError.message}`);
  }

  return {
    id: dbData.id,
    title: dbData.title,
    caption: dbData.caption,
    category: dbData.category as GalleryCategory,
    categoryLabel: dbData.category_label,
    mediaUrl: dbData.media_url,
    mediaType: dbData.media_type,
    filePath: dbData.file_path,
    fileSize: dbData.file_size,
    isPublished: dbData.is_published,
    isRealGymPhoto: dbData.is_real_gym_photo,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
}

/**
 * Fetches all gallery media (both published and drafts) for Owner Dashboard.
 * Requires authenticated owner session.
 */
export async function getOwnerGalleryItems(): Promise<OwnerGalleryMedia[]> {
  await requireOwnerSession();

  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch owner gallery error:', error);
    throw new Error(`Failed to fetch gallery items: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    caption: row.caption,
    category: row.category as GalleryCategory,
    categoryLabel: row.category_label || 'Gym Gallery',
    mediaUrl: row.media_url,
    mediaType: row.media_type as 'image' | 'video',
    filePath: row.file_path,
    fileSize: row.file_size,
    isPublished: row.is_published,
    isRealGymPhoto: row.is_real_gym_photo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Publishes gallery items so they appear on the public website.
 * Requires authenticated owner session.
 */
export async function publishGalleryItems(itemIds?: string[]): Promise<number> {
  await requireOwnerSession();

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client unavailable.');

  let query = supabase.from('gallery_items').update({
    is_published: true,
    updated_at: new Date().toISOString(),
  });

  if (itemIds && itemIds.length > 0) {
    query = query.in('id', itemIds);
  } else {
    query = query.eq('is_published', false);
  }

  const { error, count } = await query;
  if (error) {
    console.error('Supabase publish gallery error:', error);
    throw new Error(`Failed to publish: ${error.message}`);
  }

  return count || (itemIds ? itemIds.length : 1);
}

/**
 * Deletes a gallery photo or video.
 * Requires authenticated owner session.
 */
export async function deleteGalleryMedia(itemId: string, filePath?: string): Promise<void> {
  await requireOwnerSession();

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client unavailable.');

  // 1. Delete database record
  const { error: dbError } = await supabase.from('gallery_items').delete().eq('id', itemId);
  if (dbError) {
    throw new Error(`Delete failed: ${dbError.message}`);
  }

  // 2. Delete storage file if path exists
  if (filePath) {
    await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
  }
}

/**
 * Updates caption of a gallery item.
 * Requires authenticated owner session.
 */
export async function updateGalleryCaption(itemId: string, newCaption: string): Promise<void> {
  await requireOwnerSession();

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client unavailable.');

  const { error } = await supabase
    .from('gallery_items')
    .update({ caption: newCaption.trim(), updated_at: new Date().toISOString() })
    .eq('id', itemId);

  if (error) {
    throw new Error(`Update caption failed: ${error.message}`);
  }
}

/**
 * Fetches approved/published gallery items for the public website Gallery section.
 * Accessible to anonymous website visitors. Only returns rows with is_published = true.
 */
export async function getPublishedGalleryItems(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabase();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch published gallery warning:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title || 'ICON FITNESS Experience',
      category: (row.category as GalleryCategory) || 'interior',
      categoryLabel: row.category_label || 'Gym Gallery',
      image: row.media_url,
      caption: row.caption || '',
      isRealGymPhoto: row.is_real_gym_photo ?? true,
      mediaType: (row.media_type as 'image' | 'video') || 'image',
      videoUrl: row.media_type === 'video' ? row.media_url : undefined,
      isPublished: true,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Error fetching published gallery items:', err);
    return [];
  }
}
