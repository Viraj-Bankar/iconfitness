import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Grid,
  Send,
  Trash2,
  Edit3,
  Check,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Power,
  RotateCcw,
  Tag,
  Filter,
} from 'lucide-react';
import { OwnerDashboardHeader } from '../components/layout/OwnerDashboardHeader';
import { getActiveOwnerSession, logoutOwner } from '../services/authService';
import {
  getOwnerGalleryItems,
  uploadGalleryMedia,
  publishGalleryItems,
  deleteGalleryMedia,
  updateGalleryMedia,
  toggleGalleryPublishStatus,
  validateMediaFile,
} from '../services/galleryService';
import type { OwnerGalleryMedia } from '../types/gallery';
import {
  GALLERY_PREDEFINED_CATEGORIES,
  type GalleryPredefinedCategory,
  normalizeGalleryCategory,
} from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

interface SelectedUploadFile {
  file: File;
  preview: string;
  isVideo: boolean;
  category: GalleryPredefinedCategory;
  caption: string;
}

export const OwnerGalleryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [items, setItems] = useState<OwnerGalleryMedia[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GalleryPredefinedCategory>('all');

  // Selected files queue for preview before upload
  const [selectedFiles, setSelectedFiles] = useState<SelectedUploadFile[]>([]);
  const [batchCategory, setBatchCategory] = useState<GalleryPredefinedCategory>('Gym Interior');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<{
    id: string;
    title: string;
    category: GalleryPredefinedCategory;
    caption: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirmation modal state
  const [deletingItem, setDeletingItem] = useState<OwnerGalleryMedia | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadGallery = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getOwnerGalleryItems();
      setItems(data);
    } catch (err: unknown) {
      console.error('Error loading gallery items:', err);
      const msg = err instanceof Error ? err.message : 'Could not load gallery items. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication & owner authorization
  useEffect(() => {
    let isMounted = true;
    getActiveOwnerSession().then((session) => {
      if (isMounted) {
        if (!session) {
          setIsAuthorized(false);
          navigate('/admin/login', { replace: true });
        } else {
          setIsAuthorized(true);
          loadGallery();
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [navigate, loadGallery]);

  const handleLogout = async () => {
    await logoutOwner();
    navigate('/admin/login', { replace: true });
  };

  // 1. Trigger File Picker
  const handleOpenPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // 2. File Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validNewFiles: SelectedUploadFile[] = [];

    for (const f of files) {
      const check = validateMediaFile(f);
      if (!check.isValid) {
        setErrorMessage(check.error || 'Invalid file selected.');
        return;
      }
      validNewFiles.push({
        file: f,
        preview: URL.createObjectURL(f),
        isVideo: check.mediaType === 'video',
        category: batchCategory,
        caption: '',
      });
    }

    setSelectedFiles((prev) => [...prev, ...validNewFiles]);
  };

  const removeSelectedFile = (idx: number) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  };

  // Apply batch category to all selected files
  const handleApplyBatchCategory = (newCat: GalleryPredefinedCategory) => {
    setBatchCategory(newCat);
    setSelectedFiles((prev) => prev.map((f) => ({ ...f, category: newCat })));
  };

  // Update category for individual file
  const handleUpdateFileCategory = (index: number, newCat: GalleryPredefinedCategory) => {
    setSelectedFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, category: newCat } : f))
    );
  };

  // Update caption for individual file
  const handleUpdateFileCaption = (index: number, caption: string) => {
    setSelectedFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, caption } : f))
    );
  };

  // 3. Upload Selected Files
  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);
    setSuccessMessage(null);

    let uploadedCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        await uploadGalleryMedia(item.file, {
          category: item.category,
          caption: item.caption,
        });
        uploadedCount++;
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Cleanup previews
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setSelectedFiles([]);

      setSuccessMessage(
        `${uploadedCount} ${uploadedCount === 1 ? 'item' : 'items'} uploaded successfully as draft. Click "PUBLISH TO WEBSITE" to make live!`
      );
      await loadGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 4. Publish to Website
  const handlePublish = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const idsToPublish = selectedIds.length > 0 ? selectedIds : undefined;
    const countToPublish = idsToPublish
      ? idsToPublish.length
      : items.filter((it) => !it.isPublished).length;

    if (countToPublish === 0) {
      setSuccessMessage('All your gallery photos and videos are already published and live on the website!');
      return;
    }

    try {
      await publishGalleryItems(idsToPublish);
      setSelectedIds([]);
      setSuccessMessage(
        'Success! Your gallery photos and videos are now PUBLISHED and live on the ICON FITNESS website.'
      );
      await loadGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publishing failed.';
      setErrorMessage(msg);
    }
  };

  // 5. Toggle Live/Draft
  const handleTogglePublish = async (item: OwnerGalleryMedia) => {
    const nextStatus = !item.isPublished;
    try {
      await toggleGalleryPublishStatus(item.id, nextStatus);
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isPublished: nextStatus } : it))
      );
      setSuccessMessage(
        `"${item.title || 'Media'}" is now ${nextStatus ? 'LIVE on the website' : 'DRAFT (hidden from public)'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed.';
      setErrorMessage(msg);
    }
  };

  // 6. Delete Item with Modal Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    try {
      await deleteGalleryMedia(deletingItem.id, deletingItem.filePath);
      setItems((prev) => prev.filter((it) => it.id !== deletingItem.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingItem.id));
      setSuccessMessage(`"${deletingItem.title || 'Item'}" has been permanently deleted.`);
      setDeletingItem(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // 7. Save Edit (Category & Caption)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsUpdating(true);

    try {
      await updateGalleryMedia(editingItem.id, {
        category: editingItem.category,
        caption: editingItem.caption,
      });
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                category: editingItem.category,
                categoryLabel: editingItem.category,
                caption: editingItem.caption,
              }
            : it
        )
      );
      setEditingItem(null);
      setSuccessMessage('Media details updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update media.';
      setErrorMessage(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle selection for bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'live' && !item.isPublished) return false;
      if (statusFilter === 'draft' && item.isPublished) return false;
      if (categoryFilter !== 'all' && normalizeGalleryCategory(item.category) !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [items, statusFilter, categoryFilter]);

  const unpublishedCount = items.filter((it) => !it.isPublished).length;
  const publishedCount = items.filter((it) => it.isPublished).length;

  if (isAuthorized !== true) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#ED101B] mx-auto" />
          <p className="font-oswald text-xs uppercase tracking-wider text-neutral-400">
            Verifying owner authorization...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col pb-16">
      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Shared Responsive Owner Header */}
      <OwnerDashboardHeader
        activeModule="gallery"
        onLogout={handleLogout}
        unpublishedCount={unpublishedCount}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3.5 sm:px-6 w-full pt-6 sm:pt-8 md:pt-10 flex-1 space-y-6 sm:space-y-8">
        {/* Simple Dashboard Heading */}
        <div className="space-y-1">
          <span className="font-oswald text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#ED101B] block">
            OWNER CONTROL PANEL
          </span>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight break-words">
            Welcome to ICON FITNESS
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#A1A1A1] font-normal leading-relaxed">
            Manage your gym photos and videos with category assignment and live publishing.
          </p>
        </div>

        {/* Alerts / Notifications */}
        {successMessage && (
          <div className="p-4 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-white text-base leading-none"
            >
              &times;
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-md bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gallery Error:</span>
                <span className="text-neutral-300">{errorMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={loadGallery}
                className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-oswald text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RETRY</span>
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-white text-base leading-none px-1"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* 2 Primary Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* 1. ADD PHOTOS OR VIDEOS */}
          <button
            type="button"
            onClick={handleOpenPicker}
            className="p-4 sm:p-5 md:p-6 rounded-md bg-[#ED101B] hover:bg-[#B9000B] text-white flex items-center justify-between shadow-xl transition-transform active:scale-[0.99] cursor-pointer group w-full"
          >
            <div className="flex items-center gap-3 sm:gap-4 text-left min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 flex items-center justify-center flex-shrink-0">
                <UploadCloud className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-display text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wide block leading-snug break-words">
                  ADD PHOTOS OR VIDEOS
                </span>
                <span className="text-[11px] sm:text-xs text-white/80 font-normal leading-tight mt-0.5 block">
                  Tap to choose from phone gallery or camera
                </span>
              </div>
            </div>
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] group-hover:rotate-90 transition-transform hidden sm:block flex-shrink-0 ml-2" />
          </button>

          {/* 2. PUBLISH TO WEBSITE */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={unpublishedCount === 0 && selectedIds.length === 0}
            className={`p-4 sm:p-5 md:p-6 rounded-md flex items-center justify-between shadow-xl transition-transform active:scale-[0.99] cursor-pointer w-full ${
              unpublishedCount > 0 || selectedIds.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-[#171717] border border-[#303030] text-neutral-400 opacity-80 cursor-default'
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4 text-left min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-display text-lg sm:text-xl md:text-2xl font-black uppercase tracking-wide block text-white leading-snug break-words">
                  PUBLISH TO WEBSITE
                </span>
                <span className="text-[11px] sm:text-xs text-neutral-300 font-medium leading-tight mt-0.5 block">
                  {unpublishedCount > 0
                    ? `${unpublishedCount} new unpublished ${unpublishedCount === 1 ? 'item' : 'items'} ready`
                    : 'All items are currently live'}
                </span>
              </div>
            </div>
            {unpublishedCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-white text-emerald-800 text-[10px] sm:text-xs font-oswald font-black uppercase flex-shrink-0 ml-2">
                {unpublishedCount} NEW
              </span>
            )}
          </button>
        </div>

        {/* Selected Files Preview Queue & Category Selection */}
        {selectedFiles.length > 0 && (
          <div className="p-4 sm:p-6 rounded-md bg-[#171717] border-2 border-[#ED101B] space-y-4 sm:space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#303030]">
              <div>
                <h3 className="font-display text-lg sm:text-xl md:text-2xl font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <span>Selected for Upload</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ED101B] text-white text-xs font-oswald">
                    {selectedFiles.length}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Assign categories and optional captions before saving to your dashboard drafts.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="px-3 py-1.5 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-200 text-xs font-oswald uppercase"
                >
                  + Add More
                </button>
                <button
                  type="button"
                  onClick={() => {
                    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
                    setSelectedFiles([]);
                  }}
                  className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-oswald uppercase"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Batch Category Selector (Apply one category to all files) */}
            <div className="p-3 sm:p-3.5 rounded bg-[#080808] border border-[#303030] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#ED101B] flex-shrink-0" />
                <span className="text-xs font-oswald uppercase font-bold text-neutral-300">
                  Batch Category (Apply to all {selectedFiles.length} files):
                </span>
              </div>
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full md:w-auto">
                <select
                  value={batchCategory}
                  onChange={(e) => handleApplyBatchCategory(e.target.value as GalleryPredefinedCategory)}
                  className="w-full xs:w-auto px-3 py-1.5 rounded bg-[#171717] border border-[#ED101B]/50 text-white text-xs font-oswald uppercase focus:outline-none focus:border-[#ED101B]"
                >
                  {GALLERY_PREDEFINED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleApplyBatchCategory(batchCategory)}
                  className="px-3.5 py-1.5 rounded bg-[#222222] hover:bg-neutral-700 text-white text-xs font-oswald uppercase font-bold text-center"
                >
                  Apply All
                </button>
              </div>
            </div>

            {/* Individual Cards with Preview, Category Selector, and Caption */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {selectedFiles.map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-md overflow-hidden bg-[#080808] border border-[#303030] p-3 space-y-2.5 flex flex-col justify-between"
                >
                  {/* Media Thumbnail */}
                  <div className="relative aspect-video w-full rounded overflow-hidden bg-black">
                    {item.isVideo ? (
                      <video
                        src={item.preview}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={item.preview}
                        alt={`Upload preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {item.isVideo && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-oswald font-black uppercase flex items-center gap-1 shadow">
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>Video</span>
                      </div>
                    )}

                    <span className="absolute top-2 right-9 px-2 py-0.5 rounded bg-black/80 border border-[#303030] text-[#ED101B] text-[10px] font-oswald font-bold uppercase tracking-wider shadow truncate max-w-[120px]">
                      {item.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      aria-label="Remove photo"
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:bg-[#ED101B] transition-colors"
                      title="Remove from upload"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Category Dropdown for this item */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-oswald uppercase text-neutral-400 font-bold block">
                      Category *
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) =>
                        handleUpdateFileCategory(idx, e.target.value as GalleryPredefinedCategory)
                      }
                      className="w-full px-2.5 py-1.5 rounded bg-[#171717] border border-[#303030] text-white text-xs font-oswald uppercase focus:outline-none focus:border-[#ED101B]"
                    >
                      {GALLERY_PREDEFINED_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Caption Input for this item */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-oswald uppercase text-neutral-400 font-bold block">
                      Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => handleUpdateFileCaption(idx, e.target.value)}
                      placeholder="e.g. Heavy deadlift zone in Moshi"
                      className="w-full px-2.5 py-1.5 rounded bg-[#171717] border border-[#303030] text-white text-xs focus:outline-none focus:border-[#ED101B]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Button & Progress Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={isUploading}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white font-oswald text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>UPLOADING ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>CONFIRM &amp; UPLOAD {selectedFiles.length} ITEMS</span>
                  </>
                )}
              </button>

              <span className="text-[11px] sm:text-xs text-neutral-400 text-center sm:text-right">
                Uploaded items will be saved as drafts ready to publish.
              </span>
            </div>

            {isUploading && (
              <div className="w-full bg-[#080808] rounded-full h-2 overflow-hidden border border-[#303030]">
                <div
                  className="bg-[#ED101B] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* MY GALLERY SECTION */}
        <div className="space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-[#303030]">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Grid className="w-5 h-5 text-[#ED101B]" />
              <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                MY GALLERY ({items.length})
              </h2>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-oswald flex-wrap">
              <span className="text-emerald-400 font-bold">
                ● {publishedCount} Live on Website
              </span>
              <span className="text-neutral-500 hidden sm:inline">•</span>
              <span className="text-amber-400 font-bold">
                ● {unpublishedCount} Unpublished Drafts
              </span>
            </div>
          </div>

          {/* Filter Bar: Status & Category */}
          <div className="p-3 sm:p-3.5 rounded-md bg-[#171717] border border-[#303030] space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-oswald">
                <span className="text-neutral-400 uppercase mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-[#ED101B]" /> Status:
                </span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded uppercase font-bold transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-[#ED101B] text-white'
                      : 'bg-[#222222] text-neutral-300 hover:text-white'
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('live')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded uppercase font-bold transition-colors ${
                    statusFilter === 'live'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#222222] text-neutral-300 hover:text-white'
                  }`}
                >
                  Live ({publishedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('draft')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded uppercase font-bold transition-colors ${
                    statusFilter === 'draft'
                      ? 'bg-amber-600 text-white'
                      : 'bg-[#222222] text-neutral-300 hover:text-white'
                  }`}
                >
                  Drafts ({unpublishedCount})
                </button>
              </div>

              {/* Category Filter Dropdown */}
              <div className="flex items-center justify-between md:justify-start gap-2 text-xs font-oswald w-full md:w-auto">
                <span className="text-neutral-400 uppercase flex-shrink-0">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as 'all' | GalleryPredefinedCategory)
                  }
                  className="flex-1 md:flex-none px-3 py-1.5 rounded bg-[#080808] border border-[#303030] text-white text-xs font-oswald uppercase focus:outline-none focus:border-[#ED101B]"
                >
                  <option value="all">All Categories</option>
                  {GALLERY_PREDEFINED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Selection Sub-bar */}
            {filteredItems.length > 0 && (
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedIds.length === filteredItems.length) setSelectedIds([]);
                      else setSelectedIds(filteredItems.map((it) => it.id));
                    }}
                    className="px-2.5 py-1 rounded bg-[#222222] text-neutral-300 hover:text-white font-oswald uppercase text-[11px]"
                  >
                    {selectedIds.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-neutral-400 text-xs">
                    {selectedIds.length} of {filteredItems.length} selected
                  </span>
                </div>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-oswald text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Selected ({selectedIds.length})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Gallery Media Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-neutral-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#ED101B]" />
              <p className="font-oswald text-xs uppercase tracking-wider">Loading your gym media...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-md bg-[#171717] border border-[#303030] space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#ED101B]/15 border border-[#ED101B]/40 text-[#ED101B] flex items-center justify-center mx-auto">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  NO MEDIA FOUND
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-1">
                  {statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'No photos or videos match your selected filter criteria.'
                    : 'Tap "ADD PHOTOS OR VIDEOS" above to upload training moments, equipment, or facility photos.'}
                </p>
              </div>
              {statusFilter !== 'all' || categoryFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="px-4 py-2 rounded bg-[#222222] text-neutral-200 text-xs font-oswald uppercase"
                >
                  Reset Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="px-6 py-3 rounded bg-[#ED101B] text-white font-oswald text-xs font-black uppercase tracking-wider shadow-md"
                >
                  ADD FIRST PHOTO OR VIDEO
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isVideo = item.mediaType === 'video';

                return (
                  <div
                    key={item.id}
                    className={`rounded-md bg-[#171717] border overflow-hidden flex flex-col justify-between transition-all ${
                      isSelected ? 'border-[#ED101B] ring-2 ring-[#ED101B]' : 'border-[#303030]'
                    }`}
                  >
                    {/* Media Thumbnail Container */}
                    <div className="relative aspect-video w-full bg-black overflow-hidden group">
                      {isVideo ? (
                        <video
                          src={item.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <ImageWithFallback
                          src={item.mediaUrl}
                          alt={item.title || 'Gym Photo'}
                          category={item.category}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}

                      {/* Video Play Overlay */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-black/70 border border-white/40 flex items-center justify-center text-white">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Select Checkbox (Top Left) */}
                      <button
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className={`absolute top-2.5 left-2.5 w-6 h-6 rounded flex items-center justify-center transition-colors shadow z-10 ${
                          isSelected
                            ? 'bg-[#ED101B] text-white'
                            : 'bg-black/70 border border-white/60 text-transparent hover:border-white'
                        }`}
                        title="Select for bulk publish"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Category Badge & Live/Draft Status Pill (Top Right) */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 max-w-[calc(100%-40px)] z-10">
                        <span className="px-2 py-0.5 rounded text-[10px] font-oswald font-black uppercase tracking-wider bg-black/85 text-[#ED101B] border border-[#ED101B]/40 shadow truncate max-w-[110px] sm:max-w-[130px]">
                          {item.category}
                        </span>
                        {item.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-oswald font-black uppercase tracking-wider bg-emerald-500 text-black shadow flex-shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>LIVE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-oswald font-black uppercase tracking-wider bg-amber-500 text-black shadow animate-pulse flex-shrink-0">
                            <span>DRAFT</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Controls */}
                    <div className="p-3.5 sm:p-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-sm truncate">
                            {item.title || 'Gym Photo'}
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5 min-h-[2rem]">
                          {item.caption || <span className="italic text-neutral-600">No caption</span>}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs gap-1.5">
                        {/* Live / Draft Quick Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(item)}
                          className={`px-2.5 py-1.5 rounded text-[11px] font-oswald font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                            item.isPublished
                              ? 'bg-neutral-800 text-neutral-300 hover:bg-amber-950/50 hover:text-amber-400'
                              : 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                          }`}
                          title={item.isPublished ? 'Unpublish from website' : 'Publish immediately to website'}
                        >
                          <Power className="w-3 h-3" />
                          <span>{item.isPublished ? 'Unpublish' : 'Make Live'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Edit Category & Caption Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setEditingItem({
                                id: item.id,
                                title: item.title || 'Gym Media',
                                category: normalizeGalleryCategory(item.category),
                                caption: item.caption || '',
                              })
                            }
                            className="p-2 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-300 hover:text-white min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                            title="Edit category and caption"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            className="p-2 rounded bg-[#222222] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                            title="Delete photo or video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Edit Category & Caption Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveEdit}
            className="bg-[#171717] border border-[#303030] rounded-md p-4 sm:p-6 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto my-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#303030]">
              <h3 className="font-display text-xl font-black uppercase text-white tracking-wide">
                Edit Media Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-neutral-400 hover:text-white text-lg leading-none p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Category Dropdown */}
            <div>
              <label
                htmlFor="editCategorySelect"
                className="block text-xs font-oswald uppercase text-[#ED101B] font-bold mb-1"
              >
                Category *
              </label>
              <select
                id="editCategorySelect"
                value={editingItem.category}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    category: e.target.value as GalleryPredefinedCategory,
                  })
                }
                className="w-full px-3 py-2 rounded bg-[#080808] border border-[#303030] text-white text-xs font-oswald uppercase focus:outline-none focus:border-[#ED101B]"
              >
                {GALLERY_PREDEFINED_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Caption Input */}
            <div>
              <label
                htmlFor="editCaptionInput"
                className="block text-xs font-oswald uppercase text-neutral-400 font-bold mb-1"
              >
                Caption (Optional)
              </label>
              <textarea
                id="editCaptionInput"
                rows={3}
                value={editingItem.caption}
                onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                placeholder="Add a short caption describing the workout or equipment..."
                className="w-full px-3 py-2 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B] resize-none"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#303030]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded bg-[#222222] text-neutral-300 text-xs font-oswald uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white text-xs font-oswald font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow"
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#171717] border border-[#303030] rounded-md p-4 sm:p-6 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-black uppercase text-white tracking-wide">
                  Confirm Delete
                </h3>
                <p className="text-xs text-neutral-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{deletingItem.title || 'this media'}"</strong>?
              It will be removed from your website gallery and storage.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#303030]">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-300 text-xs font-oswald uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-oswald font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
