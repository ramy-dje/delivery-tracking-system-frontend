"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    IBranchDetails,
    NodeType,
} from "@/types/branch";
import { getBranch } from "@/services/BranchService";
import {
    ArrowLeft,
    Building2,
    Car,
    ChevronRight,
    Circle,
    Clock,
    GitBranch,
    Globe,
    MapPin,
    Network,
    Shield,
    Trash2,
    TrendingUp,
    User,
    Users,
    Zap,
} from "lucide-react";
import { Skeleton } from "@/components/commons/Skeleton";
import StatCard from "@/components/commons/StatCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NODE_TYPE_STYLE: Record<NodeType, { label: string; color: string; bg: string; border: string }> = {
    [NodeType.MainHub]: {
        label: "Main Hub",
        color: "#fbbf24",
        bg: "rgba(251,191,36,0.08)",
        border: "rgba(251,191,36,0.2)",
    },
    [NodeType.Hub]: {
        label: "Hub",
        color: "#60a5fa",
        bg: "rgba(96,165,250,0.08)",
        border: "rgba(96,165,250,0.2)",
    },
    [NodeType.Branch]: {
        label: "Branch",
        color: "#34d399",
        bg: "rgba(52,211,153,0.08)",
        border: "rgba(52,211,153,0.2)",
    },
};

const CHILD_TYPE_STYLE: Record<NodeType, { color: string; bg: string }> = {
    [NodeType.MainHub]: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)" },
    [NodeType.Hub]: { color: "#60a5fa", bg: "rgba(96,165,250,0.08)" },
    [NodeType.Branch]: { color: "#34d399", bg: "rgba(52,211,153,0.08)" },
};

