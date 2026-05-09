// components/dashboard/branches/BranchModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
    IBranchResponse,
    ICreateBranchPayload,
    IUpdateBranchPayload,
    NodeType,
    NodeTypeToNumber,
} from "@/types/branch";
import LocationPicker, { LocationPickerValue } from "@/components/commons/LocationPicker";
import MapPicker, { MapCoords } from "@/components/commons/MapPicker";

interface BranchModalProps {
    branch?: IBranchResponse | null;
    onClose: () => void;
    onSubmit: (payload: ICreateBranchPayload | IUpdateBranchPayload) => Promise<void>;
    loading?: boolean;
}

const NODE_TYPES: NodeType[] = [NodeType.Hub, NodeType.Branch, NodeType.MainHub];

const FIELD =
    "px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all w-full";
const LABEL =
    "block text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5";

// Approximate center coords per wilaya code (01–58) for auto-zoom
// Extend this map as needed
const WILAYA_CENTERS: Record<string, MapCoords> = {
    "1": { latitude: 36.7372, longitude: 3.0869 },  // Alger
    "2": { latitude: 36.2638, longitude: 6.6023 },  // Chlef
    "3": { latitude: 36.4667, longitude: 5.1000 },  // Laghouat — placeholder
    "16": { latitude: 36.3650, longitude: 6.6147 },  // Alger center alt
    "25": { latitude: 36.4500, longitude: 5.1167 },  // Constantine alt
    "31": { latitude: 35.6944, longitude: -0.6178 }, // Oran
};

function SectionHeader({ icon, label, note }: { icon: React.ReactNode; label: string; note?: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-slate-600">{icon}</span>
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{label}</span>
            {note && <span className="text-[10px] text-slate-700 normal-case font-normal">— {note}</span>}
        </div>
    );
}

