import { useEffect, useState, useCallback } from 'react';
import {
  X, Package, Clock, MapPin, Phone, ChevronDown, ChevronUp,
  AlertTriangle, Loader2, CheckCircle, XCircle, RefreshCw,
} from 'lucide-react';

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
  Pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', dot: 'bg-amber-400',  label: 'Pending' },
  Placed:    { color: '#a5b4fc', bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.25)', dot: 'bg-indigo-400', label: 'Placed' },
  Processing:{ color: '#60a5fa', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)', dot: 'bg-blue-400',   label: 'Processing' },
  Confirmed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)', dot: 'bg-blue-400',   label: 'Confirmed' },
  Printing:  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.25)', dot: 'bg-violet-400', label: 'Printing' },
  Shipped:   { color: '#06b6d4', bg: 'rgba(6,182,212,0.10)',  border: 'rgba(6,182,212,0.25)',  dot: 'bg-cyan-400',   label: 'Shipped' },
  Delivered: { color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', dot: 'bg-emerald-400',label: 'Delivered' },
  Cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)',  dot: 'bg-rose-400',   label: 'Cancelled' },
};

const getStatus = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.Pending;

/* ── Time helpers ───────────────────────────────────────────────── */
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('en-NP', {
    timeZone: 'Asia/Kathmandu',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

/** Returns { canCancel, minutesLeft } */
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

/* ── Single Order Card ──────────────────────────────────────────── */
function OrderCard({ order, onCancelled }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [timeLeft, setTimeLeft] = useState(() => getCancelInfo(order.created_at, order.status));

  // Tick timer every 30s so the cancel window updates live
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
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Card Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Order icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.25)' }}>
          <Package className="w-4 h-4 text-teal-400" />
        </div>

        {/* Info */}
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

        {/* Total + chevron */}
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
      {expanded && (
        <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

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
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MyOrdersModal
══════════════════════════════════════════════════════════════════ */
export default function MyOrdersModal({ isOpen, onClose }) {
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

  useEffect(() => {
    if (isOpen) fetchOrders();
  }, [isOpen, fetchOrders]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancelled = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl flex flex-col rounded-3xl shadow-2xl z-10"
        style={{
          background: 'linear-gradient(160deg,#080f1c 0%,#0c1525 60%,#080f1c 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '90vh',
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl bg-gradient-to-r from-transparent via-teal-500/80 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(13,148,136,0.25),rgba(8,145,178,0.15))', border: '1px solid rgba(13,148,136,0.3)' }}>
              <Package className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">My Orders</h2>
              <p className="text-[11px] text-slate-500">
                {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              <p className="text-sm text-slate-400">Fetching your orders…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
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
            <div className="flex flex-col items-center justify-center py-16 gap-4">
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

        {/* Footer note */}
        <div className="flex-shrink-0 px-6 py-3 flex items-center gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <p className="text-[11px] text-slate-500">
            Orders can be cancelled within <span className="text-amber-400 font-semibold">30 minutes</span> of placement while status is <span className="text-amber-400 font-semibold">Pending</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
