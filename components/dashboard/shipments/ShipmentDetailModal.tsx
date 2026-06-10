"use client";
import { useEffect, useState } from "react";
import { IPackage } from "@/types/shipment";
import { Package, Phone, MapPin, Clock, CheckCircle, AlertCircle, RotateCcw, Weight, DollarSign } from "lucide-react";
import { getShipmentById, trackFreelancerPackage } from "@/services/ShipmentService";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import GlassEffectCard from "@/components/commons/GlassEffectCard";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { GlassHero } from "@/components/commons/GlassHero";
import { getNodeId, getUserRole } from "@/hooks/useAuth";
import { ROLES } from "@/lib/roles";

interface ShipmentDetailModalProps {
    shipmentId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ShipmentDetailModal({ shipmentId, isOpen, onClose }: ShipmentDetailModalProps) {
    const hubId = getNodeId() ?? "";
    const userRole = getUserRole();
    const isFreelancer = userRole === ROLES.MERCHANT; // or 'freelancer' depending on your role constant
    
    const [shipment, setShipment] = useState<IPackage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !shipmentId) return;
        let active = true;

        const fetchShipment = async () => {
            setLoading(true);
            setError(null);
            try {
                let res;
                if (isFreelancer) {
                    // For freelancer: use track endpoint which doesn't need branchId
                    const trackingData = await trackFreelancerPackage(shipmentId);
                    res = { data: trackingData.package };
                } else {
                    // For supervisor/receptionist: need branchId
                    if (!hubId) throw new Error("Branch ID not found");
                    res = await getShipmentById(hubId, shipmentId);
                }
                if (active) setShipment(res.data);
            } catch (e: any) {
                if (active) setError(e?.response?.data?.message || e?.message || "Failed to load shipment details");
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchShipment();
        return () => { active = false; };
    }, [isOpen, shipmentId, hubId, isFreelancer]);

    const items = [
        {
            icon: <Phone size={10} />,
            value: shipment?.destination.recipientPhone || "No phone",
            muted: !shipment?.destination.recipientPhone,
        },
        {
            icon: <MapPin size={10} />,
            value: shipment?.destination.city || "Unknown Location",
            muted: !shipment?.destination.city,
        },
    ];

    return (
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Package Details"
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
                        title={shipment.trackingNumber}
                        subtitle={shipment.destination.recipientName}
                        statusLabel={<StatusBadge status={shipment.status} />}
                        isActive={shipment.status === 'delivered'}
                        metaItems={items}
                        accentColor={shipment.status === 'delivered' ? "emerald" : ['cancelled', 'failed_delivery', 'lost', 'damaged'].includes(shipment.status) ? "red" : "amber"}
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
                                value={shipment.attemptCount > 0 ? `${shipment.attemptCount}` : "None"}
                                secondaryValue={shipment.returnInfo?.isReturn ? "Return Initiated" : undefined}
                                badge={shipment.returnInfo?.isReturn ? { label: "RTO", color: "amber" } : undefined}
                                accentColor="amber"
                            />

                            <GlassStatCard
                                icon={<Clock size={11} style={{ color: shipment.trackingHistory?.length ? "#34d399" : "#475569" }} />}
                                label="Last Update"
                                value={shipment.updatedAt ? format(new Date(shipment.updatedAt), "MMM dd") : "No events"}
                                secondaryValue={shipment.updatedAt ? format(new Date(shipment.updatedAt), "HH:mm") : undefined}
                                emptyState={{ label: "—" }}
                                accentColor="emerald"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <GlassStatCard icon={<Package size={11} />} label="Total Price" value={`${shipment.totalPrice.toFixed(2)} DA`} accentColor="cyan" />
                        <GlassStatCard icon={<Weight size={11} />} label="Weight" value={`${shipment.weight} kg`} accentColor="violet" />
                    </div>

                    {/* Delivery Type & Priority */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <GlassStatCard 
                            icon={<MapPin size={11} />} 
                            label="Delivery Type" 
                            value={shipment.deliveryType === 'home' ? 'Home Delivery' : 'Branch Pickup'} 
                            accentColor="cyan" 
                        />
                        <GlassStatCard 
                            icon={<Clock size={11} />} 
                            label="Priority" 
                            value={shipment.deliveryPriority || 'Standard'} 
                            accentColor="violet" 
                        />
                    </div>

                    {/* Issues/RTO Info */}
                    {shipment.issues && shipment.issues.length > 0 && (
                        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                                <AlertCircle size={14} />
                                <span className="text-xs font-semibold uppercase">Issue Details</span>
                            </div>
                            {shipment.issues.map((issue, idx) => (
                                <div key={idx} className="text-[11px] text-slate-300">
                                    {issue.type}: <span className="text-slate-100 font-medium">{issue.description}</span>
                                </div>
                            ))}
                            {shipment.returnInfo?.isReturn && (
                                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mt-2">
                                    <RotateCcw size={12} /> Return Initiated
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timeline */}
                    {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.15)" }}>
                                    <Clock size={10} style={{ color: "#fbbf24" }} />
                                </div>
                                <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">Timeline</span>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>
                            <div className="space-y-3">
                                {shipment.trackingHistory
                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .slice(0, 5)
                                    .map((event, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-amber-400/50 mt-1.5" />
                                                {idx < shipment.trackingHistory.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                                            </div>
                                            <div>
                                                <StatusBadge status={event.status} />
                                                <div className="text-[11px] text-slate-500">
                                                    {format(new Date(event.timestamp), "MMM dd, yyyy HH:mm")}
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