import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Facility } from '../../types';
import { IconHelper } from './IconHelper';

interface FacilityModalProps {
  facility: Facility | null;
  onClose: () => void;
  onEnquire: (facilityTitle: string) => void;
}

export const FacilityModal: React.FC<FacilityModalProps> = ({ facility, onClose, onEnquire }) => {
  // ESC key listener & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (facility) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [facility, onClose]);

  if (!facility) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-3xl rounded-3xl bg-[#0e0e0e] border border-[#ED101B]/40 shadow-2xl overflow-hidden z-10 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/75 border border-neutral-700 text-white hover:text-[#ED101B] hover:border-[#ED101B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Banner Image */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black">
            <img
              src={facility.image}
              alt={facility.title}
              className="w-full h-full object-cover object-center filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/40 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="font-athletic text-xs font-black uppercase tracking-widest text-[#FFD21C] bg-black/80 px-3 py-1 rounded-md backdrop-blur-sm border border-neutral-700">
                  {facility.category} • Discipline {facility.number}
                </span>
                <h3 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-wide mt-2">
                  {facility.title}
                </h3>
              </div>
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-[#ED101B] items-center justify-center text-white shadow-lg">
                <IconHelper name={facility.iconName} className="w-7 h-7 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h4 className="font-athletic text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                Facility Overview
              </h4>
              <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed">
                {facility.fullDesc}
              </p>
            </div>

            {/* Highlights Chips */}
            <div>
              <h4 className="font-athletic text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                Key Features &amp; Equipment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {facility.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#ED101B] flex-shrink-0" />
                    <span className="font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="font-athletic text-xs text-[#FFD21C] font-bold">
                Spacious 4,000 sq. ft. Centre in Moshi
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-neutral-800 text-white font-athletic font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEnquire(facility.title);
                  }}
                  className="px-6 py-3 rounded-xl bg-[#ED101B] text-white font-athletic font-black text-xs uppercase tracking-wider shadow-lg shadow-[#ED101B]/40 hover:bg-[#B80009] transition-all flex items-center justify-center gap-2 border border-[#ED101B]"
                >
                  <span>Enquire For This Facility</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
