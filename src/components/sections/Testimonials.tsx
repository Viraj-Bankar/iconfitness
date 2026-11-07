import React from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, CheckCircle2 } from 'lucide-react';
import { GYM_CONTACT, TESTIMONIAL_THEMES } from '../../data/gymData';

export const Testimonials: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32 bg-[#171717] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-3 block">
            GOOGLE REVIEWS
          </span>

          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase text-white tracking-tight leading-[0.95] mb-6">
            TRUST BUILT <br />
            <span className="text-[#ED101B]">THROUGH EXPERIENCE.</span>
          </h2>

          {/* Rating Snapshot Card */}
          <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:px-6 rounded-md bg-[#222222] border border-[#303030]">
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl font-black text-white leading-none">
                {GYM_CONTACT.rating}
              </span>
              <div className="flex flex-col">
                <div className="flex text-[#ED101B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#ED101B]" />
                  ))}
                </div>
                <span className="text-[10px] text-[#A1A1A1] font-semibold mt-0.5">
                  OUT OF 5 STARS
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-[#303030] hidden sm:block" />

            <div>
              <p className="font-display text-2xl font-black text-white leading-none">
                {GYM_CONTACT.totalReviews} REVIEWS
              </p>
              <p className="font-oswald text-[10px] uppercase tracking-wider text-[#A1A1A1] font-bold mt-0.5">
                VERIFIED GOOGLE FEEDBACK
              </p>
            </div>
          </div>
        </div>

        {/* 5 Thematic Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {TESTIMONIAL_THEMES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="rounded-md p-6 bg-[#222222] border border-[#303030] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-[#ED101B]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#ED101B]" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-oswald font-bold text-[#A1A1A1] bg-[#171717] px-2 py-0.5 rounded border border-[#303030]">
                    <CheckCircle2 className="w-3 h-3 text-[#ED101B]" />
                    <span>Verified Theme</span>
                  </span>
                </div>

                <h3 className="font-display text-xl font-black uppercase text-white tracking-wide mb-2 leading-snug">
                  "{item.theme}"
                </h3>

                <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed mb-6">
                  {item.text}
                </p>
              </div>

              <div className="pt-4 border-t border-[#303030] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white tracking-wide">
                    {item.reviewerTag}
                  </p>
                  <p className="font-oswald text-[10px] text-[#A1A1A1]">
                    {item.facilityMentioned}
                  </p>
                </div>
                <div className="w-6 h-6 rounded bg-[#171717] border border-[#303030] flex items-center justify-center text-[10px] font-bold text-[#A1A1A1]">
                  G
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA: VIEW GOOGLE REVIEWS */}
        <div>
          <a
            href={GYM_CONTACT.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-md text-sm font-oswald font-black uppercase tracking-wider text-white bg-[#080808] border border-[#303030] hover:border-[#ED101B] hover:text-[#ED101B] transition-colors shadow-md group"
          >
            <span>VIEW GOOGLE REVIEWS</span>
            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
