"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Package,
    User,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ArrowRightLeft,
    Printer,
    Truck,
    MapPin,
    RotateCcw,
    Ban,
    RefreshCw,
    Building2,
    FileText,
} from "lucide-react";
import {
    IPackage,
    PackageStatus,
    STATUS_LABEL,
} from "@/types/shipment";
import { getShipmentById } from "@/services/ShipmentService";
import { parseApiError } from "@/utils/apiErrorHandler";
import { showToast } from "nextjs-toast-notify";
import { handlePrint } from "@/utils/printHelper";
import { getNodeId } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/dashboard/shipments/StatusBadge";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string | null | undefined, fallback = "—") {
    if (!iso) return fallback;
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function fmtShort(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function fmtCurrency(n: number) {
    return n.toLocaleString("fr-DZ") + " DZD";
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
    PackageStatus,
    { color: string; bg: string; border: string; icon: React.ReactNode }
> = {
    pending: { color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.22)", icon: <Clock size={11} /> },
    cashier_claimed: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)", icon: <Building2 size={11} /> },
    accepted: { color: "#60a5fa", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.25)", icon: <Package size={11} /> },
    at_origin_branch: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)", icon: <Building2 size={11} /> },
    manifested: { color: "#60a5fa", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.25)", icon: <FileText size={11} /> },
    in_transit_to_branch: { color: "#60a5fa", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.25)", icon: <Truck size={11} /> },
    at_destination_branch: { color: "#818cf8", bg: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.25)", icon: <Building2 size={11} /> },
    out_for_delivery: { color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.25)", icon: <Truck size={11} /> },
    delivered: { color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.30)", icon: <CheckCircle2 size={11} /> },
    failed_delivery: { color: "#fb7185", bg: "rgba(251,113,133,0.10)", border: "rgba(251,113,133,0.25)", icon: <XCircle size={11} /> },
    failed_delivery_attempt: { color: "#fb7185", bg: "rgba(251,113,133,0.10)", border: "rgba(251,113,133,0.25)", icon: <AlertTriangle size={11} /> },
    rescheduled: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)", icon: <Clock size={11} /> },
    returned: { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.20)", icon: <RotateCcw size={11} /> },
    cancelled: { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.18)", icon: <XCircle size={11} /> },
    lost: { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.20)", icon: <AlertTriangle size={11} /> },
    damaged: { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.20)", icon: <AlertTriangle size={11} /> },
    on_hold: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)", icon: <Ban size={11} /> },
};


// Color to use for the event spine dot, keyed by PackageStatus
const EVENT_DOT: Partial<Record<PackageStatus, string>> = {
    delivered: "#34d399",
    failed_delivery: "#fb7185",
    failed_delivery_attempt: "#fb7185",
    in_transit_to_branch: "#60a5fa",
    pending: "#94a3b8",
    at_origin_branch: "#fbbf24",
    at_destination_branch: "#fbbf24",
    returned: "#f87171",
    cancelled: "#64748b",
};

// ─── Primitives ────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-2xl ${className}`}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
            {children}
        </div>
    );
}

function CardHeader({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
                <span className="text-slate-500">{icon}</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{title}</span>
            </div>
            {right}
        </div>
    );
}

