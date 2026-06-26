import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Settings, User, Mail, Phone, MapPin, Clock,
  ChevronDown, ChevronUp, AlertTriangle, Loader2, CheckCircle,
  XCircle, RefreshCw, Save, Edit3, LogOut, Shield, Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

/* ── Status config ──────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.25)',  dot: 'bg-amber-400',   label: 'Pending' },
  Placed:    { color: '#a5b4fc', bg: 'rgba(99,102,241,0.10)',  border: 'rgba(99,102,241,0.25)',  dot: 'bg-indigo-400',  label: 'Placed' },
  Processing:{ color: '#60a5fa', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)',  dot: 'bg-blue-400',    label: 'Processing' },
  Confirmed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.25)',  dot: 'bg-blue-400',    label: 'Confirmed' },
  Printing:  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)', dot: 'bg-violet-400',  label: 'Printing' },
  Shipped:   { color: '#06b6d4', bg: 'rgba(6,182,212,0.10)',   border: 'rgba(6,182,212,0.25)',   dot: 'bg-cyan-400',    label: 'Shipped' },
  Delivered: { color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', dot: 'bg-emerald-400', label: 'Delivered' },
  Cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)',   dot: 'bg-rose-400',    label: 'Cancelled' },
};
const getStatus = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.Pending;

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-NP', {
    timeZone: 'Asia/Kathmandu',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

const getCancelInfo = (createdAt, status) => {
  if (status !== 'Pending') return { canCancel: false, minutesLeft: 0 };
  const ms = 30 * 60 * 1000 - (Date.now() - new Date(createdAt).getTime());
  if (ms <= 0) return { canCancel: false, minutesLeft: 0 };
  return { canCancel: true, minutesLeft: Math.ceil(ms / 60000) };
};

/* ── Status Badge ───────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = getStatus(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── Order Card ─────────────────────────────────────────────────── */
function OrderCard({ order, onCancelled }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [timeLeft, setTimeLeft] = useState(() => getCancelInfo(order.created_at, order.status));

  useEffect(() => {
    if (order.status !== 'Pending') return;
    const interval = setInterval(() => {
      setTimeLeft(getCancelInfo(order.created_at, order.status));
    }, 30000);
    return () => clearInterval(interval);
  }, [order.created_at, order.status]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await authFetch(`${API_BASE}/orders/${order.id}/cancel`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order.');
      onCancelled(order.id);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Card Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.25)' }}>
          <Package className="w-4.5 h-4.5 text-teal-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white">
              Order <span className="font-mono text-teal-400">#{order.id.slice(0, 8).toUpperCase()}</span>
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(order.created_at)}
          </p>
        </div>

        <div className="text-right flex-shrink-0 flex items-center gap-3">
          <div>
            <p className="text-base font-black text-teal-400">Rs. {Number(order.total_price).toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-500" />
            : <ChevronDown className="w-4 h-4 text-slate-500" />
          }
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

              {/* Delivery info */}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Delivery Address</p>
                    <p className="text-xs text-slate-300 mt-0.5">{order.delivery_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Contact</p>
                    <p className="text-xs text-slate-300 mt-0.5">{order.customer_phone}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="sm:col-span-2 flex items-start gap-2">
                    <span className="text-[10px] text-slate-500 mt-0.5">📝</span>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Notes</p>
                      <p className="text-xs text-slate-300 mt-0.5">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Items table */}
              {items.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="grid grid-cols-[1fr_auto_auto] text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                    <span>Product</span>
                    <span className="text-right pr-4">Qty</span>
                    <span className="text-right">Subtotal</span>
                  </div>
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_auto_auto] items-center px-3 py-2 text-xs"
                      style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      <span className="text-slate-300 font-medium truncate pr-2">{item.name}</span>
                      <span className="text-slate-400 text-right pr-4">×{item.quantity}</span>
                      <span className="text-teal-400 font-bold text-right">Rs. {Number(item.subtotal || item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[1fr_auto] px-3 py-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,148,136,0.06)' }}>
                    <span className="text-xs font-bold text-white">Total</span>
                    <span className="text-base font-black text-teal-400">Rs. {Number(order.total_price).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Cancel section */}
              {order.status === 'Pending' && (
                <div>
                  {timeLeft.canCancel ? (
                    <div className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-300">
                          <span className="font-bold">Cancel window:</span>{' '}
                          {timeLeft.minutesLeft} min{timeLeft.minutesLeft !== 1 ? 's' : ''} remaining
                        </p>
                      </div>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
                      >
                        {cancelling
                          ? <><Loader2 className="w-3 h-3 animate-spin" /><span>Cancelling...</span></>
                          : <><XCircle className="w-3 h-3" /><span>Cancel Order</span></>
                        }
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.15)' }}>
                      <AlertTriangle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <p className="text-xs text-slate-500">Cancellation window (30 min) has expired for this order.</p>
                    </div>
                  )}
                  {cancelError && (
                    <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-rose-500/20 inline-flex items-center justify-center text-[8px] font-black">!</span>
                      {cancelError}
                    </p>
                  )}
                </div>
              )}

              {order.status === 'Cancelled' && (
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <p className="text-xs text-rose-400">This order was cancelled.</p>
                </div>
              )}

              {order.status === 'Delivered' && (
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-emerald-400">Order successfully delivered. Thank you!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── My Orders Tab ──────────────────────────────────────────────── */
function MyOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`${API_BASE}/orders/mine?_=${Date.now()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load orders.');
      setOrders(data.data?.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancelled = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
    );
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">My Orders</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-40"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Cancel note */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <p className="text-[11px] text-slate-400">
          Orders can be cancelled within <span className="text-amber-400 font-semibold">30 minutes</span> of placement while status is <span className="text-amber-400 font-semibold">Pending</span>.
        </p>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <p className="text-sm text-slate-400">Fetching your orders…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-rose-400">Failed to load orders</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchOrders}
            className="py-2 px-6 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 4px 16px rgba(13,148,136,0.3)' }}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)' }}>
            <Package className="w-8 h-8 text-slate-500" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-white">No orders yet</p>
            <p className="text-sm text-slate-500 mt-1">Your order history will appear here once you place an order.</p>
          </div>
        </div>
      )}

      {!loading && !error && orders.map((order) => (
        <OrderCard key={order.id} order={order} onCancelled={handleCancelled} />
      ))}
    </div>
  );
}

/* ── Profile Settings Tab ───────────────────────────────────────── */
function ProfileSettingsTab() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [saveMessage, setSaveMessage] = useState('');

  // Sync if user changes externally
  useEffect(() => {
    setPhone(user?.phone || '');
    setAddress(user?.address || '');
  }, [user?.phone, user?.address]);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate phone
    if (phone && !/^[0-9+\s\-()]{7,15}$/.test(phone.trim())) {
      setSaveStatus('error');
      setSaveMessage('Enter a valid phone number (7–15 digits).');
      return;
    }
    if (address && address.trim().length < 5) {
      setSaveStatus('error');
      setSaveMessage('Address must be at least 5 characters.');
      return;
    }

    setSaving(true);
    setSaveStatus(null);
    const result = await updateProfile(phone.trim(), address.trim());
    setSaving(false);

    if (result.success) {
      setSaveStatus('success');
      setSaveMessage('Profile saved! Your details will auto-fill at checkout.');
      setTimeout(() => setSaveStatus(null), 4000);
    } else {
      setSaveStatus('error');
      setSaveMessage(result.message || 'Failed to save profile.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const inputBase =
    'w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 border bg-slate-900/60 hover:border-white/20 focus:border-teal-500/60 focus:ring-teal-500/20 border-white/10';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-white">Profile Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your account information and delivery details</p>
      </div>

      {/* Account Card */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        {/* Card header */}
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <Shield className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account Info</span>
        </div>

        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover"
              style={{ border: '2px solid rgba(13,148,136,0.4)', boxShadow: '0 0 24px rgba(13,148,136,0.2)' }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#080f1c] flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name (read-only) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-400 font-medium"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {user?.name}
                  <span className="ml-auto text-[9px] font-bold text-slate-600 uppercase tracking-wider">Read-only</span>
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-400 font-medium truncate"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="truncate">{user?.email}</span>
                  <span className="flex-shrink-0 ml-auto text-[9px] font-bold text-slate-600 uppercase tracking-wider">Read-only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Details Card (editable) */}
      <form onSubmit={handleSave}>
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
          {/* Card header */}
          <div className="px-5 py-3 flex items-center gap-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Delivery Details</span>
            <span className="ml-auto text-[10px] text-slate-600 font-medium">Auto-fills at checkout</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Auto-fill note */}
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
              style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.18)' }}>
              <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                Save your phone number and delivery address here — they'll be <span className="text-teal-400 font-semibold">automatically filled</span> every time you place a new order.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
                <Phone className="w-3 h-3 text-teal-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setSaveStatus(null); }}
                placeholder="e.g. 9800000000"
                className={inputBase}
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-1.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                Delivery Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setSaveStatus(null); }}
                placeholder="e.g. Putalisadak, Kathmandu"
                className={inputBase}
              />
            </div>

            {/* Status feedback */}
            <AnimatePresence>
              {saveStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-emerald-300">{saveMessage}</p>
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <p className="text-xs text-rose-300">{saveMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save button */}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: saving ? 'rgba(13,148,136,0.4)' : 'linear-gradient(135deg,#0d9488,#0891b2)',
                boxShadow: saving ? 'none' : '0 4px 20px rgba(13,148,136,0.35)',
              }}
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></>
                : <><Save className="w-4 h-4" /><span>Save Changes</span></>
              }
            </button>
          </div>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)' }}>
        <div className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(239,68,68,0.1)', background: 'rgba(239,68,68,0.04)' }}>
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-[11px] font-bold text-rose-500/70 uppercase tracking-widest">Session</span>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-300">Sign out of your account</p>
            <p className="text-xs text-slate-500 mt-0.5">You'll need to log in again to access your orders.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:text-rose-300 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Profile Page
══════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'orders',   label: 'My Orders',        icon: Package },
  { id: 'settings', label: 'Profile Settings', icon: Settings },
];

export default function Profile() {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const setTab = (tabId) => setSearchParams({ tab: tabId });

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      navigate('/');
    }
  }, [user, navigate, openAuthModal]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      style={{
        background: 'radial-gradient(at 15% 10%, rgba(13,148,136,0.08) 0px, transparent 55%), radial-gradient(at 85% 80%, rgba(8,145,178,0.06) 0px, transparent 55%), #000',
      }}>
      <div className="max-w-5xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover"
              style={{ border: '2px solid rgba(13,148,136,0.4)', boxShadow: '0 0 30px rgba(13,148,136,0.25)' }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              {user.name}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {user.phone && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-400 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)' }}>
                  <Phone className="w-2.5 h-2.5" /> {user.phone}
                </span>
              )}
              {user.address && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                  <MapPin className="w-2.5 h-2.5" /> {user.address}
                </span>
              )}
              {!user.phone && !user.address && (
                <span className="text-[10px] text-slate-600 italic">No delivery details saved yet</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl w-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg,rgba(13,148,136,0.25),rgba(8,145,178,0.15))',
                  border: '1px solid rgba(13,148,136,0.35)',
                  boxShadow: '0 2px 12px rgba(13,148,136,0.2)',
                } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'orders' && <MyOrdersTab />}
            {activeTab === 'settings' && <ProfileSettingsTab />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
