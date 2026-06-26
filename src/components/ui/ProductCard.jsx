
import { motion } from 'framer-motion';
import { Layers, Clock, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product, index }) {
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const gradient = product.color || 'from-brand-600 to-brand-700';

  const originalPrice = product.originalPrice || Math.round(product.price * 1.3);

  const descPoints = (product.description || '')
    .split(/(?<=\.)\s+|\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.22 } }}
      className="group relative flex flex-col h-full text-left overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(8,12,22,0.98) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20`}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(13,148,136,0.06) 0%, transparent 65%)' }}
      />

      {/* ── IMAGE — tall, hero-style ── */}
      <div className="relative w-full overflow-hidden" style={{ height: '280px' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06] brightness-[0.82] group-hover:brightness-[0.95]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'rgba(15,23,42,0.8)' }}>
            <span className="text-4xl">🖨️</span>
          </div>
        )}

        {/* Dark gradient overlay at bottom of image — blends into card body */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(8,12,22,0.98), transparent)' }}
        />

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute left-3 top-3 z-20 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(13,148,136,0.85)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(13,148,136,0.5)',
            }}
          >
            {product.badge}
          </span>
        )}


      </div>

      {/* ── INFO ── */}
      <div className="flex flex-col flex-grow px-5 pt-4 pb-5">

        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl font-black text-teal-400">
            Rs. {product.price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-600 line-through">
            Rs. {originalPrice.toLocaleString()}
          </span>
        </div>

        {/* Product name */}
        <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors duration-250 mb-3">
          {product.name}
        </h3>

        {/* Description bullet points */}
        <ul className="space-y-1.5 mb-4 flex-grow">
          {descPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[13px] text-slate-400 leading-snug group-hover:text-slate-300 transition-colors">
              <span className="mt-1 w-1 h-1 rounded-full bg-teal-500 flex-shrink-0" />
              {point}
            </li>
          ))}
        </ul>

        {/* Specs row */}
        <div
          className="flex items-center justify-between text-[11px] font-medium py-3 mb-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="flex items-center gap-1.5 text-slate-500">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-slate-600">Material:</span>
            <span className="text-slate-300">{product.material}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-slate-600">Lead:</span>
            <span className="text-slate-300">{product.leadTime}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              if (!user) { openAuthModal('login'); } else { addToCart(product, 1, false); }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>
          <button
            onClick={() => {
              if (!user) { openAuthModal('login'); } else { addToCart(product, 1, true); }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-brand-700 text-white transition-all duration-200 hover:from-brand-500 hover:to-brand-600 hover:scale-[1.02] active:scale-95"
            style={{ boxShadow: '0 4px 14px rgba(13,148,136,0.25)' }}
          >
            <Zap className="w-3.5 h-3.5" />
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
