import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { GYM_CONTACT } from '../../data/gymData';

export const FloatingActions: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Quick Direct Call Button */}
      <a
        href={`tel:${GYM_CONTACT.phonePrimaryRaw}`}
        aria-label="Call ICON FITNESS"
        className="w-11 h-11 rounded-full bg-[#ED101B] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 border border-[#ED101B] group"
      >
        <Phone className="w-5 h-5" />
        <span className="absolute right-14 bg-[#111111] border border-neutral-700 text-white text-xs font-athletic font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none hidden sm:inline-block">
          Call: {GYM_CONTACT.phonePrimary}
        </span>
      </a>

      {/* WhatsApp Floating Button */}
      <a
        href={GYM_CONTACT.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-13 h-13 rounded-full bg-[#25D366] text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 group border-2 border-black/40"
      >
        <MessageCircle className="w-7 h-7 fill-black" />
        <span className="absolute right-15 bg-[#111111] border border-neutral-700 text-white text-xs font-athletic font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none hidden sm:inline-block">
          WhatsApp Enquiry
        </span>
      </a>
    </div>
  );
};