export default function BranchModal({ branch, onClose, onSubmit, loading }: BranchModalProps) {
    const isEdit = !!branch;

    const [form, setForm] = useState({
        name: branch?.name ?? "",
        type: (branch?.type ?? NodeType.Branch) as NodeType,
        parentNodeId: branch?.parentNodeId ?? "",
    });

    const [location, setLocation] = useState<LocationPickerValue>({
        wilayaId: branch?.wilayaId ?? "",
        communeId: branch?.communeId ?? "",
        wilaya: branch?.wilaya,
        commune: branch?.commune,
    });

    const [coords, setCoords] = useState<MapCoords | undefined>(
        branch?.latitude && branch?.longitude
            ? { latitude: branch.latitude, longitude: branch.longitude }
            : undefined
    );

    // When wilaya changes → auto-pan map to that wilaya's area
    const [mapCenter, setMapCenter] = useState<MapCoords | undefined>(undefined);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [locationErrors, setLocationErrors] = useState<{ wilaya?: string; commune?: string }>({});

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const set = (k: string, v: string) => {
        setForm((f) => ({ ...f, [k]: v }));
        setErrors((e) => ({ ...e, [k]: "" }));
    };

    const handleLocationChange = (val: LocationPickerValue) => {
        setLocation(val);
        setLocationErrors({
            wilaya: val.wilayaId ? undefined : locationErrors.wilaya,
            commune: val.communeId ? undefined : locationErrors.commune,
        });

        // Auto-pan map when wilaya changes
        if (val.wilaya?.code) {
            const center = WILAYA_CENTERS[String(val.wilaya.code)];
            if (center) setMapCenter(center);
        }
    };

    const handleCoordsChange = (c: MapCoords | null) => {
        setCoords(c ?? undefined);
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        const locErrs: { wilaya?: string; commune?: string } = {};

        if (!form.name.trim()) errs.name = "Name is required";
        if (!location.wilayaId) locErrs.wilaya = "Wilaya is required";
        if (!isEdit && !location.communeId) locErrs.commune = "Commune is required";

        setErrors(errs);
        setLocationErrors(locErrs);
        return Object.keys(errs).length === 0 && Object.keys(locErrs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (isEdit) {
            const payload: IUpdateBranchPayload = {
                name: form.name || undefined,
                type: NodeTypeToNumber[form.type],
                wilayaId: location.wilayaId || undefined,
                ParentNodeId: form.parentNodeId || undefined,
                longitude: coords?.longitude,
                latitude: coords?.latitude,
            };
            await onSubmit(payload);
        } else {
            const payload: ICreateBranchPayload = {
                name: form.name,
                type: NodeTypeToNumber[form.type],
                wilayaId: location.wilayaId,
                communeId: location.communeId,
                longitude: Number(coords?.longitude),
                latitude: Number(coords?.latitude),
            };
            await onSubmit(payload);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
            <div
                className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
                style={{
                    background: "#0d1117",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
            >
                {/* ── Header ────────────────────────────────────────────── */}
                <div
                    className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
                    style={{ background: "#0d1117" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px]"
                            style={{
                                background: "rgba(251,191,36,0.08)",
                                border: "1px solid rgba(251,191,36,0.15)",
                            }}
                        >
                            {isEdit ? "✎" : "+"}
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-white tracking-tight leading-none">
                                {isEdit ? "Edit Node" : "New Node"}
                            </h2>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                                {isEdit ? `Editing ${branch.name}` : "Add a new logistics node"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* ── Form ──────────────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                    {/* Name + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL}>Name</label>
                            <input
                                className={FIELD}
                                placeholder="e.g. Algiers North Hub"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={LABEL}>Type</label>
                            <select
                                className={FIELD}
                                value={form.type}
                                onChange={(e) => set("type", e.target.value)}
                                style={{ appearance: "none" }}
                            >
                                {NODE_TYPES.map((t) => (
                                    <option key={t} value={t} style={{ background: "#0d1117" }}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Location picker ─────────────────────────────── */}
                    <div className="space-y-3">
                        <SectionHeader
                            icon={
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                                        stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            }
                            label="Location"
                        />
                        <LocationPicker
                            value={location}
                            onChange={handleLocationChange}
                            error={locationErrors}
                        />
                        {isEdit && (
                            <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Commune cannot be changed after creation.
                            </p>
                        )}
                    </div>

                    {/* ── Map picker ──────────────────────────────────── */}
                    <div className="space-y-3">
                        <SectionHeader
                            icon={
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21"
                                        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                                    <line x1="9" y1="3" x2="9" y2="18" stroke="currentColor" strokeWidth="1.5" />
                                    <line x1="15" y1="6" x2="15" y2="21" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            }
                            label="Pin on Map"
                            note="click to place · drag to adjust"
                        />

                        {/* Coordinate readout pills — above the map */}
                        <div className="flex items-center gap-2">
                            <CoordPill label="Lat" value={coords?.latitude} />
                            <CoordPill label="Lng" value={coords?.longitude} />
                            {coords && (
                                <span className="text-[10px] text-slate-700 ml-auto">
                                    Drag marker to fine-tune
                                </span>
                            )}
                        </div>

                        <MapPicker
                            value={coords}
                            onChange={handleCoordsChange}
                            centerOn={mapCenter}
                        />
                    </div>

                    {/* Parent node — edit only */}
                    {isEdit && (
                        <div className="space-y-3">
                            <div className="border-t border-white/[0.05]" />
                            <div>
                                <label className={LABEL}>
                                    Parent Node ID{" "}
                                    <span className="text-slate-700 normal-case tracking-normal font-normal">(optional)</span>
                                </label>
                                <input
                                    className={FIELD}
                                    placeholder="Parent node UUID"
                                    value={form.parentNodeId}
                                    onChange={(e) => set("parentNodeId", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Actions ─────────────────────────────────────── */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.05]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-background-main transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            style={{
                                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                                boxShadow: loading ? "none" : "0 4px 16px rgba(251,191,36,0.25)",
                            }}
                        >
                            {loading && (
                                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                                        strokeDasharray="60" strokeDashoffset="20" />
                                </svg>
                            )}
                            {isEdit ? "Save Changes" : "Create Node"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Coord pill ───────────────────────────────────────────────────────────────

function CoordPill({ label, value }: { label: string; value?: number }) {
    return (
        <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${value !== undefined ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)"}`,
            }}
        >
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-600">{label}</span>
            <span
                className="text-[12px] font-mono tabular-nums"
                style={{ color: value !== undefined ? "#fbbf24" : "#334155" }}
            >
                {value !== undefined ? value.toFixed(6) : "—"}
            </span>
        </div>
    );
}