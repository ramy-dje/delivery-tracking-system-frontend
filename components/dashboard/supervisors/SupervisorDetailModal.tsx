"use client";

import { useEffect, useState } from "react";
import { getSupervisorById } from "@/services/SupervisorService";
import { ISupervisorDetail, IUserData, IBranchData } from "@/types/supervisor";

// ─── Helpers ──────────────────────────────────────────────────────────────

function resolveUserData(userId: string | IUserData): IUserData | null {
    if (typeof userId === "object" && userId !== null) return userId;
    return null;
}

function resolveBranchData(branchId: string | IBranchData): IBranchData | null {
    if (typeof branchId === "object" && branchId !== null) return branchId;
    return null;
}

function formatPermission(perm: string): string {
    return perm.replace(/^can_/, "").replace(/_/g, " ");
}

// ─── Props ────────────────────────────────────────────────────────────────

interface SupervisorDetailModalProps {
    supervisorId: string;
    companyId: string;
    /** branchId is optional — if omitted the modal resolves it from the supervisor record */
    branchId?: string;
    isOpen: boolean;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function SupervisorDetailModal({
    supervisorId,
    companyId,
    branchId: branchIdProp,
    isOpen,
    onClose,
}: SupervisorDetailModalProps) {
    const [supervisor, setSupervisor] = useState<ISupervisorDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !supervisorId || !companyId) return;

        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                // branchIdProp may be undefined — we still call with it; the API endpoint
                // is GET /manager/companies/:companyId/branches/:branchId/supervisor.
                // If your backend supports GET by supervisorId directly, swap here.
                const resolvedBranchId = branchIdProp ?? supervisorId;
                const res = await getSupervisorById(companyId, resolvedBranchId);
                if (mounted) setSupervisor(res.data);
            } catch (e: any) {
                if (mounted) {
                    setError(e?.message ?? "Failed to load supervisor details");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [isOpen, supervisorId, companyId, branchIdProp]);

    if (!isOpen) return null;

    const userData = supervisor ? resolveUserData(supervisor.userId) : null;
    const branchData = supervisor ? resolveBranchData(supervisor.branchId) : null;

    const fullName = userData
        ? `${userData.firstName} ${userData.lastName}`.trim()
        : "—";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-lg rounded-2xl overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: "rgba(251,191,36,0.1)",
                                border: "1px solid rgba(251,191,36,0.2)",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                                    stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">Supervisor Details</div>
                            <div className="text-[11px] text-slate-600">View supervisor information</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 max-h-[68vh] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                            </svg>
                        </div>
                    )}

                    {error && (
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-[13px]"
                            style={{
                                background: "rgba(239,68,68,0.06)",
                                border: "1px solid rgba(239,68,68,0.15)",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {supervisor && (
                        <div className="space-y-5">
                            {/* Name + Email */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Full Name
                                    </label>
                                    <p className="text-[14px] font-semibold text-white mt-1.5">
                                        {fullName}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Email
                                    </label>
                                    <p className="text-[14px] font-semibold text-white mt-1.5 truncate">
                                        {userData?.email ?? "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Phone + Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Phone
                                    </label>
                                    <p className="text-[14px] font-semibold text-white mt-1.5">
                                        {userData?.phone ?? "—"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Status
                                    </label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                background: supervisor.isActive ? "#34d399" : "#475569",
                                            }}
                                        />
                                        <p className="text-[14px] font-semibold" style={{ color: supervisor.isActive ? "#34d399" : "#475569" }}>
                                            {supervisor.isActive ? "Active" : "Inactive"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Branch */}
                            <div className="pt-2 border-t border-white/6">
                                <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                    Assigned Branch
                                </label>
                                <p className="text-[14px] font-semibold text-white mt-1.5">
                                    {branchData?.name ?? (typeof supervisor.branchId === "string" ? supervisor.branchId : "—")}
                                </p>
                                {branchData?.code && (
                                    <p className="text-[11px] text-slate-600 mt-0.5">{branchData.code}</p>
                                )}
                            </div>

                            {/* Permissions */}
                            <div className="pt-2 border-t border-white/6">
                                <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                    Permissions ({supervisor.permissions.length})
                                </label>
                                {supervisor.permissions.length === 0 ? (
                                    <p className="text-[13px] text-slate-600 mt-2 italic">No permissions assigned</p>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {supervisor.permissions.map((perm) => (
                                            <span
                                                key={perm}
                                                className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium capitalize"
                                                style={{
                                                    background: "rgba(251,191,36,0.08)",
                                                    border: "1px solid rgba(251,191,36,0.2)",
                                                    color: "#fbbf24",
                                                }}
                                            >
                                                {formatPermission(perm)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Work Schedule (if available) */}
                            {supervisor.formattedSchedule && Object.keys(supervisor.formattedSchedule).length > 0 && (
                                <div className="pt-2 border-t border-white/6">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Work Schedule
                                    </label>
                                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                                        {Object.entries(supervisor.formattedSchedule).map(([day, schedule]) => (
                                            <div key={day} className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                                            >
                                                <span className="text-[11px] text-slate-500 capitalize">{day.slice(0, 3)}</span>
                                                <span className="text-[11px] text-slate-300">{schedule}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Supervisor ID */}
                            <div className="pt-2 border-t border-white/6">
                                <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                    Supervisor ID
                                </label>
                                <p className="text-[11px] text-slate-600 font-mono mt-1.5">
                                    {supervisor._id}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {supervisor && (
                    <div
                        className="flex items-center justify-between px-6 py-4 border-t"
                        style={{
                            borderColor: "rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.01)",
                        }}
                    >
                        <div className="text-[11px] text-slate-600">
                            Role: Supervisor
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}