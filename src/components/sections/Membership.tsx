import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { MEMBERSHIP_PLANS, ADDITIONAL_OFFERS } from '../../data/gymData';
import { getPublicMembershipPlans } from '../../services/membershipService';
import type { MembershipPlan } from '../../types';

interface MembershipProps {
  onSelectPlan: (plan: MembershipPlan) => void;
  onEnquireOffer: (offerTitle: string) => void;
}

export const Membership: React.FC<MembershipProps> = ({ onSelectPlan, onEnquireOffer }) => {
  const [plans, setPlans] = useState<MembershipPlan[]>(MEMBERSHIP_PLANS);

  useEffect(() => {
    let isMounted = true;
    getPublicMembershipPlans()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setPlans(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load membership plans from Supabase:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <section id="membership" className="relative py-24 lg:py-32 bg-[#080808] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="font-oswald text-xs font-bold uppercase tracking-widest text-[#ED101B] mb-3 block">
            MEMBERSHIP PLANS
          </span>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-[0.95] mb-4">
            CHOOSE YOUR PLAN. <br />
            <span className="text-[#ED101B]">COMMIT TO YOURSELF.</span>
          </h2>
          <p className="text-[#A1A1A1] text-base sm:text-lg font-normal leading-relaxed">
            Every fitness journey starts with a decision. Find a membership duration that suits your goals and take the first step towards becoming stronger.
          </p>
        </div>

        {/* Membership Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-16">
          {plans.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-md bg-[#171717] border border-[#303030] p-8">
              <p className="text-[#A1A1A1] text-base mb-2">No membership plans available at this moment.</p>
              <p className="text-xs text-neutral-400">Please contact us directly on WhatsApp for customized plans.</p>
            </div>
          ) : (
            plans.map((plan, index) => {
              const isFeatured = plan.featured;
              const isCouple = plan.isCouple || plan.category === 'Couple';

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className={`relative rounded-md bg-[#171717] border p-6 flex flex-col justify-between transition-colors duration-200 ${
                    isFeatured
                      ? 'border-[#ED101B] shadow-xl'
                      : isCouple
                      ? 'border-neutral-500'
                      : 'border-[#303030] hover:border-neutral-500'
                  }`}
                >
                  {/* Visual Identifier Badges */}
                  {isFeatured && (
                    <div className="absolute -top-3 left-6 bg-[#ED101B] text-white text-[10px] font-oswald font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow">
                      {plan.tag || 'BEST VALUE • 1 YEAR'}
                    </div>
                  )}
                  {isCouple && !isFeatured && (
                    <div className="absolute -top-3 left-6 bg-white text-black text-[10px] font-oswald font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow">
                      {plan.tag || '2 PEOPLE • 3 MONTHS'}
                    </div>
                  )}
                  {!isFeatured && !isCouple && plan.tag && (
                    <div className="absolute -top-3 left-6 bg-neutral-800 text-[#ED101B] border border-[#ED101B]/40 text-[10px] font-oswald font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow">
                      {plan.tag}
                    </div>
                  )}

                  <div>
                    <span className="font-oswald text-xs font-bold text-[#A1A1A1] uppercase tracking-wider block mb-1">
                      PLAN {plan.planNumber || String(index + 1).padStart(2, '0')}
                    </span>

                    <h3 className="font-display text-2xl font-black uppercase text-white tracking-wide mb-1">
                      {plan.name}
                    </h3>

                    <p className="font-oswald text-xs text-[#A1A1A1] font-semibold uppercase tracking-wider mb-6">
                      Duration: <span className="text-white">{plan.duration}</span>
                    </p>

                    {/* Large Red Price Numbers */}
                    <div className="mb-6 pb-5 border-b border-[#303030]">
                      <div className="font-display text-5xl font-black text-[#ED101B] tracking-tight leading-none">
                        {plan.price}
                      </div>
                      {isCouple && (
                        <span className="text-[11px] text-white font-medium block mt-1.5 leading-snug">
                          Total {plan.price} for two people
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-8">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#A1A1A1]">
                          <Check className="w-3.5 h-3.5 text-[#ED101B] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Red CTA Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectPlan(plan)}
                      className="w-full py-3 rounded text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{plan.ctaText || 'ENQUIRE NOW'}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Two Separate Red-Accented Promotional Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ADDITIONAL_OFFERS.map((offer, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="rounded-md p-6 sm:p-8 bg-[#171717] border-l-4 border-l-[#ED101B] border-y border-r border-[#303030] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B]">
                  {offer.tag}
                </span>
                <h4 className="font-display text-2xl font-black uppercase text-white tracking-wide">
                  {offer.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed max-w-md">
                  {offer.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onEnquireOffer(offer.title)}
                className="whitespace-nowrap px-6 py-3 rounded text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-colors cursor-pointer"
              >
                {offer.cta}
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
