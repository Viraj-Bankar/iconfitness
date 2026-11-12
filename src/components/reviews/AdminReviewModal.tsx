import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  RefreshCw,
  LogOut,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import type { Review, ReviewStatus } from '../../types/review';
import {
  verifyAdminToken,
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
} from '../../services/reviewsService';

interface AdminReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewsUpdated?: () => void;
}

const ADMIN_SESSION_KEY = 'icon_fitness_admin_session';

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewsUpdated,
}) => {
  const [authToken, setAuthToken] = useState<string>('');
  const [inputPasscode, setInputPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<'all' | ReviewStatus>('pending');
  const [filterRating, setFilterRating] = useState<'all' | number>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Check saved session on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (saved && verifyAdminToken(saved)) {
        setAuthToken(saved);
        setIsAuthenticated(true);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const loadReviews = useCallback(async (token: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await getAdminReviews(token);
      setReviews(data);
    } catch (err: unknown) {
      console.error('Error fetching admin reviews:', err);
      setStatusMessage('Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && authToken && isOpen) {
      loadReviews(authToken);
    }
  }, [isAuthenticated, authToken, isOpen, loadReviews]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!inputPasscode.trim()) {
      setAuthError('Please enter admin access passcode.');
      return;
    }

    if (verifyAdminToken(inputPasscode.trim())) {
      const token = inputPasscode.trim();
      setAuthToken(token);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, token);
      } catch {
        // Ignore
      }
      loadReviews(token);
    } else {
      setAuthError('Invalid passcode. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken('');
    setInputPasscode('');
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: ReviewStatus) => {
    setActionLoadingId(reviewId);
    try {
      await updateReviewStatus(reviewId, newStatus, authToken);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
      );
      setStatusMessage(`Review status updated to ${newStatus}.`);
      if (onReviewsUpdated) onReviewsUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update review status.';
      setStatusMessage(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (reviewId: string, customerName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review by "${customerName}"?`)) {
      return;
    }

    setActionLoadingId(reviewId);
    try {
      await deleteReview(reviewId, authToken);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setStatusMessage('Review deleted successfully.');
      if (onReviewsUpdated) onReviewsUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete review.';
      setStatusMessage(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customer_name.toLowerCase().includes(q);
      const matchText = r.review_text.toLowerCase().includes(q);
      const matchTitle = (r.review_title || '').toLowerCase().includes(q);
      const matchVisit = (r.visit_type || '').toLowerCase().includes(q);
      if (!matchName && !matchText && !matchTitle && !matchVisit) return false;
    }
    return true;
  });

  const countPending = reviews.filter((r) => r.status === 'pending').length;
  const countApproved = reviews.filter((r) => r.status === 'approved').length;
  const countRejected = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
          className="relative w-full max-w-4xl rounded-md bg-[#171717] border border-[#303030] shadow-2xl p-5 sm:p-7 z-10 my-6 max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#303030] mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#ED101B]/15 border border-[#ED101B]/40 text-[#ED101B] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B] block">
                  STAFF &amp; MANAGEMENT PORTAL
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  CUSTOMER REVIEW MODERATION
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded bg-[#222222] text-[#A1A1A1] hover:text-white hover:bg-neutral-800 transition-colors text-xs font-oswald flex items-center gap-1.5"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#ED101B]" />
                  <span className="hidden sm:inline">LOGOUT</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded bg-[#222222] text-[#A1A1A1] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isAuthenticated ? (
            /* Login View */
            <div className="py-8 max-w-md mx-auto w-full text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#ED101B]/10 border border-[#ED101B]/30 text-[#ED101B] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  AUTHENTICATION REQUIRED
                </h4>
                <p className="text-xs text-[#A1A1A1] mt-1.5 leading-relaxed">
                  Only authorized ICON FITNESS gym staff may approve, reject, or manage customer reviews.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label
                    htmlFor="adminPasscodeInput"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Admin Passcode
                  </label>
                  <input
                    id="adminPasscodeInput"
                    type="password"
                    value={inputPasscode}
                    onChange={(e) => setInputPasscode(e.target.value)}
                    placeholder="Enter management passcode"
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                    autoFocus
                  />
                  <p className="text-[11px] text-neutral-500 mt-1.5">
                    Configured via <code>VITE_ADMIN_REVIEW_TOKEN</code> (default: <code>iconadmin2026</code>).
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white font-oswald text-xs font-black uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  UNLOCK DASHBOARD
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Review Moderation View */
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Notification Banner */}
              {statusMessage && (
                <div className="p-2.5 rounded bg-[#222222] border border-[#303030] text-xs text-neutral-300 flex items-center justify-between">
                  <span>{statusMessage}</span>
                  <button
                    type="button"
                    onClick={() => setStatusMessage(null)}
                    className="text-neutral-500 hover:text-white"
                  >
                    &times;
                  </button>
                </div>
              )}

              {/* Toolbar: Status Tabs + Counters */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 bg-[#080808] rounded border border-[#303030]">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('pending')}
                    className={`px-3 py-1.5 rounded text-xs font-oswald font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      filterStatus === 'pending'
                        ? 'bg-amber-500 text-black font-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>PENDING</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-bold">
                      {countPending}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterStatus('approved')}
                    className={`px-3 py-1.5 rounded text-xs font-oswald font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      filterStatus === 'approved'
                        ? 'bg-emerald-500 text-black font-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>APPROVED</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-bold">
                      {countApproved}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterStatus('rejected')}
                    className={`px-3 py-1.5 rounded text-xs font-oswald font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      filterStatus === 'rejected'
                        ? 'bg-red-500 text-white font-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>REJECTED</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-bold">
                      {countRejected}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded text-xs font-oswald font-bold uppercase tracking-wider transition-colors ${
                      filterStatus === 'all'
                        ? 'bg-[#ED101B] text-white font-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>ALL ({reviews.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => loadReviews(authToken)}
                  disabled={isLoading}
                  className="p-2 rounded bg-[#222222] border border-[#303030] text-neutral-300 hover:text-white text-xs font-oswald flex items-center gap-1.5"
                  title="Refresh Reviews"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">REFRESH</span>
                </button>
              </div>

              {/* Filters Bar: Search & Star Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reviewer name, title or review text..."
                    className="w-full pl-9 pr-3 py-2 rounded bg-[#080808] border border-[#303030] text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-[#ED101B]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={filterRating}
                    onChange={(e) =>
                      setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded bg-[#080808] border border-[#303030] text-white text-xs focus:outline-none focus:border-[#ED101B]"
                  >
                    <option value="all">All Star Ratings</option>
                    <option value="5">5 Stars Only</option>
                    <option value="4">4 Stars Only</option>
                    <option value="3">3 Stars Only</option>
                    <option value="2">2 Stars Only</option>
                    <option value="1">1 Star Only</option>
                  </select>
                </div>
              </div>

              {/* Reviews Moderation List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[280px]">
                {isLoading ? (
                  <div className="py-16 text-center text-neutral-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#ED101B]" />
                    <p className="text-xs font-oswald uppercase tracking-wider">Loading reviews...</p>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="py-16 text-center text-neutral-500 p-8 rounded bg-[#080808] border border-[#262626]">
                    <p className="font-display text-lg uppercase text-neutral-400">No reviews found</p>
                    <p className="text-xs mt-1">No reviews match the current status and search filters.</p>
                  </div>
                ) : (
                  filteredReviews.map((rev) => {
                    const isPending = rev.status === 'pending';
                    const isApproved = rev.status === 'approved';
                    const isRejected = rev.status === 'rejected';
                    const isActioning = actionLoadingId === rev.id;

                    return (
                      <div
                        key={rev.id}
                        className={`p-4 rounded-md bg-[#080808] border transition-colors ${
                          isPending
                            ? 'border-amber-500/40 bg-amber-500/[0.02]'
                            : isApproved
                            ? 'border-emerald-500/30'
                            : 'border-red-500/30 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-sm">{rev.customer_name}</h5>
                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-oswald font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                                  isPending
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : isApproved
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                                }`}
                              >
                                {rev.status}
                              </span>

                              {/* Source Badge */}
                              <span className="text-[10px] font-oswald uppercase text-neutral-400 bg-[#171717] px-2 py-0.5 rounded border border-[#303030]">
                                {rev.source}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                              <div className="flex text-[#FFB800]">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-[#FFB800]" />
                                ))}
                              </div>
                              {rev.visit_type && (
                                <span className="font-oswald text-[11px] text-[#ED101B]">
                                  {rev.visit_type}
                                </span>
                              )}
                              <span className="text-[11px] text-neutral-500">
                                {new Date(rev.created_at).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            {!isApproved && (
                              <button
                                type="button"
                                disabled={isActioning}
                                onClick={() => handleStatusChange(rev.id, 'approved')}
                                className="px-2.5 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 text-[11px] font-oswald font-black uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Approve Review"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>APPROVE</span>
                              </button>
                            )}

                            {!isRejected && (
                              <button
                                type="button"
                                disabled={isActioning}
                                onClick={() => handleStatusChange(rev.id, 'rejected')}
                                className="px-2.5 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/40 text-[11px] font-oswald font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Reject Review"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>REJECT</span>
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isActioning}
                              onClick={() => handleDelete(rev.id, rev.customer_name)}
                              className="p-1.5 rounded bg-neutral-900 hover:bg-red-500 text-neutral-400 hover:text-white border border-[#303030] transition-colors cursor-pointer disabled:opacity-50"
                              title="Permanently Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {rev.review_title && (
                          <p className="font-bold text-white text-xs uppercase mb-1">
                            "{rev.review_title}"
                          </p>
                        )}
                        <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                          {rev.review_text}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

