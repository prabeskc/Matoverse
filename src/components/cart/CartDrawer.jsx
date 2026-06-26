import { useEffect, useState } from 'react';
import {
  X, ShoppingBag, Plus, Minus, Trash2, Loader2,
  CheckCircle, Package, Phone, MapPin, FileText, ChevronLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('mato_token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

/* Input style helper */
const inputCls = (err) =>
  `w-full rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-150 ${
    err
      ? 'border border-rose-500/60 bg-rose-950/10 focus:ring-rose-500/30'
      : 'border border-white/10 bg-slate-900/60 hover:border-white/20 focus:border-teal-500/60 focus:ring-teal-500/20'
  }`;

/* ─── Reusable section heading ─── */
const SectionHead = ({ icon: Icon, color, title, sub }) => (
  <div className="flex items-center gap-2.5 flex-shrink-0">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `rgba(${color},0.18)`, border: `1px solid rgba(${color},0.28)` }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: `rgb(${color})` }} />
    </div>
    <div>
      <p className="text-sm font-bold text-white leading-tight">{title}</p>
      {sub && <p className="text-[11px] text-slate-500 leading-tight">{sub}</p>}
    </div>
  </div>
);

/* ─── Field wrapper ─── */
const Field = ({ label, icon: Icon, iconColor, required, error, children }) => (
  <div className="space-y-1 flex-shrink-0">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3" style={{ color: iconColor }} />}
      {label}
      {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-rose-400 flex items-center gap-1">
        <span className="w-3 h-3 rounded-full bg-rose-500/20 inline-flex items-center justify-center text-[8px] font-black flex-shrink-0">!</span>
        {error}
      </p>
    )}
  </div>
);

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState('cart');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  // Pre-fill form from saved user profile (name, phone, address)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mato_user');
      if (saved) {
        const u = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          name: u.name || prev.name,
          phone: u.phone || prev.phone,
          address: u.address || prev.address,
        }));
      }
    } catch {}
  }, [isCartOpen]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => { setStep('cart'); setSubmitError(''); setFormErrors({}); setOrderResult(null); }, 300);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    if (submitError) setSubmitError('');
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errs.name = 'Full name required (min 2 chars).';
    if (!formData.phone.trim())
      errs.phone = 'Phone number is required.';
    else if (!/^[0-9+\s\-()]{7,15}$/.test(formData.phone.trim()))
      errs.phone = 'Enter a valid phone number.';
    if (!formData.address.trim() || formData.address.trim().length < 5)
      errs.address = 'Delivery address required (min 5 chars).';
    return errs;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setIsSubmitting(true);
    setSubmitError('');

    const items = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name || item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const savedUser = (() => { try { return JSON.parse(localStorage.getItem('mato_user') || 'null'); } catch { return null; } })();
    const payload = {
      customerName: formData.name.trim(),
      customerEmail: savedUser?.email || null,
      customerPhone: formData.phone.trim(),
      deliveryAddress: formData.address.trim(),
      notes: formData.notes.trim() || null,
      items,
      totalPrice: cartTotal,
    };

    try {
      const res = await authFetch(`${API_BASE}/orders`, { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order.');
      setOrderResult(data.data);
      setStep('success');
      await clearCart();
    } catch (err) {
      console.error('Order error:', err);
      setSubmitError(err.message || 'Cannot reach server. Check backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishOrder = () => { setIsCartOpen(false); setFormData({ name: '', phone: '', address: '', notes: '' }); };
  const totalQty = cartItems.reduce((a, i) => a + i.quantity, 0);

  /* ═══════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />

      {/* Panel — full height, NO internal scroll */}
      <div
        className={`relative flex flex-col z-10 h-full w-full ${step === 'checkout' ? 'md:max-w-full' : 'md:max-w-[48%]'} transition-all duration-500`}
        style={{ background: 'linear-gradient(160deg,#080f1c 0%,#0c1525 60%,#080f1c 100%)' }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/80 to-transparent z-10 pointer-events-none" />

        {/* ── HEADER ── fixed height */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.25)' }}>
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button onClick={() => setStep('cart')} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(13,148,136,0.25),rgba(8,145,178,0.15))', border: '1px solid rgba(13,148,136,0.3)' }}>
              <ShoppingBag className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {step === 'cart' && 'Your Cart'}
                {step === 'checkout' && 'Secure Checkout'}
                {step === 'success' && 'Order Confirmed!'}
              </h2>
              {step === 'cart' && cartItems.length > 0 && (
                <p className="text-[10px] text-slate-500">{totalQty} item{totalQty !== 1 ? 's' : ''} · Rs. {cartTotal.toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Step pills */}
            {step !== 'success' && (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${step === 'cart' ? 'bg-teal-500/15 border-teal-500/35 text-teal-300' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${step === 'cart' ? 'bg-teal-500 text-white' : 'bg-emerald-500 text-white'}`}>{step === 'cart' ? '1' : '✓'}</span>
                  Cart
                </span>
                <span className="text-white/15">›</span>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${step === 'checkout' ? 'bg-teal-500/15 border-teal-500/35 text-teal-300' : 'bg-white/4 border-white/8 text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${step === 'checkout' ? 'bg-teal-500 text-white' : 'bg-white/10 text-slate-400'}`}>2</span>
                  Checkout
                </span>
              </div>
            )}
            <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ══════════════ STEP 1: CART — no scroll ══════════════ */}
        {step === 'cart' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {cartItems.length === 0 ? (
              /* Empty state — centered */
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)' }}>
                  <ShoppingBag className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your cart is empty</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">Browse premium 3D prints and find something amazing.</p>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); navigate('/products'); }}
                  className="py-2.5 px-7 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 4px 20px rgba(13,148,136,0.3)' }}
                >
                  Explore Products →
                </button>
              </div>
            ) : (
              <>
                {/* Items list — no overflow-y, uses flex-1 and distributes evenly */}
                <div className="flex-1 flex flex-col gap-2.5 px-4 py-3 min-h-0">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 rounded-xl flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f172a' }}>
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-bold text-white line-clamp-1">{item.product.name}</p>
                          <p className="text-base font-black text-teal-400 mt-0.5">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                          <p className="text-[11px] text-slate-500">Rs. {item.product.price.toLocaleString()} each</p>
                        </div>
                      </div>
                      {/* Controls */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0">
                        <button onClick={() => removeFromCart(item.product.id)} className="text-slate-600 hover:text-rose-400 p-1 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)' }}>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1.5 text-slate-400 hover:text-white transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold text-white px-2 min-w-[24px] text-center" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                            {item.quantity}
                          </span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1.5 text-slate-400 hover:text-white transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Footer — fixed at bottom */}
                <div className="flex-shrink-0 px-4 py-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
                  {/* Price breakdown */}
                  <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal ({totalQty} item{totalQty !== 1 ? 's' : ''})</span>
                      <span className="font-semibold text-white">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Shipping</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Free · Nepal
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-sm font-bold text-white">Total</span>
                      <span className="text-xl font-black text-teal-400">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 4px 20px rgba(13,148,136,0.35)' }}
                  >
                    Proceed to Checkout →
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">🔒 No payment required upfront</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════ STEP 2: CHECKOUT — no scroll, two-column ══════════════ */}
        {step === 'checkout' && (
          <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">

            {/* Two-column body — flex-1, NO overflow */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0 overflow-hidden">

              {/* LEFT: Order Summary */}
              <div className="flex flex-col gap-3 px-5 py-4 overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <SectionHead icon={Package} color="13,148,136" title="Order Summary" sub={`${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} ready`} />

                {/* Items — flex-1 distributes height */}
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f172a' }}>
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white line-clamp-1">{item.product.name}</p>
                        <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                      </div>
                      <p className="text-sm font-black text-teal-400 flex-shrink-0">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(13,148,136,0.2)', background: 'linear-gradient(135deg,rgba(13,148,136,0.07),rgba(10,16,30,0.8))' }}>
                  <div className="px-4 py-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="font-semibold text-white">Rs. {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Shipping</span>
                      <span className="text-emerald-400 font-semibold">Free</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5" style={{ borderTop: '1px solid rgba(13,148,136,0.2)', background: 'rgba(13,148,136,0.08)' }}>
                    <span className="text-sm font-bold text-white">Total</span>
                    <span className="text-xl font-black text-teal-400">Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Trust badge */}
                <div className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <span className="text-sm flex-shrink-0">🔒</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <span className="text-emerald-400 font-semibold">No payment now.</span> We'll call to confirm specs & delivery first.
                  </p>
                </div>
              </div>

              {/* RIGHT: Delivery Form */}
              <div className="flex flex-col gap-3 px-5 py-4 overflow-hidden border-t md:border-t-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <SectionHead icon={MapPin} color="6,182,212" title="Delivery Details" sub="Where should we send your order?" />

                {/* Form fields — evenly fill space */}
                <div className="flex-1 flex flex-col gap-3 min-h-0">
                  <Field label="Full Name" required error={formErrors.name}>
                    <input
                      type="text" name="name" required
                      value={formData.name} onChange={handleInputChange}
                      className={inputCls(formErrors.name)}
                      placeholder="e.g. Prabesh KC"
                    />
                  </Field>

                  <Field label="Phone Number" icon={Phone} iconColor="#0d9488" required error={formErrors.phone}>
                    <input
                      type="tel" name="phone" required
                      value={formData.phone} onChange={handleInputChange}
                      className={inputCls(formErrors.phone)}
                      placeholder="e.g. 9800000000"
                    />
                  </Field>

                  <Field label="Delivery Address" icon={MapPin} iconColor="#06b6d4" required error={formErrors.address}>
                    <input
                      type="text" name="address" required
                      value={formData.address} onChange={handleInputChange}
                      className={inputCls(formErrors.address)}
                      placeholder="e.g. Putalisadak, Kathmandu"
                    />
                  </Field>

                  <Field label="Special Notes" icon={FileText} iconColor="#64748b">
                    <textarea
                      name="notes"
                      value={formData.notes} onChange={handleInputChange}
                      rows={3}
                      className={`${inputCls(false)} resize-none flex-1`}
                      placeholder="Color, material, or custom instructions..."
                    />
                  </Field>

                  {submitError && (
                    <div className="flex-shrink-0 flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[9px] font-black flex-shrink-0 mt-0.5">!</span>
                      <p className="text-xs text-rose-400 leading-relaxed">{submitError}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer — fixed at bottom of checkout */}
            <div className="relative flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.4)' }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
              <div className="px-5 py-3.5 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Order Total</p>
                  <p className="text-xl font-black text-teal-400">Rs. {cartTotal.toLocaleString()}</p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  style={{
                    background: isSubmitting ? 'rgba(13,148,136,0.4)' : 'linear-gradient(135deg,#0d9488,#0891b2)',
                    boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(13,148,136,0.4)',
                  }}
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Placing...</span></>
                    : <><CheckCircle className="w-4 h-4" /><span>Confirm Order</span></>
                  }
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ══════════════ STEP 3: SUCCESS ══════════════ */}
        {step === 'success' && orderResult && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-6 overflow-hidden">
            {/* Glowing icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl animate-pulse" style={{ background: 'rgba(16,185,129,0.25)' }} />
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.15),transparent 70%)', border: '2px solid rgba(16,185,129,0.4)' }}>
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Order Placed! 🎉</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
                Thanks, <span className="font-bold text-white">{orderResult.customerName}</span>! We'll call{' '}
                <span className="font-semibold text-teal-400">{orderResult.customerPhone}</span> to confirm details.
              </p>
            </div>

            {/* Order card */}
            <div className="w-full max-w-xs rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg,rgba(13,148,136,0.08),rgba(10,16,30,0.9))' }}>
              <div className="px-5 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Details</p>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                {[
                  { label: 'Order ID', value: <span className="text-xs font-mono px-2 py-0.5 rounded-lg text-white" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}>#{orderResult.orderId?.slice(0, 8).toUpperCase()}</span> },
                  { label: 'Items', value: <span className="text-sm font-bold text-white">{orderResult.itemCount} product(s)</span> },
                  { label: 'Total', value: <span className="text-lg font-black text-teal-400">Rs. {Number(orderResult.totalPrice).toLocaleString()}</span> },
                  { label: 'Status', value: <span className="text-xs font-bold text-amber-400 px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>{orderResult.status}</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{label}</span>
                    {value}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={finishOrder}
              className="py-2.5 px-9 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 4px 20px rgba(13,148,136,0.3)' }}
            >
              Continue Shopping →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
