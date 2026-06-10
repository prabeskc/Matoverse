import { ArrowRight, Clock, Layers, Package, Printer } from 'lucide-react';
import { products } from '../data/products';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import ProductCard from '../components/ui/ProductCard';

// Reusable ProductCard is imported from components/ui/ProductCard

export default function Products() {
  return (
    <div className="relative overflow-hidden pt-16 min-h-screen">

      {/* Background */}
      <div className="fixed inset-0 -z-10 mesh-bg" />
      <div className="orb orb-primary w-[500px] h-[500px] top-[8%] right-[-80px] opacity-20 pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────
         HERO HEADER
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14 sm:pt-20 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5 text-left max-w-3xl"
        >
          <span className="section-label">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            Upgrade Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none font-display">
            Precision 3D <span className="gradient-text">Prints</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
            Browse our premium custom models, home decor accents, and automotive gadgets. Printed with the highest precision — tailored for durability, heat stability, and premium finish.
          </p>

          {/* Count badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card/60 border border-white/8 text-xs text-slate-400 font-medium">
            <Package className="w-3.5 h-3.5 text-brand-500" />
            {products.length} products available
          </div>
        </motion.div>
      </section>

      {/* Gradient divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gradient-divider mb-12" />
      </div>

      {/* ─────────────────────────────────────────────────────────
         PRODUCTS GRID
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed border-white/10 rounded-3xl p-16 text-center max-w-md mx-auto space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-card border border-white/8 flex items-center justify-center mx-auto text-slate-500">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No products yet</h3>
            <p className="text-slate-500 text-sm">Check back soon — we're printing new parts!</p>
          </motion.div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────
         CTA SECTION (CUSTOM STL UPLOAD)
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden border border-white/8 carbon-texture text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(13,148,136,0.12) 0%, rgba(15,23,42,0.95) 40%, rgba(249,115,22,0.06) 100%)',
          }}
        >
          {/* Glow orbs */}
          <div className="absolute top-[-40%] left-[20%] w-[350px] h-[350px] bg-brand-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[10%] w-[250px] h-[250px] bg-neon-500/8 rounded-full blur-[70px] pointer-events-none" />

          {/* Top line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

          <div className="relative py-16 px-6 sm:py-20 sm:px-12 max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/25 text-brand-400 mx-auto"
            >
              <Printer className="w-7 h-7" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-display">
              Have an <span className="gradient-text">STL File</span> Ready to Print?
            </h2>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Don't limit yourself to catalog items. Send us your design specifications, dimensions, or raw STL/CAD models, and we'll check wall thickness, print angles, and give you a cost estimate.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/contact" className="btn-primary">
                <span>Submit Custom Design</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/about" className="btn-ghost">
                <span>How We Review Files</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
