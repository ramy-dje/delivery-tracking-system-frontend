"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { Truck } from "lucide-react";
import VehicleRow from "./VehicleRow";
import { IVehicleResponse } from "@/types/vehicle";

interface VehicleListProps {
    vehicles: IVehicleResponse[];
    loading?: boolean;
    onViewDetail?: (vehicleId: string) => void;
    onAddClick?: () => void;
}

export default function VehicleList({ vehicles, loading, onAddClick, onViewDetail }: VehicleListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        height: "100%",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (vehicles.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Vehicles yet"
                    description="Add your first vehicle to the fleet."
                    icon={Truck}
                    actionLabel="+ Add Vehicle"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[180px_1fr_150px_120px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Vehicle", "Brand / Model", "Capacity", "Cooling", ""].map((h, i) => (
                    <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
                        {h}
                    </div>
                ))}
            </div>
            {vehicles.map((v, idx) => (
                <VehicleRow
                    key={v.id}
                    vehicle={v}
                    isLast={idx === vehicles.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(v.id) : undefined}
                />
            ))}
        </div>
    );
}