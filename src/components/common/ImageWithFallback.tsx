import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  category?: string;
}

/**
 * Resilient image component that automatically tries alternate local paths
 * and gracefully falls back to a sleek dark-themed placeholder card if all sources fail.
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  category,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasTriedSecondary, setHasTriedSecondary] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const handleError = () => {
    // 1. Try explicit fallbackSrc if provided
    if (fallbackSrc && currentSrc !== fallbackSrc && !hasTriedSecondary) {
      setHasTriedSecondary(true);
      setCurrentSrc(fallbackSrc);
      return;
    }

    // 2. Try swapping /assets/gallery/ with /images/gym/ or vice versa
    if (!hasTriedSecondary) {
      setHasTriedSecondary(true);
      if (currentSrc.includes('/assets/gallery/')) {
        setCurrentSrc(currentSrc.replace('/assets/gallery/', '/images/gym/'));
        return;
      }
      if (currentSrc.includes('/images/gym/')) {
        setCurrentSrc(currentSrc.replace('/images/gym/', '/assets/gallery/'));
        return;
      }
    }

    // 3. Mark as failed to display graceful branded placeholder
    setIsFailed(true);
  };

  if (isFailed) {
    return (
      <div
        className={`w-full h-full min-h-[160px] bg-[#121212] border border-[#303030] flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
        title={alt}
      >
        <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#3a3a3a] flex items-center justify-center text-[#ED101B] mb-2.5 shadow">
          <Dumbbell className="w-5 h-5" />
        </div>
        <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B] block mb-1">
          {category || 'ICON FITNESS'}
        </span>
        <p className="font-display text-sm font-bold uppercase text-white/90 line-clamp-2 max-w-[200px]">
          {alt}
        </p>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...rest}
    />
  );
};
