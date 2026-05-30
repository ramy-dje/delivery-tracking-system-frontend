"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback, useMemo } from "react";

type Testimonial = {
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar: string;
    rating: number;
    metric: string;
    metricValue: string;
    industry: string;
};

const testimonials: Testimonial[] = [
    {
        quote:
            "WaselGo cut our average delivery time from 3 days to same-day across Alger. The route AI is genuinely impressive — it adapts better than our veteran dispatchers.",
        author: "Nassim Belouizdad",
        role: "Head of Operations",
        company: "AlgeriaMart",
        avatar: "NB",
        rating: 5,
        metric: "faster delivery",
        metricValue: "75%",
        industry: "E-commerce",
    },
    {
        quote:
            "We integrated WaselGo via API in an afternoon. The webhooks are solid and the analytics dashboard surfaced problems we didn't even know we had.",
        author: "Dina Ferhat",
        role: "CTO",
        company: "QuickDeliver DZ",
        avatar: "DF",
        rating: 5,
        metric: "integration time",
        metricValue: "1 day",
        industry: "Tech",
    },
    {
        quote:
            "Before WaselGo, managing 60 drivers was chaos. Now dispatch is fully automated, driver accountability is through the roof, and our customers love the live tracking.",
        author: "Amine Zerrouk",
        role: "Founder",
        company: "ZipCourier",
        avatar: "AZ",
        rating: 5,
        metric: "drivers managed",
        metricValue: "60+",
        industry: "Logistics",
    },
    {
        quote:
            "The POD capture alone saved us countless disputes. Proof of delivery is now instant and legally defensible. Worth every dinar.",
        author: "Leila Mansouri",
        role: "Logistics Director",
        company: "CEVA Algeria",
        avatar: "LM",
        rating: 5,
        metric: "delivery disputes",
        metricValue: "Zero",
        industry: "Freight",
    },
    {
        quote:
            "Scaled from 200 to 3,000 deliveries/day on the same plan. WaselGo didn't even flinch. Rock-solid infrastructure.",
        author: "Yacine Hadjadj",
        role: "CEO",
        company: "ExpressBox",
        avatar: "YH",
        rating: 5,
        metric: "volume growth",
        metricValue: "15x",
        industry: "Parcel",
    },
    {
        quote:
            "Support team responds in under 10 minutes. Every. Single. Time. That alone sets WaselGo apart from every other logistics SaaS in the region.",
        author: "Samira Boudjelal",
        role: "E-commerce Manager",
        company: "Style.dz",
        avatar: "SB",
        rating: 5,
        metric: "avg response",
        metricValue: "<10min",
        industry: "Fashion",
    },
];

const marqueeItems = [
    { value: "500+", label: "Active Businesses" },
    { value: "2.1M", label: "Deliveries / Month" },
    { value: "99.97%", label: "Uptime SLA" },
    { value: "4.9/5", label: "Avg Rating" },
    { value: "48", label: "Wilayas Covered" },
    { value: "<200ms", label: "API Latency" },
    { value: "500+", label: "Active Businesses" },
    { value: "2.1M", label: "Deliveries / Month" },
    { value: "99.97%", label: "Uptime SLA" },
    { value: "4.9/5", label: "Avg Rating" },
    { value: "48", label: "Wilayas Covered" },
    { value: "<200ms", label: "API Latency" },
];

// Deterministic particles to fix hydration mismatch caused by Math.random()
const staticParticles = [
    { id: 0, delay: 0, x: "15%", y: "20%", size: 4 },
    { id: 1, delay: 0.5, x: "85%", y: "15%", size: 3 },
    { id: 2, delay: 1, x: "45%", y: "70%", size: 5 },
    { id: 3, delay: 1.5, x: "70%", y: "40%", size: 3.5 },
    { id: 4, delay: 2, x: "25%", y: "85%", size: 4.5 },
    { id: 5, delay: 2.5, x: "90%", y: "75%", size: 3 },
    { id: 6, delay: 3, x: "10%", y: "55%", size: 4 },
    { id: 7, delay: 3.5, x: "60%", y: "10%", size: 5.5 },
    { id: 8, delay: 4, x: "35%", y: "30%", size: 3 },
    { id: 9, delay: 4.5, x: "80%", y: "90%", size: 4 },
    { id: 10, delay: 5, x: "50%", y: "45%", size: 3.5 },
    { id: 11, delay: 5.5, x: "20%", y: "65%", size: 5 },
];

