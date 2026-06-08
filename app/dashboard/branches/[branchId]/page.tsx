"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IBranchDetails, WeekDay } from "@/types/branch";
import { getBranch } from "@/services/BranchService";
import {
    ArrowLeft,
    Building2,
    ChevronRight,
    Clock,
    GitBranch,
    Mail,
    MapPin,
    Network,
    Phone,
    TrendingUp,
    TrendingDown,
    Wrench,
    Timer,
} from "lucide-react";
import { Skeleton } from "@/components/commons/Skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRANCH_TYPE_STYLE: Record<
    string,
    { label: string; color: string; bg: string; border: string }
> = {
    regional_main_hub: {
        label: "Regional Main Hub",
        color: "#fbbf24",
        bg: "rgba(251,191,36,0.08)",
        border: "rgba(251,191,36,0.2)",
    },
    local_branch: {
        label: "Local Branch",
        color: "#22d3ee",
        bg: "rgba(34,211,238,0.07)",
        border: "rgba(34,211,238,0.2)",
    },
};

const STATUS_STYLE: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
> = {
    active: {
        label: "Active",
        color: "#22c55e",
        icon: <TrendingUp size={11} />,
    },
    inactive: {
        label: "Inactive",
        color: "#94a3b8",
        icon: <TrendingDown size={11} />,
    },
    maintenance: {
        label: "Maintenance",
        color: "#f59e0b",
        icon: <Wrench size={10} />,
    },
    pending: {
        label: "Pending",
        color: "#818cf8",
        icon: <Timer size={10} />,
    },
};

