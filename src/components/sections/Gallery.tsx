import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ChevronLeft, ChevronRight, CheckCircle2, Play } from 'lucide-react';
import { GALLERY_ITEMS } from '../../data/gymData';
import type { GalleryCategory, GalleryItem } from '../../types';
import { getPublishedGalleryItems } from '../../services/galleryService';

const CATEGORIES: { label: string; value: GalleryCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Gym Interior', value: 'interior' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Strength Training', value: 'strength' },
  { label: 'Cardio', value: 'cardio' },
  { label: 'Zumba', value: 'zumba' },
  { label: 'Yoga', value: 'yoga' },
  { label: 'Personal Training', value: 'trainers' },
];

export const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);

  // Load published items from Supabase and merge with baseline gallery
  const loadGalleryMedia = useCallback(async () => {
    try {
      const published = await getPublishedGalleryItems();
      if (published.length > 0) {
        // Prepend published owner uploads so they appear first!
        setItems([...published, ...GALLERY_ITEMS]);
      } else {
        setItems(GALLERY_ITEMS);
      }
    } catch (err) {
      console.error('Failed to load published gallery media:', err);
      setItems(GALLERY_ITEMS);
    }
  }, []);

  useEffect(() => {
    loadGalleryMedia();
  }, [loadGalleryMedia]);

  const filteredItems =
    activeCategory === 'all' ? items : items.filter((item) => item.category === activeCategory);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev, handleClose]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [lightboxIndex]);

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <section id="gallery" className="relative py-24 lg:py-32 bg-[#080808] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-3 block">
            VISUAL TOUR
          </span>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[0.95] mb-4">
            INSIDE <span className="text-[#ED101B]">ICON FITNESS.</span>
          </h2>
          <p className="text-[#A1A1A1] text-base sm:text-lg font-normal leading-relaxed">
            Take a closer look at our fitness environment, equipment and workout experiences.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.value);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded text-xs font-oswald font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#ED101B] text-white'
                    : 'bg-[#171717] border border-[#303030] text-[#A1A1A1] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Responsive Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const isVideo = item.mediaType === 'video';
              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setLightboxIndex(index)}
                  className={`group relative rounded-md overflow-hidden bg-[#171717] border border-[#303030] hover:border-[#ED101B] cursor-pointer ${
                    index % 4 === 0 ? 'sm:col-span-2 lg:col-span-2 h-[340px] sm:h-[420px]' : 'h-[340px]'
                  }`}
                >
                  {isVideo ? (
                    <video
                      src={item.videoUrl || item.image}
                      className="w-full h-full object-cover object-center filter brightness-90 group-hover:brightness-100"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90 group-hover:brightness-100"
                      loading="lazy"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {item.isRealGymPhoto && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-oswald font-black uppercase tracking-widest bg-[#ED101B] text-white">
                          <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                          <span>Actual Gym Photo</span>
                        </span>
                      )}
                      {isVideo && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-oswald font-black uppercase tracking-widest bg-blue-600 text-white shadow">
                          <Play className="w-2.5 h-2.5 fill-white" />
                          <span>Video</span>
                        </span>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded text-[10px] font-oswald font-bold uppercase tracking-widest bg-[#080808]/90 text-neutral-300 border border-[#303030]">
                      {item.categoryLabel}
                    </span>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-5 z-10 flex items-end justify-between">
                    <div className="max-w-md">
                      <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide group-hover:text-[#ED101B] transition-colors">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs text-[#A1A1A1] font-normal mt-1 line-clamp-1">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    <div className="w-9 h-9 rounded bg-[#080808]/80 border border-[#303030] group-hover:border-[#ED101B] flex items-center justify-center text-white group-hover:bg-[#ED101B] transition-colors flex-shrink-0 ml-3">
                      {isVideo ? <Play className="w-4 h-4 fill-white" /> : <Maximize2 className="w-4 h-4" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6"
            onClick={handleClose}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close lightbox"
              className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-[#171717] border border-[#303030] text-white hover:text-[#ED101B] hover:border-[#ED101B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous photo"
              className="absolute left-4 sm:left-8 z-50 p-3 rounded-full bg-[#171717]/90 border border-[#303030] text-white hover:text-[#ED101B] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next photo"
              className="absolute right-4 sm:right-8 z-50 p-3 rounded-full bg-[#171717]/90 border border-[#303030] text-white hover:text-[#ED101B] transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col rounded-md overflow-hidden bg-[#171717] border border-[#303030] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 bg-black flex items-center justify-center max-h-[68vh] overflow-hidden">
                {currentItem.mediaType === 'video' ? (
                  <video
                    src={currentItem.videoUrl || currentItem.image}
                    controls
                    autoPlay
                    className="max-h-[68vh] w-auto max-w-full"
                  />
                ) : (
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="max-h-[68vh] w-auto max-w-full object-contain"
                  />
                )}
              </div>

              <div className="p-4 sm:p-5 bg-[#171717] border-t border-[#303030] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {currentItem.isRealGymPhoto && (
                      <span className="text-[10px] uppercase font-oswald font-black tracking-widest text-white bg-[#ED101B] px-2 py-0.5 rounded">
                        Actual Gym Photo
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-oswald font-bold tracking-widest text-neutral-300 bg-[#222222] px-2 py-0.5 rounded">
                      {currentItem.categoryLabel}
                    </span>
                    <span className="text-xs text-[#A1A1A1]">
                      {lightboxIndex + 1} of {filteredItems.length}
                    </span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                    {currentItem.title}
                  </h3>
                  {currentItem.caption && (
                    <p className="text-xs text-[#A1A1A1] font-normal mt-0.5">
                      {currentItem.caption}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
