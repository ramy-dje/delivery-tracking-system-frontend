"use client";

import { useEffect, useState } from "react";
import { getVehicle } from "@/services/VehicleService";
import { IVehicleDetails, VehicleOwnershipType } from "@/types/vehicle";
import { ReceiptText, Truck, User, Calendar, Activity } from "lucide-react";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import ErrorBaner from "@/components/commons/ErrorBaner";
import ActionBtn from "@/components/commons/ActionButton";
import { GlassHero } from "@/components/commons/GlassHero";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import GlassEffectCard from "@/components/commons/GlassEffectCard";

interface VehicleDetailModalProps {
    vehicleId: string;
    isOpen: boolean;
    onClose: () => void;
}

const OWNERSHIP_LABEL: Record<VehicleOwnershipType, string> = {
    Company: "Company Fleet",
    Driver: "Owner-Operator",
};

export default function VehicleDetailModal({ vehicleId, isOpen, onClose }: VehicleDetailModalProps) {
    const [vehicle, setVehicle] = useState<IVehicleDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !vehicleId) return;
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getVehicle(vehicleId);
                if (mounted) setVehicle(data);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? "Failed to load vehicle details");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [isOpen, vehicleId]);

    // Meta items for the Hero section
    const metaItems = vehicle
        ? [
            { icon: <ReceiptText size={10} />, value: vehicle.licensePlate, muted: false },
            { icon: <Truck size={10} />, value: `${vehicle.capacityKg.toLocaleString()} kg`, muted: false },
            { icon: <Calendar size={10} />, value: vehicle.isRefrigerated ? "Refrigerated" : "Standard", muted: false },
        ]
        : [];

    return (
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Vehicle Details"
            subtitle={vehicleId?.slice(0, 14).toUpperCase()}
            headerIcon={<Truck size={17} style={{ color: "#fbbf24" }} />}
            showCloseButton={true}
            accentColor="amber"
            withNoise={true}
            withSweep={true}
            withAvatarGlow={false}
            footer={
                <ActionBtn
                    onClick={onClose}
                    title="Close"
                    label="Close"
                    variant="slate"
                    size="action"
                    className="w-fit text-sm! font-medium! capitalize px-4 py-2 text-text-secondary"
                />
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {error && <ErrorBaner error={error} setError={setError} />}

                    {vehicle && (
                        <div className="space-y-5">
                            {/* ─── Identity Hero ─── */}
                            <GlassHero
                                title={`${vehicle.brand || "Unknown"} ${vehicle.model || ""}`}
                                subtitle={vehicle.type || "Commercial Vehicle"}
                                statusLabel={OWNERSHIP_LABEL[vehicle.ownershipType]}
                                isActive={true}
                                metaItems={metaItems}
                                accentColor="amber"
                            />

                            {/* ─── Specifications Section ─── */}
                            <div>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div
                                        className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: "rgba(251,191,36,0.1)",
                                            border: "1px solid rgba(251,191,36,0.15)",
                                        }}
                                    >
                                        <ReceiptText size={10} style={{ color: "#fbbf24" }} />
                                    </div>
                                    <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                        Specifications
                                    </span>
                                    <div className="gef-divider" />
                                </div>
                                <div className="grid grid-cols-3 gap-2.5">
                                    <GlassStatCard
                                        icon={<Truck size={11} style={{ color: "#fbbf24" }} />}
                                        label="Capacity"
                                        value={vehicle.capacityKg.toLocaleString()}
                                        secondaryValue="kg"
                                        accentColor="amber"
                                    />
                                    <GlassStatCard
                                        icon={<ReceiptText size={11} style={{ color: "#fbbf24" }} />}
                                        label="Volume"
                                        value={vehicle.volumeM3.toString()}
                                        secondaryValue="m³"
                                        accentColor="amber"
                                    />
                                    <GlassStatCard
                                        icon={<Activity size={11} style={{ color: vehicle.isRefrigerated ? "#34d399" : "#475569" }} />}
                                        label="Cooling"
                                        value={vehicle.isRefrigerated ? "Refrigerated" : "Standard"}
                                        badge={vehicle.isRefrigerated ? { label: "Yes", color: "emerald" } : { label: "No", color: "slate" }}
                                        accentColor={vehicle.isRefrigerated ? "emerald" : "amber"}
                                    />
                                </div>
                            </div>

                            {/* ─── Assignment Section ─── */}
                            <div>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div
                                        className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: "rgba(251,191,36,0.1)",
                                            border: "1px solid rgba(251,191,36,0.15)",
                                        }}
                                    >
                                        <User size={10} style={{ color: "#fbbf24" }} />
                                    </div>
                                    <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                        Assignment & Ownership
                                    </span>
                                    <div className="gef-divider" />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <GlassStatCard
                                        icon={<User size={11} style={{ color: "#fbbf24" }} />}
                                        label="Owner Driver"
                                        value={vehicle.ownerDriverName || null}
                                        emptyState={{ label: "No owner driver" }}
                                        accentColor="amber"
                                    />
                                    <GlassStatCard
                                        icon={<Calendar size={11} style={{ color: vehicle.currentAssignment ? "#34d399" : "#475569" }} />}
                                        label="Current Assignment"
                                        value={vehicle.currentAssignment?.driverName || null}
                                        secondaryValue={vehicle.currentAssignment
                                            ? `Since ${new Date(vehicle.currentAssignment.assignedAt).toLocaleDateString()}`
                                            : undefined
                                        }
                                        badge={vehicle.currentAssignment ? { label: "Assigned", color: "emerald" } : undefined}
                                        emptyState={{ label: "Unassigned" }}
                                        accentColor={vehicle.currentAssignment ? "emerald" : "amber"}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </GlassEffectCard>
    );
}