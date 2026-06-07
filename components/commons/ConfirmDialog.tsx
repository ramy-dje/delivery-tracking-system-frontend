"use client";

import React, { useEffect } from "react";

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    title,
    message,
    confirmLabel = "Confirm",
    danger = false,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        >
            <div className="w-full max-w-sm rounded-2xl border border-white/8 shadow-2xl overflow-hidden"
                style={{ background: "#0d1117" }}>
                <div className="p-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                        {danger ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                    stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01"
                                    stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        )}
                    </div>
                    <h3 className="font-display text-[15px] font-bold text-white mb-2">{title}</h3>
                    <p className="text-[13px] text-slate-400 leading-relaxed">{message}</p>
                </div>
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-lg text-[13px] text-slate-400 hover:text-white border border-white/8 hover:border-white/15 bg-white/2 hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={danger
                            ? { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }
                            : { background: "linear-gradient(135deg,#fbbf24,#f59e0b)", color: "#030712" }
                        }
                    >
                        {loading && (
                            <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                            </svg>
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}