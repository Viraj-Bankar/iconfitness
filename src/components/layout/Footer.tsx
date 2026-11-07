import React from 'react';
import { Phone, MapPin, ArrowUp, MessageCircle, Clock, Dumbbell } from 'lucide-react';
import { GYM_CONTACT, FACILITIES, MEMBERSHIP_PLANS } from '../../data/gymData';
import { BrandLogo } from '../common/BrandLogo';
import { InstagramIcon } from '../common/InstagramIcon';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Facilities', href: '#facilities' },
    { name: 'Membership', href: '#membership' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="relative bg-[#080808] border-t border-[#ED101B] pt-16 pb-12 text-[#A1A1A1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-[#303030]">
          
          {/* Column 1: Brand Info & Mascot */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#hero" className="inline-block">
              <BrandLogo size="lg" />
            </a>

            <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed pr-4">
              A 4,000 sq. ft. modern fitness destination in Moshi, Pimpri-Chinchwad. Strength training, Zumba, yoga, cardio, personal training and steam bath facilities.
            </p>

            <div className="pt-2">
              <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] block mb-1">
                PRIMARY TAGLINE
              </span>
              <p className="font-display text-xl text-white tracking-wide uppercase">
                {GYM_CONTACT.primaryTagline}
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-2">
            <h4 className="font-oswald text-xs font-black uppercase text-white tracking-widest mb-4">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-xs font-oswald font-bold uppercase tracking-wider">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-[#ED101B] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Membership & Facilities */}
          <div className="lg:col-span-3">
            <h4 className="font-oswald text-xs font-black uppercase text-white tracking-widest mb-4">
              MEMBERSHIP PLANS
            </h4>
            <ul className="space-y-2 text-xs">
              {MEMBERSHIP_PLANS.map((plan) => (
                <li key={plan.id}>
                  <a
                    href="#membership"
                    className="flex justify-between items-center py-1 border-b border-[#222222] hover:text-white"
                  >
                    <span className="font-oswald uppercase text-[#A1A1A1] hover:text-white">{plan.name}</span>
                    <span className="font-display font-black text-[#ED101B] text-sm">{plan.price}</span>
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="font-oswald text-xs font-black uppercase text-white tracking-widest mt-6 mb-3 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[#ED101B]" />
              <span>FACILITIES</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A1A1A1]">
              {FACILITIES.slice(0, 4).map((f) => (
                <li key={f.id}>
                  <a href="#facilities" className="hover:text-white transition-colors">
                    {f.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Timings */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-oswald text-xs font-black uppercase text-white tracking-widest mb-4">
              CONTACT &amp; TIMINGS
            </h4>

            <div className="flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-[#ED101B] flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[#A1A1A1]">
                {GYM_CONTACT.addressLine1}, {GYM_CONTACT.addressLine2} <br />
                <span className="text-white font-mono text-[11px]">
                  ({GYM_CONTACT.googleMapsPlusCode})
                </span>
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#ED101B]" />
                <a href={`tel:${GYM_CONTACT.phonePrimaryRaw}`} className="text-white hover:text-[#ED101B] font-oswald font-bold">
                  {GYM_CONTACT.phonePrimary}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#ED101B]" />
                <a href={`tel:${GYM_CONTACT.phoneSecondaryRaw}`} className="text-white hover:text-[#ED101B] font-oswald font-bold">
                  {GYM_CONTACT.phoneSecondary}
                </a>
              </div>
            </div>

            <div className="p-3 rounded bg-[#171717] border border-[#303030] text-xs space-y-1">
              <div className="flex items-center gap-2 text-white font-oswald font-bold text-[11px] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#ED101B]" />
                <span>Gym Timings</span>
              </div>
              <p className="text-[#A1A1A1]">Morning: <span className="text-white font-bold">{GYM_CONTACT.timings.morning}</span></p>
              <p className="text-[#A1A1A1]">Evening: <span className="text-white font-bold">{GYM_CONTACT.timings.evening}</span></p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={GYM_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#171717] border border-[#303030] text-white hover:border-[#ED101B] transition-colors text-xs font-oswald font-bold"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-[#ED101B]" />
                <span>{GYM_CONTACT.instagramHandle}</span>
              </a>

              <a
                href={GYM_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded bg-[#171717] border border-[#303030] flex items-center justify-center text-white hover:border-[#25D366] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer Tagline */}
        <div className="py-8 text-center border-b border-[#303030]">
          <p className="font-display text-2xl sm:text-4xl font-black uppercase text-white tracking-widest">
            TRAIN HARD. <span className="text-[#ED101B]">STAY STRONG.</span> BE ICONIC.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Back To Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1A1A1] font-oswald uppercase tracking-wider">
          <p>© 2026 ICON FITNESS. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <span>MODERN MINIMAL FITNESS • DARK EDITION</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-white hover:text-[#ED101B] transition-colors focus:outline-none cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
