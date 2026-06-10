import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Layers, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product, index }) {
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const gradient = product.color || 'from-brand-600 to-brand-700';

  // Persisted wishlist state per product ID
  const [isWishlisted, setIsWishlisted] = useState(() => {
    try {
      const saved = localStorage.getItem('mato_wishlist');
      return saved ? JSON.parse(saved).includes(product.id) : false;
    } catch (e) {
      return false;
    }
  });

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('mato_wishlist');
      let wishlist = saved ? JSON.parse(saved) : [];
      if (isWishlisted) {
        wishlist = wishlist.filter((id) => id !== product.id);
      } else {
        wishlist.push(product.id);
      }
      localStorage.setItem('mato_wishlist', JSON.stringify(wishlist));
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
    }
  };

  // Dynamically calculate an original price to show a discount (matches template)
  const originalPrice = product.originalPrice || Math.round(product.price * 1.3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="card-glass flex flex-col group relative h-full text-left overflow-hidden"
    >
      {/* Top Accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-20`} />

      {/* Radial Hover Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(13,148,136,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Product Image Wrapper */}
      <div className="relative w-full h-60 sm:h-64 overflow-hidden bg-slate-950/60 border-b border-white/5">

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106 brightness-[0.85] group-hover:brightness-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900/40">
            No Image
          </div>
        )}

        {/* Status Badge */}
        {product.badge && (
          <span className="absolute left-4 top-4 z-20 tag text-[10px] uppercase tracking-wider font-bold">
            {product.badge}
          </span>
        )}


      </div>

      {/* Info Content Section */}
      <div className="p-6 flex flex-col flex-grow relative z-10 bg-slate-950/30">
        {/* Price & original price */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-brand-400">
            Rs. {product.price.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 line-through">
            Rs. {originalPrice.toLocaleString()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-slate-500 text-xs leading-relaxed line-clamp-3 mb-5 flex-grow">
          {product.description}
        </p>

        {/* Specifications Meta */}
        <div className="border-t border-white/5 pt-4 mt-auto space-y-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-500/60" />
              Material: <span className="text-slate-400">{product.material}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-500/60" />
              Lead: <span className="text-slate-400">{product.leadTime}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else {
                  addToCart(product, 1, false);
                }
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/8 bg-white/4 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/15 transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer text-center"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else {
                  addToCart(product, 1, true);
                }
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r ${gradient} text-white shadow-brand-sm hover:brightness-110 hover:shadow-brand transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer text-center`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
