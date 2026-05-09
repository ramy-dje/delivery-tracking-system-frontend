import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
    tone?: "default" | "danger" | "warning";
}

export default function EmptyState({
    title,
    description,
    icon: Icon,
    actionLabel,
    onAction,
    tone = "default",
}: EmptyStateProps) {
    const styles = {
        default: {
            bg: "rgba(148,163,184,0.06)",
            border: "rgba(148,163,184,0.12)",
            glow: "rgba(148,163,184,0.06)",
            icon: "#94a3b8",
        },
        warning: {
            bg: "rgba(251,191,36,0.06)",
            border: "rgba(251,191,36,0.12)",
            glow: "rgba(251,191,36,0.06)",
            icon: "#fbbf24",
        },
        danger: {
            bg: "rgba(239,68,68,0.06)",
            border: "rgba(239,68,68,0.12)",
            glow: "rgba(239,68,68,0.06)",
            icon: "#ef4444",
        },
    }[tone];

    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            {/* Icon container */}
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{
                    background: styles.bg,
                    border: `1px solid ${styles.border}`,
                    boxShadow: `0 0 40px ${styles.glow}`,
                }}
            >
                <Icon size={26} color={styles.icon} strokeWidth={1.5} />
            </div>

            {/* Title */}
            <p className="text-[15px] font-semibold text-slate-300 mb-1">
                {title}
            </p>

            {/* Description */}
            {description && (
                <p className="text-[13px] text-slate-600 max-w-60 leading-relaxed">
                    {description}
                </p>
            )}

            {/* Action */}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-6 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                    style={{
                        background:
                            tone === "danger"
                                ? "linear-gradient(135deg,#ef4444,#dc2626)"
                                : "linear-gradient(135deg,#fbbf24,#f59e0b)",
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}