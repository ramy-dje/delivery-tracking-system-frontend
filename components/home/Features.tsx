"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#fbbf24" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="#fbbf24" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="#fbbf24" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    title: "Intelligent Route Optimization",
    description: "AI-powered routing that adapts in real-time to traffic, weather, and delivery windows across Algeria's 58 wilayas.",
    tag: "AI-Powered",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="1.8" />
        <path d="M12 6V12L16 14" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Real-Time GPS Tracking",
    description: "Sub-second location updates for every parcel and driver. Your customers always know exactly where their order is.",
    tag: "Live",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#34d399" strokeWidth="1.8" />
        <path d="M8 12H16M8 8H16M8 16H12" stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Automated Dispatch",
    description: "Smart assignment algorithms match orders to drivers based on proximity, capacity, and performance score.",
    tag: "Automation",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18 20V10M12 20V4M6 20V14" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Analytics Dashboard",
    description: "Deep operational insights — delivery rates, driver performance, zone heat maps, and revenue trends.",
    tag: "Insights",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#a78bfa" strokeWidth="1.8" />
        <path d="M2 12H22M12 2C9.33 6.67 8 9.33 8 12C8 14.67 9.33 17.33 12 22M12 2C14.67 6.67 16 9.33 16 12C16 14.67 14.67 17.33 12 22" stroke="#a78bfa" strokeWidth="1.8" />
      </svg>
    ),
    title: "API-First Platform",
    description: "RESTful API and webhooks for deep integration with your existing e-commerce stack, ERP, or CRM systems.",
    tag: "Developer",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#fbbf24" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "POD & Signature Capture",
    description: "Electronic proof of delivery with photo capture, OTP confirmation, and digital signatures on every order.",
    tag: "Compliance",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  // Fix: Add type parameter to useRef
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 25,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Card body */}
        <div
          className="relative rounded-2xl p-6 h-full overflow-hidden transition-all duration-500 cursor-default"
          style={{
            background: isHovered
              ? "linear-gradient(145deg, rgba(15,18,25,1) 0%, rgba(10,12,18,1) 100%)"
              : "linear-gradient(145deg, rgba(10,12,18,1) 0%, rgba(8,9,14,1) 100%)",
            border: isHovered
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(255,255,255,0.04)",
            boxShadow: isHovered
              ? "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)"
              : "0 10px 30px -10px rgba(0,0,0,0.3)",
          }}
        >
          {/* Hover corner glow */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="absolute top-0 right-0 w-full h-full"
              style={{
                background: "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)",
              }}
            />
          </motion.div>

          <div className="relative z-10">
            <div
              className="mb-5 inline-flex p-2.5 rounded-xl transition-all duration-300"
              style={{
                background: isHovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
              }}
            >
              {feature.icon}
            </div>

            <div className="font-mono text-[10px] mb-3 tracking-widest uppercase text-primary/70 group-hover:text-primary transition-colors">
              {feature.tag}
            </div>

            <h3 className="font-display font-700 text-lg text-white/90 mb-3 leading-tight transition-colors duration-300 group-hover:text-white">
              {feature.title}
            </h3>

            <p className="text-sm text-slate-500 leading-relaxed transition-colors duration-300 group-hover:text-slate-400">
              {feature.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Ambient glow beneath card */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-10 rounded-full blur-3xl pointer-events-none"
        animate={{
          opacity: isHovered ? 0.15 : 0,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.5 }}
        style={{
          background: "radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Clean Background Layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Sharp divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-px mb-24 origin-left"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03) 60%, transparent)",
          }}
        />

        <div ref={ref} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 mb-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="font-mono text-[11px] text-slate-500 tracking-[0.2em] uppercase">
              Everything You Need
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-800 text-4xl md:text-5xl lg:text-7xl text-white mb-6 leading-[0.95]"
          >
            Built for serious
            <br />
            <span
              className="bg-clip-text text-transparent bg-gradient-primary"
            >
              logistics teams.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed"
          >
            Every feature is crafted to reduce friction, increase delivery speed,
            and give you full operational visibility.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgb(3 7 18), transparent)",
        }}
      />
    </section>
  );
}