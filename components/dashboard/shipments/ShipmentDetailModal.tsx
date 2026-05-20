"use client";
import { useEffect, useState } from "react";
import { IShipmentDetail, ShipmentStatus, FailureReason } from "@/types/shipment";
import { Package, Phone, MapPin, Clock, CheckCircle, AlertCircle, RotateCcw, Weight, DollarSign } from "lucide-react";
import { getShipmentById } from "@/services/ShipmentService";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import GlassEffectCard from "@/components/commons/GlassEffectCard";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { format } from "date-fns";
import { getFailureReasonLabel, StatusBadge } from "./StatusBadge";
import { GlassHero } from "@/components/commons/GlassHero";

interface ShipmentDetailModalProps {
    shipmentId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ShipmentDetailModal({ shipmentId, isOpen, onClose }: ShipmentDetailModalProps) {
    const [shipment, setShipment] = useState<IShipmentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !shipmentId) return;
        let active = true;

        const fetchShipment = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getShipmentById(shipmentId);
                if (active) setShipment(data);
            } catch (e: any) {
                if (active) setError(e?.message ?? "Failed to load shipment details");
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchShipment();
        return () => { active = false; };
    }, [isOpen, shipmentId]);

    const items = [
        {
            icon: <Phone size={10} />,
            value: shipment?.customer.phoneNumber || "No phone",
            muted: !shipment?.customer.phoneNumber,
        },
        {
            icon: <MapPin size={10} />,
            value: shipment?.customer.commune?.nameFr || "Unknown Location",
            muted: !shipment?.customer.commune?.nameFr,
        },
    ];

    return (
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Shipment Details"
            subtitle={shipmentId?.slice(0, 14).toUpperCase()}
            headerIcon={<Package size={17} style={{ color: "#fbbf24" }} />}
            showCloseButton={true}
            accentColor="amber"
            withNoise={true}
            withSweep={true}
            withAvatarGlow={true}
            footer={
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all"
                >
                    Close
                </button>
            }
        >
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <ErrorBaner error={error} setError={setError} />
            ) : shipment ? (
                <div className="space-y-5">
                    {/* Identity Hero */}
                    <GlassHero
                        title={shipment.trackingCode}
                        subtitle={shipment.customer.fullName}
                        statusLabel={<StatusBadge status={shipment.status} />}
                        isActive={shipment.status === ShipmentStatus.Delivered}
                        metaItems={items}
                        accentColor={shipment.status === ShipmentStatus.Delivered ? "emerald" : shipment.status === ShipmentStatus.Cancelled ? "red" : "amber"}
                    />

                    {/* Status & Stats */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                Status & Info
                            </span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <GlassStatCard
                                icon={<CheckCircle size={11} style={{ color: "#fbbf24" }} />}
                                label="Delivery Attempts"
                                value={shipment.deliveryAttempts > 0 ? `${shipment.deliveryAttempts}` : "None"}
                                secondaryValue={shipment.isRto ? "Return Initiated" : undefined}
                                badge={shipment.isRto ? { label: "RTO", color: "amber" } : undefined}
                                accentColor="amber"
                            />

                            <GlassStatCard
                                icon={<Clock size={11} style={{ color: shipment.events?.length ? "#34d399" : "#475569" }} />}
                                label="Last Update"
                                value={shipment.events?.[0] ? format(new Date(shipment.events[0].createdAt), "MMM dd") : "No events"}
                                secondaryValue={shipment.events?.[0] ? format(new Date(shipment.events[0].createdAt), "HH:mm") : undefined}
                                emptyState={{ label: "—" }}
                                accentColor="emerald"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <GlassStatCard icon={<Package size={11} />} label="COD" value={`${shipment.codAmount.toFixed(2)} DA`} accentColor="cyan" />
                        <GlassStatCard icon={<Weight size={11} />} label="Weight" value={`${shipment.weightKg} kg`} accentColor="violet" />
                        <GlassStatCard icon={<DollarSign size={11} />} label="Fee" value={`${shipment.deliveryFee.toFixed(2)} DA`} accentColor="amber" />
                    </div>

                    {/* Failure/RTO Info */}
                    {(shipment.status === ShipmentStatus.DeliveryFailed || shipment.status === ShipmentStatus.Refused || shipment.isRto) && (
                        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                                <AlertCircle size={14} />
                                <span className="text-xs font-semibold uppercase">Issue Details</span>
                            </div>
                            {shipment.failureReason !== FailureReason.Other && (
                                <div className="text-[11px] text-slate-300">
                                    Reason: <span className="text-slate-100 font-medium">{getFailureReasonLabel(shipment.failureReason)}</span>
                                </div>
                            )}
                            {shipment.failureNotes && (
                                <div className="text-[11px] text-slate-300">
                                    Notes: <span className="text-slate-100 font-medium">{shipment.failureNotes}</span>
                                </div>
                            )}
                            {shipment.isRto && (
                                <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
                                    <RotateCcw size={12} /> Return to Merchant Initiated
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline */}
                    {shipment.events && shipment.events.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.15)" }}>
                                    <Clock size={10} style={{ color: "#fbbf24" }} />
                                </div>
                                <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">Timeline</span>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>
                            <div className="space-y-3">
                                {shipment.events
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .slice(0, 5)
                                    .map((event, idx) => (
                                        <div key={event.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-amber-400/50 mt-1.5" />
                                                {idx < shipment.events.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                                            </div>
                                            <div>
                                                <StatusBadge status={event.status} />
                                                <div className="text-[11px] text-slate-500">
                                                    {format(new Date(event.createdAt), "MMM dd, yyyy HH:mm")}
                                                </div>
                                                {event.notes && (
                                                    <div className="text-[11px] text-slate-400 mt-0.5">{event.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </GlassEffectCard>
    );
}