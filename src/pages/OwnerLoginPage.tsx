import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { loginOwner, getActiveOwnerSession } from '../services/authService';

export const OwnerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect straight to gallery dashboard
  useEffect(() => {
    let isMounted = true;
    getActiveOwnerSession().then((session) => {
      if (isMounted && session) {
        navigate('/admin/gallery', { replace: true });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your owner email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginOwner(email, password);
      if (res.success) {
        navigate('/admin/gallery', { replace: true });
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Access denied.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during sign in.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pt-2 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-oswald uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#ED101B]" />
          <span>Back to Website</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-oswald text-neutral-400 bg-[#171717] px-2.5 py-1 rounded border border-[#303030]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ED101B]" />
          <span>Private Portal</span>
        </span>
      </div>

      {/* Login Card */}
      <div className="max-w-md mx-auto w-full">
        <div className="p-7 sm:p-9 rounded-md bg-[#171717] border border-[#303030] shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <BrandLogo size="md" />
            </div>

            <div className="pt-2">
              <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-[#ED101B] block mb-1">
                PRIVATE MANAGEMENT
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                OWNER SIGN IN
              </h1>
              <p className="text-xs text-[#A1A1A1] mt-1 leading-relaxed">
                Sign in with your gym owner credentials to manage gallery photos and videos.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="ownerEmailInput"
                className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
              >
                Owner Email
              </label>
              <input
                id="ownerEmailInput"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. owner@iconfitness.com"
                className="w-full px-3.5 py-2.5 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                autoFocus
                required
              />
            </div>

            <div>
              <label
                htmlFor="ownerPasswordInput"
                className="block text-xs font-oswald font-bold uppercase tracking-wider text-[#A1A1A1] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="ownerPasswordInput"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded bg-[#080808] border border-[#303030] text-white text-sm focus:outline-none focus:border-[#ED101B]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-white"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded text-xs font-oswald font-black uppercase tracking-wider text-white bg-[#ED101B] hover:bg-[#B9000B] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>SIGN IN TO GALLERY</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="p-3 bg-[#080808] rounded border border-[#262626] text-[11px] text-neutral-500 text-center space-y-1">
            <p>Authorized access only. No public user registration.</p>
            <p className="text-neutral-400">
              Protected with Supabase Authentication. Contact system administrator for owner credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-neutral-600 font-oswald uppercase pb-2">
        <p>© 2026 ICON FITNESS. PRIVATE OWNER MANAGEMENT SYSTEM.</p>
      </div>
    </div>
  );
};

