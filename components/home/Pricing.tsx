"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
    {
        name: "Starter",
        price: { monthly: 4900, yearly: 3900 },
        currency: "DA",
        description: "Perfect for small e-commerce businesses starting to scale.",
        features: [
            "Up to 500 deliveries/month",
            "3 driver accounts",
            "Real-time GPS tracking",
            "Basic analytics",
            "Email & SMS notifications",
            "API access",
        ],
        highlight: false,
        cta: "Start Free Trial",
        borderColor: "border-blue-500/30",
        iconColor: "text-blue-400",
    },
    {
        name: "Growth",
        price: { monthly: 14900, yearly: 11900 },
        currency: "DA",
        description: "For growing operations that need automation and scale.",
        features: [
            "Up to 5,000 deliveries/month",
            "25 driver accounts",
            "AI route optimization",
            "Advanced analytics & heatmaps",
            "Priority dispatch",
            "POD + signature capture",
            "Webhook integrations",
            "Dedicated support",
        ],
        highlight: true,
        cta: "Get Started",
        badge: "Most Popular",
        borderColor: "border-amber-500/40",
        iconColor: "text-amber-400",
    },
    {
        name: "Enterprise",
        price: { monthly: null, yearly: null },
        currency: "DA",
        description: "Custom contracts for large fleets and enterprise logistics.",
        features: [
            "Unlimited deliveries",
            "Unlimited drivers",
            "Custom SLA guarantees",
            "White-label app",
            "On-premise option",
            "Dedicated account manager",
            "Custom integrations",
            "24/7 phone support",
        ],
        highlight: false,
        cta: "Contact Sales",
        borderColor: "border-purple-500/30",
        iconColor: "text-purple-400",
    },
];

export default function Pricing() {
    const [yearly, setYearly] = useState(false);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section id="pricing" className="relative py-28 overflow-hidden">
            {/* Enhanced background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px]"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 50%)",
                    }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[600px] h-[600px]"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 50%)",
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="section-divider mb-20" />

                <div ref={ref} className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="font-mono text-xs text-amber-400 tracking-widest uppercase">
                            Transparent Pricing
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="font-display font-800 text-4xl md:text-5xl lg:text-6xl text-white mb-6"
                    >
                        Scale without{" "}
                        <span className="gradient-amber">surprises.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-400 text-lg max-w-xl mx-auto mb-8"
                    >
                        Start with a 14-day free trial. No credit card required. All plans
                        include real-time tracking and our core analytics suite.
                    </motion.p>

                    {/* Enhanced Toggle */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="inline-flex items-center gap-1 p-1 glass rounded-full"
                    >
                        <button
                            onClick={() => setYearly(false)}
                            className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${!yearly
                                ? "bg-amber-400 text-ink-950 shadow-lg shadow-amber-400/25"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setYearly(true)}
                            className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${yearly
                                ? "bg-amber-400 text-ink-950 shadow-lg shadow-amber-400/25"
                                : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Yearly
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                                -20%
                            </span>
                        </button>
                    </motion.div>
                </div>

                {/* Enhanced Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                            className={`relative rounded-2xl p-1 transition-all duration-300 hover:-translate-y-2 ${plan.highlight
                                ? "bg-gradient-to-b from-amber-400/20 via-amber-400/10 to-transparent"
                                : "bg-gradient-to-b from-white/5 to-transparent"
                                }`}
                        >
                            <div
                                className={`relative rounded-xl p-8 h-full flex flex-col backdrop-blur-sm ${plan.highlight
                                    ? "bg-ink-950 border border-amber-400/20"
                                    : "bg-ink-950/80 border border-white/10"
                                    }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-ink-950 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-amber-400/25">
                                            {plan.badge}
                                        </div>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="mb-8">
                                    <div
                                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br`}
                                    >
                                        <span className={`text-xl ${plan.iconColor}`}>
                                            {plan.name === "Starter" && "🚀"}
                                            {plan.name === "Growth" && "⚡"}
                                            {plan.name === "Enterprise" && "🏢"}
                                        </span>
                                    </div>
                                    <h3 className="font-display font-700 text-xl text-white mb-2">
                                        {plan.name}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Price */}
                                <div className="mb-8">
                                    {plan.price.monthly ? (
                                        <>
                                            <div className="flex items-end gap-1 mb-1">
                                                <span className="font-display font-800 text-5xl text-white">
                                                    {(yearly ? plan.price.yearly : plan.price.monthly)?.toLocaleString()}
                                                </span>
                                                <span className="text-slate-400 mb-2 font-mono text-sm">
                                                    {plan.currency}/mo
                                                </span>
                                            </div>
                                            {yearly && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-500 line-through">
                                                        {plan.price.monthly?.toLocaleString()} {plan.currency}
                                                    </span>
                                                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                                        Save 20%
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="font-display font-800 text-4xl text-white">
                                            Custom
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3.5 mb-8 flex-1">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm">
                                            <div
                                                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlight
                                                    ? "bg-amber-400/20"
                                                    : "bg-white/5"
                                                    }`}
                                            >
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 12 12"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M3 6L5 8L9 4"
                                                        stroke={plan.highlight ? "#fbbf24" : "#22d3ee"}
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                            <span className="text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <a
                                    href="/register"
                                    className={`text-center py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${plan.highlight
                                        ? "btn-primary shadow-lg shadow-amber-400/25"
                                        : "btn-outline"
                                        }`}
                                >
                                    {plan.cta}
                                    <span className="ml-1">→</span>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-6 glass rounded-2xl px-8 py-4">
                        {[
                            "14-day free trial",
                            "No credit card required",
                            "Cancel anytime",
                            "Algerian data residency",
                        ].map((item) => (
                            <div
                                key={item}
                                className="flex items-center gap-2 text-sm text-slate-400"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <circle cx="8" cy="8" r="7" fill="rgba(52,211,153,0.2)" />
                                    <path
                                        d="M5 8L7 10L11 6"
                                        stroke="#34d399"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                {item}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}