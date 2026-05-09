// components/ui/GlassEffectCard/GlassEffectCard.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { X } from "lucide-react";

export interface GlassEffectCardProps {
    isOpen: boolean;
    onClose?: () => void;
    onBackdropClick?: () => void;
    title?: string;
    subtitle?: string;
    headerIcon?: ReactNode;
    showCloseButton?: boolean;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
    maxHeight?: string;
    accentColor?: "amber" | "emerald" | "violet" | "rose" | "cyan";
    withNoise?: boolean;
    withSweep?: boolean;
    withAvatarGlow?: boolean;
    className?: string;
}

const ACCENT_COLORS = {
    amber: {
        primary: "#fbbf24",
        gradient: "linear-gradient(135deg, rgba(251,191,36,0.16) 0%, rgba(217,119,6,0.09) 100%)",
        border: "rgba(251,191,36,0.26)",
        glow: "radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 68%)",
        sweep: "rgba(251,191,36,0.04)",
        heroBg: "linear-gradient(135deg, rgba(251,191,36,0.065) 0%, rgba(255,255,255,0.018) 100%)",
        heroBorder: "rgba(251,191,36,0.11)",
    },
    emerald: {
        primary: "#34d399",
        gradient: "linear-gradient(135deg, rgba(52,211,153,0.16) 0%, rgba(16,185,129,0.09) 100%)",
        border: "rgba(52,211,153,0.26)",
        glow: "radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 68%)",
        sweep: "rgba(52,211,153,0.04)",
        heroBg: "linear-gradient(135deg, rgba(52,211,153,0.065) 0%, rgba(255,255,255,0.018) 100%)",
        heroBorder: "rgba(52,211,153,0.11)",
    },
    violet: {
        primary: "#818cf8",
        gradient: "linear-gradient(135deg, rgba(129,140,248,0.16) 0%, rgba(79,70,229,0.09) 100%)",
        border: "rgba(129,140,248,0.26)",
        glow: "radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 68%)",
        sweep: "rgba(129,140,248,0.04)",
        heroBg: "linear-gradient(135deg, rgba(129,140,248,0.065) 0%, rgba(255,255,255,0.018) 100%)",
        heroBorder: "rgba(129,140,248,0.11)",
    },
    rose: {
        primary: "#fb7185",
        gradient: "linear-gradient(135deg, rgba(251,113,133,0.16) 0%, rgba(225,29,72,0.09) 100%)",
        border: "rgba(251,113,133,0.26)",
        glow: "radial-gradient(circle, rgba(251,113,133,0.14) 0%, transparent 68%)",
        sweep: "rgba(251,113,133,0.04)",
        heroBg: "linear-gradient(135deg, rgba(251,113,133,0.065) 0%, rgba(255,255,255,0.018) 100%)",
        heroBorder: "rgba(251,113,133,0.11)",
    },
    cyan: {
        primary: "#22d3ee",
        gradient: "linear-gradient(135deg, rgba(34,211,238,0.16) 0%, rgba(8,145,178,0.09) 100%)",
        border: "rgba(34,211,238,0.26)",
        glow: "radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 68%)",
        sweep: "rgba(34,211,238,0.04)",
        heroBg: "linear-gradient(135deg, rgba(34,211,238,0.065) 0%, rgba(255,255,255,0.018) 100%)",
        heroBorder: "rgba(34,211,238,0.11)",
    },
} as const;

