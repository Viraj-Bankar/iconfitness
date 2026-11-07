import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Target, Apple, Users } from 'lucide-react';
import { FACILITIES } from '../../data/gymData';
import type { Facility } from '../../types';
import { IconHelper } from '../ui/IconHelper';

interface FacilitiesProps {
  onSelectFacility: (facility: Facility) => void;
  onEnquireFacility: (facilityTitle: string) => void;
}

export const Facilities: React.FC<FacilitiesProps> = ({ onSelectFacility, onEnquireFacility }) => {
  return (
    <section id="facilities" className="relative py-24 lg:py-32 bg-[#080808] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-3 block">
            FACILITIES SHOWCASE
          </span>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[0.95] mb-4">
            EVERYTHING YOU NEED. <br />
            <span className="text-[#ED101B]">ALL UNDER ONE ROOF.</span>
          </h2>
          <p className="text-[#A1A1A1] text-base sm:text-lg font-normal leading-relaxed">
            Explore different ways to move, train, improve and take care of your fitness.
          </p>
        </div>

        {/* 6 Modern Facility Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FACILITIES.map((facility, index) => {
            return (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                className="group relative rounded-md overflow-hidden bg-[#171717] border border-[#303030] hover:border-[#ED101B] transition-colors duration-300 flex flex-col h-[460px] cursor-pointer"
                onClick={() => onSelectFacility(facility)}
              >
                {/* Image Top Area */}
                <div className="relative h-56 w-full overflow-hidden bg-[#080808]">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent opacity-80" />
                  
                  {/* Top Bar: Number & Icon */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="font-display text-2xl font-black text-white/90 bg-[#080808]/80 px-2.5 py-0.5 rounded border border-[#303030]">
                      {facility.number}
                    </span>
                    <div className="w-9 h-9 rounded bg-[#080808]/90 border border-[#303030] flex items-center justify-center text-[#ED101B]">
                      <IconHelper name={facility.iconName} className="w-4 h-4 stroke-[2]" />
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B] mb-1.5 block">
                      {facility.category}
                    </span>
                    <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide mb-2 group-hover:text-[#ED101B] transition-colors leading-snug">
                      {facility.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A1A1A1] font-normal leading-relaxed">
                      {facility.shortDesc}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#303030] mt-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFacility(facility);
                      }}
                      className="font-oswald text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white flex items-center gap-1"
                    >
                      <span>DETAILS</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#ED101B]" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEnquireFacility(facility.title);
                      }}
                      className="px-3.5 py-1.5 rounded text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-colors"
                    >
                      ENQUIRE
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ALSO AVAILABLE SECTION */}
        <div className="p-6 sm:p-8 rounded-md bg-[#171717] border border-[#303030]">
          <span className="font-oswald text-xs font-black uppercase tracking-widest text-[#ED101B] mb-4 block">
            ALSO AVAILABLE
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-[#ED101B] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-white">
                  Personalized workout plans
                </h4>
                <p className="text-xs text-[#A1A1A1] mt-0.5">
                  Tailored exercise routines structured for your individual progression.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Apple className="w-5 h-5 text-[#ED101B] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-white">
                  Diet-plan guidance
                </h4>
                <p className="text-xs text-[#A1A1A1] mt-0.5">
                  Nutritional support aligned with your workout intensity and goals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[#ED101B] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-white">
                  Group discounts
                </h4>
                <p className="text-xs text-[#A1A1A1] mt-0.5">
                  Special discount options available when enrolling with friends or groups.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
