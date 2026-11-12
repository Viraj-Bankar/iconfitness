import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  Grid,
  Send,
  LogOut,
  Trash2,
  Edit3,
  Check,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { getActiveOwnerSession, logoutOwner } from '../services/authService';
import {
  getOwnerGalleryItems,
  uploadGalleryMedia,
  publishGalleryItems,
  deleteGalleryMedia,
  updateGalleryCaption,
  validateMediaFile,
} from '../services/galleryService';
import type { OwnerGalleryMedia } from '../types/gallery';

export const OwnerGalleryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [items, setItems] = useState<OwnerGalleryMedia[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected files queue for preview before upload
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string; isVideo: boolean }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Caption editing modal/popover
  const [editingItem, setEditingItem] = useState<{ id: string; caption: string } | null>(null);

  const loadGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getOwnerGalleryItems();
      setItems(data);
    } catch (err: unknown) {
      console.error('Error loading gallery items:', err);
      setErrorMessage('Could not load gallery items. Please try again.');
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

    const validNewFiles: { file: File; preview: string; isVideo: boolean }[] = [];

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
        await uploadGalleryMedia(item.file);
        uploadedCount++;
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      // Cleanup previews
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setSelectedFiles([]);

      setSuccessMessage(
        `${uploadedCount} ${uploadedCount === 1 ? 'item' : 'items'} uploaded successfully as draft. Click "PUBLISH TO WEBSITE" to make them live!`
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

  // 5. Delete Item
  const handleDelete = async (item: OwnerGalleryMedia) => {
    const isConfirmed = window.confirm(
      `Delete this ${item.mediaType}? It will be removed from your gallery and website.`
    );
    if (!isConfirmed) return;

    try {
      await deleteGalleryMedia(item.id, item.filePath);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      setSuccessMessage('Item deleted.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed.';
      setErrorMessage(msg);
    }
  };

  // 6. Save Caption
  const handleSaveCaption = async () => {
    if (!editingItem) return;
    try {
      await updateGalleryCaption(editingItem.id, editingItem.caption);
      setItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, caption: editingItem.caption } : it))
      );
      setEditingItem(null);
      setSuccessMessage('Caption updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update caption.';
      setErrorMessage(msg);
    }
  };

  // Toggle selection for bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

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

      {/* Top Bar */}
      <header className="bg-[#171717] border-b border-[#303030] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showSubtitle={false} />
            <div className="h-4 w-px bg-[#303030] hidden sm:block" />
            <span className="font-oswald text-xs font-bold uppercase tracking-widest text-neutral-300 hidden sm:inline-block">
              Owner Gallery Portal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/#gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#303030] text-xs font-oswald flex items-center gap-1.5 transition-colors"
              title="View Live Website Gallery"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#ED101B]" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded bg-[#ED101B]/15 hover:bg-[#ED101B] text-[#ED101B] hover:text-white border border-[#ED101B]/40 text-xs font-oswald font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOG OUT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 w-full pt-8 sm:pt-10 flex-1 space-y-8">
        {/* Simple Dashboard Heading */}
        <div className="space-y-1">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] block">
            OWNER CONTROL PANEL
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Welcome to ICON FITNESS
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1A1] font-normal">
            Manage your gym photos and videos.
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
          <div className="p-4 rounded-md bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white text-base leading-none"
            >
              &times;
            </button>
          </div>
        )}

        {/* 4 Essential Large Buttons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. ADD PHOTOS OR VIDEOS */}
          <button
            type="button"
            onClick={handleOpenPicker}
            className="p-6 rounded-md bg-[#ED101B] hover:bg-[#B9000B] text-white flex items-center justify-between shadow-xl transition-transform active:scale-[0.99] cursor-pointer group"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-13 h-13 rounded-full bg-black/25 flex items-center justify-center flex-shrink-0">
                <UploadCloud className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-display text-xl sm:text-2xl font-black uppercase tracking-wide block">
                  ADD PHOTOS OR VIDEOS
                </span>
                <span className="text-xs text-white/80 font-normal">
                  Tap to choose from phone gallery or camera
                </span>
              </div>
            </div>
            <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform hidden sm:block" />
          </button>

          {/* 2. PUBLISH TO WEBSITE */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={unpublishedCount === 0 && selectedIds.length === 0}
            className={`p-6 rounded-md flex items-center justify-between shadow-xl transition-transform active:scale-[0.99] cursor-pointer ${
              unpublishedCount > 0 || selectedIds.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                : 'bg-[#171717] border border-[#303030] text-neutral-400 opacity-80 cursor-default'
            }`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-13 h-13 rounded-full bg-black/25 flex items-center justify-center flex-shrink-0">
                <Send className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-display text-xl sm:text-2xl font-black uppercase tracking-wide block text-white">
                  PUBLISH TO WEBSITE
                </span>
                <span className="text-xs text-neutral-300 font-medium">
                  {unpublishedCount > 0
                    ? `${unpublishedCount} new unpublished ${unpublishedCount === 1 ? 'item' : 'items'} ready`
                    : 'All items are currently live'}
                </span>
              </div>
            </div>
            {unpublishedCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-oswald font-black uppercase">
                {unpublishedCount} NEW
              </span>
            )}
          </button>
        </div>

        {/* Selected Files Preview Queue (When files are chosen) */}
        {selectedFiles.length > 0 && (
          <div className="p-5 sm:p-6 rounded-md bg-[#171717] border-2 border-[#ED101B] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-black uppercase text-white tracking-wide">
                  Selected for Upload ({selectedFiles.length})
                </h3>
                <p className="text-xs text-neutral-400">
                  Review your photos or videos before uploading.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="px-3 py-1.5 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-200 text-xs font-oswald uppercase"
                >
                  + Add More
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-oswald uppercase"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Thumbnail Preview Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {selectedFiles.map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-md overflow-hidden aspect-square bg-black border border-[#303030] group"
                >
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
                      alt={`Preview ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {item.isVideo && (
                    <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white p-1 rounded-full shadow">
                      <Play className="w-2.5 h-2.5 fill-white" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    aria-label="Remove photo"
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 text-white hover:bg-[#ED101B] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Upload Button & Progress Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={isUploading}
                className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white font-oswald text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
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

              <span className="text-xs text-neutral-400">
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
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#303030]">
            <div className="flex items-center gap-2.5">
              <Grid className="w-5 h-5 text-[#ED101B]" />
              <h2 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                MY GALLERY ({items.length})
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs font-oswald">
              <span className="text-emerald-400 font-bold">
                ● {publishedCount} Live on Website
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-amber-400 font-bold">
                ● {unpublishedCount} Unpublished Drafts
              </span>
            </div>
          </div>

          {/* Bulk Selection Bar */}
          {items.length > 0 && (
            <div className="p-3 rounded bg-[#171717] border border-[#303030] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedIds.length === items.length) setSelectedIds([]);
                    else setSelectedIds(items.map((it) => it.id));
                  }}
                  className="px-2.5 py-1 rounded bg-[#222222] text-neutral-300 hover:text-white font-oswald uppercase"
                >
                  {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-neutral-400">
                  {selectedIds.length} of {items.length} selected
                </span>
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-oswald text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Selected ({selectedIds.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Gallery Media Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-neutral-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#ED101B]" />
              <p className="font-oswald text-xs uppercase tracking-wider">Loading your gym media...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center rounded-md bg-[#171717] border border-[#303030] space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#ED101B]/15 border border-[#ED101B]/40 text-[#ED101B] flex items-center justify-center mx-auto">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  NO PHOTOS OR VIDEOS YET
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-1">
                  Tap "ADD PHOTOS OR VIDEOS" above to upload training moments, equipment, or facility photos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenPicker}
                className="px-6 py-3 rounded bg-[#ED101B] text-white font-oswald text-xs font-black uppercase tracking-wider shadow-md"
              >
                ADD FIRST PHOTO OR VIDEO
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {items.map((item) => {
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
                        <img
                          src={item.mediaUrl}
                          alt={item.title || 'Gym Photo'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}

                      {/* Video Indicator */}
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
                        className={`absolute top-2.5 left-2.5 w-6 h-6 rounded flex items-center justify-center transition-colors shadow ${
                          isSelected
                            ? 'bg-[#ED101B] text-white'
                            : 'bg-black/70 border border-white/60 text-transparent hover:border-white'
                        }`}
                        title="Select for bulk publish"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Published / Draft Status Pill (Top Right) */}
                      <div className="absolute top-2.5 right-2.5">
                        {item.isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-oswald font-black uppercase tracking-wider bg-emerald-500 text-black shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>LIVE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-oswald font-black uppercase tracking-wider bg-amber-500 text-black shadow animate-pulse">
                            <span>DRAFT</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Controls */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-bold text-white text-sm truncate">
                          {item.title || 'Gym Photo'}
                        </h4>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5 min-h-[2rem]">
                          {item.caption || <span className="italic text-neutral-600">No caption</span>}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-neutral-500">
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingItem({ id: item.id, caption: item.caption || '' })}
                            className="p-1.5 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-300 hover:text-white"
                            title="Edit caption"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded bg-[#222222] hover:bg-red-500/20 text-neutral-400 hover:text-red-400"
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

      {/* Caption Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#171717] border border-[#303030] rounded-md p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display text-xl font-black uppercase text-white tracking-wide">
              Edit Caption
            </h3>

            <div>
              <label
                htmlFor="editCaptionInput"
                className="block text-xs font-oswald uppercase text-neutral-400 mb-1"
              >
                Caption (Optional)
              </label>
              <textarea
                id="editCaptionInput"
                rows={3}
                value={editingItem.caption}
                onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                placeholder="Add a short caption describing the workout or equipment..."
                className="w-full px-3 py-2 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded bg-[#222222] text-neutral-300 text-xs font-oswald uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCaption}
                className="px-5 py-2 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white text-xs font-oswald font-black uppercase tracking-wider"
              >
                Save Caption
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