function fmt(dt: string | null) {
    if (!dt) return "—";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dt));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-xl p-5 ${className}`}
            style={{
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.07)",
            }}
        >
            {children}
        </div>
    );
}

function CardHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <span className="text-slate-600">{icon}</span>
                <span className="text-[11px] uppercase tracking-widest font-semibold text-slate-500">{title}</span>
            </div>
            {count !== undefined && (
                <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}
                >
                    {count}
                </span>
            )}
        </div>
    );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span className="text-[11px] text-slate-600 shrink-0 pt-0.5">{label}</span>
            <span className={`text-[13px] text-slate-300 text-right ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BranchDetailsPage() {
    const { branchId: id } = useParams<{ branchId: string }>();
    const router = useRouter();

    const [data, setData] = useState<IBranchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getBranch(id)
            .then(setData)
            .catch((e) => setError(e?.message ?? "Failed to load"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Skeleton />;

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#070b10" }}>
                <div className="text-center space-y-3">
                    <p className="text-red-400 text-[13px]">{error ?? "Node not found"}</p>
                    <button onClick={() => router.back()} className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors">
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    const typeStyle = NODE_TYPE_STYLE[data.type] ?? NODE_TYPE_STYLE[NodeType.Branch];
    const hasCoords = data.latitude != null && data.longitude != null;

    return (
        <div className="min-h-screen" style={{ background: "#070b10" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* ── Breadcrumb / back ──────────────────────────────── */}
                <div className="flex items-center gap-2 text-[12px]">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                        <ArrowLeft size={13} />
                        Nodes
                    </button>
                    <ChevronRight size={12} className="text-slate-700" />
                    <span className="text-slate-500">{data.name}</span>
                </div>

                {/* ── Hero header ────────────────────────────────────── */}
                <div
                    className="rounded-2xl px-6 py-5 flex items-start justify-between gap-4 flex-wrap"
                    style={{
                        background: "linear-gradient(135deg, #0d1117 0%, #111827 100%)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    }}
                >
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}` }}
                        >
                            <Network size={22} style={{ color: typeStyle.color }} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-[22px] font-bold text-white tracking-tight">{data.name}</h1>
                                {/* Type badge */}
                                <span
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}
                                >
                                    {typeStyle.label}
                                </span>
                                {/* Deleted badge */}
                                {data.isDeleted && (
                                    <span
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                                        style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                                    >
                                        <Trash2 size={10} /> Deleted
                                    </span>
                                )}
                            </div>

                            {/* Sub-info row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                    <Building2 size={11} className="text-slate-600" />
                                    {data.companyName}
                                </span>
                                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                    <MapPin size={11} className="text-slate-600" />
                                    {data.communeName}, {data.wilayaName}
                                </span>
                                {data.managerName && (
                                    <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                        <User size={11} className="text-slate-600" />
                                        {data.managerName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Audit timestamps */}
                    <div className="flex flex-col items-end gap-1 text-[11px] text-slate-700 shrink-0">
                        <span className="flex items-center gap-1"><Clock size={10} /> Created {fmt(data.createdAt)}</span>
                        {data.updatedAt && <span className="flex items-center gap-1"><Clock size={10} /> Updated {fmt(data.updatedAt)}</span>}
                        {data.isDeleted && data.deletedAt && (
                            <span className="flex items-center gap-1 text-red-800"><Trash2 size={10} /> Deleted {fmt(data.deletedAt)}</span>
                        )}
                    </div>
                </div>

                {/* ── Stats row ──────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4">

                    <StatCard label="Vehicles" value={data.vehiclesCount} accent="#fbbf24" />
                    <StatCard label="Staff Members" value={data.staffCount} accent="#60a5fa" />
                    <StatCard label="Driver Shifts" value={data.driverShiftsCount} accent="#34d399" />
                </div>

                {/* ── Main grid ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Left col */}
                    <div className="space-y-4">

                        {/* Location */}
                        <Card>
                            <CardHeader icon={<MapPin size={14} />} title="Location" />
                            <div className="divide-y divide-white/4">
                                <InfoRow label="Wilaya" value={`${data.wilayaName}`} />
                                <InfoRow label="Commune" value={data.communeName} />
                                {hasCoords && (
                                    <>
                                        <InfoRow label="Latitude" value={data.latitude?.toFixed(6)} mono />
                                        <InfoRow label="Longitude" value={data.longitude?.toFixed(6)} mono />
                                    </>
                                )}
                                {!hasCoords && (
                                    <div className="py-3 text-[11px] text-slate-700 flex items-center gap-1.5">
                                        <Globe size={11} /> No coordinates pinned
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Hierarchy */}
                        <Card>
                            <CardHeader icon={<GitBranch size={14} />} title="Hierarchy" />

                            {/* Parent */}
                            <div className="mb-3">
                                <p className="text-[10px] uppercase tracking-widest text-slate-700 mb-2">Parent node</p>
                                {data.parentNodeId ? (
                                    <div
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                                        style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.1)" }}
                                    >
                                        <Network size={13} className="text-amber-500/60 shrink-0" />
                                        <span className="text-[13px] text-slate-300">{data.parentNodeName}</span>
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-slate-700 italic px-1">No parent — top-level node</p>
                                )}
                            </div>

                            {/* Children */}
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-slate-700 mb-2">
                                    Child nodes <span className="text-slate-800">({data.childNodes.length})</span>
                                </p>
                                {data.childNodes.length === 0 ? (
                                    <p className="text-[12px] text-slate-700 italic px-1">No child nodes</p>
                                ) : (
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                        {data.childNodes.map((child) => {
                                            const s = CHILD_TYPE_STYLE[child.type] ?? CHILD_TYPE_STYLE[NodeType.Branch];
                                            return (
                                                <div
                                                    key={child.id}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                                                >
                                                    <Circle size={6} style={{ color: s.color, fill: s.color }} className="shrink-0" />
                                                    <span className="text-[13px] text-slate-300 flex-1 truncate">{child.name}</span>
                                                    <span
                                                        className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                                                        style={{ background: s.bg, color: s.color }}
                                                    >
                                                        {NODE_TYPE_STYLE[child.type]?.label ?? child.type}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right col */}
                    <div className="space-y-4">

                        {/* Coverage communes */}
                        <Card>
                            <CardHeader
                                icon={<Shield size={14} />}
                                title="Coverage Communes"
                                count={data.coverages.length}
                            />
                            {data.coverages.length === 0 ? (
                                <p className="text-[12px] text-slate-700 italic">No coverage communes assigned</p>
                            ) : (
                                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    {data.coverages.map((cov) => (
                                        <div
                                            key={cov.communeId}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                                            style={{
                                                background: "rgba(255,255,255,0.025)",
                                                border: "1px solid rgba(255,255,255,0.05)",
                                            }}
                                        >
                                            <MapPin size={11} className="text-slate-700 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] text-slate-300 truncate">{cov.communeName}</p>
                                                <p className="text-[10px] text-slate-600">{cov.wilayaName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Manager + meta */}
                        <Card>
                            <CardHeader icon={<User size={14} />} title="Manager & Meta" />
                            <div className="divide-y divide-white/4">
                                <InfoRow
                                    label="Manager"
                                    value={
                                        data.managerName ? (
                                            <span className="flex items-center gap-1.5 justify-end">
                                                <span
                                                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                                                    style={{ background: "rgba(96,165,250,0.15)", color: "#60a5fa" }}
                                                >
                                                    {data.managerName[0]?.toUpperCase()}
                                                </span>
                                                {data.managerName}
                                            </span>
                                        ) : (
                                            <span className="text-slate-700 italic">Unassigned</span>
                                        )
                                    }
                                />
                                <InfoRow label="Company" value={data.companyName} />
                                <InfoRow label="Node ID" value={
                                    <span className="text-[11px] font-mono text-slate-500">{data.id}</span>
                                } />
                                <InfoRow label="Status" value={
                                    data.isDeleted
                                        ? <span className="text-red-400 flex items-center gap-1 justify-end"><Trash2 size={10} /> Deleted</span>
                                        : <span className="text-emerald-400 flex items-center gap-1 justify-end"><TrendingUp size={10} /> Active</span>
                                } />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}