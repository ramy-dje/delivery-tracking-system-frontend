// components/ui/GlassEffectCard/GlassStatCard.tsx
import { ReactNode } from "react";

export interface GlassStatCardProps {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    secondaryValue?: ReactNode;
    badge?: { label: string; color?: "amber" | "emerald" | "slate" };
    emptyState?: { label: string; icon?: ReactNode };
    accentColor?: "amber" | "emerald" | "violet" | "rose" | "cyan";
    className?: string;
}

export function GlassStatCard({
    icon,
    label,
    value,
    secondaryValue,
    badge,
    emptyState,
    accentColor = "amber",
    className = "",
}: GlassStatCardProps) {
    const accent = {
        amber: { primary: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.14)" },
        emerald: { primary: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.14)" },
        violet: { primary: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.14)" },
        rose: { primary: "#fb7185", bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.14)" },
        cyan: { primary: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.14)" },
    }[accentColor];

    const badgeColors = {
        amber: { bg: "rgba(251,191,36,0.07)", color: "rgba(251,191,36,0.65)", border: "rgba(251,191,36,0.1)" },
        emerald: { bg: "rgba(52,211,153,0.07)", color: "rgba(52,211,153,0.65)", border: "rgba(52,211,153,0.1)" },
        slate: { bg: "rgba(100,116,139,0.07)", color: "rgba(148,163,184,0.65)", border: "rgba(100,116,139,0.1)" },
    };

    if (emptyState && !value) {
        return (
            <div
                className={`gef-stat rounded-xl p-3.5 ${className}`}
                style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(255,255,255,0.062)",
                }}
            >
                <div className="flex items-center gap-2 mb-2.5">
                    <div
                        className="w-5.5 h-5.5 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
                    >
                        {icon}
                    </div>
                    <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    {emptyState.icon || <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                    <p className="text-[11.5px] italic" style={{ color: "rgba(100,116,139,0.6)" }}>
                        {emptyState.label}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`gef-stat rounded-xl p-3.5 ${className}`}
            style={{
                background: "rgba(255,255,255,0.022)",
                border: "1px solid rgba(255,255,255,0.062)",
            }}
        >
            <div className="flex items-center gap-2 mb-2.5">
                <div
                    className="w-5.5 h-5.5 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
                >
                    {icon}
                </div>
                <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
            </div>

            <div className="text-[13.5px] font-semibold text-white leading-tight tracking-tight">
                {value}
            </div>

            {secondaryValue && (
                <p
                    className="text-[11px] mt-1 font-medium"
                    style={{ color: accent.primary, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}
                >
                    {secondaryValue}
                </p>
            )}

            {badge && (
                <span
                    className="inline-flex items-center mt-2 text-[9.5px] px-1.5 py-0.5 rounded-md font-semibold"
                    style={badgeColors[badge.color || "amber"]}
                >
                    {badge.label}
                </span>
            )}
        </div>
    );
}