"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    IBranchResponse,
    ICreateBranchPayload,
    IUpdateBranchPayload,
    NodeType,
    NodeTypeToNumber,
} from "@/types/branch";
import MapPicker, { MapCoords } from "@/components/commons/MapPicker";
import EntityPicker from "@/components/commons/EntityPicker";
import MultiEntityPicker from "@/components/commons/MultiEntityPicker";
import { GitBranch, Map, MapPin, Network, X } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import InputField from "@/components/commons/InputField";
import SelectField from "@/components/commons/SelectField";
import { listBranches } from "@/services/BranchService";
import { ICommune } from "@/types/common";
import { getAllCommunes } from "@/services/LocationService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BranchModalProps {
    branch?: IBranchResponse | null;
    onClose: () => void;
    onSubmit: (payload: ICreateBranchPayload | IUpdateBranchPayload) => Promise<void>;
    loading?: boolean;
}

const NODE_TYPES = [
    { label: NodeType.MainHub, value: NodeType.MainHub },
    { label: NodeType.Hub, value: NodeType.Hub },
    { label: NodeType.Branch, value: NodeType.Branch },
];

function parentTypesFor(type: NodeType): NodeType[] {
    if (type === NodeType.MainHub) return [];
    if (type === NodeType.Hub) return [NodeType.MainHub];
    if (type === NodeType.Branch) return [NodeType.Hub, NodeType.MainHub];
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
    const [nodeType, setNodeType] = useState<NodeType>((branch?.type ?? NodeType.Branch) as NodeType);
    const [parentNodeId, setParentNodeId] = useState<string>(branch?.parentNodeId ?? "");
    const [communeId, setCommuneId] = useState<string>(branch?.communeId ?? "");
    const [coverageIds, setCoverageIds] = useState<string[]>([]);
    const [coords, setCoords] = useState<MapCoords | undefined>(
        branch?.latitude && branch?.longitude
            ? { latitude: branch.latitude, longitude: branch.longitude }
            : undefined
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Server-search state — one per commune picker ──────────────────────────
    // Each picker gets its own search term so they don't interfere with each other
    const [primarySearch, setPrimarySearch] = useState("");
    const [coverageSearch, setCoverageSearch] = useState("");

    // ── Keyboard close ────────────────────────────────────────────────────────
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    // ── Reset parent when type changes ────────────────────────────────────────
    useEffect(() => { setParentNodeId(""); }, [nodeType]);

    // ── If primary commune changes, evict it from coverage ────────────────────
    useEffect(() => {
        if (communeId) setCoverageIds((prev) => prev.filter((id) => id !== communeId));
    }, [communeId]);

    const canHaveParent = parentTypesFor(nodeType).length > 0;

    // ── Fetchers ──────────────────────────────────────────────────────────────
    const fetchParentNodes = useCallback(async (): Promise<IBranchResponse[]> => {
        const results = await Promise.all(
            parentTypesFor(nodeType).map((t) =>
                listBranches({ type: NodeTypeToNumber[t], pageNumber: 1, pageSize: 20 }).then((r) => r.items)
            )
        );
        return results.flat();
    }, [nodeType]);

    // Rebuilds whenever the search term changes → EntityPicker / MultiEntityPicker
    // detect the new reference and re-call fetchData automatically.
    const fetchPrimaryCommunes = useCallback(
        () => getAllCommunes({ search: primarySearch, pageNumber: 1, pageSize: 30 }),
        [primarySearch]
    );

    const fetchCoverageCommunes = useCallback(
        () => getAllCommunes({ search: coverageSearch, pageNumber: 1, pageSize: 30 }),
        [coverageSearch]
    );

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Name is required";
        if (!isEdit && !communeId) errs.communeId = "Primary commune is required";
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
                type: NodeTypeToNumber[nodeType],
                parentNodeId: parentNodeId || undefined,
                longitude: coords?.longitude,
                latitude: coords?.latitude,
            } satisfies IUpdateBranchPayload);
        } else {
            await onSubmit({
                name,
                type: NodeTypeToNumber[nodeType],
                parentNodeId: parentNodeId || undefined,
                wilayaId: "",   // derived server-side from communeId
                communeId,
                longitude: Number(coords?.longitude ?? 0),
                latitude: Number(coords?.latitude ?? 0),
                coverageCommuneIds: coverageIds,
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

                    {/* 1 · Name + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Name"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                            placeholder="e.g. Algiers North Hub"
                            error={errors.name}
                        />
                        <SelectField
                            label="Type"
                            value={nodeType}
                            onChange={(v) => setNodeType(v as NodeType)}
                            options={NODE_TYPES}
                        />
                    </div>

                    {/* 2 · Parent Node */}
                    {canHaveParent && (
                        <>
                            <div className="border-t border-white/4" />
                            <div>
                                <SectionHeader icon={<Network size={14} />} label="Parent Node" note="optional" />
                                <EntityPicker<IBranchResponse>
                                    value={parentNodeId || null}
                                    onChange={(id) => setParentNodeId(id ?? "")}
                                    fetchData={fetchParentNodes}
                                    getId={(n) => n.id}
                                    getLabel={(n) => n.name}
                                    getSubLabel={(n) => n.type}
                                    renderIcon={() => (
                                        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                                            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                                        </div>
                                    )}
                                    label={`Parent — ${parentTypesFor(nodeType).join(" / ")}`}
                                    placeholder={`Search ${parentTypesFor(nodeType).join(" or ")} nodes…`}
                                    searchFn={(n, q) => n.name.toLowerCase().includes(q.toLowerCase())}
                                />
                            </div>
                        </>
                    )}

                    {/* 3 · Primary Commune */}
                    <>
                        <div className="border-t border-white/4" />
                        <div>
                            <SectionHeader icon={<MapPin size={14} />} label="Primary Commune" />
                            {isEdit ? (
                                <div
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px]"
                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                                >
                                    <MapPin size={12} className="text-slate-600" />
                                    <span className="text-slate-400">{branch.commune?.nameFr ?? branch.communeId}</span>
                                    <span className="text-[10px] text-slate-700 ml-auto flex items-center gap-1">
                                        <Map size={11} /> Cannot change after creation
                                    </span>
                                </div>
                            ) : (
                                <EntityPicker<ICommune>
                                    value={communeId || null}
                                    onChange={(id) => { setCommuneId(id ?? ""); setErrors((p) => ({ ...p, communeId: "" })); }}
                                    fetchData={fetchPrimaryCommunes}
                                    onSearchChange={setPrimarySearch}
                                    getId={(c) => c.id}
                                    getLabel={(c) => c.nameFr}
                                    getSubLabel={(c) => c.nameAr}
                                    renderIcon={() => (
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                        </div>
                                    )}
                                    label="Commune *"
                                    placeholder="Type to search communes…"
                                    required
                                    error={errors.communeId}
                                />
                            )}
                        </div>
                    </>

                    {/* 4 · Coverage Communes — create only */}
                    {!isEdit && (
                        <>
                            <div className="border-t border-white/4" />
                            <div>
                                <SectionHeader
                                    icon={<MapPin size={14} />}
                                    label="Coverage Communes"
                                    note="optional · additional areas this node serves"
                                />
                                <MultiEntityPicker<ICommune>
                                    value={coverageIds}
                                    onChange={(ids) => setCoverageIds(ids)}
                                    fetchData={fetchCoverageCommunes}
                                    onSearchChange={setCoverageSearch}
                                    getId={(c) => c.id}
                                    getLabel={(c) => c.nameFr}
                                    getSubLabel={(c) => c.nameAr}
                                    renderIcon={() => (
                                        <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center">
                                            <MapPin className="w-3.5 h-3.5 text-violet-400" />
                                        </div>
                                    )}
                                    placeholder="Type to search and add communes…"
                                    filterFn={(item) => item.id !== communeId}
                                />
                            </div>
                        </>
                    )}

                    {/* 5 · Map Pin */}
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