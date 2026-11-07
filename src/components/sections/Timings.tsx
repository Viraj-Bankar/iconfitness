import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { GYM_CONTACT } from '../../data/gymData';

export const Timings: React.FC = () => {
  return (
    <section className="relative py-20 lg:py-28 bg-[#ED101B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-white/80 mb-3 block">
            FACILITY HOURS
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black uppercase text-white tracking-tight leading-[0.95]">
            MAKE TIME FOR YOUR FITNESS.
          </h2>
        </div>

        {/* Two Prominent Timing Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          
          {/* Morning Session */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-md bg-[#B9000B] border border-white/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-white/80">
                <Clock className="w-5 h-5 stroke-[2]" />
                <span className="font-oswald text-xs font-bold uppercase tracking-widest text-white">
                  EARLY SESSION
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide mb-4">
                MORNING SESSION
              </h3>

              <div className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight leading-none">
                {GYM_CONTACT.timings.morning}
              </div>
            </div>
            
            <p className="text-xs text-white/80 mt-6 font-medium">
              Start your day with strength training and cardio conditioning.
            </p>
          </motion.div>

          {/* Evening Session */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-8 rounded-md bg-[#B9000B] border border-white/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-white/80">
                <Clock className="w-5 h-5 stroke-[2]" />
                <span className="font-oswald text-xs font-bold uppercase tracking-widest text-white">
                  AFTER-WORK SESSION
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide mb-4">
                EVENING SESSION
              </h3>

              <div className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight leading-none">
                {GYM_CONTACT.timings.evening}
              </div>
            </div>

            <p className="text-xs text-white/80 mt-6 font-medium">
              Strength, Zumba dance sessions, cardio, and steam bath recovery.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
