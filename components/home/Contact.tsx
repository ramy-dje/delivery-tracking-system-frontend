"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Mail, Tag, CheckCircle } from "lucide-react";

export default function Contact() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    const [form, setForm] = useState({ email: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // Simulate send — replace with real API call as needed
        setTimeout(() => {
            setLoading(false);
            setSent(true);
        }, 1200);
    }

    return (
        <section id="contact" className="relative py-28">
            <div className="max-w-7xl mx-auto px-6">
                <div className="section-divider mb-20" />

                {/* Section header */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 glass-amber rounded-full px-4 py-1.5 mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        <span className="font-mono text-xs text-amber-400 tracking-widest uppercase">
                            Get in Touch
                        </span>
                    </div>
                    <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-[1.05]">
                        Let&apos;s talk{" "}
                        <span className="gradient-amber">delivery</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Have a question, a partnership idea, or just want to see WaselGo in action?
                        Drop us a message and we&apos;ll get back to you within 24 hours.
                    </p>
                </motion.div>

                <div className="max-w-3xl mx-auto">
                    {/* Form card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative rounded-2xl overflow-hidden"
                        style={{
                            background: "linear-gradient(145deg, #06090f, #0d1117)",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    >
                        {/* Corner glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
                            style={{ background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)" }}
                        />

                        <div className="relative p-8">
                            {sent ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="flex flex-col items-center justify-center py-12 text-center gap-4"
                                >
                                    <div className="inline-flex p-4 rounded-full"
                                        style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}>
                                        <CheckCircle size={32} className="text-emerald-400" />
                                    </div>
                                    <h3 className="font-display font-bold text-2xl text-white">Message sent!</h3>
                                    <p className="text-slate-400 text-sm max-w-xs">
                                        Thanks for reaching out. We&apos;ll get back to you at{" "}
                                        <span className="text-amber-400">{form.email}</span> within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => { setSent(false); setForm({ email: "", subject: "", message: "" }); }}
                                        className="btn-outline px-6 py-2.5 rounded-xl text-sm mt-2"
                                    >
                                        Send another
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-mono text-[10px] tracking-widest uppercase text-slate-500">
                                            Your Email
                                        </label>
                                        <div className="relative">
                                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="you@company.com"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                                                style={{
                                                    background: "rgba(255,255,255,0.04)",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                }}
                                                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(251,191,36,0.35)")}
                                                onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-mono text-[10px] tracking-widest uppercase text-slate-500">
                                            Subject
                                        </label>
                                        <div className="relative">
                                            <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                                            <input
                                                type="text"
                                                name="subject"
                                                required
                                                value={form.subject}
                                                onChange={handleChange}
                                                placeholder="How can we help?"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                                                style={{
                                                    background: "rgba(255,255,255,0.04)",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                }}
                                                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(251,191,36,0.35)")}
                                                onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
                                            />
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="font-mono text-[10px] tracking-widest uppercase text-slate-500">
                                            Message
                                        </label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={handleChange}
                                            placeholder="Tell us about your delivery needs, team size, or any questions…"
                                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none resize-none transition-all duration-200"
                                            style={{
                                                background: "rgba(255,255,255,0.04)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                            onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(251,191,36,0.35)")}
                                            onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)")}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <Send size={15} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

    );
}
