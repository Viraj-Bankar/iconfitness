import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, Dumbbell, Award } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface HeroProps {
  onExploreFacilities: () => void;
  onViewPlans: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreFacilities, onViewPlans }) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#080808]"
    >
      {/* Background Photography with Dark Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/gallery/real-gym-wide-interior.jpg"
          alt="ICON FITNESS 4000 sq ft facility in Moshi"
          className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-[1.15]"
          loading="eager"
        />
        {/* Subtle Dark Vignette & Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/75 to-[#080808]/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center min-h-[calc(100vh-7rem)]">
        <div className="max-w-4xl">
          
          {/* Eyebrow with Original Logo Mascot */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#303030] mb-6"
          >
            <BrandLogo size="sm" showSubtitle={false} />
            <div className="h-4 w-px bg-[#303030]" />
            <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#A1A1A1]">
              Moshi, Pimpri-Chinchwad
            </span>
          </motion.div>

          {/* Main Heading: Highlight STRONGEST in red */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-white leading-[0.92] mb-6"
          >
            BUILD YOUR <br />
            <span className="text-[#ED101B]">STRONGEST</span> SELF.
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-[#A1A1A1] font-normal max-w-2xl leading-relaxed mb-10"
          >
            Your fitness journey deserves the right environment, the right equipment and the right guidance. Welcome to <strong className="text-white font-bold">ICON FITNESS</strong> — where strength, discipline and transformation come together.
          </motion.p>

          {/* CTA Buttons: Primary & Secondary */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16"
          >
            <button
              type="button"
              onClick={onExploreFacilities}
              className="inline-flex items-center justify-center px-8 py-4 rounded-md text-sm font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-all duration-200 cursor-pointer shadow-md group"
            >
              <span>EXPLORE OUR FACILITIES</span>
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onViewPlans}
              className="inline-flex items-center justify-center px-8 py-4 rounded-md text-sm font-oswald font-bold uppercase tracking-wider text-white bg-[#171717] hover:bg-[#222222] border border-[#303030] hover:border-neutral-500 transition-all duration-200 cursor-pointer"
            >
              <span>VIEW MEMBERSHIP PLANS</span>
            </button>
          </motion.div>

          {/* Three Key Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 border-t border-[#303030] max-w-3xl"
          >
            {/* Highlight 1: 4,000 SQ. FT. */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-md bg-[#171717] border border-[#303030]">
              <div className="w-10 h-10 rounded bg-[#222222] flex items-center justify-center text-[#ED101B]">
                <Dumbbell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="font-display text-2xl text-white tracking-wide font-black leading-none">
                  4,000 SQ. FT.
                </p>
                <p className="font-oswald text-[11px] uppercase tracking-wider text-[#A1A1A1] font-bold mt-1">
                  FITNESS SPACE
                </p>
              </div>
            </div>

            {/* Highlight 2: 6+ FACILITIES */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-md bg-[#171717] border border-[#303030]">
              <div className="w-10 h-10 rounded bg-[#222222] flex items-center justify-center text-[#ED101B]">
                <Award className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="font-display text-2xl text-white tracking-wide font-black leading-none">
                  6+ FACILITIES
                </p>
                <p className="font-oswald text-[11px] uppercase tracking-wider text-[#A1A1A1] font-bold mt-1">
                  FITNESS &amp; WELLNESS
                </p>
              </div>
            </div>

            {/* Highlight 3: 4.8/5 GOOGLE RATING */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-md bg-[#171717] border border-[#303030]">
              <div className="w-10 h-10 rounded bg-[#222222] flex items-center justify-center text-[#ED101B]">
                <Star className="w-5 h-5 fill-[#ED101B]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <p className="font-display text-2xl text-white tracking-wide font-black">
                    4.8 / 5
                  </p>
                  <div className="flex text-[#ED101B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-[#ED101B]" />
                    ))}
                  </div>
                </div>
                <p className="font-oswald text-[11px] uppercase tracking-wider text-[#A1A1A1] font-bold mt-1">
                  55 GOOGLE REVIEWS
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Minimal Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <a
          href="#about"
          className="group flex flex-col items-center gap-1 text-neutral-500 hover:text-[#ED101B] transition-colors"
          aria-label="Scroll to About section"
        >
          <span className="font-oswald text-[9px] uppercase font-bold tracking-widest text-[#A1A1A1] group-hover:text-white">
            SCROLL
          </span>
          <div className="w-4 h-7 rounded-full border border-[#303030] flex items-start justify-center p-1 group-hover:border-[#ED101B]">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-1.5 bg-[#ED101B] rounded-full"
            />
          </div>
        </a>
      </div>
    </section>
  );
};
