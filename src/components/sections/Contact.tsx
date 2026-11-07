import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { GYM_CONTACT } from '../../data/gymData';
import type { ContactFormData } from '../../types';
import { InstagramIcon } from '../common/InstagramIcon';

interface ContactProps {
  preselectedOption?: string;
}

const INTERESTED_OPTIONS = [
  'General Gym Enquiry',
  'Membership',
  'Personal Training',
  'Zumba',
  'Yoga',
  'Diet Plan',
  'Other',
];

export const Contact: React.FC<ContactProps> = ({ preselectedOption }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    phone: '',
    email: '',
    planOrFacility: preselectedOption || 'General Gym Enquiry',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(null);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    const phoneClean = formData.phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneClean) {
      newErrors.phone = 'Please enter your contact mobile number.';
    } else if (!phoneRegex.test(phoneClean)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 4) {
      newErrors.message = 'Message should be at least 4 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({ ...formData });
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        planOrFacility: 'General Gym Enquiry',
        message: '',
      });
      setErrors({});
    }, 500);
  };

  const constructWhatsAppLink = (data: ContactFormData) => {
    const text = encodeURIComponent(
      `Hello ICON FITNESS, I submitted an enquiry on your website.\n\nName: ${data.fullName}\nPhone: ${data.phone}\nInterested in: ${data.planOrFacility}\nMessage: ${data.message}`
    );
    return `https://wa.me/918669022902?text=${text}`;
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
            Have questions about our facilities, membership or personal training? Connect with ICON FITNESS.
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
                <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  SEND AN ENQUIRY
                </h3>
                <p className="text-xs text-[#A1A1A1] mt-1">
                  Fill in your details below and we will get back to you promptly.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {submittedData ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-6 text-center space-y-5"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#ED101B]/15 border border-[#ED101B] flex items-center justify-center text-[#ED101B] mx-auto">
                      <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-display text-2xl font-black uppercase text-white">
                        ENQUIRY RECEIVED
                      </h4>
                      <p className="text-xs text-[#A1A1A1] mt-1">
                        Thank you, {submittedData.fullName}. Phase 1 frontend demo state recorded.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={constructWhatsAppLink(submittedData)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-4 rounded bg-[#25D366] text-black font-oswald text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 fill-black" />
                        <span>CONTINUE ON WHATSAPP</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setSubmittedData(null)}
                        className="py-3 px-4 rounded bg-[#222222] text-white font-oswald text-xs font-bold uppercase tracking-wider hover:bg-[#303030]"
                      >
                        RESET FORM
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
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Your full name"
                        className={`w-full px-3.5 py-2.5 rounded bg-[#080808] border ${
                          errors.fullName ? 'border-red-500' : 'border-[#303030]'
                        } text-white text-sm focus:outline-none focus:border-[#ED101B]`}
                      />
                      {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    {/* Mobile Number & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contactPhone" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                          Mobile Number *
                        </label>
                        <input
                          id="contactPhone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="10-digit mobile"
                          className={`w-full px-3.5 py-2.5 rounded bg-[#080808] border ${
                            errors.phone ? 'border-red-500' : 'border-[#303030]'
                          } text-white text-sm focus:outline-none focus:border-[#ED101B]`}
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label htmlFor="contactEmail" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                          Email Address (Optional)
                        </label>
                        <input
                          id="contactEmail"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                        />
                      </div>
                    </div>

                    {/* Interested In */}
                    <div>
                      <label htmlFor="contactInterest" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                        Interested In
                      </label>
                      <select
                        id="contactInterest"
                        value={formData.planOrFacility}
                        onChange={(e) => setFormData({ ...formData, planOrFacility: e.target.value })}
                        className="w-full px-3 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-xs sm:text-sm focus:outline-none focus:border-[#ED101B]"
                      >
                        {INTERESTED_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="contactMessage" className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5">
                        Message *
                      </label>
                      <textarea
                        id="contactMessage"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what you would like to know..."
                        className={`w-full px-3.5 py-2.5 rounded bg-[#080808] border ${
                          errors.message ? 'border-red-500' : 'border-[#303030]'
                        } text-white text-sm focus:outline-none focus:border-[#ED101B] resize-none`}
                      />
                      {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                    </div>

                    {/* Submit Button: SEND ENQUIRY */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <span>SENDING...</span> : <span>SEND ENQUIRY</span>}
                    </button>
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
