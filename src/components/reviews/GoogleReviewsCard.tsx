import React from 'react';
import { Star, ExternalLink, MessageSquarePlus, ShieldCheck } from 'lucide-react';
import { getGoogleBusinessInfo } from '../../services/googleReviewsService';

export const GoogleReviewsCard: React.FC = () => {
  const info = getGoogleBusinessInfo();

  return (
    <div className="p-6 sm:p-8 rounded-md bg-[#171717] border border-[#303030] relative overflow-hidden">
      {/* Background Subtle Google Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Google Business Profile Snapshot */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="font-oswald text-xs font-bold uppercase tracking-wider text-white">
              Official Google Business Profile
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-oswald text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Listing</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-display text-4xl sm:text-5xl font-black text-white leading-none">
              {info.rating.toFixed(1)}
            </span>
            <div>
              <div className="flex text-[#FFB800] gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(info.rating)
                        ? 'fill-[#FFB800] text-[#FFB800]'
                        : 'fill-[#FFB800]/30 text-[#FFB800]'
                    }`}
                  />
                ))}
              </div>
              <p className="font-oswald text-xs text-neutral-300 font-semibold uppercase tracking-wider mt-1">
                Based on <strong className="text-white">{info.totalReviews}+ Verified Customer Reviews</strong>
              </p>
            </div>
          </div>

          <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
            Customer feedback on Google Maps from members training at our 4,000 sq. ft. fitness centre in Moshi, Pimpri-Chinchwad.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <a
            href={info.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-white hover:bg-neutral-200 text-black font-oswald text-xs font-black uppercase tracking-wider transition-colors shadow-md group"
          >
            <MessageSquarePlus className="w-4 h-4 text-black" />
            <span>WRITE A GOOGLE REVIEW</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <a
            href={info.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-[#222222] hover:bg-[#2b2b2b] border border-[#383838] hover:border-neutral-400 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-colors group"
          >
            <span>READ MORE ON GOOGLE</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