function Row({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
    return (
        <div className="flex items-start justify-between gap-6 py-2.5 border-b border-white/5 last:border-0">
            <span className="text-[12px] text-slate-500 shrink-0">{label}</span>
            <span className="text-[13px] font-medium text-right break-all leading-relaxed"
                style={{ color: accent ?? "#cbd5e1" }}>
                {value}
            </span>
        </div>
    );
}

function Mono({ children }: { children: string }) {
    return <span className="font-mono text-[11px] text-amber-400/80">{children}</span>;
}

function ShortGuid({ id }: { id: string | null }) {
    if (!id) return <span className="text-slate-600">—</span>;
    return <Mono>{id.slice(0, 8)}</Mono>;
}

// ─── Progress bar ──────────────────────────────────────────────────────────────

// Ordered happy-path statuses for the progress visualiser
const PROGRESS_STEPS: PackageStatus[] = [
    'pending',
    'at_origin_branch',
    'in_transit_to_branch',
    'at_destination_branch',
    'out_for_delivery',
    'delivered',
];

const TERMINAL_STATUSES = new Set([
    'delivered',
    'cancelled',
    'returned',
    'lost',
    'damaged',
]);

function ProgressBar({ status, isReturn }: { status: PackageStatus, isReturn?: boolean }) {
    const isFailed = ['failed_delivery', 'cancelled', 'lost', 'damaged'].includes(status);

    const stepIdx = PROGRESS_STEPS.indexOf(status);
    const activeIdx = stepIdx === -1 ? (isFailed ? PROGRESS_STEPS.length - 2 : -1) : stepIdx;

    if (isReturn) {
        return (
            <div className="flex items-center gap-2 px-1">
                <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(248,113,113,0.15)" }}>
                    <div className="h-full rounded-full" style={{ width: "80%", background: "linear-gradient(90deg,#f87171,#ef4444)" }} />
                </div>
                <span className="text-[11px] text-red-400 font-semibold shrink-0">Returning</span>
            </div>
        );
    }

    return (
        <div className="relative flex items-center gap-0 px-1">
            {PROGRESS_STEPS.map((step, i) => {
                const isDone = i < activeIdx;
                const isActive = i === activeIdx;
                const cfg = STATUS_CFG[step];
                const activeCfg = STATUS_CFG[status];
                const color = isActive
                    ? (isFailed ? "#fb7185" : activeCfg?.color ?? cfg?.color)
                    : isDone ? "#34d399" : "rgba(255,255,255,0.1)";

                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        {/* dot */}
                        <div
                            className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                            style={{
                                background: color,
                                boxShadow: isActive ? `0 0 0 3px ${color}33` : "none",
                            }}
                        />
                        {/* connector line */}
                        {i < PROGRESS_STEPS.length - 1 && (
                            <div className="h-px flex-1 mx-0.5 transition-all duration-300"
                                style={{ background: isDone ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.07)" }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Event Timeline ────────────────────────────────────────────────────────────

function EventTimeline({ events }: { events: IPackage["trackingHistory"] }) {
    const sorted = [...(events || [])].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <div className="flex flex-col">
            {sorted.map((ev, i) => {
                const dot = EVENT_DOT[ev.status] ?? "#64748b";
                const isLast = i === sorted.length - 1;

                return (
                    <div key={i} className="flex gap-3 group">
                        {/* spine */}
                        <div className="flex flex-col items-center pt-0.5 shrink-0" style={{ width: 18 }}>
                            <div
                                className="w-2 h-2 rounded-full shrink-0 ring-2 ring-offset-0"
                                style={{
                                    background: dot,
                                    boxShadow: `0 0 0 3px ${dot}22`,
                                }}
                            />
                            {!isLast && (
                                <div className="w-px flex-1 mt-1.5"
                                    style={{ background: "rgba(255,255,255,0.06)", minHeight: 28 }} />
                            )}
                        </div>

                        {/* content */}
                        <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <span className="text-[12px] font-semibold text-slate-200 leading-tight">
                                    {STATUS_LABEL[ev.status] ?? String(ev.status)}
                                </span>
                                <span className="text-[11px] text-slate-600 tabular-nums shrink-0 mt-px">
                                    {fmtShort(ev.timestamp)}
                                </span>
                            </div>

                            {/* meta pills */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {ev.branchId && (
                                    <span
                                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                        style={{ color: "#818cf8", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)" }}
                                    >
                                        <Building2 size={9} />
                                        {ev.branchId.slice(0, 8)}…
                                    </span>
                                )}
                            </div>

                            {ev.notes && (
                                <p className="mt-1.5 text-[11px] text-slate-500 italic leading-relaxed">
                                    {ev.notes}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── KPI strip ─────────────────────────────────────────────────────────────────

function KpiStrip({ shipment }: { shipment: IPackage }) {
    const items = [
        {
            label: "Total Price",
            value: fmtCurrency(shipment.totalPrice),
            color: "#34d399",
            icon: <CheckCircle2 size={14} />,
        },
        {
            label: "Weight",
            value: `${shipment.weight} kg`,
            color: "#818cf8",
            icon: <Package size={14} />,
        },
        {
            label: "Attempts",
            value: String(shipment.attemptCount),
            color: shipment.attemptCount > 1 ? "#fb7185" : "#94a3b8",
            icon: <RefreshCw size={14} />,
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map(({ label, value, color, icon }) => (
                <div key={label} className="rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ color }}>
                        {icon}
                        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70">{label}</span>
                    </div>
                    <p className="text-[18px] font-bold tracking-tight" style={{ color }}>{value}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Bone({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-xl ${className}`}
            style={{ background: "rgba(255,255,255,0.05)" }} />
    );
}

function PageSkeleton() {
    return (
        <div className="flex flex-col gap-4 h-full pt-1">
            <div className="flex items-center gap-3">
                <Bone className="w-8 h-8 rounded-xl" />
                <Bone className="w-52 h-6" />
                <Bone className="w-24 h-6 ml-auto" />
            </div>
            <Bone className="h-16" />
            <Bone className="h-10" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <Bone className="h-32" />
                    <Bone className="h-48" />
                </div>
                <div className="flex flex-col gap-4">
                    <Bone className="h-40" />
                    <Bone className="h-56" />
                </div>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ShipmentDetailPage() {
    const hubId = getNodeId() ?? "";
    const params = useParams();
    const router = useRouter();
    const shipmentId = params?.shipmentId as string;

    const [shipment, setShipment] = useState<IPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shipmentId || !hubId) return;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getShipmentById(hubId, shipmentId);
                setShipment(res.data);
            } catch (e: any) {
                const err = parseApiError(e);
                setError(err.message ?? "Failed to load shipment");
                showToast.error(err.message ?? "Failed to load shipment");
            } finally {
                setLoading(false);
            }
        })();
    }, [shipmentId, hubId]);

    if (loading) return <PageSkeleton />;

    if (error || !shipment) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                    <XCircle size={24} className="text-red-400" />
                </div>
                <p className="text-[14px] text-slate-400">{error ?? "Shipment not found"}</p>
                <button onClick={() => router.back()}
                    className="text-[12px] text-amber-400 hover:text-amber-300 transition-colors">
                    ← Go back
                </button>
            </div>
        );
    }

    const cfg = STATUS_CFG[shipment.status];
    const isFailed = ['failed_delivery', 'lost', 'damaged', 'cancelled'].includes(shipment.status);
    const isRto = shipment.returnInfo?.isReturn;

    return (
        <div className="flex flex-col min-h-0 gap-4 h-full overflow-y-auto pb-8">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 pt-1 flex-wrap sticky top-0 z-10 py-3"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 80%, transparent)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => router.back()}
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all hover:bg-white/8 active:scale-95"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                        <ArrowLeft size={14} className="text-slate-400" />
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-[17px] font-bold text-white tracking-tight">
                                {shipment.trackingNumber}
                            </h1>
                            <StatusBadge status={shipment.status} />
                            {isRto && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                                    <RotateCcw size={9} />
                                    RTO
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => handlePrint(shipment)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium text-slate-400 transition-all hover:text-slate-200 hover:bg-white/5 active:scale-95"
                        style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                        <Printer size={13} />
                        Print label
                    </button>
                </div>
            </div>

            {/* ── Progress bar ─────────────────────────────────────────────── */}
            <Card>
                <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Journey</span>
                        <span className="text-[11px]" style={{ color: cfg?.color ?? "#94a3b8" }}>
                            {STATUS_LABEL[shipment.status] ?? shipment.status}
                        </span>
                    </div>
                    <ProgressBar status={shipment.status} isReturn={isRto} />
                    <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-slate-700">Created {fmt(shipment.createdAt)}</span>
                        {shipment.deliveredAt && (
                            <span className="text-[10px] text-emerald-600">Delivered {fmt(shipment.deliveredAt)}</span>
                        )}
                        {shipment.returnInfo?.returnDate && (
                            <span className="text-[10px] text-purple-600">Returned {fmt(shipment.returnInfo.returnDate)}</span>
                        )}
                    </div>
                </div>
            </Card>

            {/* ── KPI strip ────────────────────────────────────────────────── */}
            <KpiStrip shipment={shipment} />

            {/* ── Failure / RTO banner ─────────────────────────────────────── */}
            {(isFailed || isRto) && (
                <div className="flex flex-col gap-3 rounded-xl px-4 py-3"
                    style={{
                        background: isFailed ? "rgba(248,113,113,0.07)" : "rgba(248,113,113,0.05)",
                        border: `1px solid ${isFailed ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.15)"}`,
                    }}>
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                        <p className="text-[12px] font-semibold">
                            {isFailed ? `Delivery failed or exception` : "Return to origin in progress"}
                        </p>
                    </div>
                    {shipment.issues && shipment.issues.map((issue, idx) => (
                        <p key={idx} className="text-[11px] text-red-400/80 leading-relaxed ml-6">
                            - {issue.type}: {issue.description}
                        </p>
                    ))}
                </div>
            )}

            {/* ── Body grid ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ── Left col (2/3) ─────────────────────────────────────── */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Recipient */}
                    <Card>
                        <CardHeader icon={<User size={14} />} title="Recipient" />
                        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                            <div>
                                <Row label="Full name" value={shipment.destination.recipientName} />
                                <Row label="Phone" value={shipment.destination.recipientPhone} />
                            </div>
                            <div>
                                <Row
                                    label="City"
                                    value={shipment.destination.city ?? "—"}
                                    accent={shipment.destination.city ? "#cbd5e1" : "#475569"}
                                />
                                <Row
                                    label="State"
                                    value={shipment.destination.state ?? "—"}
                                />
                                <Row
                                    label="Address"
                                    value={shipment.destination.address ?? "—"}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Shipment details */}
                    <Card>
                        <CardHeader icon={<Package size={14} />} title="Shipment details" />
                        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                            <div>
                                <Row label="Tracking code" value={<Mono>{shipment.trackingNumber}</Mono>} />
                                <Row label="Delivery type" value={shipment.deliveryType.replace('_', ' ')} />
                                <Row
                                    label="Weight"
                                    value={shipment.weight != null ? `${shipment.weight} kg` : "—"}
                                    accent={shipment.weight != null ? "#cbd5e1" : "#475569"}
                                />
                                <Row
                                    label="Description"
                                    value={shipment.description ?? "—"}
                                    accent={shipment.description ? "#94a3b8" : "#475569"}
                                />
                            </div>
                            <div>
                                <Row label="Sender Type" value={shipment.senderType} />
                                <Row label="Deliverer" value={shipment.assignedDelivererId
                                    ? <ShortGuid id={shipment.assignedDelivererId} />
                                    : <span className="text-slate-600">Unassigned</span>}
                                />
                                <Row label="Origin branch" value={<ShortGuid id={shipment.originBranchId ?? null} />} />
                                <Row label="Current branch" value={<ShortGuid id={shipment.currentBranchId ?? null} />} />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ── Right col (1/3) ────────────────────────────────────── */}
                <div className="flex flex-col gap-4">

                    {/* Timestamps */}
                    <Card>
                        <CardHeader icon={<Calendar size={14} />} title="Timeline" />
                        <div className="px-5 pb-4">
                            <Row label="Created" value={fmt(shipment.createdAt)} />
                            <Row
                                label="Delivered"
                                value={fmt(shipment.deliveredAt)}
                                accent={shipment.deliveredAt ? "#34d399" : "#475569"}
                            />
                            <Row
                                label="Returned"
                                value={fmt(shipment.returnInfo?.returnDate)}
                                accent={shipment.returnInfo?.returnDate ? "#c084fc" : "#475569"}
                            />
                        </div>
                    </Card>

                    {/* Events */}
                    <Card>
                        <CardHeader
                            icon={<Clock size={14} />}
                            title="Events"
                            right={
                                <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                                    {shipment.trackingHistory?.length ?? 0}
                                </span>
                            }
                        />
                        <div className="px-5 pb-4">
                            {!shipment.trackingHistory || shipment.trackingHistory.length === 0 ? (
                                <p className="text-[12px] text-slate-600 text-center py-6">No events yet</p>
                            ) : (
                                <EventTimeline events={shipment.trackingHistory} />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}