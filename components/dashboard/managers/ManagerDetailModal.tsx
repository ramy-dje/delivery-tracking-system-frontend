"use client";

import { useEffect, useState } from "react";
import { getManagerById } from "@/services/ManagerService";
import { IManagerDetail } from "@/types/manager";
import { tr } from "date-fns/locale";

interface ManagerDetailModalProps {
    managerId: string;
    companyId: string;
    isOpen: boolean;
    onClose: () => void;
    onReassignClick?: () => void;
}

export default function ManagerDetailModal({
    managerId,
    companyId,
    isOpen,
    onClose,
    onReassignClick,
}: ManagerDetailModalProps) {
    const [manager, setManager] = useState<IManagerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !managerId || !companyId) return;

        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getManagerById(companyId, managerId);
                if (mounted) setManager(data);
            } catch (e: any) {
                if (mounted) {
                    setError(e?.message ?? "Failed to load manager details");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => { mounted = false; };
    }, [isOpen, managerId, companyId]);

    if (!isOpen) return null;

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
                            <div className="text-[14px] font-semibold text-white">Manager Details</div>
                            <div className="text-[11px] text-slate-600">View and manage manager information</div>
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

                    {manager && (
                        <div className="space-y-5">
                            {/* Name + Email */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Full Name
                                    </label>
                                    <p className="text-[14px] font-semibold text-white mt-1.5">
                                        {manager.fullName}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Email
                                    </label>
                                    <p className="text-[14px] font-semibold text-white mt-1.5 truncate">
                                        {manager.email}
                                    </p>
                                </div>
                            </div>

                            {/* Role + Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Role
                                    </label>
                                    <p className="text-[14px] font-semibold text-amber-300 mt-1.5">
                                        {manager.role}
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
                                                background: manager.isActive ? "#34d399" : "#475569",
                                            }}
                                        />
                                        <p className="text-[14px] font-semibold" style={{ color: manager.isActive ? "#34d399" : "#475569" }}>
                                            {manager.isActive ? "Active" : "Inactive"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Node Assignment */}
                            <div className="pt-2 border-t border-white/6">
                                <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                    Assigned Node
                                </label>
                                {manager.logisticsNodeName ? (
                                    <div className="mt-2 space-y-2">
                                        <p className="text-[14px] font-semibold text-white">
                                            {manager.logisticsNodeName}
                                        </p>
                                        {manager.nodeName && (
                                            <p className="text-[12px] text-slate-500">
                                                Name: {manager.nodeName}
                                            </p>
                                        )}
                                        {manager.nodeType && (
                                            <p className="text-[12px] text-slate-500">
                                                Type: {manager.nodeType}
                                            </p>
                                        )}
                                        {manager.logisticsNodeId && (
                                            <p className="text-[11px] text-slate-600 font-mono">
                                                ID: {manager.logisticsNodeId}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-slate-600 italic mt-2">
                                        No node assigned
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            {manager.phoneNumber && (
                                <div className="pt-2 border-t border-white/6">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Phone Number
                                    </label>
                                    <p className="text-[14px] font-semibold text-white mt-1.5">
                                        {manager.phoneNumber}
                                    </p>
                                </div>
                            )}

                            {/* Company ID */}
                            {manager.companyId && (
                                <div className="pt-2 border-t border-white/6">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                        Company ID
                                    </label>
                                    <p className="text-[11px] text-slate-600 font-mono mt-1.5">
                                        {manager.companyId}
                                    </p>
                                </div>
                            )}

                            {/* Manager ID */}
                            <div className="pt-2 border-t border-white/6">
                                <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                                    Manager ID
                                </label>
                                <p className="text-[11px] text-slate-600 font-mono mt-1.5">
                                    {manager.id}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {manager && (
                    <div
                        className="flex items-center justify-between px-6 py-4 border-t"
                        style={{
                            borderColor: "rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.01)",
                        }}
                    >
                        <div className="text-[11px] text-slate-600">
                            Manager {manager.logisticsNodeName ? "assigned to" : "not assigned to"} <span className="font-semibold text-slate-400">{manager.logisticsNodeName || "any node"}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all"
                            >
                                Close
                            </button>
                            {onReassignClick && (
                                <button
                                    type="button"
                                    onClick={onReassignClick}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
                                    style={{
                                        background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                                        boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M7 16a5 5 0 016-9m6 6a5 5 0 01-6 9"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                        />
                                        <path
                                            d="M7 16H3v4m14-4h4v4"
                                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                        />
                                    </svg>
                                    Reassign Node
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
