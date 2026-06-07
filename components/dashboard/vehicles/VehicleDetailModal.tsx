"use client";

import { useEffect, useState } from "react";
import { getVehicle } from "@/services/VehicleService";
import { IVehicleDetails } from "@/types/vehicle";
import { ReceiptText, Truck, User, Calendar, Activity, FileText } from "lucide-react";
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
            { icon: <ReceiptText size={10} />, value: vehicle.registrationNumber, muted: false },
            { icon: <Truck size={10} />, value: `${vehicle.maxWeight.toLocaleString()} kg`, muted: false },
            { icon: <Activity size={10} />, value: vehicle.status.replace("_", " "), muted: false },
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
                                title={`${vehicle.brand || "Unknown"} ${vehicle.modelName || ""}`}
                                subtitle={vehicle.category || "Commercial Vehicle"}
                                statusLabel={vehicle.status.replace("_", " ")}
                                isActive={vehicle.isAvailable}
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
                                        label="Max Weight"
                                        value={vehicle.maxWeight.toLocaleString()}
                                        secondaryValue="kg"
                                        accentColor="amber"
                                    />
                                    <GlassStatCard
                                        icon={<ReceiptText size={11} style={{ color: "#fbbf24" }} />}
                                        label="Volume"
                                        value={vehicle.maxVolume.toString()}
                                        secondaryValue="m³"
                                        accentColor="amber"
                                    />
                                    <GlassStatCard
                                        icon={<Activity size={11} style={{ color: vehicle.supportsFragile ? "#34d399" : "#475569" }} />}
                                        label="Fragile Transport"
                                        value={vehicle.supportsFragile ? "Supported" : "Not Supported"}
                                        badge={vehicle.supportsFragile ? { label: "Yes", color: "emerald" } : { label: "No", color: "slate" }}
                                        accentColor={vehicle.supportsFragile ? "emerald" : "amber"}
                                    />
                                </div>
                            </div>

                            {/* ─── Details Section ─── */}
                            <div>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div
                                        className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: "rgba(251,191,36,0.1)",
                                            border: "1px solid rgba(251,191,36,0.15)",
                                        }}
                                    >
                                        <FileText size={10} style={{ color: "#fbbf24" }} />
                                    </div>
                                    <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                        Details & Documents
                                    </span>
                                    <div className="gef-divider" />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <GlassStatCard
                                        icon={<FileText size={11} style={{ color: "#fbbf24" }} />}
                                        label="Document Status"
                                        value={vehicle.documentStatus.replace("_", " ")}
                                        badge={{
                                            label: vehicle.documentStatus.toUpperCase(),
                                            color: vehicle.documentStatus === "valid" ? "emerald" : vehicle.documentStatus === "expired" || vehicle.documentStatus === "missing" ? "red" : "amber"
                                        }}
                                        accentColor="amber"
                                    />
                                    <GlassStatCard
                                        icon={<Calendar size={11} style={{ color: "#fbbf24" }} />}
                                        label="Year & Color"
                                        value={vehicle.year?.toString() || "N/A"}
                                        secondaryValue={vehicle.color || "No color specified"}
                                        accentColor="amber"
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
                                        Assignment
                                    </span>
                                    <div className="gef-divider" />
                                </div>
                                <div className="grid grid-cols-1 gap-2.5">
                                    <GlassStatCard
                                        icon={<User size={11} style={{ color: vehicle.isAssigned ? "#34d399" : "#475569" }} />}
                                        label="Current Assignment"
                                        value={vehicle.assignedUserName || null}
                                        secondaryValue={vehicle.isAssigned
                                            ? `Role: ${vehicle.assignedUserRole}`
                                            : undefined
                                        }
                                        badge={vehicle.isAssigned ? { label: "Assigned", color: "emerald" } : undefined}
                                        emptyState={{ label: "Unassigned" }}
                                        accentColor={vehicle.isAssigned ? "emerald" : "amber"}
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