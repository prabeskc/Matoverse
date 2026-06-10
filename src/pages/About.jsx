import { Link2, Share2, Target, Eye, Heart, Wrench, Printer, ArrowRight } from 'lucide-react';
import { team } from '../data/team';
import { motion } from 'framer-motion';

const ABOUT_IMAGE =
  'https://images.unsplash.com/photo-1611117775350-ac3950990985?auto=format&fit=crop&w=900&q=80';

const values = [
  {
    icon: Target,
    title: 'Quality First',
    desc: 'Every part is inspected before shipping. Layer adhesion, dimensional accuracy, surface finish — if anything is off, it gets reprinted.',
    color: 'from-brand-500 to-brand-700',
    glow: 'rgba(13,148,136,0.15)',
  },
  {
    icon: Heart,
    title: 'Enthusiast Roots',
    desc: 'We started by printing mods for our own cars and bikes. That passion for the hobby is in every part we make.',
    color: 'from-neon-500 to-neon-700',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    icon: Wrench,
    title: 'PLA & PETG Experts',
    desc: 'We exclusively use high-strength PLA and PETG — chosen for durability, thermal resistance, and automotive compatibility.',
    color: 'from-cyan-600 to-teal-700',
    glow: 'rgba(6,182,212,0.15)',
  },
  {
    icon: Printer,
    title: 'Custom-First',
    desc: 'Have a spec nobody stocks? Send us a photo, dimensions, or CAD file and we will build it around your exact requirements.',
    color: 'from-slate-600 to-slate-700',
    glow: 'rgba(100,116,139,0.12)',
  },
];

function TeamCard({ member, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card-glass p-7 group relative overflow-hidden flex flex-col h-full text-left"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-600 to-neon-500 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-t-2xl" />

      {/* Avatar */}
      <div className="relative mb-6 w-fit">
        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${member.color} flex items-center justify-center text-2xl font-black text-white shadow-brand transition-all duration-300 group-hover:shadow-brand-lg group-hover:scale-105`}>
          {member.initials}
        </div>
        {/* Online indicator */}
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-surface-card" />
      </div>

      {/* Role */}
      <span className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-1">
        {member.role}
      </span>

      <h3 className="text-lg font-bold text-white mb-3 font-display">
        {member.name}
      </h3>

      <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
        {member.bio}
      </p>

      {/* Social Links */}
      <div className="flex items-center gap-2.5 pt-4 border-t border-white/6">
        <a
          href={member.linkedin}
          className="p-2 rounded-lg border border-white/8 bg-white/4 text-slate-500 hover:text-white hover:bg-white/10 hover:border-brand-500/30 transition-all duration-200"
          aria-label="LinkedIn Profile"
        >
          <Link2 className="w-4 h-4" />
        </a>
        <a
          href={member.twitter}
          className="p-2 rounded-lg border border-white/8 bg-white/4 text-slate-500 hover:text-white hover:bg-white/10 hover:border-brand-500/30 transition-all duration-200"
          aria-label="Twitter/X Profile"
        >
          <Share2 className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="relative overflow-hidden pt-16 min-h-screen">

      {/* Background */}
      <div className="fixed inset-0 -z-10 mesh-bg" />
      <div className="orb orb-primary w-[500px] h-[500px] top-[12%] left-[-150px] opacity-20 pointer-events-none" />
      <div className="orb orb-secondary w-[400px] h-[400px] bottom-[8%] right-[-100px] opacity-15 pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────
         STORY & MISSION
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <span className="section-label">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Our Story
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] font-display">
              High-Strength<br />
              <span className="gradient-text">Nepali 3D Crafts</span>
            </h1>

            <div className="space-y-4">
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                MatoVerse was born in Kathmandu out of frustration. As automotive and cycling enthusiasts, we frequently found ourselves importing bespoke brackets, spacers, and center-console cup holders from abroad — only to pay triple the price in customs fees and cargo shipping.
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                In late 2025, we set up our first high-accuracy FDM printers. By selecting structural, high-temperature filaments like UV-resistant PETG and high-perimeter PLA, we found we could print custom parts locally that outperform default injection-molded plastics.
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Target className="w-4 h-4 text-brand-500" />
                  <span>Our Mission</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To provide South Asian automotive enthusiasts with affordable, engineered 3D printed components without international shipping delay.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Eye className="w-4 h-4 text-neon-500" />
                  <span>Our Vision</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To establish Nepal's premier digital manufacturing hub, making rapid prototyping and replacement parts accessible to all makers.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 32, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative pointer-events-none"
          >
            <div className="absolute inset-0 bg-brand-600/15 rounded-3xl blur-2xl opacity-60" />
            <div className="image-frame p-2.5 bg-surface-card/80 backdrop-blur-sm">
              <img
                src={ABOUT_IMAGE}
                alt="3D printer nozzle extrusion"
                className="w-full h-80 sm:h-[440px] object-cover rounded-2xl brightness-90"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
         CORE VALUES
         ───────────────────────────────────────────────────────── */}
      <section className="bg-surface-card/15 border-y border-white/5 carbon-texture py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-14 space-y-4"
          >
            <span className="section-label">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Our Values
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
              Quality Specs We Code By
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We hold our products to rigid testing guidelines to guarantee you get fitment, resistance, and strength in every single order.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 24, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="card-glass p-6 flex flex-col group relative overflow-hidden text-left h-full"
                  style={{ '--glow': val.glow }}
                >
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${val.color} opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-t-2xl`} />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: `radial-gradient(circle at 50% 0%, var(--glow) 0%, transparent 70%)` }} />

                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${val.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-brand-sm flex-shrink-0 text-white relative z-10`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-400 transition-colors relative z-10">
                    {val.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed flex-grow relative z-10">
                    {val.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
         MEET THE TEAM
         ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14 space-y-4"
        >
          <span className="section-label">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            The Founders
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
            Meet the Makers
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            We are builders, designers, and hobbyists who test every component on our own personal bikes and track builds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <TeamCard key={member.id} member={member} index={i} />
          ))}
        </div>

      </section>

    </div>
  );
}
