import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ArrowRight } from 'lucide-react';
import { GYM_CONTACT } from '../../data/gymData';
import { BrandLogo } from '../common/BrandLogo';

interface NavbarProps {
  onOpenEnquiry: (planOrFacility?: string) => void;
}

const NAV_LINKS = [
  { name: 'Home', href: '#hero' },
  { name: 'About', href: '#about' },
  { name: 'Facilities', href: '#facilities' },
  { name: 'Membership', href: '#membership' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Contact', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenEnquiry }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => link.href.substring(1));
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(targetId);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080808]/95 backdrop-blur-md border-b border-[#303030] py-3 shadow-xl'
            : 'bg-gradient-to-b from-[#080808]/90 via-[#080808]/40 to-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Original ICON FITNESS Logo */}
            <a
              href="#hero"
              onClick={(e) => handleNavClick(e, '#hero')}
              className="cursor-pointer"
            >
              <BrandLogo size="md" />
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative px-3.5 py-2 text-sm font-oswald font-bold uppercase tracking-wider transition-colors duration-200 ${
                      isActive ? 'text-[#ED101B]' : 'text-neutral-300 hover:text-[#ED101B]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#ED101B]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right Action: Call shortcut + Red CTA button */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href={`tel:${GYM_CONTACT.phonePrimaryRaw}`}
                className="hidden xl:flex items-center gap-2 text-xs font-oswald font-bold tracking-wider text-neutral-300 hover:text-white transition-colors py-2 px-3 rounded-md border border-[#303030] bg-[#171717]"
              >
                <Phone className="w-3.5 h-3.5 text-[#ED101B]" />
                <span>{GYM_CONTACT.phonePrimary}</span>
              </a>

              <button
                type="button"
                onClick={() => onOpenEnquiry('General Enquiry')}
                className="relative inline-flex items-center justify-center px-6 py-2.5 rounded-md text-sm font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-all duration-200 cursor-pointer shadow-md"
              >
                <span>ENQUIRE NOW</span>
                <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenEnquiry('General Enquiry')}
                className="px-3 py-1.5 text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] rounded shadow-md"
              >
                ENQUIRE
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 text-neutral-300 hover:text-white bg-[#171717] border border-[#303030] rounded focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-[#ED101B]" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Animated Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[60px] sm:top-[68px] z-40 bg-[#080808]/98 backdrop-blur-xl border-b border-[#303030] px-6 py-6 lg:hidden shadow-2xl"
          >
            <div className="flex flex-col space-y-2">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`flex items-center justify-between py-2.5 px-3 rounded text-base font-oswald font-bold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'text-[#ED101B] bg-[#171717] border-l-4 border-[#ED101B]'
                        : 'text-neutral-300 hover:text-white hover:bg-[#171717]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#ED101B]"></span>}
                  </a>
                );
              })}

              <div className="pt-4 border-t border-[#303030] flex flex-col gap-3">
                <a
                  href={`tel:${GYM_CONTACT.phonePrimaryRaw}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded bg-[#171717] border border-[#303030] text-xs font-oswald font-bold uppercase tracking-wider text-neutral-200"
                >
                  <Phone className="w-4 h-4 text-[#ED101B]" />
                  <span>Call: {GYM_CONTACT.phonePrimary}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenEnquiry('General Enquiry');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded bg-[#ED101B] text-white text-sm font-oswald font-black uppercase tracking-wider hover:bg-[#B9000B]"
                >
                  <span>ENQUIRE NOW</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
