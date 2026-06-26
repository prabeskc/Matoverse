import { ArrowRight, Printer, Package, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ui/ProductCard';

const BACKEND_URL = 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

const normalizeProduct = (p) => ({
  id: p.id,
  name: p.title,
  description: p.description,
  price: Number(p.price),
  originalPrice: p.original_price ? Number(p.original_price) : null,
  image: p.image_url ? (p.image_url.startsWith('/') ? `${BACKEND_URL}${p.image_url}` : p.image_url) : null,
  badge: p.badge,
  material: p.material,
  leadTime: p.lead_time,
  category: p.category,
  highlight: p.highlight,
  inStock: p.in_stock,
  color: getCategoryColor(p.category),
});

function getCategoryColor(category) {
  const map = {
    'Home Decor':  'from-brand-600 to-brand-700',
    'Accessories': 'from-cyan-600 to-teal-700',
    'Automotive':  'from-slate-600 to-slate-700',
  };
  return map[category] || 'from-brand-600 to-brand-700';
}



export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/products?_=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success') {
          setProducts(data.data.products.map(normalizeProduct));
        } else {
          setError('Failed to load products.');
        }
      })
      .catch(() => setError('Cannot reach server. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen" style={{ background: '#000' }}>

      {/* Background glows */}
      <div className="fixed inset-0 -z-10 mesh-bg" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.05) 0%, transparent 70%)' }} />

      {/* ── SLIM HEADER BAR ── */}
      <div className="pt-20 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Left: Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none font-display">
                Our <span className="gradient-text">Products</span>
              </h1>
            </div>

            {/* Right: count */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-slate-400 font-medium"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Package className="w-3.5 h-3.5 text-brand-500" />
                {loading ? 'Loading…' : `${products.length} products`}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── PRODUCTS GRID — immediately visible ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="rounded-2xl"
                style={{ height: 480, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-rose-400">Failed to load products</p>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#0d9488,#0891b2)', boxShadow: '0 4px 16px rgba(13,148,136,0.3)' }}
            >
              Try Again
            </button>
          </motion.div>
        ) : products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.15)' }}>
              <Package className="w-8 h-8 text-slate-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white">No products yet</p>
              <p className="text-sm text-slate-500 mt-1">Check back soon — we're printing new parts!</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(8,15,28,0.97) 45%, rgba(8,145,178,0.08) 100%)',
            border: '1px solid rgba(13,148,136,0.2)',
          }}
        >
          {/* Accent glow blobs */}
          <div className="absolute top-[-60px] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-40px] right-[5%] w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.10) 0%, transparent 70%)' }} />

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(13,148,136,0.6), transparent)' }} />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 px-8 sm:px-12 py-10 sm:py-12">
            {/* Left */}
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)' }}>
                <Printer className="w-7 h-7 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display leading-snug">
                  Have an <span className="gradient-text">STL File</span> to Print?
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">
                  Send us your design — we'll review tolerances, wall thickness, and give a free cost estimate.
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/contact" className="btn-primary">
                <span>Get a Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-ghost whitespace-nowrap">
                How It Works
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
