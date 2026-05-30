"use client";

import { motion } from "framer-motion";
import AlgeriaMap from "./AlgeriaMap";

const stats = [
  { value: "48K+", label: "Deliveries / day" },
  { value: "99.2%", label: "On-time rate" },
  { value: "58", label: "Wilayas covered" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow top-left */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 65%)",
        }}
      />
      {/* Radial glow right */}
      <div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-0 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 glass-amber rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" style={{ animation: "ping2 1.5s ease-out infinite" }} />
              <span className="font-mono text-xs text-primary tracking-widest uppercase">
                Live in 58 Wilayas
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display font-800 text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-white mb-6"
            >
              Logistics at
              <br />
              <span className="gradient-amber">light speed.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg"
            >
              WaselGo is Algeria&apos;s most advanced delivery management platform.
              Intelligent routing, real-time tracking, and automated dispatch —
              all in one dashboard.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-14"
            >
              <a href="/register" className="btn-primary px-7 py-3.5 rounded-xl text-base">
                Start Free Trial
              </a>
              <a href="#how-it-works" className="btn-outline px-7 py-3.5 rounded-xl text-base flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6.5 5.5L10.5 8L6.5 10.5V5.5Z" fill="currentColor" />
                </svg>
                See How It Works
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-8"
            >
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="font-display font-800 text-2xl text-white mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Algeria Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative flex justify-center"
          >
            <AlgeriaMap />
          </motion.div>
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-20 pt-10 section-divider"
        >
          <div className="flex flex-wrap items-center justify-between gap-6 pt-8">
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono">
              Trusted by leading brands across Algeria
            </p>
            <div className="flex flex-wrap gap-8 items-center">
              {["Jumia DZ", "Yassir", "Ouedkniss", "CEVITAL", "Ooredoo"].map((brand) => (
                <span key={brand} className="text-slate-600 hover:text-slate-400 transition-colors text-sm font-display font-600 tracking-tight">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
