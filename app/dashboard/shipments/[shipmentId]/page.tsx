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
    IShipmentDetail,
    ShipmentStatus,
    FailureReason,
    EVENT_TYPE_LABEL,
    TRIGGER_SOURCE_LABEL,
    EventTriggerSource,
    ShipmentEventType,
} from "@/types/shipment";
import { getShipmentById } from "@/services/ShipmentService";
import { parseApiError } from "@/utils/apiErrorHandler";
import { showToast } from "nextjs-toast-notify";
import { handlePrint } from "@/utils/printHelper";

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
    ShipmentStatus,
    { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
    [ShipmentStatus.Pending]: { label: "Pending", color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.22)", icon: <Clock size={11} /> },
    [ShipmentStatus.ReceivedAtBranch]: { label: "At branch", color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)", icon: <Building2 size={11} /> },
    [ShipmentStatus.ReadyForTransfer]: { label: "Ready for transfer", color: "#60a5fa", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.25)", icon: <Package size={11} /> },
    [ShipmentStatus.InTransit]: { label: "In transit", color: "#60a5fa", bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.25)", icon: <Truck size={11} /> },
    [ShipmentStatus.ReceivedAtDestinationHub]: { label: "At destination hub", color: "#818cf8", bg: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.25)", icon: <Building2 size={11} /> },
    [ShipmentStatus.ReadyForDelivery]: { label: "Ready for delivery", color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.25)", icon: <Package size={11} /> },
    [ShipmentStatus.OutForDelivery]: { label: "Out for delivery", color: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.25)", icon: <Truck size={11} /> },
    [ShipmentStatus.Delivered]: { label: "Delivered", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.30)", icon: <CheckCircle2 size={11} /> },
    [ShipmentStatus.DeliveryFailed]: { label: "Delivery failed", color: "#fb7185", bg: "rgba(251,113,133,0.10)", border: "rgba(251,113,133,0.25)", icon: <XCircle size={11} /> },
    [ShipmentStatus.Refused]: { label: "Refused", color: "#fb7185", bg: "rgba(251,113,133,0.10)", border: "rgba(251,113,133,0.25)", icon: <Ban size={11} /> },
    [ShipmentStatus.PendingSwap]: { label: "Pending swap", color: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)", icon: <ArrowRightLeft size={11} /> },
    [ShipmentStatus.RtoPreparing]: { label: "RTO preparing", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.20)", icon: <RotateCcw size={11} /> },
    [ShipmentStatus.InTransitReturn]: { label: "Return transit", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.20)", icon: <Truck size={11} /> },
    [ShipmentStatus.ReturnedToMerchant]: { label: "Returned", color: "#c084fc", bg: "rgba(192,132,252,0.10)", border: "rgba(192,132,252,0.25)", icon: <RefreshCw size={11} /> },
    [ShipmentStatus.Cancelled]: { label: "Cancelled", color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.18)", icon: <XCircle size={11} /> },
};

const FAILURE_LABEL: Record<FailureReason, string> = {
    [FailureReason.OneTimeFailure]: "One-time failure",
    [FailureReason.AddressIssue]: "Address issue",
    [FailureReason.CustomerUnavailable]: "Customer unavailable",
    [FailureReason.WeatherDelay]: "Weather delay",
    [FailureReason.VehicleBreakdown]: "Vehicle breakdown",
    [FailureReason.Other]: "Other",
};

// Color to use for the event spine dot, keyed by ShipmentStatus
const EVENT_DOT: Partial<Record<ShipmentStatus, string>> = {
    [ShipmentStatus.Delivered]: "#34d399",
    [ShipmentStatus.DeliveryFailed]: "#fb7185",
    [ShipmentStatus.Refused]: "#fb7185",
    [ShipmentStatus.InTransit]: "#60a5fa",
    [ShipmentStatus.InTransitReturn]: "#f87171",
    [ShipmentStatus.Pending]: "#94a3b8",
    [ShipmentStatus.ReceivedAtBranch]: "#fbbf24",
    [ShipmentStatus.RtoPreparing]: "#f87171",
    [ShipmentStatus.ReturnedToMerchant]: "#c084fc",
    [ShipmentStatus.PendingSwap]: "#fbbf24",
    [ShipmentStatus.Cancelled]: "#64748b",
};

