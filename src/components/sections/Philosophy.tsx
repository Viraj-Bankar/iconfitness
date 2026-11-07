import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Scale } from 'lucide-react';

export const Philosophy: React.FC = () => {
  const pillars = [
    {
      keyword: 'STRENGTH',
      subtitle: 'Physical Power & Capacity',
      description: 'Developing resilient muscles, robust bones, and functional power that supports your daily lifestyle.',
      icon: Zap,
    },
    {
      keyword: 'BALANCE',
      subtitle: 'Mobility & Recovery',
      description: 'Harmonizing intense exertion with mindful yoga and restorative steam baths to avoid burnout and prevent injury.',
      icon: Scale,
    },
    {
      keyword: 'CONSISTENCY',
      subtitle: 'Habits for Longevity',
      description: 'Creating an encouraging atmosphere where regular discipline turns into rewarding, lifelong wellness.',
      icon: Shield,
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-[#090909] overflow-hidden">
      {/* Editorial Background Image with Strong Dark Grading */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=2000&q=80"
          alt="Athlete focused on discipline at ICON FITNESS"
          className="w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.2]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-[#090909]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/70 to-[#090909]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Editorial Statement */}
        <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 text-[#C6FF36] text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span>Our Fitness &amp; Wellness Philosophy</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.05] mb-8"
          >
            “FITNESS IS NOT JUST ABOUT LOOKING STRONG.{' '}
            <span className="text-[#C6FF36] block sm:inline">
              IT’S ABOUT FEELING STRONG.”
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-xl text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto"
          >
            From strength training and cardiovascular workouts to yoga and Zumba, ICON FITNESS brings together different approaches to help you build a balanced fitness lifestyle.
          </motion.p>
        </div>

        {/* 3 Visual Keywords / Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.keyword}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative rounded-2xl p-8 bg-neutral-900/60 border border-neutral-800 backdrop-blur-md hover:border-[#C6FF36]/40 transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C6FF36]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#C6FF36]/10 transition-colors" />

                <div>
                  <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[#C6FF36] mb-6 group-hover:bg-[#C6FF36] group-hover:text-black transition-all">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  <h3 className="font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-wider mb-1 group-hover:text-[#C6FF36] transition-colors">
                    {pillar.keyword}
                  </h3>

                  <p className="text-xs font-bold uppercase tracking-widest text-[#C6FF36] mb-3">
                    {pillar.subtitle}
                  </p>

                  <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    Pillar 0{index + 1}
                  </span>
                  <div className="w-8 h-0.5 bg-neutral-700 group-hover:bg-[#C6FF36] transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

