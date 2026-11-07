import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MessageCircle } from 'lucide-react';
import { MEMBERSHIP_PLANS, GYM_CONTACT } from '../../data/gymData';
import type { ContactFormData, MembershipPlan } from '../../types';

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
    email: '',
    planOrFacility: 'Yearly Plan (1 Year - ₹8,000)',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (selectedPlan) {
      setFormData((prev) => ({
        ...prev,
        planOrFacility: `${selectedPlan.name} (${selectedPlan.duration} - ${selectedPlan.price})`,
      }));
    } else if (initialInterest) {
      setFormData((prev) => ({
        ...prev,
        planOrFacility: initialInterest,
      }));
    }
  }, [selectedPlan, initialInterest]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
      setIsSuccess(false);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    const errs: Partial<Record<keyof ContactFormData, string>> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Please enter your full name.';
    const phoneClean = formData.phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneClean) {
      errs.phone = 'Please enter your 10-digit mobile number.';
    } else if (!phoneRegex.test(phoneClean)) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 450);
  };

  const prefilledWhatsappMessage = encodeURIComponent(
    `Hello ICON FITNESS, I would like to enquire about: ${formData.planOrFacility}.\nName: ${formData.fullName}\nPhone: ${formData.phone}${formData.message ? `\nNote: ${formData.message}` : ''}`
  );

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

          {isSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#ED101B]/15 border border-[#ED101B] flex items-center justify-center text-[#ED101B] mx-auto">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  ENQUIRY RECORDED
                </h3>
                <p className="text-xs text-[#A1A1A1] mt-1">
                  Thank you, {formData.fullName}. You can connect directly on WhatsApp to continue.
                </p>
              </div>

              <div className="p-4 bg-[#080808] rounded border border-[#303030] text-xs text-left text-[#A1A1A1] space-y-1">
                <p><strong>Mobile:</strong> {formData.phone}</p>
                <p><strong>Selected:</strong> {formData.planOrFacility}</p>
                <p className="text-[11px] text-[#A1A1A1] italic pt-1 border-t border-[#303030]">
                  *Phase 1 Demo: No online payment processed.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/918669022902?text=${prefilledWhatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded bg-[#25D366] text-black font-oswald text-xs font-black uppercase tracking-wider"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>ENQUIRE THROUGH WHATSAPP</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded bg-[#222222] text-[#A1A1A1] text-xs font-oswald font-bold uppercase tracking-wider hover:text-white"
                >
                  CLOSE
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B] block mb-1">
                  MEMBERSHIP ENQUIRY
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                  JOIN ICON FITNESS
                </h3>
                <p className="text-xs text-[#A1A1A1] mt-1">
                  WhatsApp: {GYM_CONTACT.whatsappNumber}
                </p>
              </div>

              {/* Selected Plan Details */}
              {selectedPlan && (
                <div className="mb-5 p-3 rounded bg-[#222222] border border-[#303030] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-oswald text-[#A1A1A1] block">
                      Plan &amp; Duration
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

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="modalFullName" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="modalFullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                  />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modalPhone" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      id="modalPhone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="modalPlanSelect" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                      Plan / Topic
                    </label>
                    <select
                      id="modalPlanSelect"
                      value={formData.planOrFacility}
                      onChange={(e) => setFormData({ ...formData, planOrFacility: e.target.value })}
                      className="w-full px-3 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-xs sm:text-sm focus:outline-none focus:border-[#ED101B]"
                    >
                      <optgroup label="Official Membership Plans">
                        {MEMBERSHIP_PLANS.map((p) => (
                          <option key={p.id} value={`${p.name} (${p.duration} - ${p.price})`}>
                            {p.name} — {p.price} ({p.duration})
                          </option>
                        ))}
                      </optgroup>
                      <option value="Group Discount Enquiry">Group Discount Enquiry</option>
                      <option value="Personal Training Guidance">Personal Training Guidance</option>
                      <option value="General Gym Enquiry">General Gym Enquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="modalMessage" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                    Optional Message
                  </label>
                  <textarea
                    id="modalMessage"
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Preferred batch (morning 5:30 AM or evening), questions, etc."
                    className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B] resize-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <span>PROCESSING...</span> : <span>SUBMIT ENQUIRY</span>}
                  </button>

                  <a
                    href={`https://wa.me/918669022902?text=${prefilledWhatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded text-xs font-oswald font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-[#222222] hover:bg-[#2b2b2b] border border-[#303030] transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>ENQUIRE THROUGH WHATSAPP</span>
                  </a>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
