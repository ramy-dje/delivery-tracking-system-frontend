"use client";

import { useEffect, useState } from "react";
import { IShipmentDetail, ShipmentStatus, ShipmentOrigin, FailureReason } from "@/types/shipment";
import {
    Package,
    Phone,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    RotateCcw,
} from "lucide-react";
import { getShipmentById } from "@/services/ShipmentService";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import GlassEffectCard from "@/components/commons/GlassEffectCard";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { format } from "date-fns";

interface ShipmentDetailModalProps {
    shipmentId: string;
    isOpen: boolean;
    onClose: () => void;
}

function getStatusLabel(status: ShipmentStatus): string {
    const labels: Record<ShipmentStatus, string> = {
        [ShipmentStatus.Pending]: "Pending",
        [ShipmentStatus.PickupRequested]: "Pickup Requested",
        [ShipmentStatus.DroppedOffAtBranch]: "Dropped Off At Branch",
        [ShipmentStatus.Collected]: "Collected",
        [ShipmentStatus.ReceivedAtHub]: "Received At Hub",
        [ShipmentStatus.ReadyForTransfer]: "Ready For Transfer",
        [ShipmentStatus.InTransit]: "In Transit",
        [ShipmentStatus.ReceivedAtDestinationHub]: "Received At Destination Hub",
        [ShipmentStatus.ReadyForDelivery]: "Ready For Delivery",
        [ShipmentStatus.OutForDelivery]: "Out For Delivery",
        [ShipmentStatus.Delivered]: "Delivered",
        [ShipmentStatus.DeliveryFailed]: "Delivery Failed",
        [ShipmentStatus.Refused]: "Refused",
        [ShipmentStatus.PendingSwap]: "Pending Swap",
        [ShipmentStatus.RtoPreparing]: "RTO Preparing",
        [ShipmentStatus.InTransitReturn]: "In Transit Return",
        [ShipmentStatus.ReturnedToMerchant]: "Returned To Merchant",
        [ShipmentStatus.Cancelled]: "Cancelled",
    };
    return labels[status] || "Unknown";
}

function getFailureReasonLabel(reason: FailureReason): string {
    const labels: Record<FailureReason, string> = {
        [FailureReason.OneTimeFailure]: "One Time Failure",
        [FailureReason.AddressIssue]: "Address Issue",
        [FailureReason.CustomerUnavailable]: "Customer Unavailable",
        [FailureReason.WeatherDelay]: "Weather Delay",
        [FailureReason.VehicleBreakdown]: "Vehicle Breakdown",
        [FailureReason.Other]: "Other",
    };
    return labels[reason] || "Unknown";
}

