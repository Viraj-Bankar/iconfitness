import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, ArrowRight, RotateCcw } from 'lucide-react';
import type { ContactFormData, MembershipPlan } from '../../types';
import {
  INTERESTED_IN_OPTIONS,
  MEMBERSHIP_PLAN_OPTIONS,
  formatWhatsAppMessage,
  buildWhatsAppUrl,
  openWhatsApp,
  validateIndianMobile,
  mapTopicToInterestedIn,
  WHATSAPP_DISPLAY_NUMBER,
} from '../../utils/whatsapp';

interface EnquiryModalProps {
  isOpen: boolean;
  selectedPlan?: MembershipPlan | null;
  initialInterest?: string;
  onClose: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  selectedPlan,
  initialInterest,
  onClose,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    phone: '',
    interestedIn: 'General Gym Enquiry',
    membershipPlan: MEMBERSHIP_PLAN_OPTIONS[3].label, // Default to 1 Year Best Value
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<'fullName' | 'phone' | 'interestedIn' | 'membershipPlan', string>>>({});
  const [isRedirected, setIsRedirected] = useState(false);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState('');

  // Synchronize incoming plan or interest
  useEffect(() => {
    if (selectedPlan) {
      // Find matching plan option
      const matching = MEMBERSHIP_PLAN_OPTIONS.find(
        (p) =>
          p.name.toLowerCase() === selectedPlan.name.toLowerCase() ||
          p.duration.toLowerCase() === selectedPlan.duration.toLowerCase() ||
          p.price === selectedPlan.price
      );
      setFormData((prev) => ({
        ...prev,
        interestedIn: 'Membership',
        membershipPlan: matching ? matching.label : `${selectedPlan.name} (${selectedPlan.duration} – ${selectedPlan.price})`,
      }));
    } else if (initialInterest) {
      const mapped = mapTopicToInterestedIn(initialInterest);
      setFormData((prev) => ({
        ...prev,
        interestedIn: mapped.interestedIn,
        membershipPlan: mapped.membershipPlan || prev.membershipPlan || MEMBERSHIP_PLAN_OPTIONS[3].label,
        message: mapped.defaultMessage || prev.message || '',
      }));
    }
  }, [selectedPlan, initialInterest]);

