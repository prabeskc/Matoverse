import { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ArrowRight, ShoppingBag, Zap, User, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Home',     to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'About',    to: '/about' },
  { label: 'Contact',  to: '/contact' },
];

export default function Header() {
  const [isScrolled,  setIsScrolled]  = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { cartCount, setIsCartOpen }  = useCart();
  const { user, openAuthModal, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-surface/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_32px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="relative">
              <img
                src="/logo.png"
                alt="Matoverse Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(13,148,136,0.5)] group-hover:drop-shadow-[0_0_18px_rgba(13,148,136,0.8)] transition-all duration-300"
              />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-white tracking-tight font-display">
                Mato<span className="gradient-text-brand">verse</span>
              </span>
            </div>
            <span className="hidden lg:flex items-center text-[10px] text-slate-500 font-medium tracking-widest uppercase ml-1 border-l border-white/10 pl-3">
              <Zap className="w-2.5 h-2.5 mr-1 text-brand-500" />
              3D Printing
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-brand-400 bg-brand-500/8'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative p-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-brand-400 hover:bg-brand-500/10 hover:shadow-[0_0_18px_rgba(20,184,166,0.25)] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <AnimatePresence mode="wait">
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-brand-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-white/8 bg-white/4 hover:bg-white/8 hover:border-brand-500/30 text-slate-300 hover:text-white transition-all duration-200 select-none cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover bg-slate-800"
                  />
                  <span className="text-xs font-semibold max-w-[90px] truncate">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-brand-lg"
                    >
                      {/* User Meta */}
                      <div className="px-3 py-2.5 mb-1.5 text-left">
                        <p className="text-[10px] font-bold tracking-widest text-brand-400 uppercase">Signed In As</p>
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="h-[1px] bg-white/5 mb-1.5" />
                      
                      {/* Actions */}
                      <button
                        onClick={() => { setDropdownOpen(false); alert('My Orders simulation: showing list of mock orders.'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-150 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </button>
                      <button
                        onClick={() => { setDropdownOpen(false); alert('Settings simulation: edit account options.'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-150 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Profile Settings</span>
                      </button>
                      
                      <div className="h-[1px] bg-white/5 my-1.5" />
                      
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="btn-primary py-2.5 px-5 text-xs font-semibold tracking-wide"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>

          {/* ── Mobile Controls ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative p-2 rounded-xl bg-white/5 text-slate-300 hover:text-brand-400 hover:bg-brand-500/10 transition-all duration-300 focus:outline-none"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl border border-white/8 bg-white/4 text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-b border-white/5 bg-surface/95 backdrop-blur-2xl"
          >
            <div className="px-4 pt-3 pb-6 space-y-1.5">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.05 }}
                >
                  <NavLink
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              {user ? (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 + 0.05 }}
                  className="pt-4 mt-4 border-t border-white/5 space-y-3"
                >
                  {/* User Details card */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/4 border border-white/5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-800"
                    />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => { setMobileOpen(false); alert('My Orders simulation.'); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/8 bg-white/4 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>Orders</span>
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); alert('Settings simulation.'); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/8 bg-white/4 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings</span>
                    </button>
                  </div>

                  <button
                    onClick={() => { setMobileOpen(false); logout(); }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl w-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 + 0.05 }}
                  className="pt-4 border-t border-white/5"
                >
                  <button
                    onClick={() => { setMobileOpen(false); openAuthModal('login'); }}
                    className="btn-primary w-full justify-center py-3 text-xs font-semibold tracking-wide"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Login / Sign Up</span>
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
