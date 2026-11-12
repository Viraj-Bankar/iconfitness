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
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import type { Review, ReviewStatus } from '../../types/review';
import {
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
} from '../../services/reviewsService';
import {
  getActiveOwnerSession,
  loginOwner,
  logoutOwner,
  DEFAULT_OWNER_EMAIL,
} from '../../services/authService';

interface AdminReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewsUpdated?: () => void;
}

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewsUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [ownerEmail, setOwnerEmail] = useState('');

  // Login form state
  const [emailInput, setEmailInput] = useState(DEFAULT_OWNER_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Reviews data state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<'all' | ReviewStatus>('pending');
  const [filterRating, setFilterRating] = useState<'all' | number>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await getAdminReviews();
      setReviews(data);
    } catch (err: unknown) {
      console.error('Error fetching admin reviews:', err);
      setStatusMessage('Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check active Supabase owner session on mount or modal open
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setIsCheckingAuth(true);
      setAuthError(null);
      getActiveOwnerSession().then((session) => {
        if (!isMounted) return;
        if (session) {
          setIsAuthenticated(true);
          setOwnerEmail(session.email);
          loadReviews();
        } else {
          setIsAuthenticated(false);
          setOwnerEmail('');
        }
        setIsCheckingAuth(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, loadReviews]);

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
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both owner email and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await loginOwner(emailInput, passwordInput);
      if (res.success && res.user) {
        setIsAuthenticated(true);
        setOwnerEmail(res.user.email);
        setPasswordInput('');
        await loadReviews();
      } else {
        setAuthError(res.error || 'Authentication failed. Access denied.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login error.';
      setAuthError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutOwner();
    setIsAuthenticated(false);
    setOwnerEmail('');
    setReviews([]);
    setPasswordInput('');
  };

  const handleStatusChange = async (reviewId: string, newStatus: ReviewStatus) => {
    setActionLoadingId(reviewId);
    try {
      await updateReviewStatus(reviewId, newStatus);
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
      await deleteReview(reviewId);
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
                  OWNER &amp; MANAGEMENT PORTAL
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  CUSTOMER REVIEW MODERATION
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-oswald text-neutral-400 bg-[#080808] px-2.5 py-1 rounded border border-[#303030]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{ownerEmail || 'Owner Active'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded bg-[#222222] text-[#A1A1A1] hover:text-white hover:bg-neutral-800 transition-colors text-xs font-oswald flex items-center gap-1.5"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#ED101B]" />
                    <span className="hidden sm:inline">LOGOUT</span>
                  </button>
                </div>
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

          {isCheckingAuth ? (
            <div className="py-20 text-center text-neutral-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#ED101B]" />
              <p className="font-oswald text-xs uppercase tracking-wider">Verifying owner authentication...</p>
            </div>
          ) : !isAuthenticated ? (
            /* Supabase Owner Sign-In View */
            <div className="py-6 max-w-md mx-auto w-full text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#ED101B]/10 border border-[#ED101B]/30 text-[#ED101B] flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  OWNER AUTHENTICATION REQUIRED
                </h4>
                <p className="text-xs text-[#A1A1A1] mt-1.5 leading-relaxed">
                  Sign in with your verified Supabase gym owner credentials to approve, reject, or delete customer reviews.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-left" noValidate>
                <div>
                  <label
                    htmlFor="ownerReviewEmailInput"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Owner Email
                  </label>
                  <input
                    id="ownerReviewEmailInput"
                    type="email"
                    autoComplete="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="owner@iconfitness.com"
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="ownerReviewPasswordInput"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Owner Password
                  </label>
                  <input
                    id="ownerReviewPasswordInput"
                    type="password"
                    autoComplete="current-password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter owner password"
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white font-oswald text-xs font-black uppercase tracking-wider transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SIGNING IN...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>SIGN IN &amp; MODERATE REVIEWS</span>
                    </>
                  )}
                </button>
              </form>

              <div className="p-2.5 bg-[#080808] rounded border border-[#262626] text-[11px] text-neutral-500">
                <span>Direct Supabase Auth. Passcodes are no longer accepted.</span>
              </div>
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
                        ? 'bg-white text-black font-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>ALL ({reviews.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={loadReviews}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-300 text-xs font-oswald flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#ED101B]' : ''}`} />
                  <span>REFRESH</span>
                </button>
              </div>

              {/* Search & Rating Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, keyword or activity..."
                    className="w-full pl-9 pr-4 py-2 rounded bg-[#080808] border border-[#303030] text-white text-xs focus:outline-none focus:border-[#ED101B]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2 text-neutral-500 hover:text-white text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-oswald text-neutral-400 uppercase">Rating:</span>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-2.5 py-2 rounded bg-[#080808] border border-[#303030] text-white text-xs focus:outline-none focus:border-[#ED101B]"
                  >
                    <option value="all">All Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[260px]">
                {isLoading ? (
                  <div className="py-16 text-center text-neutral-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#ED101B]" />
                    <p className="font-oswald text-xs uppercase">Loading reviews from database...</p>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="py-16 text-center text-neutral-400 space-y-2 bg-[#080808] rounded border border-[#262626]">
                    <p className="font-oswald text-xs uppercase text-neutral-400">
                      No {filterStatus !== 'all' ? filterStatus : ''} reviews found.
                    </p>
                  </div>
                ) : (
                  filteredReviews.map((r) => {
                    const isActing = actionLoadingId === r.id;
                    return (
                      <div
                        key={r.id}
                        className="p-4 rounded bg-[#080808] border border-[#262626] hover:border-[#3a3a3a] transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">{r.customer_name}</span>
                              <span
                                className={`text-[10px] font-oswald uppercase px-2 py-0.5 rounded font-bold ${
                                  r.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : r.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                }`}
                              >
                                {r.status}
                              </span>
                              <span className="text-[10px] font-oswald uppercase text-neutral-500">
                                {r.source === 'google' ? 'Google Review' : 'Website Review'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <div className="flex items-center text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                                    }`}
                                  />
                                ))}
                              </div>
                              {r.visit_type && (
                                <span className="text-[11px] text-neutral-400">• {r.visit_type}</span>
                              )}
                              <span className="text-[11px] text-neutral-500">
                                • {new Date(r.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {r.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'approved')}
                                disabled={isActing}
                                className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-600/40 text-[11px] font-oswald uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
                                title="Approve review"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                            )}

                            {r.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'rejected')}
                                disabled={isActing}
                                className="px-2.5 py-1 rounded bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border border-amber-600/40 text-[11px] font-oswald uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
                                title="Reject review"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(r.id, r.customer_name)}
                              disabled={isActing}
                              className="p-1 rounded bg-neutral-900 text-neutral-500 hover:text-red-400 hover:bg-red-500/20 border border-neutral-800 transition-colors disabled:opacity-50"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title and Review Body */}
                        <div>
                          {r.review_title && (
                            <h5 className="font-bold text-white text-xs mb-1">{r.review_title}</h5>
                          )}
                          <p className="text-xs text-[#A1A1A1] leading-relaxed whitespace-pre-line">
                            {r.review_text}
                          </p>
                        </div>
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
