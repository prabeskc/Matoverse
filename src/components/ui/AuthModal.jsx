import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── Social icons ──────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#EA4335" d="M12 5.04c1.7 0 3.2.58 4.4 1.71l3.28-3.28C17.7 1.63 15 1 12 1 7.37 1 3.4 3.73 1.58 7.72l3.92 3.04C6.42 7.74 9 5.04 12 5.04z"/>
    <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.22-2.36H12v4.47h6.45c-.28 1.48-1.12 2.74-2.38 3.59l3.7 2.87c2.16-1.99 3.42-4.92 3.42-8.57z"/>
    <path fill="#FBBC05" d="M5.5 14.76a7.15 7.15 0 0 1 0-4.32L1.58 7.4a11.96 11.96 0 0 0 0 10.39l3.92-3.03z"/>
    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3 0-5.58-2.7-6.5-5.72l-3.92 3.03C3.4 20.27 7.37 23 12 23z"/>
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

/* ─── Shared Input ───────────────────────────────────────────── */
function AuthInput({ type = 'text', placeholder, value, onChange, disabled, rightEl }) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
        className="w-full bg-[#eee] border-none rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all duration-200 disabled:opacity-60"
      />
      {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
    </div>
  );
}

/* ─── Social Row ─────────────────────────────────────────────── */
function SocialRow({ onSocial }) {
  return (
    <div className="flex gap-3 my-4">
      {[
        { icon: <GoogleIcon />,  label: 'Google'  },
        { icon: <GithubIcon />,  label: 'GitHub'  },
        { icon: <LinkedInIcon />, label: 'LinkedIn'},
      ].map(({ icon, label }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSocial(label)}
          title={`Continue with ${label}`}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-300 hover:border-brand-400 hover:bg-brand-50 text-slate-600 hover:text-brand-600 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────── */
export default function AuthModal() {
  const {
    authModalOpen,
    authModalTab,
    isLoading,
    error,
    closeAuthModal,
    setAuthModalTab,
    login,
    signup,
    setError,
  } = useAuth();

  /* Form state */
  const [signInEmail,    setSignInEmail]    = useState('');
  const [signInPass,     setSignInPass]     = useState('');
  const [signInShowPass, setSignInShowPass] = useState(false);

  const [signUpName,     setSignUpName]     = useState('');
  const [signUpEmail,    setSignUpEmail]    = useState('');
  const [signUpPass,     setSignUpPass]     = useState('');
  const [signUpShowPass, setSignUpShowPass] = useState(false);

  const isSignUp = authModalTab === 'signup';

  const resetForms = () => {
    setSignInEmail(''); setSignInPass(''); setSignInShowPass(false);
    setSignUpName(''); setSignUpEmail(''); setSignUpPass(''); setSignUpShowPass(false);
    setError(null);
  };

  const switchPanel = (tab) => {
    resetForms();
    setAuthModalTab(tab);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    await login(signInEmail, signInPass);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    await signup(signUpName, signUpEmail, signUpPass);
  };

  const handleSocial = async (provider) => {
    setError(null);
    await new Promise(r => setTimeout(r, 700));
    const mockEmail = `${provider.toLowerCase().replace(/\s/g, '')}user@example.com`;
    await login(mockEmail, 'social123456');
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* ── Card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
            className="auth-slider-container relative"
            style={{ width: '100%', maxWidth: 820 }}
          >
            {/* Close */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 z-[200] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── Error banner (shared, floats on top) ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-xl bg-red-600/90 backdrop-blur text-white text-xs font-semibold shadow-lg max-w-xs text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════ */}
            {/*   SIGN-IN PANEL (always rendered, slides)     */}
            {/* ══════════════════════════════════════════════ */}
            <div className={`auth-form-panel auth-sign-in-panel${isSignUp ? ' auth-panel--shifted' : ''}`}>
              <form onSubmit={handleSignIn} className="auth-form-inner">
                <h1 className="text-2xl font-bold font-display text-slate-800 mb-1">Sign In</h1>
                <SocialRow onSocial={handleSocial} />
                <span className="text-xs text-slate-500 mb-3">or use your account</span>

                <AuthInput
                  type="email"
                  placeholder="Email"
                  value={signInEmail}
                  onChange={e => setSignInEmail(e.target.value)}
                  disabled={isLoading}
                />
                <div className="mt-2 w-full">
                  <AuthInput
                    type={signInShowPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={signInPass}
                    onChange={e => setSignInPass(e.target.value)}
                    disabled={isLoading}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setSignInShowPass(v => !v)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {signInShowPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setError('Password reset: Contact your administrator.')}
                  className="text-xs text-slate-500 hover:text-brand-600 transition-colors mt-2 mb-4"
                >
                  Forgot your password?
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-cta-btn"
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin"/>
                    : 'SIGN IN'
                  }
                </button>
              </form>
            </div>

            {/* ══════════════════════════════════════════════ */}
            {/*   SIGN-UP PANEL (always rendered, slides)     */}
            {/* ══════════════════════════════════════════════ */}
            <div className={`auth-form-panel auth-sign-up-panel${isSignUp ? ' auth-panel--active' : ''}`}>
              <form onSubmit={handleSignUp} className="auth-form-inner">
                <h1 className="text-2xl font-bold font-display text-slate-800 mb-1">Create Account</h1>
                <SocialRow onSocial={handleSocial} />
                <span className="text-xs text-slate-500 mb-3">or use your email for registration</span>

                <AuthInput
                  type="text"
                  placeholder="Name"
                  value={signUpName}
                  onChange={e => setSignUpName(e.target.value)}
                  disabled={isLoading}
                />
                <div className="mt-2 w-full">
                  <AuthInput
                    type="email"
                    placeholder="Email"
                    value={signUpEmail}
                    onChange={e => setSignUpEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="mt-2 w-full mb-4">
                  <AuthInput
                    type={signUpShowPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={signUpPass}
                    onChange={e => setSignUpPass(e.target.value)}
                    disabled={isLoading}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setSignUpShowPass(v => !v)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {signUpShowPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-cta-btn"
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin"/>
                    : 'SIGN UP'
                  }
                </button>
              </form>
            </div>

            {/* ══════════════════════════════════════════════ */}
            {/*   OVERLAY (the colored sliding half)          */}
            {/* ══════════════════════════════════════════════ */}
            <div className={`auth-overlay-container${isSignUp ? ' auth-overlay--shifted' : ''}`}>
              <div className={`auth-overlay${isSignUp ? ' auth-overlay--moved' : ''}`}>

                {/* Left panel – "Welcome Back" (visible when sign-up is active) */}
                <div className={`auth-overlay-panel auth-overlay-left${isSignUp ? ' auth-overlay-panel--visible' : ''}`}>
                  {/* Logo watermark */}
                  <div className="mb-4 opacity-60">
                    <div className="w-12 h-12 rounded-2xl border-2 border-white/40 flex items-center justify-center mx-auto">
                      <span className="text-white font-bold text-lg font-display">M</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold font-display text-white mb-3">Welcome Back!</h1>
                  <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-[200px]">
                    To keep connected with us please sign in with your personal info
                  </p>
                  <button
                    onClick={() => switchPanel('login')}
                    className="auth-ghost-btn"
                  >
                    SIGN IN
                  </button>
                </div>

                {/* Right panel – "Hello, Friend!" (visible when sign-in is active) */}
                <div className={`auth-overlay-panel auth-overlay-right${!isSignUp ? ' auth-overlay-panel--visible' : ''}`}>
                  <div className="mb-4 opacity-60">
                    <div className="w-12 h-12 rounded-2xl border-2 border-white/40 flex items-center justify-center mx-auto">
                      <span className="text-white font-bold text-lg font-display">M</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold font-display text-white mb-3">Hello, Friend!</h1>
                  <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-[200px]">
                    Enter your details and start your journey with MatoVerse
                  </p>
                  <button
                    onClick={() => switchPanel('signup')}
                    className="auth-ghost-btn"
                  >
                    SIGN UP
                  </button>
                </div>

              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
