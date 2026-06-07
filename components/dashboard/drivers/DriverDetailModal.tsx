"use client";

import { useEffect, useState } from "react";
import { IDelivererResponse } from "@/types/driver";
import { User, Truck, Phone, Calendar, Activity } from "lucide-react";
import { getDriver } from "@/services/DriverService";
import ActionBtn from "@/components/commons/ActionButton";
import { GlassHero } from "@/components/commons/GlassHero";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import GlassEffectCard from "@/components/commons/GlassEffectCard";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import ErrorBaner from "@/components/commons/ErrorBaner";

interface DriverDetailModalProps {
    driverId: string;
    branchId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function DriverDetailModal({
    driverId,
    branchId,
    isOpen,
    onClose,
}: DriverDetailModalProps) {
    const [driver, setDriver] = useState<IDelivererResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !driverId || !branchId) return;
        let active = true;

        const fetchDriver = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getDriver(branchId, driverId);
                if (active) setDriver(data);
            } catch (e: any) {
                if (active) setError(e?.message ?? "Failed to load deliverer details");
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchDriver();
        return () => { active = false; };
    }, [isOpen, driverId, branchId]);

    const items = [
        {
            icon: <Phone size={10} />,
            value: driver?.userId?.phone || "No phone",
            muted: !driver?.userId?.phone,
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
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Deliverer Profile"
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
                        title={`${driver.userId?.firstName || ""} ${driver.userId?.lastName || ""}`}
                        subtitle={driver.userId?.email}
                        statusLabel={driver.isActive ? "Active" : "Inactive"}
                        isActive={driver.isActive}
                        metaItems={items}
                        accentColor="amber"
                    />

                    {/* Performance / Financials Section */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-3">
                            <div
                                className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                style={{
                                    background: "rgba(251,191,36,0.1)",
                                    border: "1px solid rgba(251,191,36,0.15)"
                                }}
                            >
                                <Activity size={10} style={{ color: "#fbbf24" }} />
                            </div>
                            <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                Performance & Stats
                            </span>
                            <div className="gef-divider" />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Deliveries Card */}
                            <GlassStatCard
                                icon={<Activity size={11} style={{ color: "#34d399" }} />}
                                label="Deliveries"
                                value={`${driver.totalDeliveries} total`}
                                secondaryValue={`${driver.successfulDeliveries} success, ${driver.failedDeliveries} fail`}
                                badge={
                                    driver.performance?.onTimeDeliveryRate !== undefined
                                        ? { label: `${driver.performance.onTimeDeliveryRate}% On-Time`, color: "emerald" }
                                        : undefined
                                }
                                accentColor="emerald"
                            />

                            {/* Earnings Card */}
                            <GlassStatCard
                                icon={
                                    <Activity
                                        size={11}
                                        style={{ color: "#fbbf24" }}
                                    />
                                }
                                label="Earnings"
                                value={`${driver.totalEarnings} DZD`}
                                secondaryValue={`Comm: ${driver.commission} DZD | Pending Return: ${driver.pendingBranchReturn} DZD`}
                                accentColor="amber"
                            />
                        </div>
                    </div>
                </div>}
        </GlassEffectCard>
    );
}