function Stars({ count }: { count: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
                <motion.svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 15 }}
                >
                    <path
                        d="M7 1L8.545 5.09L13 5.09L9.455 7.91L10.727 12L7 9.32L3.273 12L4.545 7.91L1 5.09L5.455 5.09L7 1Z"
                        fill="url(#starGrad)"
                    />
                    <defs>
                        <linearGradient id="starGrad" x1="0" y1="0" x2="14" y2="14">
                            <stop offset="0%" stopColor="#fde68a" />
                            <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                    </defs>
                </motion.svg>
            ))}
        </div>
    );
}

function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                left: x,
                top: y,
                width: size,
                height: size,
                background: "rgba(251,191,36,0.2)",
                boxShadow: "0 0 6px rgba(251,191,36,0.3)",
            }}
            animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8],
            }}
            transition={{
                duration: 6 + delay * 2,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
            }}
        />
    );
}

function TestimonialCard({ t, index, inView }: { t: Testimonial; index: number; inView: boolean }) {
    const cardRef = useRef<HTMLDivElement>(null);
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
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
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
            ref={cardRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
                duration: 0.7,
                delay: 0.15 + index * 0.1,
                ease: [0.22, 1, 0.36, 1],
            }}
            className="break-inside-avoid group relative"
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
                    className="relative rounded-2xl p-6 h-full overflow-hidden transition-all duration-500"
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
                                background: "radial-gradient(circle at 100% 0%, rgba(251,191,36,0.08) 0%, transparent 70%)",
                            }}
                        />
                    </motion.div>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-5 relative z-10">
                        <Stars count={t.rating} />
                        <span
                            className="text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-md transition-colors duration-300"
                            style={{
                                color: isHovered ? "rgba(251,191,36,0.7)" : "rgba(255,255,255,0.25)",
                                background: isHovered ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.03)",
                                border: `1px solid ${isHovered ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)"}`,
                            }}
                        >
                            {t.industry}
                        </span>
                    </div>

                    {/* Quote */}
                    <div className="relative mt-1 mb-6 z-10">
                        <svg
                            className="absolute -top-1 -left-1 text-white/[0.04] select-none"
                            width="28"
                            height="28"
                            viewBox="0 0 32 32"
                            fill="currentColor"
                        >
                            <path d="M10 8h-2c-2.2 0-4 1.8-4 4v2h4v8H2v-8c0-4.4 3.6-8 8-8v2zm14 0h-2c-2.2 0-4 1.8-4 4v2h4v8h-6v-8c0-4.4 3.6-8 8-8v2z" />
                        </svg>
                        <p className="text-slate-300 text-[13.5px] leading-[1.8] relative z-10 pl-5">
                            {t.quote}
                        </p>
                    </div>

                    {/* Metric badge */}
                    <div className="mb-5 relative z-10">
                        <div
                            className="inline-flex items-center gap-3 px-3.5 py-2.5 rounded-xl relative overflow-hidden transition-all duration-300"
                            style={{
                                background: isHovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                                border: `1px solid ${isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                            }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300"
                                style={{
                                    background: isHovered ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)",
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                                    <path
                                        d="M2 6.5L4.5 9L10 3"
                                        stroke={isHovered ? "#fbbf24" : "rgba(255,255,255,0.3)"}
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ transition: "stroke 0.3s" }}
                                    />
                                </svg>
                            </div>
                            <div>
                                <div
                                    className="font-display font-800 text-base leading-none transition-colors duration-300"
                                    style={{ color: isHovered ? "#ffffff" : "rgba(255,255,255,0.7)" }}
                                >
                                    {t.metricValue}
                                </div>
                                <div className="text-slate-500 text-[10px] mt-0.5 tracking-wide">
                                    {t.metric}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Author section */}
                    <div
                        className="flex items-center gap-3 pt-4 relative z-10"
                        style={{
                            borderTop: "1px solid rgba(255,255,255,0.04)",
                        }}
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <motion.div
                                className="absolute -inset-[1.5px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))",
                                }}
                            />
                            <div
                                className="relative w-10 h-10 rounded-lg flex items-center justify-center font-display font-700 text-xs"
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                                    color: "rgba(255,255,255,0.7)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                }}
                            >
                                {t.avatar}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white/90 truncate transition-colors duration-300 group-hover:text-white">
                                {t.author}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                                {t.role} <span className="text-slate-700 mx-1">·</span>{" "}
                                <span className="text-slate-600">{t.company}</span>
                            </div>
                        </div>

                        {/* Arrow icon on hover */}
                        <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={false}
                            animate={isHovered ? { x: 0, opacity: 1 } : { x: -5, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                className="text-slate-500"
                            >
                                <path
                                    d="M10 4L4 10M10 4H6M10 4V8"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </motion.div>
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

function AnimatedCounter({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex items-center gap-3 px-6 py-3 shrink-0">
            <span className="font-display font-800 text-lg text-white/80 whitespace-nowrap">{value}</span>
            <span className="text-xs text-slate-500 whitespace-nowrap">{label}</span>
            <div className="w-1 h-1 rounded-full bg-white/10 shrink-0" />
        </div>
    );
}

export default function Testimonials() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section id="testimonials" className="relative py-32 overflow-hidden">
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
                {/* Floating particles */}
                {staticParticles.map((p) => (
                    <FloatingParticle key={p.id} {...p} />
                ))}
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

                {/* Header */}
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
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                        </span>
                        <span className="font-mono text-[11px] text-amber-400/80 tracking-[0.2em] uppercase">
                            Customer Stories
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="font-display font-800 text-4xl md:text-5xl lg:text-7xl text-white mb-6 leading-[0.95]"
                    >
                        Teams who
                        <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #d97706 100%)",
                            }}
                        >
                            ship smarter.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed"
                    >
                        Join 500+ businesses across Algeria that trust WaselGo
                        <br className="hidden sm:block" /> for their delivery operations.
                    </motion.p>
                </div>

                {/* Scrolling metrics marquee */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-16 relative overflow-hidden"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{
                        background: "linear-gradient(90deg, rgb(3 7 18), transparent)"
                    }} />
                    <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{
                        background: "linear-gradient(-90deg, rgb(3 7 18), transparent)"
                    }} />

                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.04)",
                        }}
                    >
                        <motion.div
                            className="flex"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                x: {
                                    duration: 30,
                                    repeat: Infinity,
                                    ease: "linear",
                                },
                            }}
                        >
                            {marqueeItems.map((item, i) => (
                                <AnimatedCounter
                                    key={i}
                                    value={item.value}
                                    label={item.label}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Testimonials Grid */}
                <div
                    className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5"
                    style={{ perspective: "1200px" }}
                >
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={i} t={t} index={i} inView={inView} />
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-20 relative"
                >
                    <div
                        className="relative rounded-3xl p-px max-w-2xl mx-auto overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06))",
                        }}
                    >
                        {/* Animated border shimmer */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background:
                                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
                                backgroundSize: "200% 100%",
                            }}
                            animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                        />

                        <div
                            className="relative rounded-3xl px-8 py-10 md:px-12 md:py-12 text-center"
                            style={{
                                background: "linear-gradient(135deg, rgba(6,9,15,1), rgba(10,12,18,1))",
                                backdropFilter: "blur(20px)",
                            }}
                        >
                            {/* Decorative dots */}
                            <div className="flex justify-center gap-1.5 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 h-1 rounded-full bg-white/20"
                                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                                        transition={{
                                            duration: 2,
                                            delay: i * 0.2,
                                            repeat: Infinity,
                                        }}
                                    />
                                ))}
                            </div>

                            <h3 className="font-display font-800 text-2xl md:text-3xl text-white mb-3">
                                Ready to join them?
                            </h3>
                            <p className="text-slate-500 text-sm md:text-base mb-8 max-w-sm mx-auto leading-relaxed">
                                Start your 14-day free trial and see why teams choose WaselGo.
                            </p>

                            <motion.a
                                href="/register"
                                className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold overflow-hidden"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                    color: "#030712",
                                    boxShadow: "0 0 20px rgba(251,191,36,0.1), 0 4px 15px rgba(0,0,0,0.3)",
                                }}
                            >
                                <span className="relative z-10">Get Started Free</span>
                                <motion.svg
                                    className="relative z-10"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <path
                                        d="M3 8H13M13 8L9 4M13 8L9 12"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </motion.svg>
                                <motion.div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background:
                                            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                                        backgroundSize: "200% 100%",
                                    }}
                                    animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                                    transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
                                />
                            </motion.a>

                            <p className="text-slate-600 text-[11px] mt-4 font-mono tracking-wide">
                                NO CREDIT CARD REQUIRED
                            </p>
                        </div>
                    </div>
                </motion.div>
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