export default function GlassEffectCard({
    isOpen,
    onClose,
    onBackdropClick,
    title,
    subtitle,
    headerIcon,
    showCloseButton = true,
    children,
    footer,
    maxWidth = "476px",
    maxHeight = "92vh",
    accentColor = "amber",
    withNoise = true,
    withSweep = true,
    withAvatarGlow = true,
    className = "",
}: GlassEffectCardProps) {
    const [mounted, setMounted] = useState(false);
    const accent = ACCENT_COLORS[accentColor];

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setMounted(true), 10);
            return () => clearTimeout(timer);
        } else {
            setMounted(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

                .gef-root { font-family: 'DM Sans', sans-serif; }

                .gef-backdrop {
                    animation: gefBackdropIn 0.18s ease both;
                }
                @keyframes gefBackdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                .gef-card {
                    transition: transform 0.3s cubic-bezier(0.34, 1.28, 0.64, 1), opacity 0.22s ease;
                }
                .gef-card.is-in  { transform: translateY(0)   scale(1);    opacity: 1; }
                .gef-card.is-out { transform: translateY(14px) scale(0.97); opacity: 0; }

                /* Amber sweep on header */
                .gef-header-sweep {
                    position: relative;
                    overflow: hidden;
                }
                .gef-header-sweep::after {
                    content: '';
                    position: absolute;
                    top: 0; left: -80%;
                    width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(251,191,36,0.04), transparent);
                    animation: gefSweep 5s ease-in-out infinite;
                    pointer-events: none;
                }
                @keyframes gefSweep {
                    0%   { left: -80%; }
                    100% { left: 130%; }
                }

                /* Avatar glow ring */
                .gef-avatar-glow {
                    position: relative;
                }
                .gef-avatar-glow::after {
                    content: '';
                    position: absolute;
                    inset: -5px;
                    border-radius: 16px;
                    background: radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 68%);
                    pointer-events: none;
                }

                /* Identity hero: corner rays */
                .gef-hero {
                    position: relative;
                    overflow: hidden;
                }
                .gef-hero::before {
                    content: '';
                    position: absolute;
                    top: -30px; right: -30px;
                    width: 120px; height: 120px;
                    background: radial-gradient(circle, rgba(251,191,36,0.09) 0%, transparent 65%);
                    pointer-events: none;
                }
                .gef-hero::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0;
                    width: 80px; height: 50px;
                    background: radial-gradient(ellipse, rgba(251,191,36,0.04) 0%, transparent 70%);
                    pointer-events: none;
                }

                /* Stat card hover */
                .gef-stat {
                    transition: transform 0.17s ease, border-color 0.17s ease, box-shadow 0.17s ease;
                    cursor: default;
                }
                .gef-stat:hover {
                    transform: translateY(-2px);
                    border-color: rgba(251,191,36,0.18) !important;
                    box-shadow: 0 8px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(251,191,36,0.07);
                }

                /* Pulse for active status dot */
                .gef-pulse { animation: gefPulse 2.2s ease-in-out infinite; }
                @keyframes gefPulse {
                    0%, 100% { box-shadow: 0 0 0 0   rgba(52,211,153,0.55); }
                    55%      { box-shadow: 0 0 0 5px  rgba(52,211,153,0);   }
                }

                /* License badge */
                .gef-badge {
                    transition: background 0.14s ease, border-color 0.14s ease, transform 0.14s ease;
                }
                .gef-badge:hover {
                    background: rgba(251,191,36,0.1) !important;
                    border-color: rgba(251,191,36,0.28) !important;
                    transform: scale(1.05);
                }

                /* Section divider */
                .gef-divider {
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 100%);
                }

                /* Noise texture */
                .gef-noise::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
                    pointer-events: none;
                    border-radius: inherit;
                }

                /* Close button */
                .gef-close {
                    transition: background 0.14s, border-color 0.14s, color 0.14s;
                    border: 1px solid transparent;
                }
                .gef-close:hover {
                    background: rgba(255,255,255,0.07);
                    border-color: rgba(255,255,255,0.09);
                    color: #e2e8f0 !important;
                }

                /* Scrollbar */
                .gef-scroll::-webkit-scrollbar       { width: 3px; }
                .gef-scroll::-webkit-scrollbar-track { background: transparent; }
                .gef-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }
                .gef-scroll::-webkit-scrollbar-thumb:hover { background: rgba(251,191,36,0.22); }
            `}</style>

            {/* ─── BACKDROP ─── */}
            <div
                className="gef-root gef-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{
                    background: "rgba(0,0,0,0.8)",
                    backdropFilter: "blur(9px)"
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onBackdropClick?.();
                        onClose?.();
                    }
                }}
            >
                {/* ─── CARD ─── */}
                <div
                    className={`gef-card gef-noise relative w-full rounded-2xl flex flex-col ${mounted ? "is-in" : "is-out"} ${withNoise ? 'gef-noise' : ''} ${className}`}
                    style={{
                        maxWidth,
                        maxHeight,
                        background: "linear-gradient(158deg, #0c1525 0%, #070c15 55%, #080e1a 100%)",
                        border: "1px solid rgba(255,255,255,0.072)",
                        boxShadow: [
                            "0 52px 120px rgba(0,0,0,0.82)",
                            "0 0 0 1px rgba(251,191,36,0.055)",
                            "inset 0 1px 0 rgba(255,255,255,0.055)",
                        ].join(", "),
                    }}
                >
                    {/* ── HEADER ── */}
                    {(title || headerIcon) && (
                        <div
                            className={`gef-header-sweep flex items-center justify-between px-5 py-4 shrink-0 rounded-t-2xl ${withSweep ? 'gef-header-sweep' : ''}`}
                            style={{
                                borderBottom: "1px solid rgba(255,255,255,0.055)",
                                background: `linear-gradient(180deg, ${accent.sweep} 0%, transparent 100%)`,
                            }}
                        >
                            <div className="flex items-center gap-3.5">
                                {headerIcon && (
                                    <div className={withAvatarGlow ? "gef-avatar-glow relative" : "relative"}>
                                        <div
                                            className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: accent.gradient,
                                                border: `1px solid ${accent.border}`,
                                                boxShadow: `0 4px 18px ${accent.border.replace('0.26', '0.12')}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                                            }}
                                        >
                                            {headerIcon}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    {title && (
                                        <p className="text-[13.5px] font-semibold text-white tracking-[-0.01em] leading-tight">
                                            {title}
                                        </p>
                                    )}
                                    {subtitle && (
                                        <p
                                            className="text-[10px] mt-0.5 tracking-[0.08em]"
                                            style={{ color: "rgba(148,163,184,0.45)", fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {showCloseButton && onClose && (
                                <button
                                    onClick={onClose}
                                    className="gef-close w-7 h-7 flex items-center justify-center rounded-lg"
                                    style={{ color: "rgba(148,163,184,0.5)" }}
                                >
                                    <X size={13} strokeWidth={1.9} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── BODY ── */}
                    <div className="gef-scroll px-5 py-5 overflow-y-auto flex-1">
                        {children}
                    </div>

                    {/* ── FOOTER ── */}
                    {footer && (
                        <div
                            className="flex items-center justify-between px-5 py-3.5 shrink-0 rounded-b-2xl"
                            style={{
                                borderTop: "1px solid rgba(255,255,255,0.05)",
                                background: "rgba(0,0,0,0.22)",
                            }}
                        >
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}