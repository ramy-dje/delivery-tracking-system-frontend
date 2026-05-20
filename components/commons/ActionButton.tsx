import React from "react";

type ActionBtnProps = {
    onClick?: (e?: any) => void;
    href?: string;
    title?: string;
    children?: React.ReactNode;
    type?: "button" | "submit" | "reset";
    label?: string;
    variant?: "primary" | "amber" | "red" | "slate" | "sky" | "emerald";
    size?: "icon" | "action";
    disabled?: boolean;
    className?: string;
    revealOnHover?: boolean; // ✨ NEW: Dim until hover
};

// Enhanced variants with rest + hover + active states
const variants = {
    primary: {
        rest: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_4px_14px_rgba(245,158,11,0.4)]",
        hover: "hover:from-amber-400 hover:to-amber-500 hover:shadow-[0_6px_20px_rgba(245,158,11,0.6)]",
        active: "active:scale-[0.99]",
    },
    amber: {
        rest: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.1)]",
        hover: "hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-300 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_4px_12px_rgba(251,191,36,0.15)]",
        active: "active:bg-amber-500/30 active:scale-[0.98]",
    },
    red: {
        rest: "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]",
        hover: "hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 hover:shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_4px_12px_rgba(239,68,68,0.15)]",
        active: "active:bg-red-500/30 active:scale-[0.98]",
    },
    slate: {
        rest: "bg-white/5 border-white/15 text-slate-300 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]",
        hover: "hover:bg-white/10 hover:border-white/30 hover:text-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.3)]",
        active: "active:bg-white/15 active:scale-[0.98]",
    },
    sky: {
        rest: "bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.1)]",
        hover: "hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-300 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.2),0_4px_12px_rgba(56,189,248,0.15)]",
        active: "active:bg-sky-500/30 active:scale-[0.98]",
    },
    emerald: {
        rest: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.1)]",
        hover: "hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-300 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_4px_12px_rgba(52,211,153,0.15)]",
        active: "active:bg-emerald-500/30 active:scale-[0.98]",
    },
};

export default function ActionBtn({
    onClick,
    href,
    title,
    children,
    label,
    variant = "slate",
    size = "icon",
    type = "button",
    disabled = false,
    className = "",
    revealOnHover = false, // ✨ Default: always visible
}: ActionBtnProps) {
    const base =
        "flex items-center justify-center rounded-xl border transition-all duration-150 " +
        "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-amber-500/50 " +
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none";

    const sizeStyles =
        size === "icon"
            ? variant === "primary"
                ? "w-10 h-10"
                : "w-9 h-9"
            : variant === "primary"
                ? "px-4 py-2 gap-2 text-[14px] font-semibold"
                : "px-4 py-2.5 gap-2 text-[12px] font-semibold";

    const variantStyles = variants[variant];

    // ✨ REVEAL ON HOVER LOGIC
    const restOpacity = revealOnHover ? "opacity-40 hover:opacity-100" : "opacity-100";
    const restStyles = revealOnHover
        ? "bg-transparent border-transparent text-inherit shadow-none hover:" + variantStyles.rest.replace('hover:', '')
        : variantStyles.rest;

    const hoverStyles = variantStyles.hover;
    const activeStyles = variantStyles.active;

    const borderStyle = variant === "primary" && !revealOnHover ? "border-transparent" : "border";

    const styles = `${base} ${sizeStyles} ${restOpacity} ${restStyles} ${hoverStyles} ${activeStyles} ${borderStyle} ${className}`;

    const content = (
        <>
            {children && <span className="shrink-0">{children}</span>}
            {size === "action" && label && (
                <span className="truncate">{label}</span>
            )}
        </>
    );

    const commonProps = {
        title,
        className: styles,
        "aria-disabled": disabled || undefined,
    };

    if (href) {
        return disabled ? (
            <span {...commonProps} aria-disabled="true">
                {content}
            </span>
        ) : (
            <a href={href} {...commonProps}>
                {content}
            </a>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            {...commonProps}
        >
            {content}
        </button>
    );
}