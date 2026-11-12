import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Calendar, Dumbbell } from 'lucide-react';
import type { Review } from '../../types/review';

interface ReviewCardProps {
  review: Review;
  index?: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, index = 0 }) => {
  const isGoogle = review.source === 'google';

  const formattedDate = review.relative_time_description
    ? review.relative_time_description
    : new Date(review.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className={`rounded-md p-6 bg-[#171717] border flex flex-col justify-between transition-colors duration-200 ${
        isGoogle ? 'border-[#303030] hover:border-blue-500/50' : 'border-[#303030] hover:border-[#ED101B]/60'
      }`}
    >
      <div>
        {/* Card Header: Rating + Source Badge */}
        <div className="flex items-center justify-between mb-4">
          {/* Gold Star Ratings */}
          <div className="flex items-center gap-1 text-[#FFB800]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-neutral-700'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-white ml-1.5 font-oswald">
              {review.rating.toFixed(1)}
            </span>
          </div>

          {/* Source Identification Badge */}
          {isGoogle ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-oswald font-bold uppercase tracking-wider text-neutral-300 bg-[#222222] px-2.5 py-1 rounded border border-[#383838]">
              <svg className="w-3 h-3" viewBox="0 0 24 24">
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
              <span>Google Review</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-oswald font-bold uppercase tracking-wider text-[#ED101B] bg-[#ED101B]/10 px-2.5 py-1 rounded border border-[#ED101B]/30">
              <CheckCircle2 className="w-3 h-3 text-[#ED101B]" />
              <span>Website Review</span>
            </span>
          )}
        </div>

        {/* Optional Review Title */}
        {review.review_title && (
          <h4 className="font-display text-lg font-bold text-white uppercase tracking-wide mb-2 line-clamp-1">
            "{review.review_title}"
          </h4>
        )}

        {/* Review Description */}
        <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed mb-6 whitespace-pre-line">
          {review.review_text}
        </p>
      </div>

      {/* Card Footer: Reviewer Info + Metadata */}
      <div className="pt-4 border-t border-[#303030] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {review.reviewer_photo ? (
            <img
              src={review.reviewer_photo}
              alt={review.customer_name}
              className="w-8 h-8 rounded-full object-cover border border-[#303030]"
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#222222] border border-[#303030] text-white flex items-center justify-center font-oswald font-bold text-xs uppercase flex-shrink-0">
              {review.customer_name.charAt(0)}
            </div>
          )}

          <div className="min-w-0">
            <p className="font-bold text-white truncate text-xs sm:text-sm">
              {review.customer_name}
            </p>
            {review.visit_type && (
              <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 font-oswald uppercase tracking-wider">
                <Dumbbell className="w-2.5 h-2.5 text-[#ED101B]" />
                <span className="truncate">{review.visit_type}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-oswald uppercase whitespace-nowrap flex-shrink-0">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
};

