import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  LogOut,
  Image,
  Power,
  X,
  RotateCcw,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { getActiveOwnerSession, logoutOwner } from '../services/authService';
import {
  getOwnerMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  togglePlanActiveStatus,
  deleteMembershipPlan,
  validatePlanInput,
} from '../services/membershipService';
import type {
  DbMembershipPlan,
  NewMembershipPlanInput,
  MembershipCategory,
} from '../types/membership';

export const OwnerPlansDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<DbMembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | MembershipCategory>('all');

  // Notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<MembershipCategory>('Individual');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState('1');

  // Delete confirmation modal state
  const [deletingPlan, setDeletingPlan] = useState<DbMembershipPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getOwnerMembershipPlans();
      setPlans(data);
    } catch (err: unknown) {
      console.error('Error loading membership plans:', err);
      const msg = err instanceof Error ? err.message : 'Could not load membership plans. Please try again.';
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
          loadPlans();
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [navigate, loadPlans]);

  const handleLogout = async () => {
    await logoutOwner();
    navigate('/admin/login', { replace: true });
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPlanId(null);
    setFormName('');
    setFormDuration('');
    setFormPrice('');
    setFormDescription('');
    setFormCategory('Individual');
    setFormIsActive(true);
    setFormDisplayOrder(String(plans.length + 1));
    setFormErrors(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (plan: DbMembershipPlan) => {
    setEditingPlanId(plan.id);
    setFormName(plan.name);
    setFormDuration(plan.duration);
    setFormPrice(String(plan.price));
    setFormDescription(plan.description || '');
    setFormCategory(plan.category);
    setFormIsActive(plan.isActive);
    setFormDisplayOrder(String(plan.displayOrder));
    setFormErrors(null);
    setIsModalOpen(true);
  };

  // Save Plan (Create or Update)
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors(null);

    const priceNum = parseFloat(formPrice);
    const orderNum = parseInt(formDisplayOrder, 10) || 0;

    const payload: NewMembershipPlanInput = {
      name: formName.trim(),
      duration: formDuration.trim(),
      price: priceNum,
      description: formDescription.trim() || undefined,
      category: formCategory,
      isActive: formIsActive,
      displayOrder: orderNum,
    };

    const validation = validatePlanInput(payload);
    if (!validation.isValid) {
      setFormErrors(validation.error || 'Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPlanId) {
        await updateMembershipPlan(editingPlanId, payload);
        setSuccessMessage(`Plan "${payload.name}" updated successfully.`);
      } else {
        await createMembershipPlan(payload);
        setSuccessMessage(`New plan "${payload.name}" created successfully.`);
      }
      setIsModalOpen(false);
      await loadPlans();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save membership plan.';
      setFormErrors(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleActive = async (plan: DbMembershipPlan) => {
    const nextState = !plan.isActive;
    try {
      await togglePlanActiveStatus(plan.id, nextState);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: nextState } : p))
      );
      setSuccessMessage(
        `Plan "${plan.name}" is now ${nextState ? 'ACTIVE (live on website)' : 'INACTIVE (hidden from public)'}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update plan status.';
      setErrorMessage(msg);
    }
  };

  // Delete Plan
  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    setIsDeleting(true);
    try {
      await deleteMembershipPlan(deletingPlan.id);
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      setSuccessMessage(`Plan "${deletingPlan.name}" has been deleted.`);
      setDeletingPlan(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete plan.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered plans
  const filteredPlans = plans.filter((p) => {
    if (statusFilter === 'active' && !p.isActive) return false;
    if (statusFilter === 'inactive' && p.isActive) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    return true;
  });

  const activeCount = plans.filter((p) => p.isActive).length;
  const inactiveCount = plans.filter((p) => !p.isActive).length;

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
      {/* Top Bar with Navigation Tabs */}
      <header className="bg-[#171717] border-b border-[#303030] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showSubtitle={false} />
            <div className="h-4 w-px bg-[#303030] hidden sm:block" />
            <span className="font-oswald text-xs font-bold uppercase tracking-widest text-neutral-300 hidden sm:inline-block">
              Owner Management Portal
            </span>
          </div>

          {/* Module Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-[#080808] p-1 rounded border border-[#303030]">
            <Link
              to="/admin/gallery"
              className="px-3 py-1.5 rounded text-xs font-oswald uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Image className="w-3.5 h-3.5" />
              <span>Gallery</span>
            </Link>

            <Link
              to="/admin/plans"
              className="px-3 py-1.5 rounded text-xs font-oswald font-black uppercase tracking-wider bg-[#ED101B] text-white transition-colors flex items-center gap-1.5 shadow"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Membership Plans</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to="/#membership"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#303030] text-xs font-oswald flex items-center gap-1.5 transition-colors"
              title="View Live Website Membership Section"
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
        {/* Page Title & Add Plan Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] block">
              MEMBERSHIP PLAN MANAGEMENT
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Manage Pricing &amp; Plans
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1A1] font-normal">
              Changes updated here immediately update the live website and WhatsApp enquiry rates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-6 py-3.5 rounded-md bg-[#ED101B] hover:bg-[#B9000B] text-white font-oswald text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ADD NEW PLAN</span>
          </button>
        </div>

        {/* Notifications */}
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
                <span className="font-bold block">Database Loading Error:</span>
                <span className="text-neutral-300">{errorMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={loadPlans}
                className="px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-oswald text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
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

        {/* Quick Stats / Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded bg-[#171717] border border-[#303030] space-y-1">
            <span className="text-[10px] font-oswald uppercase text-neutral-400 tracking-wider">Total Plans</span>
            <div className="font-display text-2xl font-black text-white">{plans.length}</div>
          </div>
          <div className="p-4 rounded bg-[#171717] border border-[#303030] space-y-1">
            <span className="text-[10px] font-oswald uppercase text-emerald-400 tracking-wider">Live Active</span>
            <div className="font-display text-2xl font-black text-emerald-400">{activeCount}</div>
          </div>
          <div className="p-4 rounded bg-[#171717] border border-[#303030] space-y-1">
            <span className="text-[10px] font-oswald uppercase text-amber-400 tracking-wider">Inactive Drafts</span>
            <div className="font-display text-2xl font-black text-amber-400">{inactiveCount}</div>
          </div>
          <div className="p-4 rounded bg-[#171717] border border-[#303030] space-y-1">
            <span className="text-[10px] font-oswald uppercase text-neutral-400 tracking-wider">Sync Status</span>
            <div className="text-xs font-oswald uppercase text-emerald-400 flex items-center gap-1.5 mt-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Synced</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded bg-[#171717] border border-[#303030]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-oswald font-bold uppercase tracking-wider transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              All Plans ({plans.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded text-xs font-oswald font-bold uppercase tracking-wider transition-colors ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              Active Live ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded text-xs font-oswald font-bold uppercase tracking-wider transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#222222] text-neutral-400 hover:text-white'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-oswald text-neutral-400 uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded bg-[#080808] border border-[#303030] text-white text-xs font-oswald focus:outline-none focus:border-[#ED101B]"
            >
              <option value="all">All Categories</option>
              <option value="Individual">Individual</option>
              <option value="Couple">Couple</option>
              <option value="Group">Group</option>
            </select>
          </div>
        </div>

        {/* Plans List / Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-neutral-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#ED101B]" />
            <p className="font-oswald text-xs uppercase tracking-wider">Loading membership plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-12 text-center rounded-md bg-[#171717] border border-[#303030] space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#ED101B]/15 border border-[#ED101B]/40 text-[#ED101B] flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                NO MEMBERSHIP PLANS AVAILABLE
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-1">
                Add your first plan to display pricing on the website and WhatsApp enquiry cards.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-6 py-3 rounded bg-[#ED101B] text-white font-oswald text-xs font-black uppercase tracking-wider shadow-md cursor-pointer"
            >
              ADD FIRST PLAN
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlans.map((plan) => {
              const isCouple = plan.category === 'Couple';
              const isGroup = plan.category === 'Group';

              return (
                <div
                  key={plan.id}
                  className={`rounded-md p-6 bg-[#171717] border flex flex-col justify-between space-y-4 transition-colors ${
                    plan.isActive ? 'border-[#303030] hover:border-neutral-500' : 'border-neutral-800 opacity-70'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Category Badge + Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-oswald font-black uppercase tracking-widest ${
                            isCouple
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : isGroup
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {plan.category}
                        </span>

                        <span className="text-[10px] font-oswald text-neutral-500 uppercase">
                          Order: #{plan.displayOrder}
                        </span>
                      </div>

                      {/* Active Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-oswald font-black uppercase tracking-wider ${
                          plan.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span>{plan.isActive ? 'LIVE ON WEBSITE' : 'INACTIVE (HIDDEN)'}</span>
                      </span>
                    </div>

                    {/* Plan Title & Duration */}
                    <div>
                      <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                        {plan.name}
                      </h3>
                      <p className="font-oswald text-xs text-neutral-400 uppercase tracking-wider">
                        Duration: <span className="text-white font-bold">{plan.duration}</span>
                      </p>
                    </div>

                    {/* Price Display */}
                    <div className="py-2 border-y border-[#262626] flex items-baseline gap-2">
                      <span className="font-display text-4xl font-black text-[#ED101B]">
                        ₹{Number(plan.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-neutral-500 font-oswald uppercase">
                        / {plan.duration}
                      </span>
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <p className="text-xs text-[#A1A1A1] leading-relaxed line-clamp-2">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#262626] flex items-center justify-between gap-2">
                    <span className="text-[10px] text-neutral-500">
                      Updated: {new Date(plan.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Toggle Active Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(plan)}
                        className={`px-3 py-1.5 rounded text-[11px] font-oswald uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                          plan.isActive
                            ? 'bg-neutral-800 text-neutral-300 hover:text-white'
                            : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-600/40'
                        }`}
                        title={plan.isActive ? 'Hide plan from public website' : 'Make plan live on website'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{plan.isActive ? 'Deactivate' : 'Activate'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(plan)}
                        className="p-1.5 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Plan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeletingPlan(plan)}
                        className="p-1.5 rounded bg-[#222222] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#171717] border border-[#303030] rounded-md p-6 max-w-lg w-full space-y-5 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#303030]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#ED101B]/15 text-[#ED101B] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  {editingPlanId ? 'EDIT MEMBERSHIP PLAN' : 'CREATE NEW MEMBERSHIP PLAN'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{formErrors}</span>
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-4" noValidate>
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1">
                  Plan Name <span className="text-[#ED101B]">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. MONTHLY, QUARTERLY, YEARLY"
                  className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                  required
                  autoFocus
                />
              </div>

              {/* Duration & Price in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1">
                    Duration <span className="text-[#ED101B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 1 Month, 3 Months, 1 Year"
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1">
                    Price in INR (₹) <span className="text-[#ED101B]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 1200, 3000, 8000"
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                    required
                  />
                </div>
              </div>

              {/* Category & Display Order in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MembershipCategory)}
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Couple">Couple (2 Persons)</option>
                    <option value="Group">Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(e.target.value)}
                    placeholder="e.g. 1, 2, 3"
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Complete floor access with modern cardio & strength machines."
                  className="w-full px-3.5 py-2 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                />
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-[#080808] rounded border border-[#262626] flex items-center justify-between">
                <div>
                  <span className="font-oswald text-xs font-bold uppercase tracking-wider text-white block">
                    Live on Website &amp; WhatsApp
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    When active, visitors can see and enquire about this plan.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-5 h-5 accent-[#ED101B] cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded bg-[#222222] text-neutral-300 text-xs font-oswald uppercase hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded bg-[#ED101B] hover:bg-[#B9000B] text-white font-oswald text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>{editingPlanId ? 'UPDATE PLAN' : 'CREATE PLAN'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#171717] border border-[#303030] rounded-md p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-display text-xl font-black uppercase text-white tracking-wide">
                Delete "{deletingPlan.name}"?
              </h4>
              <p className="text-xs text-[#A1A1A1] leading-relaxed">
                Are you sure you want to permanently delete this plan? If existing members are enrolled, we recommend clicking <strong>Deactivate</strong> instead so historical records are preserved.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlan(null)}
                className="px-4 py-2 rounded bg-[#222222] text-neutral-300 text-xs font-oswald uppercase hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-oswald text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
