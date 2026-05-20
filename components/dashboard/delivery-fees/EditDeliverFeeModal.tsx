"use client";

import { useEffect, useState } from "react";
import { IDeliveryFeeSummary, IUpdateDeliveryFeePayload } from "@/types/deliveryFee";
import { formatFee, getDeliveryTypeMeta } from "./DeliveryFeeRow";

// ── Form primitives ────────────────────────────────────────────────────────

function Field({ label, hint, error, children }: {
    label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</label>
                {hint && <span className="text-[10px] text-slate-700">{hint}</span>}
            </div>
            {children}
            {error && <p className="text-[11px] text-red-400 mt-0.5">{error}</p>}
        </div>
    );
}

function NumberInput({ value, onChange, placeholder, min, step }: {
    value: string; onChange: (v: string) => void; placeholder?: string; min?: number; step?: number;
}) {
    return (
        <input
            type="number"
            value={value}
            min={min}
            step={step}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white placeholder:text-slate-700 focus:outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(251,191,36,0.35)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.07)";
            }}
            onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
            }}
        />
    );
}

// ── Props ──────────────────────────────────────────────────────────────────

interface EditDeliveryFeeModalProps {
    isOpen: boolean;
    fee: IDeliveryFeeSummary | null;
    onClose: () => void;
    onSubmit: (id: string, data: IUpdateDeliveryFeePayload) => Promise<void>;
    loading?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function EditDeliveryFeeModal({ isOpen, fee, onClose, onSubmit, loading }: EditDeliveryFeeModalProps) {
    const [baseFee, setBaseFee] = useState("");
    const [extraKgFee, setExtraKgFee] = useState("");
    const [includedWeightKg, setIncludedWeightKg] = useState("");
    const [estimatedHours, setEstimatedHours] = useState("");

    // Pre-fill when fee changes
    useEffect(() => {
        if (fee) {
            setBaseFee(String(fee.baseFee));
            setExtraKgFee(String(fee.extraKgFee));
            setIncludedWeightKg(fee.includedWeightKg != null ? String(fee.includedWeightKg) : "");
            setEstimatedHours(fee.estimatedHours != null ? String(fee.estimatedHours) : "");
        }
    }, [fee]);

    const handleSubmit = async () => {
        if (!fee) return;
        const payload: IUpdateDeliveryFeePayload = {};
        if (baseFee) payload.baseFee = Number(baseFee);
        if (extraKgFee) payload.extraKgFee = Number(extraKgFee);
        if (includedWeightKg) payload.includedWeightKg = Number(includedWeightKg);
        if (estimatedHours) payload.estimatedHours = Number(estimatedHours);
        await onSubmit(fee.id, payload);
    };

    if (!isOpen || !fee) return null;

    const m = getDeliveryTypeMeta(fee.deliveryType);

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
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
                }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <div className="text-[14px] font-semibold text-white">Edit Delivery Fee</div>
                        <div className="text-[11px] text-slate-600 truncate">
                            {fee.originWilayaName} → {fee.destinationWilayaName}
                            <span
                                className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-semibold"
                                style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                            >
                                {m.label}
                            </span>
                        </div>
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
                <div className="px-6 py-5 space-y-4">

                    {/* Current values summary */}
                    <div
                        className="flex items-center justify-around p-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9.5px] uppercase tracking-wider text-slate-700">Current Base</span>
                            <span className="text-[13px] font-bold text-amber-400">{formatFee(fee.baseFee)}</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9.5px] uppercase tracking-wider text-slate-700">Extra /kg</span>
                            <span className="text-[13px] font-bold text-sky-400">{formatFee(fee.extraKgFee)}</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[9.5px] uppercase tracking-wider text-slate-700">Included</span>
                            <span className="text-[13px] font-bold text-slate-300">{fee.includedWeightKg ?? "—"} kg</span>
                        </div>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Base Fee (DZD)" hint="DZD">
                            <NumberInput value={baseFee} onChange={setBaseFee} placeholder="0" min={0} step={10} />
                        </Field>
                        <Field label="Extra kg Fee (DZD)" hint="DZD">
                            <NumberInput value={extraKgFee} onChange={setExtraKgFee} placeholder="0" min={0} step={5} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Included Weight" hint="kg">
                            <NumberInput value={includedWeightKg} onChange={setIncludedWeightKg} placeholder="5" min={0} step={0.5} />
                        </Field>
                        <Field label="Estimated Hours" hint="h">
                            <NumberInput value={estimatedHours} onChange={setEstimatedHours} placeholder="48" min={0} step={1} />
                        </Field>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-end gap-2.5 px-6 py-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/13 transition-all disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-slate-950 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                            boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                        }}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                                </svg>
                                Saving…
                            </>
                        ) : (
                            <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}