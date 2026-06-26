import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

// ─── API Helper ───────────────────────────────────────────────────────────────
function useAdminApi() {
  const token = localStorage.getItem('mato_token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const get = (path) => fetch(`${API_BASE}/admin${path}`, { headers }).then((r) => r.json());
  const post = (path, body) =>
    fetch(`${API_BASE}/admin${path}`, { method: 'POST', headers, body: JSON.stringify(body) }).then((r) => r.json());
  const put = (path, body) =>
    fetch(`${API_BASE}/admin${path}`, { method: 'PUT', headers, body: JSON.stringify(body) }).then((r) => r.json());
  const del = (path) =>
    fetch(`${API_BASE}/admin${path}`, { method: 'DELETE', headers }).then((r) => r.json());

  return { get, post, put, del };
}

// ─── Status badge config ──────────────────────────────────────────────────────
const ORDER_STATUS_CONFIG = {
  Pending:    { bg: 'rgba(234,179,8,0.15)',   color: '#facc15', border: 'rgba(234,179,8,0.3)'   },
  Placed:     { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.3)'  },
  Processing: { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)'  },
  Shipped:    { bg: 'rgba(249,115,22,0.15)',  color: '#fb923c', border: 'rgba(249,115,22,0.3)'  },
  Delivered:  { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)'   },
  Cancelled:  { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'   },
};

const QUOTE_STATUS_CONFIG = {
  'Pending':        { bg: 'rgba(234,179,8,0.15)',   color: '#facc15', border: 'rgba(234,179,8,0.3)'   },
  'Awaiting Review':{ bg: 'rgba(234,179,8,0.15)',   color: '#facc15', border: 'rgba(234,179,8,0.3)'   },
  'Quoted':         { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)'   },
  'Rejected':       { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.3)'   },
};

function StatusBadge({ status, config }) {
  const cfg = config[status] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: '9999px', padding: '3px 10px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    }}>{status}</span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      id="admin-modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => { if (e.target.id === 'admin-modal-overlay') onClose(); }}
    >
      <div style={{
        background: '#0f172a', border: '1px solid rgba(51,65,85,0.8)',
        borderRadius: '16px', width: '100%', maxWidth: '560px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(13,148,136,0.1)',
        animation: 'fadeInUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(51,65,85,0.6)' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
          <button
            id="admin-modal-close"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '2px 6px', borderRadius: '6px', transition: 'color 0.15s' }}
            onMouseEnter={(e) => (e.target.style.color = '#f1f5f9')}
            onMouseLeave={(e) => (e.target.style.color = '#64748b')}
          >×</button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form Input ───────────────────────────────────────────────────────────────
function FormField({ label, id, type = 'text', value, onChange, placeholder, required, as, options, children }) {
  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.7)',
    borderRadius: '8px', color: '#f1f5f9', fontSize: '14px',
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };
  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={id} style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.03em' }}>
        {label}{required && <span style={{ color: '#14b8a6', marginLeft: '3px' }}>*</span>}
      </label>
      {as === 'select' ? (
        <select id={id} value={value} onChange={onChange} style={{ ...inputStyle, cursor: 'pointer' }}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : as === 'textarea' ? (
        <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} rows={3}
          style={{ ...inputStyle, resize: 'vertical' }} />
      ) : children ? children : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = '#14b8a6')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(51,65,85,0.7)')}
        />
      )}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '14px', padding: '28px', maxWidth: '400px', width: '90%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        animation: 'fadeInUp 0.2s ease',
      }}>
        <div style={{ fontSize: '28px', marginBottom: '12px', textAlign: 'center' }}>⚠️</div>
        <p style={{ color: '#cbd5e1', fontSize: '15px', textAlign: 'center', margin: '0 0 24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button id="confirm-cancel-btn" onClick={onCancel} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(51,65,85,0.7)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            Cancel
          </button>
          <button id="confirm-delete-btn" onClick={onConfirm} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VIEW: Dashboard Overview
// ─────────────────────────────────────────────────────────────────────────────
function DashboardOverview({ api }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then((d) => {
      if (d.status === 'success') setStats(d.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Sales', value: `Rs. ${stats.totalSales?.toLocaleString()}`, icon: '💰', gradient: 'linear-gradient(135deg,#0d9488,#0f766e)', glow: 'rgba(13,148,136,0.25)' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', glow: 'rgba(59,130,246,0.25)' },
    { label: 'Active Quotes', value: stats.activeQuotes, icon: '📋', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,0.25)' },
    { label: 'Total Products', value: stats.totalProducts, icon: '🖨️', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', glow: 'rgba(139,92,246,0.25)' },
  ] : [];

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px' }}>Dashboard Overview</h2>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 28px' }}>Real-time snapshot of your store's performance.</p>

      {loading ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: '1 1 200px', height: '120px', borderRadius: '16px', background: 'rgba(30,41,59,0.5)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
          {cards.map((card) => (
            <div key={card.label} style={{
              padding: '24px 20px',
              borderRadius: '16px',
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(51,65,85,0.5)',
              boxShadow: `0 4px 20px ${card.glow}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 30px ${card.glow}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 20px ${card.glow}`; }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{card.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, background: card.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick tips */}
      <div style={{ background: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: '14px', padding: '20px 24px' }}>
        <h4 style={{ margin: '0 0 12px', color: '#14b8a6', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚡</span> Quick Actions
        </h4>
        <ul style={{ margin: 0, padding: '0 0 0 18px', color: '#64748b', fontSize: '13px', lineHeight: '1.9' }}>
          <li>Use <strong style={{ color: '#94a3b8' }}>Inventory</strong> to add, edit, or remove products</li>
          <li>Use <strong style={{ color: '#94a3b8' }}>Orders</strong> to track and update customer order statuses</li>
          <li>Use <strong style={{ color: '#94a3b8' }}>Quote Inbox</strong> to review and respond to print quote requests</li>
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VIEW: Inventory (Products CRUD)
// ─────────────────────────────────────────────────────────────────────────────
const MATERIAL_OPTIONS = ['PLA', 'PETG', 'TPU'];
const CATEGORY_OPTIONS = ['Automotive', 'Home Decor', 'Accessories', 'General'];
const EMPTY_PRODUCT = { title: '', description: '', price: '', originalPrice: '', badge: '', material: '', leadTime: '', imageUrl: '', inStock: true, highlight: false, category: 'General' };

function InventoryView({ api }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);
    // Cache-bust to always get fresh data from server
    fetch(`${API_BASE}/products?_=${Date.now()}`, { headers: { 'Content-Type': 'application/json' } })
      .then((r) => r.json())
      .then((d) => { setProducts(d.data?.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      description: p.description || '',
      price: p.price ?? '',
      originalPrice: p.original_price ?? '',
      badge: p.badge || '',
      material: p.material || '',
      leadTime: p.lead_time || '',
      imageUrl: p.image_url || '',
      inStock: p.in_stock !== false,
      highlight: p.highlight === true,
      category: p.category || 'General',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleMaterialToggle = (mat) => {
    const current = form.material ? form.material.split(',').map(s => s.trim()).filter(Boolean) : [];
    const updated = current.includes(mat) ? current.filter(m => m !== mat) : [...current, mat];
    setForm(f => ({ ...f, material: updated.join(', ') }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.price || isNaN(Number(form.price))) { setError('A valid price is required.'); return; }
    setSaving(true);
    setError(null);
    const payload = { ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined };
    try {
      const res = editing
        ? await api.put(`/products/${editing.id}`, payload)
        : await api.post('/products', payload);

      if (res.status !== 'success') {
        setError(res.message || 'Failed to save product.');
      } else {
        setModalOpen(false);
        fetchProducts();
        showToast(editing ? 'Product updated!' : 'Product created!');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProducts();
      showToast('Product deleted.', 'error');
    } catch {
      showToast('Failed to delete product.', 'error');
    }
  };

  const materialArr = form.material ? form.material.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 2000,
          padding: '12px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
          background: toast.type === 'success' ? 'rgba(13,148,136,0.9)' : 'rgba(220,38,38,0.9)',
          color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.2s ease',
        }}>{toast.msg}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' }}>Inventory Management</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{products.length} product{products.length !== 1 ? 's' : ''} in catalog</p>
        </div>
        <button id="add-product-btn" onClick={openCreate} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: '#fff',
          fontWeight: 700, fontSize: '14px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(13,148,136,0.3)', transition: 'all 0.2s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,148,136,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,148,136,0.3)'; }}
        >
          <span style={{ fontSize: '18px' }}>+</span> Add New Product
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '72px', borderRadius: '12px', background: 'rgba(30,41,59,0.5)' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖨️</div>
          <p style={{ fontWeight: 700, fontSize: '18px', margin: '0 0 8px', color: '#64748b' }}>No products yet</p>
          <p style={{ fontSize: '14px', margin: 0 }}>Click "Add New Product" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {products.map((p) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '14px 18px', borderRadius: '12px',
              background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(51,65,85,0.5)',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(13,148,136,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)')}
            >
              {/* Image thumb */}
              <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)' }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🖨️</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '15px' }}>{p.title}</span>
                  {p.badge && (
                    <span style={{ background: 'rgba(13,148,136,0.15)', color: '#2dd4bf', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>{p.badge}</span>
                  )}
                  {!p.in_stock && (
                    <span style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>Out of Stock</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                  <span style={{ color: '#14b8a6', fontWeight: 700 }}>Rs. {p.price?.toLocaleString()}</span>
                  {p.material && <span>{p.material}</span>}
                  {p.lead_time && <span>⏱ {p.lead_time}</span>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  id={`edit-product-${p.id}`}
                  onClick={() => openEdit(p)}
                  style={{ padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
                >Edit</button>
                <button
                  id={`delete-product-${p.id}`}
                  onClick={() => setDeleteTarget(p)}
                  style={{ padding: '7px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)', color: '#f87171', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSave}>
          <FormField label="Title" id="product-title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Mato Dragon Shield" required />
          <FormField label="Description" id="product-description" as="textarea" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short product description..." />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Price (Rs.)" id="product-price" type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 2500" required />
            <FormField label="Original Price (Rs.)" id="product-original-price" type="number" value={form.originalPrice} onChange={(e) => setForm(f => ({ ...f, originalPrice: e.target.value }))} placeholder="e.g. 3000" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Badge" id="product-badge" value={form.badge} onChange={(e) => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="e.g. Best Seller" />
            <FormField label="Lead Time" id="product-lead-time" value={form.leadTime} onChange={(e) => setForm(f => ({ ...f, leadTime: e.target.value }))} placeholder="e.g. 3-5 Days" />
          </div>

          <FormField label="Category" id="product-category" as="select"
            value={form.category}
            onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            options={CATEGORY_OPTIONS.map(c => ({ value: c, label: c }))}
          />

          <FormField label="Image URL" id="product-image-url" value={form.imageUrl} onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />

          {/* Material checkboxes */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Materials</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {MATERIAL_OPTIONS.map((mat) => {
                const checked = materialArr.includes(mat);
                return (
                  <label key={mat} id={`material-${mat}`} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${checked ? 'rgba(13,148,136,0.5)' : 'rgba(51,65,85,0.6)'}`, background: checked ? 'rgba(13,148,136,0.1)' : 'transparent', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={checked} onChange={() => handleMaterialToggle(mat)} style={{ accentColor: '#14b8a6' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: checked ? '#2dd4bf' : '#64748b' }}>{mat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            {[{ key: 'inStock', label: 'In Stock' }, { key: 'highlight', label: 'Highlighted' }].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div
                  id={`toggle-${key}`}
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                  style={{ width: '40px', height: '22px', borderRadius: '11px', background: form[key] ? '#0d9488' : 'rgba(51,65,85,0.8)', transition: 'background 0.2s', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: '3px', left: form[key] ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{label}</span>
              </label>
            ))}
          </div>

          {error && <p style={{ color: '#f87171', fontSize: '13px', margin: '0 0 16px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" id="product-modal-cancel" onClick={() => setModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(51,65,85,0.7)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>Cancel</button>
            <button type="submit" id="product-modal-save" disabled={saving} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VIEW: Order Tracking
// ─────────────────────────────────────────────────────────────────────────────
const ORDER_STATUSES = ['Pending', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];


function OrderTrackingView({ api }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusErrors, setStatusErrors] = useState({});

  useEffect(() => {
    api.get('/orders').then((d) => {
      if (d.status === 'success') setOrders(d.data?.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating((u) => ({ ...u, [orderId]: true }));
    setStatusErrors((e) => ({ ...e, [orderId]: null }));
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.status === 'success') {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        setStatusErrors((e) => ({ ...e, [orderId]: res.message || 'Failed to update status.' }));
      }
    } catch {
      setStatusErrors((e) => ({ ...e, [orderId]: 'Network error. Please try again.' }));
    } finally {
      setUpdating((u) => ({ ...u, [orderId]: false }));
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' }}>Order Tracking</h2>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>{orders.length} total orders</p>

      {loading ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'rgba(30,41,59,0.5)' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <p style={{ fontWeight: 700, fontSize: '18px', color: '#64748b', margin: '0 0 8px' }}>No orders yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {orders.map((order) => {
            const cfg = ORDER_STATUS_CONFIG[order.status] || {};
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} style={{ borderRadius: '12px', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(51,65,85,0.5)', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', flexWrap: 'wrap' }}>
                  {/* Order info */}
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '15px' }}>{order.customer_name}</span>
                      <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>#{order.id?.slice(0, 8)}…</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ color: '#14b8a6', fontWeight: 700 }}>Rs. {Number(order.total_price)?.toLocaleString()}</span>
                      {order.customer_phone && <span>📞 {order.customer_phone}</span>}
                      <span>🕐 {new Date(order.created_at).toLocaleDateString('en-NP')}</span>
                    </div>
                  </div>

                  {/* Status selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      id={`order-status-${order.id}`}
                      value={order.status}
                      disabled={updating[order.id]}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: `1px solid ${cfg.border || 'rgba(51,65,85,0.6)'}`,
                        background: cfg.bg || 'rgba(15,23,42,0.8)',
                        color: cfg.color || '#94a3b8',
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        outline: 'none', opacity: updating[order.id] ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Expand toggle */}
                    <button
                      id={`order-expand-${order.id}`}
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', color: '#64748b', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f5f9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
                    >{isExpanded ? '▲ Hide' : '▼ Details'}</button>
                  </div>
                  {statusErrors[order.id] && (
                    <div style={{ padding: '0 18px 10px', fontSize: '12px', color: '#f87171' }}>
                      ⚠️ {statusErrors[order.id]}
                    </div>
                  )}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(51,65,85,0.4)', paddingTop: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                      {[
                        { label: 'Email', value: order.customer_email || '—' },
                        { label: 'Phone', value: order.customer_phone || '—' },
                        { label: 'Address', value: order.delivery_address || '—' },
                        { label: 'Notes', value: order.notes || '—' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                          <div style={{ fontSize: '13px', color: '#94a3b8' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Items</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', padding: '6px 10px', background: 'rgba(30,41,59,0.5)', borderRadius: '6px' }}>
                              <span>{item.name} × {item.quantity}</span>
                              <span style={{ color: '#14b8a6', fontWeight: 600 }}>Rs. {(item.price * item.quantity)?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VIEW: Quote Inbox
// ─────────────────────────────────────────────────────────────────────────────
const QUOTE_STATUSES = ['Awaiting Review', 'Quoted', 'Rejected'];

function QuoteInboxView({ api }) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [expandedQuote, setExpandedQuote] = useState(null);

  useEffect(() => {
    api.get('/quotes').then((d) => {
      if (d.status === 'success') setQuotes(d.data?.quotes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleStatusChange = async (quoteId, newStatus) => {
    setUpdating((u) => ({ ...u, [quoteId]: true }));
    try {
      const res = await api.put(`/quotes/${quoteId}/status`, { status: newStatus });
      if (res.status === 'success') {
        setQuotes((prev) => prev.map((q) => q.id === quoteId ? { ...q, status: newStatus } : q));
      }
    } finally {
      setUpdating((u) => ({ ...u, [quoteId]: false }));
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px' }}>Quote Inbox</h2>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>{quotes.length} quote request{quotes.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div style={{ display: 'grid', gap: '10px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '88px', borderRadius: '12px', background: 'rgba(30,41,59,0.5)' }} />)}
        </div>
      ) : quotes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontWeight: 700, fontSize: '18px', color: '#64748b', margin: '0 0 8px' }}>No quotes yet</p>
          <p style={{ fontSize: '14px', margin: 0 }}>Quote requests from customers will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {quotes.map((q) => {
            const cfg = QUOTE_STATUS_CONFIG[q.status] || QUOTE_STATUS_CONFIG['Awaiting Review'];
            const isExpanded = expandedQuote === q.id;
            return (
              <div key={q.id} style={{ borderRadius: '12px', background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(51,65,85,0.5)', overflow: 'hidden' }}>
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '15px' }}>{q.name}</span>
                      <span style={{ fontSize: '12px', color: '#475569' }}>{q.email}</span>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                      <strong style={{ color: '#64748b' }}>{q.subject}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                      {new Date(q.created_at).toLocaleDateString('en-NP')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <StatusBadge status={q.status || 'Awaiting Review'} config={QUOTE_STATUS_CONFIG} />

                    <select
                      id={`quote-status-${q.id}`}
                      value={q.status || 'Awaiting Review'}
                      disabled={updating[q.id]}
                      onChange={(e) => handleStatusChange(q.id, e.target.value)}
                      style={{
                        padding: '7px 10px', borderRadius: '8px',
                        border: '1px solid rgba(51,65,85,0.6)',
                        background: 'rgba(15,23,42,0.8)', color: '#94a3b8',
                        fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        outline: 'none', opacity: updating[q.id] ? 0.5 : 1,
                      }}
                    >
                      {QUOTE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <button
                      id={`quote-expand-${q.id}`}
                      onClick={() => setExpandedQuote(isExpanded ? null : q.id)}
                      style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', color: '#64748b', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                    >{isExpanded ? '▲ Hide' : '▼ View'}</button>
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(51,65,85,0.4)', paddingTop: '14px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Full Message</div>
                      <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', padding: '14px 16px', background: 'rgba(30,41,59,0.5)', borderRadius: '8px', border: '1px solid rgba(51,65,85,0.4)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {q.message}
                      </div>
                    </div>
                    {q.file_url && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📁 Attachment</div>
                        <a
                          href={q.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'rgba(20,184,166,0.1)',
                            border: '1px solid rgba(20,184,166,0.3)',
                            borderRadius: '8px',
                            color: '#2dd4bf',
                            fontSize: '13px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(20,184,166,0.18)';
                            e.currentTarget.style.borderColor = 'rgba(20,184,166,0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(20,184,166,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(20,184,166,0.3)';
                          }}
                        >
                          <span>📥 Download: {q.file_url.split('/').pop()}</span>
                        </a>
                      </div>
                    )}
                    {/* Detect links in message */}
                    {(() => {
                      const urlRegex = /https?:\/\/[^\s]+/g;
                      const links = q.message?.match(urlRegex) || [];
                      if (links.length === 0) return null;
                      return (
                        <div>
                          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🔗 Detected Links</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {links.map((link, i) => (
                              <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#14b8a6', fontSize: '13px', wordBreak: 'break-all', textDecoration: 'none' }}
                                onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                                onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                              >{link}</a>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN: Admin Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',   label: 'Dashboard',   icon: '⚡' },
  { id: 'inventory',  label: 'Inventory',   icon: '🖨️' },
  { id: 'orders',     label: 'Orders',      icon: '📦' },
  { id: 'quotes',     label: 'Quote Inbox', icon: '📋' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const api = useAdminApi();
  const [activeView, setActiveView] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentNav = NAV_ITEMS.find(n => n.id === activeView);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#000',
      fontFamily: "'Inter', 'Space Grotesk', sans-serif",
    }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'rgba(3,7,18,0.98)',
        borderRight: '1px solid rgba(30,41,59,0.8)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(30,41,59,0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🖨️</div>
            <span style={{ fontWeight: 800, fontSize: '16px', background: 'linear-gradient(135deg,#2dd4bf,#14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Matoverse</span>
          </div>
          <div style={{ fontSize: '11px', color: '#334155', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: '2px' }}>Admin Console</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#334155', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>Navigation</div>
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveView(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: 'none', cursor: 'pointer', marginBottom: '4px',
                  background: active ? 'rgba(13,148,136,0.15)' : 'transparent',
                  color: active ? '#2dd4bf' : '#64748b',
                  fontWeight: active ? 700 : 500, fontSize: '14px',
                  transition: 'all 0.15s', textAlign: 'left',
                  borderLeft: active ? '3px solid #0d9488' : '3px solid transparent',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; e.currentTarget.style.color = '#94a3b8'; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
              >
                <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(30,41,59,0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(13,148,136,0.05)', marginBottom: '8px' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: '11px', color: '#14b8a6', fontWeight: 600 }}>Administrator</div>
            </div>
          </div>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
          >
            <span>→</span> Sign Out
          </button>

          {/* Back to site */}
          <button
            id="admin-back-to-site"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(51,65,85,0.4)', background: 'transparent', color: '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s', marginTop: '6px' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
          >
            ← Back to Site
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(30,41,59,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(3,7,18,0.6)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>{currentNav?.icon}</span>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>{currentNav?.label}</h1>
          </div>
          <div style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>
            {new Date().toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* View content */}
        <div style={{ padding: '32px', maxWidth: '1100px' }}>
          {activeView === 'overview'  && <DashboardOverview api={api} />}
          {activeView === 'inventory' && <InventoryView api={api} />}
          {activeView === 'orders'    && <OrderTrackingView api={api} />}
          {activeView === 'quotes'    && <QuoteInboxView api={api} />}
        </div>
      </main>
    </div>
  );
}
