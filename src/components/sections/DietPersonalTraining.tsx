import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Target, TrendingUp, Apple, ArrowRight } from 'lucide-react';

interface DietPersonalTrainingProps {
  onEnquireTraining: () => void;
}

export const DietPersonalTraining: React.FC<DietPersonalTrainingProps> = ({ onEnquireTraining }) => {
  const highlights = [
    {
      icon: UserCheck,
      title: 'Personal workout guidance',
      desc: 'One-on-one attention ensuring correct posture and safe exercise execution.',
    },
    {
      icon: Target,
      title: 'Personalized workout plans',
      desc: 'Training routines tailored specifically to your body type and fitness aspirations.',
    },
    {
      icon: TrendingUp,
      title: 'Fitness goal-oriented training',
      desc: 'Progressive overload tracking designed for strength building and conditioning.',
    },
    {
      icon: Apple,
      title: 'Diet-plan support',
      desc: 'Actionable nutrition recommendations to complement your training routine.',
    },
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-[#171717] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Professional Photograph */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <div className="relative rounded-lg overflow-hidden border border-[#303030] bg-[#080808]">
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80"
                alt="Personal training session at ICON FITNESS"
                className="w-full h-[450px] sm:h-[520px] object-cover object-center filter brightness-95"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded bg-[#080808]/90 border border-[#303030]">
                <p className="font-oswald text-xs uppercase tracking-wider text-white font-bold">
                  DEDICATED 1-ON-1 COACHING
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Narrative and Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center"
          >
            <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-3 block">
              COACHING &amp; NUTRITION
            </span>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-[0.96] mb-6">
              TRAIN WITH PURPOSE. <br />
              <span className="text-[#ED101B]">PROGRESS WITH GUIDANCE.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed font-normal mb-8">
              Every fitness journey is different. ICON FITNESS provides <strong className="text-white">personal training</strong> and <strong className="text-white">diet-plan guidance</strong> to help individuals follow a more structured fitness routine.
            </p>

            {/* 4 Feature Points Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-md bg-[#222222] border border-[#303030]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-[#171717] border border-[#303030] flex items-center justify-center flex-shrink-0 text-[#ED101B] mt-0.5">
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#A1A1A1] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA: ENQUIRE ABOUT PERSONAL TRAINING */}
            <div>
              <button
                type="button"
                onClick={onEnquireTraining}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-md text-sm font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-all duration-200 shadow-md group cursor-pointer"
              >
                <span>ENQUIRE ABOUT PERSONAL TRAINING</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