  // Handle ESC and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
      setIsRedirected(false);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errs: Partial<Record<'fullName' | 'phone' | 'interestedIn' | 'membershipPlan', string>> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters.';
    }

    const mobileValidation = validateIndianMobile(formData.phone);
    if (!mobileValidation.isValid) {
      errs.phone = mobileValidation.error || 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!formData.interestedIn) {
      errs.interestedIn = 'Please select a topic.';
    }

    if (formData.interestedIn === 'Membership' && !formData.membershipPlan) {
      errs.membershipPlan = 'Please select a membership plan.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEnquireWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const mobileValidation = validateIndianMobile(formData.phone);
    const cleanData: ContactFormData = {
      ...formData,
      phone: mobileValidation.cleaned || formData.phone.trim(),
    };

    const message = formatWhatsAppMessage(cleanData);
    const url = buildWhatsAppUrl(message);
    setGeneratedWhatsAppUrl(url);

    // Trigger redirection to WhatsApp
    openWhatsApp(message);
    setIsRedirected(true);
  };

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
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded bg-[#222222] text-[#A1A1A1] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isRedirected ? (
            /* Pre-Redirection Notice State */
            <div className="py-4 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#25D366]/15 border-2 border-[#25D366] flex items-center justify-center text-[#25D366] mx-auto shadow-lg shadow-[#25D366]/20">
                  <MessageCircle className="w-9 h-9 fill-[#25D366]" />
                </div>
                <div>
                  <span className="font-oswald text-[11px] font-bold uppercase tracking-widest text-[#25D366] block mb-1">
                    WHATSAPP REDIRECTION
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                    CONNECT ON WHATSAPP
                  </h3>
                </div>
              </div>

              {/* Redirection Alert Notice */}
              <div className="p-4 bg-[#25D366]/10 border border-[#25D366]/40 rounded-md">
                <p className="text-sm text-neutral-200 text-center leading-relaxed font-medium">
                  You're being redirected to WhatsApp. Review your message and press{' '}
                  <strong className="text-[#25D366] font-bold">Send</strong> to complete your enquiry.
                </p>
              </div>

              {/* Enquiry Summary */}
              <div className="p-4 bg-[#080808] rounded-md border border-[#303030] text-xs text-[#A1A1A1] space-y-2">
                <div className="flex justify-between border-b border-[#222222] pb-1.5">
                  <span className="font-oswald uppercase text-neutral-400">Name:</span>
                  <span className="text-white font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-[#222222] pb-1.5">
                  <span className="font-oswald uppercase text-neutral-400">Mobile:</span>
                  <span className="text-white font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between border-b border-[#222222] pb-1.5">
                  <span className="font-oswald uppercase text-neutral-400">Interested In:</span>
                  <span className="text-[#ED101B] font-bold">{formData.interestedIn}</span>
                </div>
                {formData.interestedIn === 'Membership' && formData.membershipPlan && (
                  <div className="flex justify-between border-b border-[#222222] pb-1.5">
                    <span className="font-oswald uppercase text-neutral-400">Plan:</span>
                    <span className="text-white font-medium">{formData.membershipPlan}</span>
                  </div>
                )}
                {formData.message && (
                  <div className="pt-1">
                    <span className="font-oswald uppercase text-neutral-400 block mb-0.5">Note:</span>
                    <span className="text-neutral-300 italic">{formData.message}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-col gap-2.5">
                <a
                  href={generatedWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded bg-[#25D366] hover:bg-[#20ba59] text-black font-oswald text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/25"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>OPEN WHATSAPP AGAIN</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </a>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRedirected(false)}
                    className="py-2.5 rounded bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white text-xs font-oswald font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>EDIT DETAILS</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 rounded bg-[#222222] hover:bg-[#2c2c2c] text-[#A1A1A1] hover:text-white text-xs font-oswald font-bold uppercase tracking-wider transition-colors"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Enquiry Input Form */
            <div>
              <div className="mb-6">
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B] block mb-1">
                  OFFICIAL ENQUIRY SYSTEM
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                  JOIN ICON FITNESS
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#A1A1A1] mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                  <span>WhatsApp: <strong className="text-white">{WHATSAPP_DISPLAY_NUMBER}</strong></span>
                </div>
              </div>

              {/* Selected Plan Details Banner (when opened via membership card) */}
              {selectedPlan && (
                <div className="mb-5 p-3.5 rounded bg-[#222222] border border-[#303030] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-oswald text-[#ED101B] font-bold tracking-wider block">
                      SELECTED PLAN
                    </span>
                    <p className="font-display text-lg text-white font-bold leading-tight">
                      {selectedPlan.name} ({selectedPlan.duration})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl font-black text-[#ED101B]">
                      {selectedPlan.price}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleEnquireWhatsApp} className="space-y-4" noValidate>
                {/* 1. Full Name */}
                <div>
                  <label
                    htmlFor="modalFullName"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="modalFullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder="Enter your full name"
                    className={`w-full px-3.5 py-2.5 rounded bg-[#080808] border ${
                      errors.fullName ? 'border-red-500' : 'border-[#303030]'
                    } text-white text-sm focus:outline-none focus:border-[#ED101B]`}
                  />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* 2. Mobile Number */}
                <div>
                  <label
                    htmlFor="modalPhone"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="modalPhone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="10-digit mobile number (e.g. 9637545941)"
                    className={`w-full px-3.5 py-2.5 rounded bg-[#080808] border ${
                      errors.phone ? 'border-red-500' : 'border-[#303030]'
                    } text-white text-sm focus:outline-none focus:border-[#ED101B]`}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* 3. Interested In Dropdown */}
                <div>
                  <label
                    htmlFor="modalInterestSelect"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Interested In *
                  </label>
                  <select
                    id="modalInterestSelect"
                    value={formData.interestedIn}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        interestedIn: e.target.value,
                        membershipPlan:
                          e.target.value === 'Membership'
                            ? formData.membershipPlan || MEMBERSHIP_PLAN_OPTIONS[3].label
                            : formData.membershipPlan,
                      });
                      if (errors.interestedIn) setErrors({ ...errors, interestedIn: undefined });
                    }}
                    className="w-full px-3 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-xs sm:text-sm focus:outline-none focus:border-[#ED101B]"
                  >
                    {INTERESTED_IN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Membership Plan Dropdown (Visible when Membership is selected) */}
                {formData.interestedIn === 'Membership' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label
                      htmlFor="modalMembershipPlan"
                      className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#ED101B] mb-1.5"
                    >
                      Membership Plan *
                    </label>
                    <select
                      id="modalMembershipPlan"
                      value={formData.membershipPlan}
                      onChange={(e) => {
                        setFormData({ ...formData, membershipPlan: e.target.value });
                        if (errors.membershipPlan) setErrors({ ...errors, membershipPlan: undefined });
                      }}
                      className="w-full px-3 py-2.5 rounded bg-[#080808] border border-[#ED101B]/50 text-white text-xs sm:text-sm focus:outline-none focus:border-[#ED101B]"
                    >
                      {MEMBERSHIP_PLAN_OPTIONS.map((p) => (
                        <option key={p.id} value={p.label}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    {errors.membershipPlan && <p className="text-red-400 text-xs mt-1">{errors.membershipPlan}</p>}
                  </motion.div>
                )}

                {/* 5. Message (optional) */}
                <div>
                  <label
                    htmlFor="modalMessage"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
                  >
                    Message (Optional)
                  </label>
                  <textarea
                    id="modalMessage"
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Preferred batch timings (morning 5:30 AM - 11 AM or evening), questions, etc."
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B] resize-none"
                  />
                </div>

                {/* Submit Action: ENQUIRE ON WHATSAPP */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded text-xs font-oswald font-black uppercase tracking-wider text-black bg-[#25D366] hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#25D366]/20 group"
                  >
                    <MessageCircle className="w-4 h-4 fill-black" />
                    <span>ENQUIRE ON WHATSAPP</span>
                  </button>

                  <p className="text-[11px] text-[#A1A1A1] text-center mt-2.5">
                    Clicking opens WhatsApp with your pre-filled enquiry. You can review before sending.
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
