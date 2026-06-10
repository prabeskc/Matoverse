import { Link } from 'react-router-dom';
import { Share2, Link2, ExternalLink, Mail, MapPin, Zap } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Us',      to: '/about' },
    { label: 'Products',      to: '/products' },
    { label: 'Contact',       to: '/contact' },
    { label: 'Custom Orders', to: '/contact' },
  ],
  Products: [
    { label: 'Interior Mods',    to: '/products' },
    { label: 'Bike Gear',        to: '/products' },
    { label: 'Aero & Exterior',  to: '/products' },
    { label: 'Accessories',      to: '/products' },
  ],
  Support: [
    { label: 'How It Works',    to: '/about' },
    { label: 'Request a Quote', to: '/contact' },
    { label: 'Send Your STL',   to: '/contact' },
    { label: 'Privacy Policy',  to: '/' },
  ],
};

const socials = [
  { icon: Share2,       href: '#', label: 'X / Twitter' },
  { icon: Link2,        href: '#', label: 'LinkedIn' },
  { icon: ExternalLink, href: '#', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto bg-surface-card/50 backdrop-blur-sm carbon-texture">
      {/* Gradient top separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main Footer ── */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 w-fit group">
              <img
                src="/logo.png"
                alt="Matoverse Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(13,148,136,0.4)] group-hover:drop-shadow-[0_0_18px_rgba(13,148,136,0.7)] transition-all duration-300"
              />
              <span className="text-lg font-bold text-white tracking-tight font-display">
                Mato<span className="gradient-text-brand">verse</span>
              </span>
            </Link>

            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Custom PLA and PETG 3D printing workshop specialized in automotive accessories, motorcycle parts, and enthusiast upgrades. Built for durability, thermal resistance, and precision engineering.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span>Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Mail className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span>hello@matoverse.io</span>
              </div>
            </div>
          </div>

          {/* Links Cols */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-500 hover:text-white hover:translate-x-0.5 inline-block transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ── */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div>
            © {new Date().getFullYear()} MatoVerse. All rights reserved. Precision crafted in Kathmandu.
          </div>

          {/* Material badges */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 border border-white/8 bg-white/4 px-2.5 py-1 rounded-md text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
              High-Temp PETG
            </span>
            <span className="flex items-center gap-1.5 border border-white/8 bg-white/4 px-2.5 py-1 rounded-md text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse-slow" />
              Tough PLA+
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-2.5">
            {socials.map((social, i) => {
              const Icon = social.icon;
              return (
                <a
                  key={i}
                  href={social.href}
                  className="p-2 rounded-lg border border-white/8 bg-white/4 text-slate-500 hover:text-white hover:bg-white/8 hover:border-brand-500/30 transition-all duration-200"
                  aria-label={social.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
