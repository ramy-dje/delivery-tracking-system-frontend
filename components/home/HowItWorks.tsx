"use client";

import { motion, useInView, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
    number: string;
    title: string;
    description: string;
    detail: string;
    side: "left" | "right";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const steps: Step[] = [
    {
        number: "01",
        title: "Connect Your Store",
        description:
            "Link Shopify, WooCommerce, or any platform via our API in under 5 minutes. Orders flow in automatically.",
        detail: "50+ integrations available",
        side: "left",
    },
    {
        number: "02",
        title: "AI Assigns Drivers",
        description:
            "WaselGo analyzes real-time traffic, driver proximity, and delivery zones to auto-dispatch the best available courier.",
        detail: "~3 sec average dispatch time",
        side: "right",
    },
    {
        number: "03",
        title: "Live Tracking",
        description:
            "Both you and your customer get a live tracking link. Drivers capture POD photos and signatures on delivery.",
        detail: "Sub-second GPS updates",
        side: "left",
    },
    {
        number: "04",
        title: "Analyze & Scale",
        description:
            "Your dashboard surfaces bottlenecks, peak hours, and zone performance so you can optimize continuously.",
        detail: "300+ metrics tracked",
        side: "right",
    },
    {
        number: "05",
        title: "Instant Payouts",
        description:
            "Drivers get paid instantly after delivery confirmation. No more waiting days for weekly settlements.",
        detail: "< 10 sec settlement",
        side: "left",
    },
];

// ─── Curved timeline SVG path ─────────────────────────────────────────────────

const TIMELINE_PATH =
    "M 250,60 C 400,60 400,220 100,220 C -100,220 -100,390 150,390 C 400,390 400,560 100,560 C -100,560 -100,730 150,730 C 400,730 400,900 250,900";

const PATH_LENGTH = 2200;


// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({
    step,
    isActive,
}: {
    step: Step;
    isActive: boolean;
}) {
    const isLeft = step.side === "left";

    return (
        <div
            className={`relative w-full overflow-hidden rounded-2xl border p-6 md:p-8 transition-all duration-500
        ${isActive
                    ? "border-amber-400/40 bg-linear-to-br from-amber-400/5 to-transparent shadow-[0_0_30px_rgba(251,191,36,0.1)]"
                    : "border-white/10 bg-slate-900/50 shadow-lg"
                }`}
        >

            {/* Active shimmer */}
            {isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-400/5 to-transparent animate-shimmer" />
            )}

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className={`flex items-center gap-4 mb-5 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                    {/* Number */}
                    <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 font-mono text-lg font-bold transition-all duration-500
            ${isActive ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/20 bg-white/5 text-white/40"}`}>
                        {isActive && (
                            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
                        )}
                        {step.number}
                    </div>



                    {/* Label */}
                    <span className={`flex-1 font-mono text-xs tracking-widest uppercase transition-all duration-500
            ${isLeft ? "text-right" : "text-left"}
            ${isActive ? "text-amber-400/70" : "text-white/30"}
          `}>
                        Step {step.number}
                    </span>
                </div>

                {/* Title */}
                <h3 className={`mb-3 text-2xl font-bold transition-all duration-500
          ${isLeft ? "text-left" : "text-right"}
          ${isActive ? "text-white" : "text-white/60"}
        `}>
                    {step.title}
                </h3>

                {/* Description */}
                <p className={`mb-5 text-[15px] leading-relaxed transition-all duration-500
          ${isLeft ? "text-left" : "text-right"}
          ${isActive ? "text-slate-300" : "text-slate-500"}
        `}>
                    {step.description}
                </p>

                {/* Detail badge */}
                <div className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
                    <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 transition-all duration-500
            ${isActive ? "border-amber-400/30 bg-amber-400/5" : "border-white/10 bg-white/5"}
          `}>
                        <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500
              ${isActive ? "bg-amber-400 animate-pulse" : "bg-white/30"}
            `} />
                        <span className={`font-mono text-xs transition-all duration-500
              ${isActive ? "text-amber-400" : "text-white/40"}
            `}>
                            {step.detail}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Curved Timeline ──────────────────────────────────────────────────────────

function CurvedTimeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(-1);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    });

    // Smooth spring for timeline fill
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        mass: 0.2,
        restDelta: 0.001
    });

    // Derived values using useTransform
    const strokeDashoffset = useTransform(smoothProgress, (v) => PATH_LENGTH * (1 - v));

    // Calculate active step
    useEffect(() => {
        const unsubscribe = smoothProgress.on("change", (latest) => {
            const step = Math.min(Math.floor(latest * steps.length), steps.length - 1);
            setActiveStep(step);
        });
        return unsubscribe;
    }, [smoothProgress]);

    return (
        <div ref={containerRef} className="relative py-8 md:py-16">
            {/* SVG Timeline */}
            <div className="pointer-events-none absolute inset-0 hidden md:block" style={{ zIndex: 0 }}>
                <svg
                    className="absolute left-1/2 -translate-x-1/2 h-full"
                    style={{ width: "500px", overflow: "visible" }}
                    preserveAspectRatio="none"
                    viewBox="0 0 500 960"
                >
                    <defs>
                        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                            <stop offset="30%" stopColor="#f59e0b" stopOpacity="1" />
                            <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                            <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4" />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feFlood floodColor="#fbbf24" floodOpacity="0.15" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Ghost path */}
                    <path
                        d={TIMELINE_PATH}
                        fill="none"
                        stroke="rgba(251,191,36,0.06)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Animated fill - FIXED: using useTransform for strokeDashoffset */}
                    <motion.path
                        d={TIMELINE_PATH}
                        fill="none"
                        stroke="url(#pathGrad)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={PATH_LENGTH}
                        style={{
                            strokeDashoffset,
                            filter: "url(#softGlow)",
                        }}
                    />
                </svg>
            </div>

            {/* Steps */}
            <div className="relative z-10 mx-auto max-w-5xl space-y-28 px-4 md:px-8">
                {steps.map((step, index) => {
                    const isActive = activeStep >= index;
                    const isLeft = step.side === "left";

                    return (
                        <motion.div
                            key={index}
                            className={`flex items-center gap-6 md:gap-10 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                            initial={{ opacity: 0, x: isLeft ? -60 : 60, y: 15 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1],
                                delay: index * 0.03
                            }}
                        >
                            {/* Mobile step dot */}
                            <div className="shrink-0 md:hidden">
                                <motion.div
                                    className="relative flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-sm font-bold text-amber-400"
                                    animate={isActive ? {
                                        scale: [1, 1.12, 1],
                                        boxShadow: [
                                            "0 0 0 0 rgba(251,191,36,0.3)",
                                            "0 0 0 12px rgba(251,191,36,0)",
                                            "0 0 0 0 rgba(251,191,36,0)"
                                        ]
                                    } : {}}
                                    transition={{
                                        duration: 1.8,
                                        repeat: isActive ? Infinity : 0,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {step.number}
                                </motion.div>
                            </div>

                            {/* Card */}
                            <div className="w-full md:w-[45%]">
                                <StepCard
                                    step={step}
                                    isActive={isActive}
                                />
                            </div>

                            {/* Spacer */}
                            <div className="hidden md:block md:w-[10%]" />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function HowItWorks() {
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    // Smoother background scale with spring + transform
    const rawScale = useTransform(scrollYProgress, [0, 1], [1, 0.97]);
    const bgScale = useSpring(rawScale, { stiffness: 80, damping: 25, mass: 0.3 });

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className="relative overflow-hidden py-20"
            style={{ background: "#030712" }}
        >
            {/* Radial bg glows */}
            <div className="pointer-events-none absolute inset-0">
                <motion.div
                    className="absolute left-1/4 top-1/4 h-150 w-150 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 75%)",
                        opacity: 0.35,
                    }}
                    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 h-125 w-125 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 75%)",
                        opacity: 0.25,
                    }}
                    animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </div>

            <motion.div style={{ scale: bgScale }} className="will-change-transform">
                {/* ── Section Header ── */}
                <div className="mx-auto mb-16 max-w-4xl px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2"
                        style={{
                            background: "rgba(251,191,36,0.07)",
                            borderColor: "rgba(251,191,36,0.28)",
                        }}
                    >
                        <motion.span
                            className="h-1.5 w-1.5 rounded-full bg-amber-400"
                            animate={{
                                scale: [1, 1.7, 1],
                                opacity: [1, 0.5, 1],
                                boxShadow: [
                                    "0 0 0 0 rgba(251,191,36,0.4)",
                                    "0 0 0 10px rgba(251,191,36,0)",
                                    "0 0 0 0 rgba(251,191,36,0)"
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <span className="font-mono text-xs tracking-[0.2em] text-amber-400 uppercase">
                            The Journey
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-5 text-4xl font-black leading-[1.1] text-white md:text-5xl lg:text-6xl"
                    >
                        How{" "}
                        <span
                            style={{
                                backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundSize: "200% 200%",
                            }}
                        >
                            delivery magic
                        </span>
                        <br />
                        happens
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400"
                    >
                        Follow the journey of an order from your store to your customer&apos;s door.
                        Every step is optimized for speed and transparency.
                    </motion.p>
                </div>

                {/* ── Timeline ── */}
                <CurvedTimeline />

            </motion.div>

            {/* Bottom fade */}
            <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
                style={{
                    background: "linear-gradient(to top, #030712 10%, rgba(3,7,18,0.8) 40%, transparent 100%)"
                }}
            />
        </section>
    );
}