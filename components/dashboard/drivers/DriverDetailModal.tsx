"use client";

import { useEffect, useState } from "react";
import { IDriverDetails } from "@/types/driver";
import {
    User, Truck, Phone,
    Calendar, Activity, CheckCircle
} from "lucide-react";
import {
    getDriver,
    UnassignVehicleFromDriver,
    AssignVehicleToDriver,
} from "@/services/DriverService";
import EntityPicker from "@/components/commons/EntityPicker";
import { showToast } from "nextjs-toast-notify";
import { IVehicleResponse } from "@/types/vehicle";
import { listVehicles } from "@/services/VehicleService";
import ActionBtn from "@/components/commons/ActionButton";
import { parseApiError } from "@/utils/apiErrorHandler";
import { GlassHero } from "@/components/commons/GlassHero";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import GlassEffectCard from "@/components/commons/GlassEffectCard";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import ErrorBaner from "@/components/commons/ErrorBaner";


interface DriverDetailModalProps {
    driverId: string;
    isOpen: boolean;
    onClose: () => void;
    onReassignSuccess?: () => void;
}

export default function DriverDetailModal({
    driverId,
    isOpen,
    onClose,
    onReassignSuccess,
}: DriverDetailModalProps) {
    const [driver, setDriver] = useState<IDriverDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showVehiclePicker, setShowVehiclePicker] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    const handleVehicleSelectionChange = (id: string | null) => {
        setSelectedVehicleId(id);
    };

    useEffect(() => {
        if (!isOpen || !driverId) return;
        let active = true;

        const fetchDriver = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getDriver(driverId);
                if (active) setDriver(data);
            } catch (e: any) {
                if (active) setError(e?.message ?? "Failed to load driver details");
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchDriver();
        return () => { active = false; };
    }, [isOpen, driverId]);

    useEffect(() => {
        if (!isOpen) {
            setShowVehiclePicker(false);
            setAssigning(false);
            setSelectedVehicleId(null);
        }
    }, [isOpen]);

    const handleAssignVehicle = async () => {
        if (!driver || !selectedVehicleId) return;
        setAssigning(true);
        try {
            await AssignVehicleToDriver(driver.id, selectedVehicleId);
            showToast.success("Vehicle assigned successfully");
            setShowVehiclePicker(false);
            setSelectedVehicleId(null);
            onReassignSuccess?.();
            onClose();
        } catch (err: any) {
            showToast.error(err?.message ?? "Failed to assign vehicle");
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassignVehicle = async () => {
        if (!driver || !driver.assignedVehicle) return;
        try {
            await UnassignVehicleFromDriver(driver.id, driver.assignedVehicle?.id);
            showToast.success("Vehicle unassigned");
            const updated = await getDriver(driver.id);
            setDriver(updated);
            onReassignSuccess?.();
        } catch (err: any) {
            const apiError = parseApiError(err);
            showToast.error(apiError.message);
        }
    };

    const items = [
        {
            icon: <Phone size={10} />,
            value: driver?.phoneNumber || "No phone",
            muted: !driver?.phoneNumber,
        },
        {
            icon: <Calendar size={10} />,
            value: driver?.createdAt
                ? new Date(driver.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
                : "—",
        },
    ];

    return (
        <>
            {/* ─── MAIN DRIVER MODAL ─── */}
            <GlassEffectCard
                isOpen={isOpen}
                onClose={onClose}
                title="Driver Profile"
                subtitle={driverId?.slice(0, 14).toUpperCase()}
                headerIcon={<User size={17} style={{ color: "#fbbf24" }} />}
                showCloseButton={true}
                accentColor="amber"
                withNoise={true}
                withSweep={true}
                withAvatarGlow={true}
                footer={<>
                    <ActionBtn
                        onClick={onClose}
                        title="Close"
                        label="Close"
                        variant="slate"
                        size="action"
                        className="w-fit text-sm! font-medium! capitalize px-4 py-2 text-text-secondary"
                    />

                    <div className="flex items-center gap-2">
                        {driver?.assignedVehicle ? (
                            <ActionBtn
                                onClick={handleUnassignVehicle}
                                title="Unassign Vehicle"
                                label="Unassign"
                                variant="red"
                                disabled={assigning}
                                size="action"
                            />
                        ) : (
                            <ActionBtn
                                onClick={() => setShowVehiclePicker(true)}
                                title="Assign Vehicle"
                                label={assigning ? "Assigning…" : "Assign Vehicle"}
                                disabled={assigning}
                                variant="emerald"
                                size="action"
                            >
                                <Truck className="w-3.5 h-3.5" />
                            </ActionBtn>
                        )}
                    </div>
                </>}
            >
                {loading ?
                    <LoadingSpinner /> :
                    (
                        error && <ErrorBaner error={error} setError={setError} />
                    )}

                {driver && !loading &&
                    <div className="space-y-5">
                        {/* Identity Hero */}
                        <GlassHero
                            title={`${driver.firstName} ${driver.lastName}`}
                            subtitle={driver.email}
                            statusLabel={driver.isActive ? "Active" : "Inactive"}
                            isActive={driver.isActive}
                            metaItems={items}
                            accentColor="amber"
                        />

                        {/* Assignment Section */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <div
                                    className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                    style={{
                                        background: "rgba(251,191,36,0.1)",
                                        border: "1px solid rgba(251,191,36,0.15)"
                                    }}
                                >
                                    <Truck size={10} style={{ color: "#fbbf24" }} />
                                </div>
                                <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                    Assignment
                                </span>
                                <div className="gef-divider" />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {/* Vehicle Card */}
                                <GlassStatCard
                                    icon={<Truck size={11} style={{ color: "#fbbf24" }} />}
                                    label="Vehicle"
                                    value={driver.assignedVehicle
                                        ? `${driver.assignedVehicle.brand} ${driver.assignedVehicle.model}`
                                        : null
                                    }
                                    secondaryValue={driver.assignedVehicle?.licensePlate}
                                    badge={driver.assignedVehicle?.capacityKg
                                        ? {
                                            label: `${driver.assignedVehicle.capacityKg.toLocaleString()} kg`,
                                            color: "amber"
                                        }
                                        : undefined
                                    }
                                    emptyState={{ label: "Unassigned" }}
                                    accentColor="amber"
                                />

                                {/* Shift Card */}
                                <GlassStatCard
                                    icon={
                                        <Activity
                                            size={11}
                                            style={{
                                                color: driver.activeShift ? "#34d399" : "#475569"
                                            }}
                                        />
                                    }
                                    label="Shift"
                                    value={driver.activeShift ? "On Duty" : null}
                                    secondaryValue={driver.activeShift
                                        ? `Since ${new Date(driver.activeShift.startTime).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}`
                                        : undefined
                                    }
                                    badge={driver.activeShift
                                        ? { label: "Active", color: "emerald" }
                                        : undefined
                                    }
                                    emptyState={{ label: "Off Duty" }}
                                    accentColor="emerald"
                                />
                            </div>
                        </div>
                    </div>}
            </GlassEffectCard>

            {/* ─── VEHICLE PICKER MODAL (Nested) ─── */}
            {showVehiclePicker && (
                <GlassEffectCard
                    isOpen={showVehiclePicker}
                    onClose={() => {
                        setShowVehiclePicker(false);
                        setSelectedVehicleId(null);
                    }}
                    title="Assign Vehicle"
                    subtitle="Choose an available vehicle for this driver"
                    headerIcon={<Truck size={16} style={{ color: "#fbbf24" }} />}
                    showCloseButton={false}
                    accentColor="amber"
                    withNoise={true}
                    withSweep={true}
                    maxWidth="448px"
                    footer={
                        <>
                            <p className="text-[10.5px]" style={{ color: "rgba(100,116,139,0.55)" }}>
                                {selectedVehicleId ? (
                                    <span className="flex items-center gap-1.5" style={{ color: "rgba(251,191,36,0.6)" }}>
                                        <CheckCircle size={10} />
                                        Vehicle selected
                                    </span>
                                ) : "No vehicle selected"}
                            </p>
                            <div className="flex items-center gap-2">
                                <ActionBtn
                                    onClick={() => {
                                        setShowVehiclePicker(false);
                                        setSelectedVehicleId(null);
                                    }}
                                    disabled={assigning}
                                    size="action"
                                    label="Cancel"
                                    variant="slate"
                                />
                                <ActionBtn
                                    onClick={handleAssignVehicle}
                                    disabled={assigning || !selectedVehicleId}
                                    size="action"
                                    label={assigning ? "Assigning…" : "Confirm"}
                                    variant="emerald"
                                />
                            </div>
                        </>
                    }
                >
                    <div className="p-1">
                        <EntityPicker<IVehicleResponse>
                            value={selectedVehicleId ?? null}
                            onChange={handleVehicleSelectionChange}
                            fetchData={async () => {
                                const res = await listVehicles({ pageSize: 100, pageNumber: 1, isAvailable: true });
                                return res.items.filter((d) => d.id !== driverId);
                            }}
                            getId={(d) => d.id}
                            getLabel={(d) => `${d.brand} ${d.model}`}
                            getSubLabel={(d) => d.licensePlate}
                            renderIcon={() => (
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Truck className="w-3.5 h-3.5 text-primary" />
                                </div>
                            )}
                            label="Select Vehicle *"
                            placeholder="Search vehicles…"
                            required
                        />
                    </div>
                </GlassEffectCard>
            )}
        </>
    );
}