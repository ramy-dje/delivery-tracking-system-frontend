"use client";

import { useEffect, useState } from "react";
import { getStaffById } from "@/services/StaffService";
import { IStaffResponse } from "@/types/staff";

const ROLE_META: Record<string, { color: string; bg: string; border: string }> = {
    Driver: { color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.22)" },
    TruckDriver: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.22)" },
    LeadDriver: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.22)" },
    Sorter: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.22)" },
    Receptionist: { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.22)" },
    InventoryAuditor: { color: "#fb7185", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.22)" },
    ShiftSupervisor: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)" },
    SecurityOfficer: { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.22)" },
};
const FALLBACK = { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" };

function getRoleMeta(role: string) { return ROLE_META[role] ?? FALLBACK; }
function getRoleLabel(role: string) { return role.replace(/([A-Z])/g, " $1").trim(); }
function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-700">{label}</span>
            <span className={`text-[13px] text-slate-300 ${mono ? "font-mono text-[11px] text-slate-500" : "font-medium"}`}>{value}</span>
        </div>
    );
}

interface StaffDetailModalProps {
    isOpen: boolean;
    staffId: string;
    onClose: () => void;
}

export default function StaffDetailModal({ isOpen, staffId, onClose }: StaffDetailModalProps) {
    const [staff, setStaff] = useState<IStaffResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !staffId) return;
        let mounted = true;
        (async () => {
            setLoading(true); setError(null);
            try {
                const data = await getStaffById(staffId);
                if (mounted) setStaff(data);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? "Failed to load staff details");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [isOpen, staffId]);

    if (!isOpen) return null;

    const m = staff ? getRoleMeta(staff.role) : FALLBACK;
    const isActive = staff ? staff.isActive !== false : false;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-md rounded-2xl overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div>
                        <div className="text-[14px] font-semibold text-white">Staff Details</div>
                        <div className="text-[11px] text-slate-600">Profile and assignment info</div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 max-h-[68vh] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <svg className="animate-spin text-amber-400" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                            </svg>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-[13px]" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                            {error}
                        </div>
                    )}

                    {staff && (
                        <div className="space-y-5">
                            {/* Avatar + name hero */}
                            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0"
                                    style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}
                                >
                                    {getInitials(staff.fullName)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[15px] font-semibold text-white truncate">{staff.fullName}</div>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span
                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold"
                                            style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                                        >
                                            {getRoleLabel(staff.role)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#34d399" : "#475569", boxShadow: isActive ? "0 0 5px rgba(52,211,153,0.5)" : "none" }} />
                                            <span className="text-[11px]" style={{ color: isActive ? "#34d399" : "#475569" }}>{isActive ? "Active" : "Inactive"}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div
                                className="p-4 rounded-xl space-y-3"
                                style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                                <div className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-slate-700 mb-2">Contact</div>
                                <div className="flex items-center gap-2.5">
                                    <svg className="shrink-0 opacity-40" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#64748b" strokeWidth="1.5" />
                                        <polyline points="22,6 12,13 2,6" stroke="#64748b" strokeWidth="1.5" />
                                    </svg>
                                    <span className="text-[12.5px] text-slate-400">{staff.email}</span>
                                </div>
                                {(staff as any).phoneNumber && (
                                    <div className="flex items-center gap-2.5">
                                        <svg className="shrink-0 opacity-40" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92z"
                                                stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <a href={`tel:${(staff as any).phoneNumber}`} className="text-[12.5px] font-semibold text-slate-300 hover:text-amber-400 transition-colors">
                                            {(staff as any).phoneNumber}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Node assignment */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                                <div className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-slate-700 mb-3">Node Assignment</div>
                                <div className="flex items-center gap-2">
                                    <svg className="shrink-0 opacity-50" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-[11px] font-mono text-slate-500 break-all">{staff.logisticNodeId}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}