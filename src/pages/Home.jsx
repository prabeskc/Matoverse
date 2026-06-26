import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Package, Layers, Wrench, Star,
  Printer, ChevronRight, ShoppingCart, Zap, Shield, Clock,
} from 'lucide-react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { products as staticProducts } from '../data/products';
import { stats } from '../data/testimonials';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';
import heroBg from '../assets/hero_bg.png';

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 50;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else { setCount(Math.floor(current)); }
          }, 1600 / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums font-black text-white text-3xl sm:text-4xl font-display">
      {count}{suffix}
    </span>
  );
}

const statIcons = [Package, Star, Layers, Wrench];

// HERO_IMAGE is replaced by local import heroBg

/* ── Floating particle dot ── */
function Particle({ x, y, delay, size = 2 }) {
  return (
    <motion.div
      className="absolute rounded-full bg-brand-500/40 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay }}
    />
  );
}

/* ── Why Us card ── */
const whyItems = [
  {
    icon: Shield,
    title: 'Guaranteed Quality',
    desc: 'Every part inspected before shipping. Layer adhesion, dimensional accuracy, surface finish.',
    color: 'from-brand-500 to-brand-700',
  },
  {
    icon: Zap,
    title: 'Fast Turnaround',
    desc: 'Most orders printed and dispatched within 1–5 business days.',
    color: 'from-neon-500 to-neon-700',
  },
  {
    icon: Printer,
    title: 'Custom STL Prints',
    desc: 'Send us your design files. We\'ll quote, review wall thickness, and print.',
    color: 'from-cyan-600 to-teal-700',
  },
];

/* ── Hero particles config ── */
const particles = [
  { x: 75, y: 15, delay: 0, size: 3 },
  { x: 85, y: 30, delay: 1.2, size: 2 },
  { x: 90, y: 55, delay: 0.6, size: 4 },
  { x: 65, y: 70, delay: 2, size: 2 },
  { x: 95, y: 45, delay: 1.5, size: 3 },
];

export default function Home() {
  const { addToCart } = useCart();
  const [previewProducts, setPreviewProducts] = useState([]);

  useEffect(() => {
    const BACKEND_URL = 'http://localhost:5000';
    const API_BASE = `${BACKEND_URL}/api`;
    
    const getCategoryColor = (category) => {
      const map = {
        'Home Decor':  'from-brand-600 to-brand-700',
        'Accessories': 'from-cyan-600 to-teal-700',
        'Automotive':  'from-slate-600 to-slate-700',
      };
      return map[category] || 'from-brand-600 to-brand-700';
    };

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

    fetch(`${API_BASE}/products`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success' && data.data?.products?.length > 0) {
          const apiProducts = data.data.products.map(normalizeProduct);
          const filtered = [
            ...apiProducts.filter((p) => p.highlight),
            ...apiProducts.filter((p) => !p.highlight),
          ].slice(0, 3);
          setPreviewProducts(filtered);
        } else {
          useStaticFallback();
        }
      })
      .catch(() => {
        useStaticFallback();
      });

    function useStaticFallback() {
      const filtered = [
        ...staticProducts.filter((p) => p.highlight),
        ...staticProducts.filter((p) => !p.highlight),
      ].slice(0, 3);
      setPreviewProducts(filtered);
    }
  }, []);

  return (
    <div className="relative overflow-hidden">

      {/* ── Background Mesh ── */}
      <div className="fixed inset-0 -z-10 mesh-bg" />
      <div className="orb orb-primary w-[600px] h-[600px] top-[-120px] right-[-150px] opacity-30" />
      <div className="orb orb-secondary w-[450px] h-[450px] top-[50%] left-[-200px] opacity-15" />

      {/* ─────────────────────────────────────────────────────────
         HERO SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden min-h-screen flex items-center justify-center py-20 sm:py-32">
        {/* Hero Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="MatoVerse Workshop 3D Printer"
            className="w-full h-full object-cover object-center"
          />
          {/* Shades / overlay of the image so text can be read properly */}
          <div className="absolute inset-0 bg-black/60" />
          {/* Subtle gradients to blend edges */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Text Container */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-9 flex flex-col items-center max-w-4xl"
          >

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-wide leading-[1.2] font-display"
            >
              Automotive 3D
              <br />
              <span className="gradient-text">Printing</span> Redefined
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="text-slate-300 text-lg sm:text-xl max-w-3xl leading-relaxed text-center drop-shadow-md"
            >
              Custom PLA+ and High-Temp PETG interior mods, motorcycle handlebar mounts, and aerodynamic parts. Engineered for durability and millimeter-perfect fit.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-5 pt-4"
            >
              <Link to="/products" className="btn-primary text-sm py-3 px-6">
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-ghost text-sm py-3 px-6 backdrop-blur-sm bg-black/35 hover:bg-black/50">
                <span>Send STL / Get Quote</span>
              </Link>
            </motion.div>


          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
         STATS SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-surface-card/30 carbon-texture backdrop-blur-sm py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = statIcons[i % statIcons.length];
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
         BEST SELLERS SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          >
            <span className="section-label">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Best Sellers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
              Our Best Selling Products
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              A curated selection of our most popular 3D printed parts, trusted by car and motorcycle enthusiasts for their quality and performance.
            </p>
          </motion.div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {previewProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/products" className="btn-ghost">
              <span>View All 3D Printed Parts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
         WHY US — 3 PILLARS
         ───────────────────────────────────────────────────────── */}
      <section className="bg-surface-card/20 border-y border-white/5 carbon-texture py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: i * 0.1 }}
                  className="flex items-start gap-4 p-6 rounded-2xl border border-white/5 bg-white/2 hover:border-brand-500/20 hover:bg-brand-950/10 transition-all duration-300 group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-brand-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
         ABOUT TEASER SECTION
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-brand-600/10 blur-2xl rounded-full" />
            <div className="image-frame p-2 bg-surface-card/80">
              <img
                src="https://images.unsplash.com/photo-1611117775350-ac3950990985?auto=format&fit=crop&w=640&q=80"
                alt="3D Printing PLA filament"
                className="w-full h-80 object-cover rounded-2xl brightness-90"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="space-y-3">
              <span className="section-label">About Matoverse</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
                Born in the Workshop,<br />Built for the Road
              </h2>
            </div>

            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
              Matoverse was founded by two Nepali makers who grew tired of paying exorbitant shipping fees for simple car interior trims and bike mounts. We decided to build our own high-end printing farm right here in Kathmandu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { label: 'Guaranteed Layer Fusion', sub: 'Strict quality checks.' },
                { label: 'UV & Heat Stable PETG', sub: "Parts won't melt in cars." },
                { label: 'Enthusiast Support', sub: 'We test fits on actual frames.' },
                { label: 'Custom Sizes', sub: 'Send dimensions, we scale.' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">✓</div>
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold text-white">{item.label}:</span> {item.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link to="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors group">
                <span>Learn our full story</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
         CTA SECTION (CUSTOM STL UPLOAD)
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
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
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-[-50%] left-[20%] w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-30%] right-[10%] w-[300px] h-[300px] bg-neon-500/8 rounded-full blur-[80px]" />
          </div>

          {/* Animated border top */}
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
