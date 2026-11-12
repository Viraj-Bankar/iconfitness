import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { VISIT_TYPE_OPTIONS } from '../../types/review';
import { submitWebsiteReview } from '../../services/reviewsService';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 - Poor Experience',
  2: '2 - Fair Experience',
  3: '3 - Good Experience',
  4: '4 - Very Good Experience',
  5: '5 - Excellent Experience',
};

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [fullName, setFullName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [visitType, setVisitType] = useState<string>('General Gym Experience');
  const [honeypot, setHoneypot] = useState(''); // Spam honeypot

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
      setSubmitSuccess(false);
      setSubmitError(null);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    }

    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = 'Please select a rating between 1 and 5 stars.';
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = 'Review description is required.';
    } else if (reviewText.trim().length < 20) {
      newErrors.reviewText = `Review description must be at least 20 characters (currently ${reviewText.trim().length}).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await submitWebsiteReview({
        customer_name: fullName,
        rating,
        review_title: reviewTitle.trim() || undefined,
        review_text: reviewText,
        visit_type: visitType,
        website_url_hp: honeypot,
      });

      if (result.success) {
        setSubmitSuccess(true);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        setSubmitError(result.message || 'Submission failed. Please check your inputs.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while submitting your review.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setFullName('');
    setRating(5);
    setReviewTitle('');
    setReviewText('');
    setVisitType('General Gym Experience');
    setSubmitSuccess(false);
    setSubmitError(null);
    setErrors({});
    onClose();
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg rounded-md bg-[#171717] border border-[#303030] shadow-2xl p-6 sm:p-8 z-10 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-2 rounded bg-[#222222] text-[#A1A1A1] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {submitSuccess ? (
            /* Submission Awaiting Approval View */
            <div className="py-4 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>

              <div>
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  SUBMISSION AWAITING APPROVAL
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                  REVIEW RECEIVED
                </h3>
              </div>

              {/* Exact required confirmation message */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                <p className="text-sm text-neutral-200 text-center leading-relaxed font-medium">
                  Thank you for sharing your experience! Your review has been submitted and is awaiting approval.
                </p>
              </div>

              {/* Review summary preview */}
              <div className="p-4 bg-[#080808] rounded-md border border-[#303030] text-xs text-left text-neutral-300 space-y-2">
                <div className="flex justify-between border-b border-[#222222] pb-1.5">
                  <span className="font-oswald uppercase text-neutral-400">Reviewer:</span>
                  <span className="text-white font-medium">{fullName}</span>
                </div>
                <div className="flex justify-between border-b border-[#222222] pb-1.5">
                  <span className="font-oswald uppercase text-neutral-400">Rating:</span>
                  <div className="flex items-center gap-1 text-[#FFB800]">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#FFB800]" />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between border-b border-[#222222] pb-1.5">
                  <span className="font-oswald uppercase text-neutral-400">Discipline / Visit:</span>
                  <span className="text-[#ED101B] font-bold">{visitType}</span>
                </div>
                <div className="pt-1">
                  <span className="font-oswald uppercase text-neutral-400 block mb-0.5">Moderation Policy:</span>
                  <span className="text-neutral-400 text-[11px] leading-relaxed block">
                    All reviews are verified to ensure authentic feedback from genuine members before being publicly showcased.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white font-oswald text-xs font-black uppercase tracking-wider transition-colors shadow-md"
              >
                CLOSE
              </button>
            </div>
          ) : (
            /* Review Form */
            <div>
              <div className="mb-6">
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B] block mb-1">
                  MEMBER TESTIMONIAL
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                  WRITE A REVIEW
                </h3>
                <p className="text-xs text-[#A1A1A1] mt-1">
                  Tell us about your training, coaching, and workout experience at ICON FITNESS.
                </p>
              </div>

              {submitError && (
                <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Honeypot hidden input for anti-bot protection */}
                <input
                  type="text"
                  name="website_url_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* 1. Full Name */}
                <div>
                  <label
                    htmlFor="reviewFullName"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="reviewFullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="Enter your name"
                    className={`w-full px-3.5 py-2.5 rounded bg-[#080808] border ${
                      errors.fullName ? 'border-red-500' : 'border-[#303030]'
                    } text-white text-sm focus:outline-none focus:border-[#ED101B]`}
                  />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* 2. Interactive Star Rating Selector */}
                <div>
                  <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                    Star Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const isFilled = starValue <= activeRating;
                        return (
                          <button
                            key={starValue}
                            type="button"
                            onClick={() => {
                              setRating(starValue);
                              if (errors.rating) setErrors({ ...errors, rating: '' });
                            }}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(null)}
                            aria-label={`Rate ${starValue} stars`}
                            className="p-1 rounded hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                isFilled
                                  ? 'fill-[#FFB800] text-[#FFB800]'
                                  : 'text-neutral-700 hover:text-neutral-500'
                              } transition-colors`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-oswald font-semibold text-neutral-300 ml-2">
                      {RATING_LABELS[activeRating] || `${activeRating} Stars`}
                    </span>
                  </div>
                  {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
                </div>

                {/* 3. Visit Type (Optional dropdown) */}
                <div>
                  <label
                    htmlFor="reviewVisitType"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Discipline / Visit Type (Optional)
                  </label>
                  <select
                    id="reviewVisitType"
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-xs sm:text-sm focus:outline-none focus:border-[#ED101B]"
                  >
                    {VISIT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Review Title (Optional) */}
                <div>
                  <label
                    htmlFor="reviewTitle"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Review Title (Optional)
                  </label>
                  <input
                    id="reviewTitle"
                    type="text"
                    maxLength={80}
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Great trainers and spacious floor"
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                  />
                </div>

                {/* 5. Review Description (Required, min 20 chars) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="reviewDescription"
                      className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1]"
                    >
                      Review Description *
                    </label>
                    <span
                      className={`text-[11px] font-oswald ${
                        reviewText.trim().length >= 20 ? 'text-neutral-400' : 'text-amber-500 font-bold'
                      }`}
                    >
                      {reviewText.trim().length} / 20 min chars
                    </span>
                  </div>
                  <textarea
                    id="reviewDescription"
                    rows={4}
                    maxLength={1000}
                    value={reviewText}
                    onChange={(e) => {
                      setReviewText(e.target.value);
                      if (errors.reviewText) setErrors({ ...errors, reviewText: '' });
                    }}
                    placeholder="Describe your workout experience, facilities, trainers, or gym atmosphere (minimum 20 characters)..."
                    className={`w-full px-3.5 py-2.5 rounded bg-[#080808] border ${
                      errors.reviewText ? 'border-red-500' : 'border-[#303030]'
                    } text-white text-sm focus:outline-none focus:border-[#ED101B] resize-none`}
                  />
                  {errors.reviewText && <p className="text-red-400 text-xs mt-1">{errors.reviewText}</p>}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>SUBMITTING REVIEW...</span>
                      </>
                    ) : (
                      <span>SUBMIT REVIEW FOR APPROVAL</span>
                    )}
                  </button>

                  <p className="text-[11px] text-[#A1A1A1] text-center mt-2.5">
                    Reviews are verified by ICON FITNESS moderation before appearing on the website.
                  </p>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

