import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Layers, UserCheck, HeartHandshake, ArrowRight } from 'lucide-react';

interface AboutProps {
  onDiscoverFacilities: () => void;
}

export const About: React.FC<AboutProps> = ({ onDiscoverFacilities }) => {
  const highlights = [
    {
      icon: Maximize2,
      title: 'Spacious 4,000 sq. ft. facility',
      desc: 'Extensive floor area with an agility turf lane and dedicated zones for unrestricted training.',
    },
    {
      icon: Layers,
      title: 'Multiple fitness and wellness facilities',
      desc: 'Strength training, Zumba, yoga, cardio, personal training and steam bath under one roof.',
    },
    {
      icon: UserCheck,
      title: 'Personal training and workout guidance',
      desc: 'Individual workout instruction emphasizing form, biomechanics and structured progression.',
    },
    {
      icon: HeartHandshake,
      title: 'Supportive workout environment',
      desc: 'A positive and disciplined atmosphere where members motivate each other every day.',
    },
  ];

  return (
    <section id="about" className="relative py-24 lg:py-32 bg-[#171717] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Large Gym Interior Photograph with Minimal Framing */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-lg overflow-hidden border border-[#303030] bg-[#080808]">
              <img
                src="/assets/gallery/real-gym-wide-interior.jpg"
                alt="ICON FITNESS spacious gym interior in Moshi"
                className="w-full h-[440px] sm:h-[500px] object-cover object-center filter brightness-95"
                loading="lazy"
              />
              {/* Minimal caption badge */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded bg-[#080808]/90 border border-[#303030]">
                <p className="font-oswald text-xs uppercase tracking-wider text-white font-bold">
                  4,000 SQ. FT. WORKOUT SPACE • MOSHI GAON
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Narrative and Value Points */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Eyebrow */}
            <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-3 block">
              ABOUT ICON FITNESS
            </span>

            {/* Heading */}
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-[0.96] mb-6">
              MORE THAN A GYM. <br />
              <span className="text-[#ED101B]">A STRONGER WAY OF LIFE.</span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed font-normal mb-8">
              ICON FITNESS is a fitness and wellness destination designed to help individuals work towards their fitness goals. With a spacious 4,000 sq. ft. facility, modern workout equipment, personal training, group fitness activities and wellness facilities, we bring different fitness experiences together under one roof.
            </p>

            {/* 4 Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
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

            {/* CTA: DISCOVER ICON FITNESS */}
            <div>
              <button
                type="button"
                onClick={onDiscoverFacilities}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-md text-sm font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-all duration-200 shadow-md group cursor-pointer"
              >
                <span>DISCOVER ICON FITNESS</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