const WEEK_DAYS: WeekDay[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

function fmt(dt: string | Date | null | undefined) {
    if (!dt) return "—";
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(dt));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
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

function CardHeader({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-slate-600">{icon}</span>
            <span className="text-[11px] uppercase tracking-widest font-semibold text-slate-500">
                {title}
            </span>
        </div>
    );
}

function InfoRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div
            className="flex items-start justify-between gap-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
            <span className="text-[11px] text-slate-600 shrink-0 pt-0.5">
                {label}
            </span>
            <span
                className={`text-[13px] text-slate-300 text-right ${mono ? "font-mono" : ""}`}
            >
                {value ?? "—"}
            </span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BranchDetailsPage() {
    const { branchId } = useParams<{ branchId: string }>();
    const router = useRouter();

    const [data, setData] = useState<IBranchDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!branchId) return;
        getBranch(branchId)
            .then(setData)
            .catch((e) => setError(e?.message ?? "Failed to load"))
            .finally(() => setLoading(false));
    }, [branchId]);

    if (loading) return <Skeleton />;

    if (error || !data) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: "#070b10" }}
            >
                <div className="text-center space-y-3">
                    <p className="text-red-400 text-[13px]">{error ?? "Branch not found"}</p>
                    <button
                        onClick={() => router.back()}
                        className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors"
                    >
                        ← Go back
                    </button>
                </div>
            </div>
        );
    }

    const typeStyle =
        BRANCH_TYPE_STYLE[data.branchType] ?? BRANCH_TYPE_STYLE.local_branch;
    const statusStyle = STATUS_STYLE[data.status] ?? STATUS_STYLE.inactive;

    // Coordinates: backend stores [longitude, latitude]
    const [lng, lat] = data.location?.coordinates ?? [];
    const hasCoords = lat != null && lng != null;

    // Capacity percentage
    const capacityPct =
        data.capacityLimit && data.capacityLimit > 0
            ? Math.min(100, Math.round((data.currentLoad / data.capacityLimit) * 100))
            : null;

    return (
        <div className="min-h-screen overflow-y-scroll" style={{ background: "#070b10" }}>
            <div className="max-w-5xl overflow-y-scroll mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* ── Breadcrumb ─────────────────────────────────────────── */}
                <div className="flex items-center gap-2 text-[12px]">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                        <ArrowLeft size={13} />
                        Branches
                    </button>
                    <ChevronRight size={12} className="text-slate-700" />
                    <span className="text-slate-500">{data.name}</span>
                </div>

                {/* ── Hero header ────────────────────────────────────────── */}
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
                            style={{
                                background: typeStyle.bg,
                                border: `1px solid ${typeStyle.border}`,
                            }}
                        >
                            <Network size={22} style={{ color: typeStyle.color }} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-[22px] font-bold text-white tracking-tight">
                                    {data.name}
                                </h1>
                                {/* Type badge */}
                                <span
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{
                                        background: typeStyle.bg,
                                        color: typeStyle.color,
                                        border: `1px solid ${typeStyle.border}`,
                                    }}
                                >
                                    {typeStyle.label}
                                </span>
                                {/* Status badge */}
                                <span
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                                    style={{
                                        background: `${statusStyle.color}15`,
                                        color: statusStyle.color,
                                        border: `1px solid ${statusStyle.color}33`,
                                    }}
                                >
                                    {statusStyle.icon}
                                    {statusStyle.label}
                                </span>
                            </div>

                            {/* Sub-info */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                    <Building2 size={11} className="text-slate-600" />
                                    {data.companyId?.name ?? "—"}
                                </span>
                                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                    <MapPin size={11} className="text-slate-600" />
                                    {data.fullAddress}
                                </span>
                                <span className="flex items-center gap-1 text-[12px] text-slate-500 font-mono">
                                    {data.code}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="flex flex-col items-end gap-1 text-[11px] text-slate-700 shrink-0">
                        <span className="flex items-center gap-1">
                            <Clock size={10} /> Created {fmt(data.createdAt)}
                        </span>
                        {data.updatedAt && (
                            <span className="flex items-center gap-1">
                                <Clock size={10} /> Updated {fmt(data.updatedAt)}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Capacity bar ───────────────────────────────────────── */}
                {data.capacityLimit != null && (
                    <Card>
                        <CardHeader icon={<TrendingUp size={14} />} title="Capacity" />
                        <div className="flex items-center justify-between mb-2 text-[12px]">
                            <span className="text-slate-500">
                                {data.currentLoad} / {data.capacityLimit} units
                            </span>
                            <span
                                style={{
                                    color:
                                        (capacityPct ?? 0) > 80
                                            ? "#f87171"
                                            : (capacityPct ?? 0) > 50
                                                ? "#f59e0b"
                                                : "#22c55e",
                                }}
                            >
                                {capacityPct}%
                            </span>
                        </div>
                        <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${capacityPct}%`,
                                    background:
                                        (capacityPct ?? 0) > 80
                                            ? "#ef4444"
                                            : (capacityPct ?? 0) > 50
                                                ? "#f59e0b"
                                                : "#22c55e",
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-[11px]">
                            <span className="text-slate-600">
                                Available:{" "}
                                <span className="text-slate-400">{data.availableCapacity}</span>
                            </span>
                            <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                style={
                                    data.isFull
                                        ? {
                                            background: "rgba(239,68,68,0.1)",
                                            color: "#f87171",
                                        }
                                        : {
                                            background: "rgba(34,197,94,0.08)",
                                            color: "#22c55e",
                                        }
                                }
                            >
                                {data.isFull ? "Full" : "Has space"}
                            </span>
                        </div>
                    </Card>
                )}

                {/* ── Main grid ──────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* ── Left col ─────────────────────────────────────── */}
                    <div className="space-y-4">

                        {/* Contact */}
                        <Card>
                            <CardHeader icon={<Phone size={14} />} title="Contact" />
                            <div className="divide-y divide-white/4">
                                <InfoRow
                                    label="Phone"
                                    value={
                                        <span className="flex items-center gap-1.5">
                                            <Phone size={10} className="text-slate-600" />
                                            {data.phone}
                                        </span>
                                    }
                                />
                                <InfoRow
                                    label="Email"
                                    value={
                                        <span className="flex items-center gap-1.5">
                                            <Mail size={10} className="text-slate-600" />
                                            {data.email}
                                        </span>
                                    }
                                />
                            </div>
                        </Card>

                        {/* Address & Location */}
                        <Card>
                            <CardHeader icon={<MapPin size={14} />} title="Address & Location" />
                            <div className="divide-y divide-white/4">
                                <InfoRow label="Street" value={data.address?.street} />
                                <InfoRow label="City" value={data.address?.city} />
                                <InfoRow label="State" value={data.address?.state} />
                                {data.address?.postalCode && (
                                    <InfoRow
                                        label="Postal Code"
                                        value={data.address.postalCode}
                                        mono
                                    />
                                )}
                                {hasCoords && (
                                    <>
                                        <InfoRow
                                            label="Latitude"
                                            value={lat?.toFixed(6)}
                                            mono
                                        />
                                        <InfoRow
                                            label="Longitude"
                                            value={lng?.toFixed(6)}
                                            mono
                                        />
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* Company */}
                        <Card>
                            <CardHeader icon={<Building2 size={14} />} title="Company" />
                            <div className="divide-y divide-white/4">
                                <InfoRow label="Name" value={data.companyId?.name} />
                                <InfoRow
                                    label="Business Type"
                                    value={data.companyId?.businessType}
                                />
                                <InfoRow
                                    label="Status"
                                    value={
                                        <span
                                            className="capitalize"
                                            style={{
                                                color:
                                                    data.companyId?.status === "active"
                                                        ? "#22c55e"
                                                        : "#94a3b8",
                                            }}
                                        >
                                            {data.companyId?.status}
                                        </span>
                                    }
                                />
                            </div>
                        </Card>
                    </div>

                    {/* ── Right col ────────────────────────────────────── */}
                    <div className="space-y-4">

                        {/* Hierarchy */}
                        <Card>
                            <CardHeader icon={<GitBranch size={14} />} title="Hierarchy" />

                            {/* Parent hub */}
                            <div className="mb-4">
                                <p className="text-[10px] uppercase tracking-widest text-slate-700 mb-2">
                                    Parent Hub
                                </p>
                                {data.parentHubId ? (
                                    <div
                                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                                        style={{
                                            background: "rgba(251,191,36,0.05)",
                                            border: "1px solid rgba(251,191,36,0.1)",
                                        }}
                                    >
                                        <Network
                                            size={13}
                                            className="text-amber-500/60 shrink-0"
                                        />
                                        <span className="text-[12px] text-slate-400 font-mono">
                                            {data.parentHubId}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-[12px] text-slate-700 italic px-1">
                                        {data.isHub
                                            ? "Top-level hub — no parent"
                                            : "No parent hub assigned"}
                                    </p>
                                )}
                            </div>

                            {/* Serves branches */}
                            {data.servesBranches && data.servesBranches.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-700 mb-2">
                                        Serves{" "}
                                        <span className="text-slate-800">
                                            ({data.servesBranches.length})
                                        </span>
                                    </p>
                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                        {data.servesBranches.map((id) => (
                                            <div
                                                key={id}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                                                style={{
                                                    background: "rgba(255,255,255,0.03)",
                                                    border: "1px solid rgba(255,255,255,0.05)",
                                                }}
                                            >
                                                <span className="text-[11px] text-slate-500 font-mono truncate">
                                                    {id}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Operating Hours */}
                        <Card>
                            <CardHeader icon={<Clock size={14} />} title="Operating Hours" />
                            <div className="space-y-1">
                                {WEEK_DAYS.map((day) => {
                                    const hours = data.operatingHours?.[day];
                                    return (
                                        <div
                                            key={day}
                                            className="flex items-center justify-between py-1.5"
                                            style={{
                                                borderBottom:
                                                    "1px solid rgba(255,255,255,0.03)",
                                            }}
                                        >
                                            <span className="text-[11px] text-slate-600 capitalize w-20">
                                                {day}
                                            </span>
                                            {hours ? (
                                                <span className="text-[12px] text-slate-300 font-mono">
                                                    {hours.open} – {hours.close}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-700 italic">
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* isOpen virtual */}
                            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <span
                                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                    style={
                                        data.isOpen
                                            ? {
                                                background: "rgba(34,197,94,0.08)",
                                                color: "#22c55e",
                                                border: "1px solid rgba(34,197,94,0.2)",
                                            }
                                            : {
                                                background: "rgba(148,163,184,0.06)",
                                                color: "#64748b",
                                                border: "1px solid rgba(148,163,184,0.1)",
                                            }
                                    }
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                            background: data.isOpen ? "#22c55e" : "#475569",
                                        }}
                                    />
                                    {data.isOpen ? "Currently open" : "Currently closed"}
                                </span>
                            </div>
                        </Card>

                        {/* Meta */}
                        <Card>
                            <CardHeader icon={<Network size={14} />} title="Meta" />
                            <div className="divide-y divide-white/4">
                                <InfoRow
                                    label="Branch ID"
                                    value={
                                        <span className="text-[11px] font-mono text-slate-500">
                                            {data._id ?? data.id}
                                        </span>
                                    }
                                />
                                <InfoRow
                                    label="Is Hub"
                                    value={
                                        <span
                                            style={{
                                                color: data.isHub ? "#fbbf24" : "#475569",
                                            }}
                                        >
                                            {data.isHub ? "Yes" : "No"}
                                        </span>
                                    }
                                />
                                <InfoRow
                                    label="Available"
                                    value={
                                        <span
                                            style={{
                                                color: data.isAvailable ? "#22c55e" : "#94a3b8",
                                            }}
                                        >
                                            {data.isAvailable ? "Yes" : "No"}
                                        </span>
                                    }
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}