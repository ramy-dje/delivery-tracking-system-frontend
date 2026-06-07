"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    IBranchResponse,
    ICreateBranchPayload,
    IUpdateBranchPayload,
    NodeType,
} from "@/types/branch";
import MapPicker, { MapCoords } from "@/components/commons/MapPicker";
import EntityPicker from "@/components/commons/EntityPicker";
import MultiEntityPicker from "@/components/commons/MultiEntityPicker";
import { GitBranch, Map, MapPin, Network, X, Mail, Phone, Hash } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import InputField from "@/components/commons/InputField";
import SelectField from "@/components/commons/SelectField";
import { listBranches } from "@/services/BranchService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BranchModalProps {
    branch?: IBranchResponse | null;
    onClose: () => void;
    onSubmit: (payload: ICreateBranchPayload | IUpdateBranchPayload) => Promise<void>;
    loading?: boolean;
}

const NODE_TYPES = [
    { label: "Regional Main Hub", value: NodeType.RegionalMainHub },
    { label: "Local Branch", value: NodeType.LocalBranch },
];

function parentTypesFor(type: NodeType): NodeType[] {
    if (type === NodeType.LocalBranch) return [NodeType.RegionalMainHub];
    return [];
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label, note }: { icon: React.ReactNode; label: string; note?: string }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-slate-600">{icon}</span>
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{label}</span>
            {note && <span className="text-[10px] text-slate-700 normal-case font-normal">— {note}</span>}
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function BranchModal({ branch, onClose, onSubmit, loading }: BranchModalProps) {
    const isEdit = !!branch;

    // ── Core form state ───────────────────────────────────────────────────────
    const [name, setName] = useState(branch?.name ?? "");
    const [code, setCode] = useState(branch?.code ?? "");
    const [nodeType, setNodeType] = useState<NodeType>((branch?.branchType ?? NodeType.LocalBranch) as NodeType);
    const [parentNodeId, setParentNodeId] = useState<string>(branch?.parentHubId ?? "");
    const [phone, setPhone] = useState(branch?.phone ?? "");
    const [email, setEmail] = useState(branch?.email ?? "");
    const [capacityLimit, setCapacityLimit] = useState<number | undefined>(branch?.capacityLimit);
    
    // Address
    const [street, setStreet] = useState(branch?.address?.street ?? "");
    const [city, setCity] = useState(branch?.address?.city ?? "");
    const [state, setState] = useState(branch?.address?.state ?? "");

    // Serves Branches
    const [servesBranches, setServesBranches] = useState<string[]>(branch?.servesBranches ?? []);
    
    const [coords, setCoords] = useState<MapCoords | undefined>(
        // The backend model is "location": { "type": "Point", "coordinates": [longitude, latitude] }
        // Wait, wait... `branch.location` doesn't exist on `IBranchResponse` ?
        // IBranchResponse actually implements `ILocation` which has `latitude` and `longitude`.
        // Wait, did we change that in types/branch.ts ?
        // IBranchResponse extends ILocation. So `branch.latitude` and `branch.longitude` exist?
        // Wait, the backend returns `location: { type: 'Point', coordinates: [lng, lat] }`
        // So the frontend interface `IBranchResponse` should have `location: { type: 'Point', coordinates: [number, number] }`.
        // Let's assume it has it from our previous edits or from the backend response.
        // Oh wait, `IBranchResponse` previously extended `ILocation` directly (`latitude`, `longitude`). But backend sends `{ location: { coordinates: [lng, lat] } }`?
        // Let's just safely fall back to checking both.
        // We will do this:
        (branch as any)?.location?.coordinates
            ? { latitude: (branch as any).location.coordinates[1], longitude: (branch as any).location.coordinates[0] }
            : branch?.latitude && branch?.longitude
            ? { latitude: branch.latitude, longitude: branch.longitude }
            : undefined
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Server-search state ──────────────────────────
    const [branchSearch, setBranchSearch] = useState("");

    // ── Keyboard close ────────────────────────────────────────────────────────
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    // ── Reset parent when type changes ────────────────────────────────────────
    useEffect(() => { setParentNodeId(""); setServesBranches([]); }, [nodeType]);

    const canHaveParent = parentTypesFor(nodeType).length > 0;
    const canServeBranches = nodeType === NodeType.RegionalMainHub;

    // ── Fetchers ──────────────────────────────────────────────────────────────
    const fetchParentNodes = useCallback(async (): Promise<IBranchResponse[]> => {
        const results = await Promise.all(
            parentTypesFor(nodeType).map((t) =>
                listBranches({ branchType: t, pageNumber: 1, pageSize: 20 }).then((r) => r.items)
            )
        );
        return results.flat();
    }, [nodeType]);

    const fetchServableBranches = useCallback(
        () => listBranches({ search: branchSearch, branchType: NodeType.LocalBranch, pageNumber: 1, pageSize: 30 }).then(r => r.items),
        [branchSearch]
    );

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name is required";
        if (!code.trim()) errs.code = "Code is required";
        if (!phone.trim()) errs.phone = "Phone is required";
        if (!email.trim()) errs.email = "Email is required";
        if (!street.trim() || !city.trim() || !state.trim()) errs.address = "Full address is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (isEdit) {
            await onSubmit({
                name: name || undefined,
                phone: phone || undefined,
                email: email || undefined,
                capacityLimit: capacityLimit || undefined,
                branchType: nodeType,
                parentHubId: parentNodeId || null,
                location: coords ? { type: 'Point', coordinates: [coords.longitude, coords.latitude] } : undefined,
                address: { street, city, state },
                servesBranches: servesBranches.length > 0 ? servesBranches : undefined,
            } satisfies IUpdateBranchPayload);
        } else {
            await onSubmit({
                name,
                code,
                phone,
                email,
                capacityLimit: capacityLimit || undefined,
                branchType: nodeType,
                parentHubId: parentNodeId || undefined,
                address: { street, city, state },
                location: { type: 'Point', coordinates: [Number(coords?.longitude ?? 0), Number(coords?.latitude ?? 0)] },
                servesBranches: servesBranches.length > 0 ? servesBranches : undefined,
            } satisfies ICreateBranchPayload);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────

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
                {/* ── Header ──────────────────────────────────────────── */}
                <div
                    className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/6"
                    style={{ background: "#0d1117" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px]"
                            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}
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
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* ── Form ────────────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                    {/* 1 · Name + Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Name"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                            placeholder="e.g. Algiers North Hub"
                            error={errors.name}
                        />
                        <InputField
                            label="Code"
                            value={code}
                            onChange={(e) => { setCode(e.target.value); setErrors((p) => ({ ...p, code: "" })); }}
                            placeholder="e.g. ALG-01"
                            error={errors.code}
                            disabled={isEdit}
                        />
                    </div>
                    
                    {/* 2 · Type + Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField
                            label="Type"
                            value={nodeType}
                            onChange={(v) => setNodeType(v as NodeType)}
                            options={NODE_TYPES}
                        />
                        <InputField
                            label="Capacity Limit"
                            type="number"
                            value={capacityLimit || ""}
                            onChange={(e) => setCapacityLimit(Number(e.target.value) || undefined)}
                            placeholder="e.g. 1000"
                        />
                    </div>

                    {/* 3 · Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Phone"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                            placeholder="+213..."
                            error={errors.phone}
                        />
                        <InputField
                            label="Email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                            placeholder="contact@example.com"
                            error={errors.email}
                        />
                    </div>

                    {/* 4 · Address */}
                    <div className="space-y-4">
                        <SectionHeader icon={<MapPin size={14} />} label="Address" />
                        <InputField
                            label="Street"
                            value={street}
                            onChange={(e) => { setStreet(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
                            placeholder="123 Logistics Ave"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="City"
                                value={city}
                                onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
                                placeholder="Algiers"
                            />
                            <InputField
                                label="State"
                                value={state}
                                onChange={(e) => { setState(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
                                placeholder="Algiers"
                            />
                        </div>
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* 5 · Parent Node */}
                    {canHaveParent && (
                        <>
                            <div className="border-t border-white/4" />
                            <div>
                                <SectionHeader icon={<Network size={14} />} label="Parent Hub" />
                                <EntityPicker<IBranchResponse>
                                    value={parentNodeId || null}
                                    onChange={(id) => setParentNodeId(id ?? "")}
                                    fetchData={fetchParentNodes}
                                    getId={(n) => n.id}
                                    getLabel={(n) => n.name}
                                    getSubLabel={(n) => n.branchType}
                                    renderIcon={() => (
                                        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                                        </div>
                                    )}
                                    label={`Parent Hub`}
                                    placeholder={`Search Hubs…`}
                                    searchFn={(n, q) => n.name.toLowerCase().includes(q.toLowerCase())}
                                />
                            </div>
                        </>
                    )}

                    {/* 6 · Serves Branches — create only */}
                    {canServeBranches && !isEdit && (
                        <>
                            <div className="border-t border-white/4" />
                            <div>
                                <SectionHeader
                                    icon={<GitBranch size={14} />}
                                    label="Serves Branches"
                                    note="optional · branches this hub serves"
                                />
                                <MultiEntityPicker<IBranchResponse>
                                    value={servesBranches}
                                    onChange={(ids) => setServesBranches(ids)}
                                    fetchData={fetchServableBranches}
                                    onSearchChange={setBranchSearch}
                                    getId={(b) => b.id}
                                    getLabel={(b) => b.name}
                                    getSubLabel={(b) => b.code}
                                    renderIcon={() => (
                                        <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center">
                                            <GitBranch className="w-3.5 h-3.5 text-violet-400" />
                                        </div>
                                    )}
                                    placeholder="Type to search and add branches…"
                                    filterFn={(item) => item.id !== branch?.id}
                                />
                            </div>
                        </>
                    )}

                    {/* 7 · Map Pin */}
                    <>
                        <div className="border-t border-white/4" />
                        <div>
                            <SectionHeader icon={<Map size={14} />} label="Pin on Map" note="click to place · drag to adjust" />
                            <div className="flex items-center gap-2 mb-3">
                                <CoordPill label="Lat" value={coords?.latitude} />
                                <CoordPill label="Lng" value={coords?.longitude} />
                                {coords && (
                                    <span className="text-[10px] text-slate-700 ml-auto">Drag marker to fine-tune</span>
                                )}
                            </div>
                            <MapPicker value={coords} onChange={(c) => setCoords(c ?? undefined)} />
                        </div>
                    </>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                        <ActionBtn type="button" onClick={onClose} disabled={loading} label="Cancel" variant="slate" size="action" />
                        <ActionBtn onClick={handleSubmit} disabled={loading} label={isEdit ? "Save Changes" : "Create Node"} variant="amber" type="button" size="action" />
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Coord Pill ───────────────────────────────────────────────────────────────

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