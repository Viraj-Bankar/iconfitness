import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Dumbbell, UserCheck, Apple, Layers, Sparkles } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const items = [
    {
      number: '01',
      title: 'SPACIOUS FACILITY',
      desc: 'A 4,000 sq. ft. fitness environment.',
      icon: Maximize2,
    },
    {
      number: '02',
      title: 'MODERN EQUIPMENT',
      desc: 'Dedicated strength and cardio equipment.',
      icon: Dumbbell,
    },
    {
      number: '03',
      title: 'PERSONAL TRAINING',
      desc: 'Individual workout guidance.',
      icon: UserCheck,
    },
    {
      number: '04',
      title: 'DIET GUIDANCE',
      desc: 'Diet-plan support for fitness goals.',
      icon: Apple,
    },
    {
      number: '05',
      title: 'MULTIPLE FITNESS ACTIVITIES',
      desc: 'Zumba, yoga, strength and cardio.',
      icon: Layers,
    },
    {
      number: '06',
      title: 'WELLNESS FACILITIES',
      desc: 'Steam bath and yoga facilities.',
      icon: Sparkles,
    },
  ];

  return (
    <section id="why-choose-us" className="relative py-24 lg:py-32 bg-[#ED101B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-white/80 mb-3 block">
            WHY ICON FITNESS
          </span>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[0.95]">
            YOUR GOALS. <br />
            OUR COMMITMENT.
          </h2>
        </div>

        {/* Clean Grid with Subtle White Dividing Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="pt-6 border-t border-white/25 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-3xl font-black text-white/90">
                      {item.number}
                    </span>
                    <Icon className="w-5 h-5 text-white/90 stroke-[1.8]" />
                  </div>

                  <h3 className="font-display text-2xl font-black uppercase tracking-wide text-white mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-white/85 font-normal leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
