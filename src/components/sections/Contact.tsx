import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Navigation,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { GYM_CONTACT } from '../../data/gymData';
import type { ContactFormData } from '../../types';
import { InstagramIcon } from '../common/InstagramIcon';
import {
  INTERESTED_IN_OPTIONS,
  MEMBERSHIP_PLAN_OPTIONS,
  type MembershipPlanOption,
  formatWhatsAppMessage,
  buildWhatsAppUrl,
  openWhatsApp,
  validateIndianMobile,
  mapTopicToInterestedIn,
  toMembershipPlanOption,
  WHATSAPP_DISPLAY_NUMBER,
} from '../../utils/whatsapp';
import { getPublicMembershipPlans } from '../../services/membershipService';

interface ContactProps {
  preselectedOption?: string;
}

export const Contact: React.FC<ContactProps> = ({ preselectedOption }) => {
  const [planOptions, setPlanOptions] = useState<MembershipPlanOption[]>(MEMBERSHIP_PLAN_OPTIONS);
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    phone: '',
    interestedIn: 'General Gym Enquiry',
    membershipPlan: MEMBERSHIP_PLAN_OPTIONS[3].label, // 1 Year default
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<'fullName' | 'phone' | 'interestedIn' | 'membershipPlan', string>>>({});
  const [isRedirected, setIsRedirected] = useState(false);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState('');

  // Load dynamic membership plans from Supabase / service
  useEffect(() => {
    let isMounted = true;
    getPublicMembershipPlans()
      .then((plans) => {
        if (isMounted && plans && plans.length > 0) {
          setPlanOptions(plans.map(toMembershipPlanOption));
        }
      })
      .catch((err) => {
        console.warn('Failed to load dynamic plan options for contact form:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (preselectedOption) {
      const mapped = mapTopicToInterestedIn(preselectedOption);
      setFormData((prev) => ({
        ...prev,
        interestedIn: mapped.interestedIn,
        membershipPlan: mapped.membershipPlan || prev.membershipPlan || (planOptions[3]?.label ?? MEMBERSHIP_PLAN_OPTIONS[3].label),
        message: mapped.defaultMessage || prev.message || '',
      }));
    }
  }, [preselectedOption, planOptions]);

  const validateForm = () => {
    const newErrors: Partial<Record<'fullName' | 'phone' | 'interestedIn' | 'membershipPlan', string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    const mobileValidation = validateIndianMobile(formData.phone);
    if (!mobileValidation.isValid) {
      newErrors.phone = mobileValidation.error || 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.interestedIn) {
      newErrors.interestedIn = 'Please select a topic.';
    }

    if (formData.interestedIn === 'Membership' && !formData.membershipPlan) {
      newErrors.membershipPlan = 'Please select a membership plan.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // Open WhatsApp
    openWhatsApp(message);
    setIsRedirected(true);
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-[#080808] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-3 block">
            CONTACT &amp; LOCATION
          </span>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[0.95] mb-4">
            YOUR FITNESS JOURNEY <br />
            <span className="text-[#ED101B]">STARTS HERE.</span>
          </h2>
          <p className="text-[#A1A1A1] text-base sm:text-lg font-normal leading-relaxed">
            Have questions about our facilities, membership or personal training? Connect directly with ICON FITNESS via WhatsApp or phone.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Official Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Address */}
            <div className="p-6 rounded-md bg-[#171717] border border-[#303030]">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#ED101B] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide mb-1">
                    {GYM_CONTACT.name}
                  </h3>
                  <p className="text-sm text-[#A1A1A1] leading-relaxed">
                    {GYM_CONTACT.addressLine1} <br />
                    {GYM_CONTACT.addressLine2}
                  </p>
                  <p className="font-oswald text-xs text-[#A1A1A1] font-semibold mt-2">
                    Plus Code: <span className="text-white">{GYM_CONTACT.googleMapsPlusCode}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Official WhatsApp Banner */}
            <div className="p-6 rounded-md bg-[#171717] border border-[#303030] space-y-3">
              <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#25D366] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                OFFICIAL WHATSAPP CHANNEL
              </span>
              <a
                href={GYM_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded bg-[#222222] border border-[#303030] hover:border-[#25D366] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  <span className="text-sm font-oswald font-bold text-white tracking-wider">
                    {WHATSAPP_DISPLAY_NUMBER}
                  </span>
                </div>
                <span className="text-xs font-oswald text-[#25D366] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  CHAT NOW &rarr;
                </span>
              </a>
            </div>

            {/* Phone Numbers */}
            <div className="p-6 rounded-md bg-[#171717] border border-[#303030] space-y-3">
              <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] block">
                PHONE NUMBERS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${GYM_CONTACT.phonePrimaryRaw}`}
                  className="flex items-center gap-2.5 p-3 rounded bg-[#222222] border border-[#303030] text-sm font-oswald font-bold text-white hover:border-[#ED101B] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#ED101B]" />
                  <span>{GYM_CONTACT.phonePrimary}</span>
                </a>
                <a
                  href={`tel:${GYM_CONTACT.phoneSecondaryRaw}`}
                  className="flex items-center gap-2.5 p-3 rounded bg-[#222222] border border-[#303030] text-sm font-oswald font-bold text-white hover:border-[#ED101B] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#ED101B]" />
                  <span>{GYM_CONTACT.phoneSecondary}</span>
                </a>
              </div>
            </div>

            {/* Instagram & Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={GYM_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-md bg-[#171717] border border-[#303030] hover:border-[#ED101B] transition-colors block group"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <InstagramIcon className="w-4 h-4 text-[#ED101B]" />
                  <span className="font-oswald text-xs font-bold uppercase tracking-wider text-white">
                    INSTAGRAM
                  </span>
                </div>
                <span className="text-sm font-oswald font-bold text-[#A1A1A1] group-hover:text-white transition-colors">
                  {GYM_CONTACT.instagramHandle}
                </span>
              </a>

              <div className="p-5 rounded-md bg-[#171717] border border-[#303030]">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#ED101B]" />
                  <span className="font-oswald text-xs font-bold uppercase tracking-wider text-white">
                    TIMINGS
                  </span>
                </div>
                <p className="text-xs text-[#A1A1A1]">Morning: <strong className="text-white">{GYM_CONTACT.timings.morning}</strong></p>
                <p className="text-xs text-[#A1A1A1]">Evening: <strong className="text-white">{GYM_CONTACT.timings.evening}</strong></p>
              </div>
            </div>

            {/* Get Directions Button */}
            <div>
              <a
                href={GYM_CONTACT.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-md bg-[#171717] hover:bg-[#222222] border border-[#303030] text-white text-xs font-oswald font-black uppercase tracking-wider transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#ED101B]" />
                <span>GET DIRECTIONS ON GOOGLE MAPS</span>
              </a>
            </div>

          </div>

          {/* Right Column: Google Maps Embed & Contact Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Embedded Google Maps */}
            <div className="rounded-md overflow-hidden border border-[#303030] bg-[#171717] h-[220px]">
              <iframe
                title="ICON FITNESS Google Maps"
                src={GYM_CONTACT.googleMapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.1)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Contact Enquiry Form */}
            <div className="p-6 sm:p-8 rounded-md bg-[#171717] border border-[#303030]">
              <div className="mb-6">
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#25D366] block mb-1">
                  DIRECT ENQUIRY
                </span>
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  SEND AN ENQUIRY
                </h3>
                <p className="text-xs text-[#A1A1A1] mt-1">
                  Fill in your details below to enquire directly with ICON FITNESS via WhatsApp.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {isRedirected ? (
                  /* Pre-Redirection Notice State */
                  <motion.div
                    key="redirected"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-6 space-y-6"
                  >
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-[#25D366]/15 border-2 border-[#25D366] flex items-center justify-center text-[#25D366] mx-auto shadow-lg shadow-[#25D366]/20">
                        <MessageCircle className="w-9 h-9 fill-[#25D366]" />
                      </div>
                      <h4 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                        CONNECT ON WHATSAPP
                      </h4>
                    </div>

                    {/* Redirection Alert Notice */}
                    <div className="p-4 bg-[#25D366]/10 border border-[#25D366]/40 rounded-md">
                      <p className="text-sm text-neutral-200 text-center leading-relaxed font-medium">
                        You're being redirected to WhatsApp. Review your message and press{' '}
                        <strong className="text-[#25D366] font-bold">Send</strong> to complete your enquiry.
                      </p>
                    </div>

                    {/* Enquiry Details Summary */}
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

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <a
                        href={generatedWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 px-4 rounded bg-[#25D366] hover:bg-[#20ba59] text-black font-oswald text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/25"
                      >
                        <MessageCircle className="w-4 h-4 fill-black" />
                        <span>OPEN WHATSAPP AGAIN</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsRedirected(false)}
                        className="py-3 px-5 rounded bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white font-oswald text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>EDIT DETAILS</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Full Name */}
                    <div>
                      <label htmlFor="contactFullName" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="contactFullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                        }}
                        placeholder="Your full name"
                        className={`w-full px-3.5 py-2.5 rounded bg-[#080808] border ${
                          errors.fullName ? 'border-red-500' : 'border-[#303030]'
                        } text-white text-sm focus:outline-none focus:border-[#ED101B]`}
                      />
                      {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label htmlFor="contactPhone" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        id="contactPhone"
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

                    {/* Interested In */}
                    <div>
                      <label htmlFor="contactInterest" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                        Interested In *
                      </label>
                      <select
                        id="contactInterest"
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
                      {errors.interestedIn && <p className="text-red-400 text-xs mt-1">{errors.interestedIn}</p>}
                    </div>

                    {/* Membership Plan (Visible when Membership is selected) */}
                    {formData.interestedIn === 'Membership' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label
                          htmlFor="contactMembershipPlan"
                          className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#ED101B] mb-1.5"
                        >
                          Membership Plan *
                        </label>
                        <select
                          id="contactMembershipPlan"
                          value={formData.membershipPlan}
                          onChange={(e) => {
                            setFormData({ ...formData, membershipPlan: e.target.value });
                            if (errors.membershipPlan) setErrors({ ...errors, membershipPlan: undefined });
                          }}
                          className="w-full px-3 py-2.5 rounded bg-[#080808] border border-[#ED101B]/50 text-white text-xs sm:text-sm focus:outline-none focus:border-[#ED101B]"
                        >
                          {formData.membershipPlan && !planOptions.some((p) => p.label === formData.membershipPlan) && (
                            <option value={formData.membershipPlan}>{formData.membershipPlan}</option>
                          )}
                          {planOptions.map((p) => (
                            <option key={p.id} value={p.label}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        {errors.membershipPlan && <p className="text-red-400 text-xs mt-1">{errors.membershipPlan}</p>}
                      </motion.div>
                    )}

                    {/* Message (Optional) */}
                    <div>
                      <label htmlFor="contactMessage" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                        Message (Optional)
                      </label>
                      <textarea
                        id="contactMessage"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what you would like to know (batch timings, personal training, etc.)..."
                        className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B] resize-none"
                      />
                    </div>

                    {/* Submit Button: ENQUIRE ON WHATSAPP */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded text-xs font-oswald font-black uppercase tracking-wider text-black bg-[#25D366] hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#25D366]/20"
                      >
                        <MessageCircle className="w-4 h-4 fill-black" />
                        <span>ENQUIRE ON WHATSAPP</span>
                      </button>

                      <p className="text-[11px] text-[#A1A1A1] text-center mt-2.5">
                        Clicking opens WhatsApp with your pre-filled enquiry. Review before sending.
                      </p>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
