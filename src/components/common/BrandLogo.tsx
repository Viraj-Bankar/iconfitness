import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Original ICON FITNESS Brand Logo Component.
 * Preserves the original muscular bodybuilder mascot, double-biceps pose,
 * ribbon emblem, and ICON FITNESS wordmark.
 * Uses the transparent-background asset.
 */
export const MASCOT_IMAGE_URL = '/assets/gallery/mascot-logo-transparent.png';

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7 sm:w-8 sm:h-8', text: 'text-lg sm:text-xl', sub: 'text-[9px]' },
    md: { img: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-xl sm:text-2xl', sub: 'text-[10px]' },
    lg: { img: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-3xl sm:text-4xl', sub: 'text-xs' },
    xl: { img: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-4xl sm:text-5xl', sub: 'text-sm' },
  };

  const { img, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Original Muscular Mascot */}
      <div className="relative flex-shrink-0">
        <img
          src={MASCOT_IMAGE_URL}
          alt="ICON FITNESS Mascot Logo"
          className={`${img} object-contain filter drop-shadow-[0_2px_8px_rgba(237,16,27,0.4)] transform group-hover:scale-105 transition-transform`}
        />
      </div>

      {/* Official Wordmark */}
      <div className="flex flex-col leading-none min-w-0">
        <div className={`font-display ${text} font-black uppercase tracking-wider text-white flex items-center gap-1 sm:gap-1.5`}>
          <span className="text-[#ED101B] italic">ICON</span>
          <span className="text-white">FITNESS</span>
        </div>
        {showSubtitle && (
          <span className={`font-oswald ${sub} uppercase tracking-widest text-[#A1A1A1] font-semibold mt-0.5 truncate`}>
            Moshi • Pimpri-Chinchwad
          </span>
        )}
      </div>
    </div>
  );
};
