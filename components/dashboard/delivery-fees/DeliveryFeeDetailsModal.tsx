"use client";

import { useEffect, useState } from "react";
import { getDeliveryFeeById } from "@/services/DeliveryFeeService";
import { IDeliveryFeeSummary, DeliveryType } from "@/types/deliveryFee";
import { formatFee, getDeliveryTypeMeta } from "./DeliveryFeeRow";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-700">{label}</span>
            <span className="text-[13px] font-medium text-slate-300">{value}</span>
        </div>
    );
}

interface DeliveryFeeDetailModalProps {
    isOpen: boolean;
    feeId: string;
    onClose: () => void;
}

export default function DeliveryFeeDetailModal({ isOpen, feeId, onClose }: DeliveryFeeDetailModalProps) {
    const [fee, setFee] = useState<IDeliveryFeeSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !feeId) return;
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getDeliveryFeeById(feeId);
                if (mounted) setFee(data);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? "Failed to load delivery fee details");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [isOpen, feeId]);

    if (!isOpen) return null;

    const m = fee ? getDeliveryTypeMeta(fee.deliveryType) : { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)", label: "" };
    const isActive = fee ? fee.isActive !== false : false;

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
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(56,189,248,0.05)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div>
                        <div className="text-[14px] font-semibold text-white">Fee Details</div>
                        <div className="text-[11px] text-slate-600">Pricing and route information</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 max-h-[68vh] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <svg className="animate-spin text-sky-400" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                            </svg>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 text-[13px]" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                            {error}
                        </div>
                    )}

                    {fee && (
                        <div className="space-y-4">
                            {/* Route hero */}
                            <div
                                className="flex items-center gap-4 p-4 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: m.bg, border: `1px solid ${m.border}` }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14M13 6l6 6-6 6" stroke={m.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[14px] font-semibold text-white truncate">
                                        {fee.originWilayaName}
                                        <span className="mx-2 text-slate-600">→</span>
                                        {fee.destinationWilayaName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span
                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold"
                                            style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                                        >
                                            {m.label}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{
                                                    background: isActive ? "#34d399" : "#475569",
                                                    boxShadow: isActive ? "0 0 5px rgba(52,211,153,0.5)" : "none",
                                                }}
                                            />
                                            <span className="text-[11px]" style={{ color: isActive ? "#34d399" : "#475569" }}>
                                                {isActive ? "Active" : "Inactive"}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div
                                className="p-4 rounded-xl space-y-3"
                                style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                                <div className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-slate-700 mb-2">Pricing</div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9.5px] uppercase tracking-wider text-slate-700">Base Fee</span>
                                        <span className="text-[14px] font-bold text-amber-400">{formatFee(fee.baseFee)}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9.5px] uppercase tracking-wider text-slate-700">Extra / kg</span>
                                        <span className="text-[14px] font-bold text-sky-400">{formatFee(fee.extraKgFee)}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9.5px] uppercase tracking-wider text-slate-700">Included Wt.</span>
                                        <span className="text-[14px] font-bold text-slate-200">{fee.includedWeightKg} kg</span>
                                    </div>
                                </div>
                            </div>

                            {/* Logistics */}
                            <div
                                className="p-4 rounded-xl space-y-3"
                                style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                                <div className="text-[9.5px] uppercase tracking-[0.14em] font-semibold text-slate-700 mb-2">Logistics</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <DetailRow
                                        label="Est. Duration"
                                        value={
                                            fee.estimatedHours != null
                                                ? `${fee.estimatedHours}h`
                                                : <span className="text-slate-600 italic text-[11px]">Not set</span>
                                        }
                                    />
                                    <DetailRow label="Company ID" value={
                                        <span className="font-mono text-[10.5px] text-slate-500 break-all">{fee.companyId}</span>
                                    } />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-end px-6 py-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/13 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}