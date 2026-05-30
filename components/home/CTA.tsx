// 'use client';

// import { motion } from 'framer-motion';
// import { useInView } from 'framer-motion';
// import { useRef } from 'react';

// export default function CTA() {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: '-100px' });

//   return (
//     <section className="relative py-24 lg:py-32 overflow-hidden" ref={ref}>
//       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
//           className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden"
//         >
//           {/* Background */}
//           <div className="absolute inset-0 bg-gradient-to-br from-[#6C3AFF] via-[#8B5CF6] to-[#00D4AA]" />
//           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />

//           {/* Decorative elements */}
//           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
//           <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

//           <div className="relative z-10 px-8 py-16 lg:px-16 lg:py-24 text-center">
//             <motion.h2
//               initial={{ opacity: 0, y: 20 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ delay: 0.2, duration: 0.7 }}
//               className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight mb-6"
//             >
//               Ready to transform your
//               <br />
//               delivery operations?
//             </motion.h2>

//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ delay: 0.3, duration: 0.7 }}
//               className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-10"
//             >
//               Join 500+ businesses across Algeria that ship smarter with WaselGo.
//               Start your free 14-day trial today — no credit card required.
//             </motion.p>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ delay: 0.4, duration: 0.7 }}
//               className="flex flex-col sm:flex-row items-center justify-center gap-4"
//             >
//               <motion.a
//                 href="#"
//                 className="btn-shine w-full sm:w-auto px-10 py-4 text-base font-semibold text-[#6C3AFF] bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
//                 whileHover={{ scale: 1.03, y: -2 }}
//                 whileTap={{ scale: 0.97 }}
//               >
//                 Start Free Trial
//                 <span className="ml-2">→</span>
//               </motion.a>

//               <motion.a
//                 href="#"
//                 className="w-full sm:w-auto px-10 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all duration-300"
//                 whileHover={{ scale: 1.03, y: -2 }}
//                 whileTap={{ scale: 0.97 }}
//               >
//                 Schedule a Demo
//               </motion.a>
//             </motion.div>

//             {/* Trust badges */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={isInView ? { opacity: 1 } : {}}
//               transition={{ delay: 0.6, duration: 0.7 }}
//               className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm"
//             >
//               <span className="flex items-center gap-2">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
//                   <polyline points="22 4 12 14.01 9 11.01" />
//                 </svg>
//                 No credit card required
//               </span>
//               <span className="flex items-center gap-2">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
//                   <polyline points="22 4 12 14.01 9 11.01" />
//                 </svg>
//                 14-day free trial
//               </span>
//               <span className="flex items-center gap-2">
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
//                   <polyline points="22 4 12 14.01 9 11.01" />
//                 </svg>
//                 Cancel anytime
//               </span>
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }


"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function CTA() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section className="relative py-28">
            <div className="max-w-7xl mx-auto px-6">
                <div className="section-divider mb-20" />

                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(34,211,238,0.06) 50%, rgba(52,211,153,0.06) 100%)",
                        border: "1px solid rgba(251,191,36,0.18)",
                    }}
                >
                    {/* Decorative grid */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />

                    {/* Corner glows */}
                    <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 65%)" }}
                    />
                    <div className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 65%)" }}
                    />

                    {/* Decorative icon grid */}
                    <div className="absolute top-8 right-8 opacity-10">
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                            <circle cx="60" cy="60" r="55" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 4" />
                            <circle cx="60" cy="60" r="35" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" />
                            <circle cx="60" cy="60" r="15" stroke="#fbbf24" strokeWidth="1" />
                            <line x1="5" y1="60" x2="115" y2="60" stroke="#fbbf24" strokeWidth="0.5" />
                            <line x1="60" y1="5" x2="60" y2="115" stroke="#fbbf24" strokeWidth="0.5" />
                        </svg>
                    </div>

                    <div className="relative px-8 md:px-16 py-16 md:py-20 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="inline-flex items-center gap-2 glass-amber rounded-full px-4 py-1.5 mb-8"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                            <span className="font-mono text-xs text-amber-400 tracking-widest uppercase">
                                14-Day Free Trial · No Card Required
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="font-display font-800 text-4xl md:text-6xl text-white mb-6 leading-[1.05]"
                        >
                            Ready to deliver
                            <br />
                            <span className="gradient-amber">at full speed?</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-slate-400 text-lg mb-10 max-w-lg mx-auto"
                        >
                            Join 500+ Algerian businesses already running on WaselGo.
                            Set up in minutes. Deliver in hours.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-wrap gap-4 justify-center"
                        >
                            <a href="/register" className="btn-primary px-8 py-4 rounded-xl text-base">
                                Start Free Trial →
                            </a>
                            <a href="#" className="btn-outline px-8 py-4 rounded-xl text-base">
                                Book a Demo
                            </a>
                        </motion.div>

                        {/* Social proof row */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600"
                        >
                            {[
                                "✓ SOC 2 Compliant",
                                "✓ 99.98% Uptime SLA",
                                "✓ GDPR Ready",
                                "✓ Algerian data residency",
                            ].map((item) => (
                                <span key={item}>{item}</span>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}