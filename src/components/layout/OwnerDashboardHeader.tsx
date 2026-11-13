import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Image,
  CreditCard,
  ExternalLink,
  LogOut,
  Shield,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface OwnerDashboardHeaderProps {
  activeModule: 'gallery' | 'plans';
  onLogout: () => void | Promise<void>;
  unpublishedCount?: number;
}

export const OwnerDashboardHeader: React.FC<OwnerDashboardHeaderProps> = ({
  activeModule,
  onLogout,
  unpublishedCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = async () => {
    setMobileMenuOpen(false);
    await onLogout();
  };

  return (
    <header className="bg-[#171717] border-b border-[#303030] sticky top-0 z-40 shadow-md w-full">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to={activeModule === 'gallery' ? '/admin/gallery' : '/admin/plans'}
            className="flex-shrink-0"
            title="Owner Portal Dashboard"
          >
            <BrandLogo size="sm" showSubtitle={false} />
          </Link>

          <div className="h-4 w-px bg-[#303030] hidden md:block" />
          <span className="font-oswald text-[11px] font-bold uppercase tracking-widest text-neutral-400 hidden md:inline-flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-[#ED101B]" />
            <span>Owner Portal</span>
          </span>
        </div>

        {/* Center: Desktop Navigation Tabs (>= 768px) */}
        <nav
          className="hidden md:flex items-center gap-1.5 bg-[#080808] p-1 rounded border border-[#303030]"
          aria-label="Owner dashboard navigation"
        >
          <Link
            to="/admin/gallery"
            className={`px-3 py-1.5 rounded text-xs font-oswald uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              activeModule === 'gallery'
                ? 'bg-[#ED101B] text-white font-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Gallery</span>
            {unpublishedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white text-[#ED101B] text-[10px] font-black">
                {unpublishedCount}
              </span>
            )}
          </Link>

          <Link
            to="/admin/plans"
            className={`px-3 py-1.5 rounded text-xs font-oswald uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              activeModule === 'plans'
                ? 'bg-[#ED101B] text-white font-black shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Membership Plans</span>
          </Link>
        </nav>

        {/* Right: Desktop Actions (>= 768px) */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            to={activeModule === 'gallery' ? '/#gallery' : '/#membership'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded bg-[#222222] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-[#303030] text-xs font-oswald flex items-center gap-1.5 transition-colors"
            title="View Live Website in new tab"
          >
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#ED101B]" />
          </Link>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="px-3.5 py-1.5 rounded bg-[#ED101B]/15 hover:bg-[#ED101B] text-[#ED101B] hover:text-white border border-[#ED101B]/40 text-xs font-oswald font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign out of owner dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOG OUT</span>
          </button>
        </div>

        {/* Mobile: Hamburger Menu Button (< 768px) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Active section quick badge for mobile */}
          <span className="px-2 py-0.5 rounded text-[10px] font-oswald font-bold uppercase tracking-wider bg-[#080808] border border-[#303030] text-neutral-300">
            {activeModule === 'gallery' ? 'Gallery' : 'Plans'}
          </span>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="p-2 rounded bg-[#080808] border border-[#303030] text-neutral-300 hover:text-white hover:border-[#ED101B] transition-colors focus:outline-none focus:ring-1 focus:ring-[#ED101B] min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#ED101B]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu & Backdrop (< 768px) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[57px] bg-black/75 backdrop-blur-sm z-30 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Drawer */}
          <div
            className="relative z-40 bg-[#171717] border-b border-[#303030] px-4 py-5 shadow-2xl md:hidden space-y-4 animate-in slide-in-from-top-2 duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-oswald uppercase font-bold text-neutral-400 tracking-wider block px-1">
                Owner Navigation
              </span>

              {/* 1. Gallery Link */}
              <Link
                to="/admin/gallery"
                onClick={handleLinkClick}
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                  activeModule === 'gallery'
                    ? 'bg-[#ED101B] text-white font-bold shadow-md'
                    : 'bg-[#080808] text-neutral-300 hover:bg-[#222222] border border-[#303030]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      activeModule === 'gallery' ? 'bg-black/30 text-white' : 'bg-[#171717] text-[#ED101B]'
                    }`}
                  >
                    <Image className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-oswald text-sm uppercase tracking-wide block">
                      Gallery Management
                    </span>
                    <span
                      className={`text-[11px] block ${
                        activeModule === 'gallery' ? 'text-white/80' : 'text-neutral-500'
                      }`}
                    >
                      Photos, videos, categories &amp; publishing
                    </span>
                  </div>
                </div>

                {unpublishedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#ED101B] text-xs font-oswald font-black">
                    {unpublishedCount} NEW
                  </span>
                )}
              </Link>

              {/* 2. Membership Plans Link */}
              <Link
                to="/admin/plans"
                onClick={handleLinkClick}
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                  activeModule === 'plans'
                    ? 'bg-[#ED101B] text-white font-bold shadow-md'
                    : 'bg-[#080808] text-neutral-300 hover:bg-[#222222] border border-[#303030]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      activeModule === 'plans' ? 'bg-black/30 text-white' : 'bg-[#171717] text-[#ED101B]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-oswald text-sm uppercase tracking-wide block">
                      Membership Plans
                    </span>
                    <span
                      className={`text-[11px] block ${
                        activeModule === 'plans' ? 'text-white/80' : 'text-neutral-500'
                      }`}
                    >
                      Pricing, durations &amp; WhatsApp rates
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Separator */}
            <div className="h-px bg-[#303030] my-2" />

            {/* View Live Website Button */}
            <Link
              to={activeModule === 'gallery' ? '/#gallery' : '/#membership'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-[#222222] hover:bg-[#2a2a2a] text-neutral-200 border border-[#303030] text-xs font-oswald font-bold uppercase tracking-wider transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#ED101B]" />
            </Link>

            {/* Log Out Button */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-[#ED101B]/15 hover:bg-[#ED101B] text-[#ED101B] hover:text-white border border-[#ED101B]/40 text-xs font-oswald font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>LOG OUT OF PORTAL</span>
            </button>
          </div>
        </>
      )}
    </header>
  );
};