export default function ShipmentDetailModal({
    shipmentId,
    isOpen,
    onClose,
}: ShipmentDetailModalProps) {
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-3xl mx-4 rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/95 to-slate-950/95 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/90 backdrop-blur">
                    <h2 className="text-xl font-bold text-slate-100">Shipment Details</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {error && <ErrorBaner error={error} setError={setError} />}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : shipment ? (
                        <>
                            {/* Tracking & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <GlassStatCard
                                    label="Tracking Code"
                                    value={shipment.trackingCode}
                                    icon={<Package size={20} />}
                                />
                                <GlassStatCard
                                    label="Status"
                                    value={getStatusLabel(shipment.status)}
                                    icon={<CheckCircle size={20} />}
                                    accentColor={shipment.status === ShipmentStatus.Delivered ? "emerald" : "violet"}
                                />
                            </div>

                            {/* Customer Info */}
                            <GlassEffectCard isOpen={true}>
                                <h3 className="font-semibold text-slate-200 mb-4">Customer Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-slate-400 mt-1 shrink-0" />
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">Name</div>
                                            <div className="text-slate-100">{shipment.customer.fullName}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone size={16} className="text-slate-400 mt-1 shrink-0" />
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase">Phone</div>
                                            <div className="text-slate-100">{shipment.customer.phoneNumber}</div>
                                        </div>
                                    </div>
                                </div>
                            </GlassEffectCard>

                            {/* Shipment Details */}
                            <GlassEffectCard isOpen={true}>
                                <h3 className="font-semibold text-slate-200 mb-4">Shipment Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase mb-1">Origin</div>
                                        <div className="text-slate-100">
                                            {shipment.origin === ShipmentOrigin.PickupRequested
                                                ? "Pickup Request"
                                                : "Walk-in"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase mb-1">
                                            Delivery Attempts
                                        </div>
                                        <div className="text-slate-100">{shipment.deliveryAttempts}</div>
                                    </div>
                                    {shipment.description && (
                                        <div className="col-span-2">
                                            <div className="text-xs text-slate-500 uppercase mb-1">
                                                Description
                                            </div>
                                            <div className="text-slate-100">{shipment.description}</div>
                                        </div>
                                    )}
                                    {shipment.weightKg && (
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase mb-1">Weight</div>
                                            <div className="text-slate-100">{shipment.weightKg} kg</div>
                                        </div>
                                    )}
                                </div>
                            </GlassEffectCard>

                            {/* Pricing */}
                            <GlassEffectCard isOpen={true}>
                                <h3 className="font-semibold text-slate-200 mb-4">Pricing</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">COD Amount:</span>
                                        <span className="text-slate-100 font-medium">
                                            {shipment.codAmount.toFixed(2)} DA
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Delivery Fee:</span>
                                        <span className="text-slate-100 font-medium">
                                            {shipment.deliveryFee.toFixed(2)} DA
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-slate-300 font-medium">Total Amount:</span>
                                        <span className="text-emerald-400 font-bold text-lg">
                                            {shipment.totalAmount.toFixed(2)} DA
                                        </span>
                                    </div>
                                </div>
                            </GlassEffectCard>

                            {/* Failure/RTO Info */}
                            {(shipment.status === ShipmentStatus.DeliveryFailed ||
                                shipment.status === ShipmentStatus.Refused ||
                                shipment.isRto) && (
                                    <GlassEffectCard isOpen={true}>
                                        <h3 className="font-semibold text-slate-200 mb-4">
                                            <AlertCircle className="inline mr-2" size={16} />
                                            Status Information
                                        </h3>
                                        <div className="space-y-3">
                                            {shipment.failureReason !== FailureReason.Other && (
                                                <div>
                                                    <div className="text-xs text-slate-500 uppercase mb-1">
                                                        Failure Reason
                                                    </div>
                                                    <div className="text-slate-100">
                                                        {getFailureReasonLabel(shipment.failureReason)}
                                                    </div>
                                                </div>
                                            )}
                                            {shipment.failureNotes && (
                                                <div>
                                                    <div className="text-xs text-slate-500 uppercase mb-1">
                                                        Notes
                                                    </div>
                                                    <div className="text-slate-100">{shipment.failureNotes}</div>
                                                </div>
                                            )}
                                            {shipment.isRto && (
                                                <div>
                                                    <div className="text-xs text-slate-500 uppercase mb-1">RTO Status</div>
                                                    <div className="flex items-center gap-2 text-amber-300">
                                                        <RotateCcw size={14} />
                                                        Return to Original Merchant Initiated
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </GlassEffectCard>
                                )}

                            {/* Timeline */}
                            {shipment.events && shipment.events.length > 0 && (
                                <GlassEffectCard isOpen={true}>
                                    <h3 className="font-semibold text-slate-200 mb-4">Timeline</h3>
                                    <div className="space-y-3">
                                        {shipment.events
                                            .sort(
                                                (a, b) =>
                                                    new Date(b.createdAt).getTime() -
                                                    new Date(a.createdAt).getTime()
                                            )
                                            .slice(0, 5)
                                            .map((event, idx) => (
                                                <div key={event.id} className="flex gap-3">
                                                    <Clock size={14} className="text-slate-500 mt-1 shrink-0" />
                                                    <div>
                                                        <div className="text-slate-100 text-sm">
                                                            Status: {getStatusLabel(event.status)}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {format(
                                                                new Date(event.createdAt),
                                                                "MMM dd, yyyy HH:mm"
                                                            )}
                                                        </div>
                                                        {event.notes && (
                                                            <div className="text-xs text-slate-400 mt-1">
                                                                {event.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </GlassEffectCard>
                            )}
                        </>
                    ) : null}

                    {/* Actions */}
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
