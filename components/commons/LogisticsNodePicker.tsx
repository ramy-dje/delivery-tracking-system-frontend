"use client";

import { useEffect, useRef, useState } from "react";
import { listBranches } from "@/services/BranchService";
import { IBranchResponse, NodeType } from "@/types/branch";

// ─── Type icons / colors ─────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    Hub: { icon: "⬡", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.22)" },
    Branch: { icon: "◈", color: "#22d3ee", bg: "rgba(34,211,238,0.07)", border: "rgba(34,211,238,0.22)" },
    MainHub: { icon: "▣", color: "#a78bfa", bg: "rgba(167,139,250,0.07)", border: "rgba(167,139,250,0.22)" },
};

// ─── Props ────────────────────────────────────────────────────────────────

interface LogisticsNodePickerProps {
    value: string | null;
    onChange: (nodeId: string | null) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function LogisticsNodePicker({
    value,
    onChange,
    label = "Logistics Node",
    placeholder = "Select a node (optional)",
    required = false,
    error,
}: LogisticsNodePickerProps) {
    const [open, setOpen] = useState(false);
    const [nodes, setNodes] = useState<IBranchResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Load nodes when dropdown opens
    useEffect(() => {
        if (!open || nodes.length > 0) return;
        (async () => {
            setLoading(true);
            try {
                const res = await listBranches({ pageSize: 100 });
                setNodes(res.items ?? res ?? []);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        })();
    }, [open]);

    const selected = nodes.find((n) => n.id === value) ?? null;

    const filtered = nodes.filter((n) => {
        const q = search.toLowerCase();
        return (
            n.name.toLowerCase().includes(q) ||
            n.code?.toLowerCase().includes(q) ||
            n.type?.toLowerCase().includes(q)
        );
    });

    const handleSelect = (node: IBranchResponse | null) => {
        onChange(node ? node.id : null);
        setOpen(false);
        setSearch("");
    };

    const m = selected ? (TYPE_META[selected.type] ?? TYPE_META.Branch) : null;

    return (
        <div className="flex flex-col gap-1.5" ref={ref}>
            {/* Label */}
            {label && (
                <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    {label}
                    {required && <span className="text-amber-400 ml-0.5">*</span>}
                </label>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="relative flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                    background: "rgba(255,255,255,0.03)",
                    border: error
                        ? "1px solid rgba(239,68,68,0.45)"
                        : open
                            ? "1px solid rgba(251,191,36,0.35)"
                            : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: open ? "0 0 0 3px rgba(251,191,36,0.07)" : "none",
                }}
            >
                {/* Selected badge */}
                {selected && m ? (
                    <>
                        <span
                            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] shrink-0"
                            style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
                        >
                            {m.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-white truncate">{selected.name}</div>
                            <div className="text-[10px] text-slate-600 font-mono truncate">{selected.code}</div>
                        </div>

                        {/* ✅ FIX: Use span instead of button for the clear action */}
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); handleSelect(null); }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSelect(null);
                                }
                            }}
                            className="ml-auto text-slate-600 hover:text-slate-400 transition-colors shrink-0 cursor-pointer"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </span>
                    </>
                ) : (
                    <>
                        <svg className="text-slate-700 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        <span className="flex-1 text-[13px] text-slate-600">{placeholder}</span>
                        <svg
                            className="text-slate-700 shrink-0 transition-transform duration-150"
                            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                        >
                            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </>
                )}
                {!selected && (
                    <svg
                        className="text-slate-700 shrink-0 transition-transform duration-150 absolute right-3"
                        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                        width="12" height="12" viewBox="0 0 24 24" fill="none"
                    >
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            {/* Error */}
            {error && (
                <p className="text-[11px] text-red-400">{error}</p>
            )}

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden shadow-2xl"
                    style={{
                        background: "#0a0f1a",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(251,191,36,0.06)",
                        // Position relative to parent - works with relative container
                        top: "calc(100% + 6px)",
                        left: 0,
                        position: "absolute",
                        minWidth: "100%",
                    }}
                >
                    {/* Search */}
                    <div
                        className="flex items-center gap-2 px-3 py-2.5 border-b"
                        style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    >
                        <svg className="text-slate-700 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search nodes…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none"
                        />
                    </div>

                    {/* Options */}
                    <div className="max-h-52 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <svg className="animate-spin text-amber-400" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                                </svg>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-8 text-center text-[12px] text-slate-600">
                                {search ? "No nodes match your search" : "No nodes available"}
                            </div>
                        ) : (
                            <>
                                {/* None option */}
                                {!required && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(null)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[12.5px] text-slate-500 hover:bg-white/[0.03] transition-colors border-b"
                                        style={{ borderColor: "rgba(255,255,255,0.04)" }}
                                    >
                                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] border"
                                            style={{ borderColor: "rgba(255,255,255,0.08)", color: "#475569" }}>
                                            —
                                        </span>
                                        No node assigned
                                    </button>
                                )}
                                {filtered.map((node) => {
                                    const nm = TYPE_META[node.type] ?? TYPE_META.Branch;
                                    const isSelected = node.id === value;
                                    return (
                                        <button
                                            key={node.id}
                                            type="button"
                                            onClick={() => handleSelect(node)}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
                                            style={{
                                                background: isSelected ? "rgba(251,191,36,0.06)" : "transparent",
                                                borderLeft: isSelected ? "2px solid rgba(251,191,36,0.4)" : "2px solid transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.025)";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                            }}
                                        >
                                            <span
                                                className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] shrink-0"
                                                style={{ background: nm.bg, border: `1px solid ${nm.border}`, color: nm.color }}
                                            >
                                                {nm.icon}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[12.5px] font-medium text-slate-200 truncate">{node.name}</div>
                                                <div className="text-[10px] text-slate-600 font-mono truncate">
                                                    {node.code}
                                                    {node.wilaya?.nameFr ? ` · ${node.wilaya.nameFr}` : ""}
                                                </div>
                                            </div>
                                            <span
                                                className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                                                style={{ background: nm.bg, color: nm.color, border: `1px solid ${nm.border}` }}
                                            >
                                                {node.type}
                                            </span>
                                            {isSelected && (
                                                <svg className="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17l-5-5" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}