// ─── Primitives ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ShipmentStatus }) {
    const cfg = STATUS_CFG[status] ?? {
        label: String(status), color: "#94a3b8",
        bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", icon: null,
    };
    return (
        <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide"
            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

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
const PROGRESS_STEPS: ShipmentStatus[] = [
    ShipmentStatus.Pending,
    ShipmentStatus.ReceivedAtBranch,
    ShipmentStatus.ReadyForTransfer,
    ShipmentStatus.InTransit,
    ShipmentStatus.ReceivedAtDestinationHub,
    ShipmentStatus.ReadyForDelivery,
    ShipmentStatus.OutForDelivery,
    ShipmentStatus.Delivered,
];

const TERMINAL_STATUSES = new Set([
    ShipmentStatus.Delivered,
    ShipmentStatus.Cancelled,
    ShipmentStatus.ReturnedToMerchant,
    ShipmentStatus.Refused,
]);

function ProgressBar({ status }: { status: ShipmentStatus }) {
    const isRto = [ShipmentStatus.RtoPreparing, ShipmentStatus.InTransitReturn, ShipmentStatus.ReturnedToMerchant].includes(status);
    const isFailed = [ShipmentStatus.DeliveryFailed, ShipmentStatus.Refused, ShipmentStatus.Cancelled].includes(status);
    const isSwap = status === ShipmentStatus.PendingSwap;

    const stepIdx = PROGRESS_STEPS.indexOf(status);
    const activeIdx = stepIdx === -1 ? (isFailed ? PROGRESS_STEPS.length - 2 : -1) : stepIdx;

    if (isRto) {
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
                    ? (isFailed ? "#fb7185" : activeCfg?.color ?? cfg.color)
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

function EventTimeline({ events }: { events: IShipmentDetail["events"] }) {
    const sorted = [...events].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div className="flex flex-col">
            {sorted.map((ev, i) => {
                const dot = EVENT_DOT[ev.status] ?? "#64748b";
                const isLast = i === sorted.length - 1;
                const isTransit = ev.eventType === ShipmentEventType.InTransit
                    || ev.eventType === ShipmentEventType.InTransitReturn;

                return (
                    <div key={ev.id} className="flex gap-3 group">
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
                                    {EVENT_TYPE_LABEL[ev.eventType] ?? String(ev.eventType)}
                                </span>
                                <span className="text-[11px] text-slate-600 tabular-nums shrink-0 mt-px">
                                    {fmtShort(ev.createdAt)}
                                </span>
                            </div>

                            {/* meta pills */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span
                                    className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                    style={{ color: "#94a3b8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                                >
                                    {TRIGGER_SOURCE_LABEL[ev.triggerSource] ?? String(ev.triggerSource)}
                                </span>
                                {ev.hubId && (
                                    <span
                                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                        style={{ color: "#818cf8", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)" }}
                                    >
                                        <Building2 size={9} />
                                        {ev.hubId.slice(0, 8)}…
                                    </span>
                                )}
                                {isTransit && ev.fromNodeId && ev.toNodeId && (
                                    <span
                                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                        style={{ color: "#60a5fa", background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)" }}
                                    >
                                        <MapPin size={9} />
                                        {ev.fromNodeId.slice(0, 6)} → {ev.toNodeId.slice(0, 6)}
                                    </span>
                                )}
                                {ev.manifestId && (
                                    <span
                                        className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                        style={{ color: "#6ee7b7", background: "rgba(110,231,183,0.07)", border: "1px solid rgba(110,231,183,0.13)" }}
                                    >
                                        <FileText size={9} />
                                        manifest
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

// ─── Swap card ─────────────────────────────────────────────────────────────────

function SwapCard({ swap }: { swap: NonNullable<IShipmentDetail["swap"]> }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
                {swap.isConfirmed ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ color: "#34d399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}>
                        <CheckCircle2 size={10} />
                        Confirmed{swap.confirmedAt && <span className="font-normal opacity-60"> · {fmt(swap.confirmedAt)}</span>}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}>
                        <Clock size={10} />
                        Awaiting confirmation
                    </span>
                )}
                <span className="text-[11px] text-slate-600">Requested {fmt(swap.requestedAt)}</span>
            </div>

            <div className="grid grid-cols-[1fr_28px_1fr] gap-2 items-center">
                {[
                    { label: "Original", c: swap.originalCustomer, hub: swap.originalDestinationHubId },
                    null,
                    { label: "New", c: swap.newCustomer, hub: swap.newDestinationHubId },
                ].map((item, idx) => {
                    if (!item) return (
                        <div key={idx} className="flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                                <ArrowRightLeft size={12} className="text-amber-400" />
                            </div>
                        </div>
                    );
                    return (
                        <div key={idx} className="rounded-xl p-3"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">{item.label}</p>
                            <p className="text-[13px] font-semibold text-slate-200 leading-tight">{item.c.fullName}</p>
                            <p className="text-[12px] text-slate-500 mt-0.5">{item.c.phoneNumber}</p>
                            {item.hub && (
                                <p className="text-[10px] text-slate-600 font-mono mt-1.5">{item.hub.slice(0, 8)}…</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── KPI strip ─────────────────────────────────────────────────────────────────

function KpiStrip({ shipment }: { shipment: IShipmentDetail }) {
    const items = [
        {
            label: "COD amount",
            value: fmtCurrency(shipment.codAmount),
            color: "#fbbf24",
            icon: <span className="text-[14px]">DZD</span>,
        },
        {
            label: "Delivery fee",
            value: fmtCurrency(shipment.deliveryFee),
            color: "#818cf8",
            icon: <Truck size={14} />,
        },
        {
            label: "Total",
            value: fmtCurrency(shipment.totalAmount),
            color: "#34d399",
            icon: <CheckCircle2 size={14} />,
        },
        {
            label: "Attempts",
            value: String(shipment.deliveryAttempts),
            color: shipment.deliveryAttempts > 1 ? "#fb7185" : "#94a3b8",
            icon: <RefreshCw size={14} />,
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
    const params = useParams();
    const router = useRouter();
    const shipmentId = params?.shipmentId as string;

    const [shipment, setShipment] = useState<IShipmentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shipmentId) return;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                setShipment(await getShipmentById(shipmentId));
            } catch (e: any) {
                const err = parseApiError(e);
                setError(err.message ?? "Failed to load shipment");
                showToast.error(err.message ?? "Failed to load shipment");
            } finally {
                setLoading(false);
            }
        })();
    }, [shipmentId]);

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
    const isFailed = shipment.status === ShipmentStatus.DeliveryFailed
        || shipment.status === ShipmentStatus.Refused;
    const isRto = shipment.isRto;

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
                                {shipment.trackingCode}
                            </h1>
                            <StatusBadge status={shipment.status} />
                            {isRto && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                                    <RotateCcw size={9} />
                                    RTO
                                </span>
                            )}
                            {shipment.hasBeenSwapped && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                                    <ArrowRightLeft size={9} />
                                    Swapped
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                            {shipment.merchantBusinessName} · {shipment.companyName}
                        </p>
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
                            {cfg?.label ?? shipment.status}
                        </span>
                    </div>
                    <ProgressBar status={shipment.status} />
                    <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-slate-700">Created {fmt(shipment.createdAt)}</span>
                        {shipment.deliveredAt && (
                            <span className="text-[10px] text-emerald-600">Delivered {fmt(shipment.deliveredAt)}</span>
                        )}
                        {shipment.returnedAt && (
                            <span className="text-[10px] text-purple-600">Returned {fmt(shipment.returnedAt)}</span>
                        )}
                    </div>
                </div>
            </Card>

            {/* ── KPI strip ────────────────────────────────────────────────── */}
            <KpiStrip shipment={shipment} />

            {/* ── Failure / RTO banner ─────────────────────────────────────── */}
            {(isFailed || isRto) && (
                <div className="flex items-start gap-3 rounded-xl px-4 py-3"
                    style={{
                        background: isFailed ? "rgba(248,113,113,0.07)" : "rgba(248,113,113,0.05)",
                        border: `1px solid ${isFailed ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.15)"}`,
                    }}>
                    <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-red-400">
                            {isFailed
                                ? `Delivery failed · ${FAILURE_LABEL[shipment.failureReason] ?? "Unknown"}`
                                : "Return to origin in progress"}
                        </p>
                        {shipment.failureNotes && (
                            <p className="text-[11px] text-red-400/60 mt-0.5 leading-relaxed">{shipment.failureNotes}</p>
                        )}
                        {isRto && shipment.rtoInitiatedAt && (
                            <p className="text-[11px] text-red-400/60 mt-0.5">
                                Initiated {fmt(shipment.rtoInitiatedAt)}
                            </p>
                        )}
                    </div>
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
                                <Row label="Full name" value={shipment.customer.fullName} />
                                <Row label="Phone" value={shipment.customer.phoneNumber} />
                            </div>
                            <div>
                                <Row
                                    label="Commune"
                                    value={shipment.customer.commune?.nameFr ?? "—"}
                                    accent={shipment.customer.commune ? "#cbd5e1" : "#475569"}
                                />
                                <Row
                                    label="Destination"
                                    value={
                                        <span className="flex items-center gap-1.5 justify-end">
                                            <MapPin size={11} className="text-slate-500 shrink-0" />
                                            {shipment.finalDestinationNodeName}
                                            <span className="text-slate-500">·</span>
                                            <span className="text-slate-500">{shipment.finalDestinationWilayaName}</span>
                                        </span>
                                    }
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Shipment details */}
                    <Card>
                        <CardHeader icon={<Package size={14} />} title="Shipment details" />
                        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                            <div>
                                <Row label="Tracking code" value={<Mono>{shipment.trackingCode}</Mono>} />
                                <Row label="Delivery type" value={String(shipment.deliveryType)} />
                                <Row
                                    label="Weight"
                                    value={shipment.weightKg != null ? `${shipment.weightKg} kg` : "—"}
                                    accent={shipment.weightKg != null ? "#cbd5e1" : "#475569"}
                                />
                                <Row
                                    label="Description"
                                    value={shipment.description ?? "—"}
                                    accent={shipment.description ? "#94a3b8" : "#475569"}
                                />
                            </div>
                            <div>
                                <Row label="Merchant" value={shipment.merchantBusinessName} />
                                <Row label="Driver" value={shipment.assignedDriverId
                                    ? <ShortGuid id={shipment.assignedDriverId} />
                                    : <span className="text-slate-600">Unassigned</span>}
                                />
                                <Row label="Current node" value={<ShortGuid id={shipment.currentNodeId ?? null} />} />
                                <Row label="Next node" value={<ShortGuid id={shipment.nextNodeId ?? null} />} />
                            </div>
                        </div>
                    </Card>

                    {/* Swap */}
                    {shipment.swap && (
                        <Card>
                            <CardHeader icon={<ArrowRightLeft size={14} />} title="Swap request" />
                            <div className="px-5 pb-4">
                                <SwapCard swap={shipment.swap} />
                            </div>
                        </Card>
                    )}
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
                                label="RTO initiated"
                                value={fmt(shipment.rtoInitiatedAt)}
                                accent={shipment.rtoInitiatedAt ? "#fbbf24" : "#475569"}
                            />
                            <Row
                                label="Returned"
                                value={fmt(shipment.returnedAt)}
                                accent={shipment.returnedAt ? "#c084fc" : "#475569"}
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
                                    {shipment.events.length}
                                </span>
                            }
                        />
                        <div className="px-5 pb-4">
                            {shipment.events.length === 0 ? (
                                <p className="text-[12px] text-slate-600 text-center py-6">No events yet</p>
                            ) : (
                                <EventTimeline events={shipment.events} />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}