import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  ExternalLink,
  MessageSquarePlus,
  PenLine,
  ShieldAlert,
  ChevronDown,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { GYM_CONTACT } from '../../data/gymData';
import type { Review } from '../../types/review';
import {
  getApprovedWebsiteReviews,
  calculateReviewStats,
} from '../../services/reviewsService';
import {
  fetchGoogleReviews,
  getGoogleBusinessInfo,
} from '../../services/googleReviewsService';
import { ReviewCard } from '../reviews/ReviewCard';
import { GoogleReviewsCard } from '../reviews/GoogleReviewsCard';
import { WriteReviewModal } from '../reviews/WriteReviewModal';
import { AdminReviewModal } from '../reviews/AdminReviewModal';

export const Testimonials: React.FC = () => {
  const [websiteReviews, setWebsiteReviews] = useState<Review[]>([]);
  const [googleReviews, setGoogleReviews] = useState<Review[]>([]);
  const [isGoogleApiConfigured, setIsGoogleApiConfigured] = useState(false);
  const [googleStatusMessage, setGoogleStatusMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'website' | 'google'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const googleInfo = getGoogleBusinessInfo();

  const loadAllReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const [approvedWeb, googleRes] = await Promise.all([
        getApprovedWebsiteReviews(),
        fetchGoogleReviews(),
      ]);

      setWebsiteReviews(approvedWeb);
      setGoogleReviews(googleRes.reviews);
      setIsGoogleApiConfigured(googleRes.isConfigured);
      setGoogleStatusMessage(googleRes.errorMessage || null);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllReviews();
  }, [loadAllReviews]);

  // Combined stats
  const stats = calculateReviewStats(websiteReviews, googleReviews);

  // Filter reviews by active tab
  const displayedReviews = ((): Review[] => {
    if (activeTab === 'website') return websiteReviews;
    if (activeTab === 'google') return googleReviews;
    // 'all' tab combines both sources
    return [...websiteReviews, ...googleReviews];
  })();

  const paginatedReviews = displayedReviews.slice(0, visibleCount);
  const hasMore = visibleCount < displayedReviews.length;

  return (
    <section id="reviews" className="relative py-24 lg:py-32 bg-[#171717] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-3 block">
              MEMBER REVIEWS &amp; TESTIMONIALS
            </span>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[0.95] mb-4">
              TRUST BUILT <br />
              <span className="text-[#ED101B]">THROUGH EXPERIENCE.</span>
            </h2>

            <p className="text-[#A1A1A1] text-base sm:text-lg font-normal leading-relaxed">
              Read authentic feedback from members who train at ICON FITNESS, or share your own personal workout journey.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-all duration-200 cursor-pointer shadow-lg shadow-[#ED101B]/20"
            >
              <PenLine className="w-4 h-4 stroke-[2.5]" />
              <span>WRITE A REVIEW</span>
            </button>

            <a
              href={googleInfo.writeReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md text-xs font-oswald font-bold uppercase tracking-wider text-white bg-[#080808] hover:bg-[#222222] border border-[#303030] hover:border-neutral-400 transition-colors shadow-md group"
            >
              <MessageSquarePlus className="w-4 h-4 text-white" />
              <span>WRITE A GOOGLE REVIEW</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Combined Rating Snapshot Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-10">
          {/* Main Rating Summary */}
          <div className="md:col-span-5 p-6 rounded-md bg-[#222222] border border-[#303030] flex flex-col justify-between">
            <div>
              <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B] block mb-2">
                OVERALL RATING OVERVIEW
              </span>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display text-5xl sm:text-6xl font-black text-white leading-none">
                  {stats.averageRating.toFixed(1)}
                </span>
                <div className="flex flex-col">
                  <div className="flex text-[#FFB800]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#A1A1A1] font-semibold mt-1">
                    OUT OF 5.0 STARS
                  </span>
                </div>
              </div>

              <p className="font-oswald text-xs uppercase tracking-wider text-neutral-300 font-bold">
                {stats.totalReviews} TOTAL REVIEWS COMBINED
              </p>
            </div>

            <div className="pt-4 border-t border-[#303030] mt-4 flex items-center justify-between text-xs text-neutral-400">
              <span>Google: <strong className="text-white">{stats.googleReviewCount}</strong></span>
              <span>•</span>
              <span>Website: <strong className="text-white">{stats.websiteReviewCount}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">100% Genuine</span>
            </div>
          </div>

          {/* Google Official Snapshot Banner */}
          <div className="md:col-span-7">
            <GoogleReviewsCard />
          </div>
        </div>

        {/* Tab Selector + Status Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#303030]">
          <div className="flex items-center gap-2 p-1 rounded bg-[#080808] border border-[#303030]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setVisibleCount(6);
              }}
              className={`px-4 py-2 rounded text-xs font-oswald font-black uppercase tracking-wider transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#ED101B] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ALL REVIEWS ({displayedReviews.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('website');
                setVisibleCount(6);
              }}
              className={`px-4 py-2 rounded text-xs font-oswald font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeTab === 'website'
                  ? 'bg-[#ED101B] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>WEBSITE REVIEWS</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-neutral-300">
                {websiteReviews.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setVisibleCount(6);
              }}
              className={`px-4 py-2 rounded text-xs font-oswald font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                activeTab === 'google'
                  ? 'bg-[#ED101B] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>GOOGLE REVIEWS</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-neutral-300">
                {googleReviews.length || GYM_CONTACT.totalReviews}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAllReviews}
              disabled={isLoading}
              className="p-2 rounded bg-[#080808] border border-[#303030] text-neutral-400 hover:text-white text-xs font-oswald flex items-center gap-1.5 transition-colors"
              title="Refresh Reviews"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ED101B]' : ''}`} />
              <span className="hidden sm:inline">SYNC</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid / Empty State */}
        {isLoading ? (
          <div className="py-20 text-center text-neutral-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#ED101B]" />
            <p className="font-oswald text-xs uppercase tracking-widest text-neutral-400">
              Loading Verified Reviews...
            </p>
          </div>
        ) : paginatedReviews.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginatedReviews.map((rev, index) => (
                <ReviewCard key={rev.id} review={rev} index={index} />
              ))}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <div className="text-center pt-2 pb-6">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-[#080808] hover:bg-[#222222] border border-[#303030] hover:border-[#ED101B] text-white font-oswald text-xs font-black uppercase tracking-wider transition-colors shadow-md cursor-pointer group"
                >
                  <span>LOAD MORE REVIEWS ({displayedReviews.length - visibleCount} REMAINING)</span>
                  <ChevronDown className="w-4 h-4 text-[#ED101B] group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center rounded-md bg-[#080808] border border-[#303030] space-y-4 my-8">
            <div className="w-12 h-12 rounded-full bg-[#ED101B]/10 border border-[#ED101B]/30 flex items-center justify-center text-[#ED101B] mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                {activeTab === 'google' && !isGoogleApiConfigured
                  ? 'GOOGLE REVIEWS ON GOOGLE MAPS'
                  : 'NO REVIEWS RECORDED YET'}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-1 leading-relaxed">
                {activeTab === 'google' && !isGoogleApiConfigured
                  ? 'Live Google Places API stream is pending API key configuration. Visit Google Maps to read all 55+ reviews or write a review directly.'
                  : 'Be the first to share your training and workout experience at ICON FITNESS!'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {activeTab === 'google' ? (
                <a
                  href={googleInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded bg-[#080808] hover:bg-[#222222] border border-[#303030] text-white font-oswald text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span>READ ON GOOGLE MAPS</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(true)}
                  className="px-6 py-3 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white font-oswald text-xs font-black uppercase tracking-wider shadow-md"
                >
                  BE THE FIRST TO WRITE A REVIEW
                </button>
              )}
            </div>
          </div>
        )}

        {/* Google Places Integration Note if unconfigured */}
        {!isGoogleApiConfigured && (
          <div className="mt-8 p-4 rounded bg-[#080808] border border-[#303030] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-400">
            <div>
              <span className="font-oswald text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                Google Places Integration Architecture
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {googleStatusMessage || (
                  <>
                    Official Google rating snapshot (<strong>{GYM_CONTACT.rating} ★ / {GYM_CONTACT.totalReviews} reviews</strong>) is active. To stream individual Google reviews via Places API without browser CORS, configure <code>VITE_GOOGLE_REVIEWS_PROXY_URL</code>.
                  </>
                )}
              </p>
            </div>
            <a
              href={googleInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ED101B] hover:underline font-oswald font-bold uppercase text-[11px] whitespace-nowrap flex items-center gap-1"
            >
              <span>View On Google Maps &rarr;</span>
            </a>
          </div>
        )}

        {/* Footer Admin Shortcut */}
        <div className="mt-12 pt-6 border-t border-[#262626] flex items-center justify-between text-[11px] text-neutral-500 font-oswald uppercase tracking-wider">
          <span>Icon Fitness Authentic Review System</span>
          <button
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            className="text-neutral-500 hover:text-[#ED101B] transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Owner Review Moderation Portal</span>
          </button>
        </div>

      </div>

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onReviewSubmitted={loadAllReviews}
      />

      {/* Staff Admin Review Moderation Modal */}
      <AdminReviewModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onReviewsUpdated={loadAllReviews}
      />
    </section>
  );
};
