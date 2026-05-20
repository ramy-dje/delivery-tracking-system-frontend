// components/ui/GlassEffectCard/GlassHero.tsx
import { ReactNode } from "react";

export interface GlassHeroProps {
    title: string;
    subtitle?: string;
    statusLabel?: string | ReactNode;
    isActive?: boolean;
    metaItems?: Array<{
        icon: ReactNode;
        value: string;
        muted?: boolean;
    }>;
    accentColor?: "amber" | "emerald" | "violet" | "rose" | "cyan" | "red";
    children?: ReactNode;
}

export function GlassHero({
    title,
    subtitle,
    statusLabel,
    isActive = false,
    metaItems = [],
    accentColor = "amber",
    children,
}: GlassHeroProps) {
    const accent = {
        amber: {
            heroBg: "linear-gradient(135deg, rgba(251,191,36,0.065) 0%, rgba(255,255,255,0.018) 100%)",
            heroBorder: "rgba(251,191,36,0.11)",
            pulse: "#34d399",
        },
        emerald: {
            heroBg: "linear-gradient(135deg, rgba(52,211,153,0.065) 0%, rgba(255,255,255,0.018) 100%)",
            heroBorder: "rgba(52,211,153,0.11)",
            pulse: "#34d399",
        },
        violet: {
            heroBg: "linear-gradient(135deg, rgba(129,140,248,0.065) 0%, rgba(255,255,255,0.018) 100%)",
            heroBorder: "rgba(129,140,248,0.11)",
            pulse: "#818cf8",
        },
        rose: {
            heroBg: "linear-gradient(135deg, rgba(251,113,133,0.065) 0%, rgba(255,255,255,0.018) 100%)",
            heroBorder: "rgba(251,113,133,0.11)",
            pulse: "#fb7185",
        },
        cyan: {
            heroBg: "linear-gradient(135deg, rgba(34,211,238,0.065) 0%, rgba(255,255,255,0.018) 100%)",
            heroBorder: "rgba(34,211,238,0.11)",
            pulse: "#22d3ee",
        },
        red: {
            heroBg: "linear-gradient(135deg, rgba(239,68,68,0.065) 0%, rgba(255,255,255,0.018) 100%)",
            heroBorder: "rgba(239,68,68,0.11)",
            pulse: "#ef4444",
        },
    }[accentColor];

    return (
        <div
            className="gef-hero rounded-xl p-4 relative overflow-hidden"
            style={{
                background: accent.heroBg,
                border: `1px solid ${accent.heroBorder}`,
            }}
        >
            <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex-1 min-w-0">
                    <p className="text-[20px] font-semibold text-white tracking-[-0.02em] leading-tight truncate">
                        {title}
                    </p>
                    {subtitle && (
                        <p
                            className="text-[11px] mt-1 truncate"
                            style={{ color: "rgba(148,163,184,0.55)", fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                {statusLabel && (
                    typeof statusLabel === "string" ? (
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                            style={{
                                background: isActive
                                    ? "rgba(52,211,153,0.08)"
                                    : "rgba(100,116,139,0.08)",
                                border: `1px solid ${isActive
                                    ? "rgba(52,211,153,0.2)"
                                    : "rgba(100,116,139,0.14)"
                                    }`,
                            }}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${isActive ? "gef-pulse" : ""
                                    }`}
                                style={{
                                    background: isActive ? accent.pulse : "#475569",
                                }}
                            />

                            <span
                                className="text-[10px] font-bold uppercase tracking-widest"
                                style={{
                                    color: isActive ? accent.pulse : "#64748b",
                                }}
                            >
                                {statusLabel}
                            </span>
                        </div>
                    ) : (
                        <div className="shrink-0">
                            {statusLabel}
                        </div>
                    )
                )}
            </div>

            {metaItems.length > 0 && (
                <div
                    className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 relative z-10"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}
                >
                    {metaItems.map((item, i, arr) => (
                        <span key={i} className="flex items-center gap-1">
                            <span className="flex items-center gap-1.5" style={{ color: item.muted ? "rgba(100,116,139,0.6)" : "rgba(148,163,184,0.65)" }}>
                                <span style={{ color: "rgba(100,116,139,0.5)" }}>{item.icon}</span>
                                <span className="text-[11px]">{item.value}</span>
                            </span>
                            {i < arr.length - 1 && (
                                <span className="ml-4 inline-block w-px h-3 bg-white/10" />
                            )}
                        </span>
                    ))}
                </div>
            )}

            {children}
        </div>
    );
}