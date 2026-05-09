"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { User } from "lucide-react";
import DriverRow from "./DriverRow";
import { IDriverResponse } from "@/types/driver";


interface DriverListProps {
    drivers: IDriverResponse[];
    loading?: boolean;
    onViewDetail?: (driverId: string) => void;
    onToggleStatus?: (driver: IDriverResponse) => void;
    onAddClick?: () => void;
}

export default function DriverList({ drivers, loading, onAddClick, onViewDetail, onToggleStatus }: DriverListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        height: "100%",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (drivers.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Drivers yet"
                    description="Add your first driver and assign them to a logistics node."
                    icon={User}
                    actionLabel="+ Add Driver"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }


    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[180px_1fr_120px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Staff", "Contact", "Status", ""].map((h, i) => (
                    <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
                        {h}
                    </div>
                ))}
            </div>
            {drivers.map((s, idx) => (
                <DriverRow
                    key={s.id}
                    driver={s}
                    isLast={idx === drivers.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(s.id) : undefined}
                    onToggleStatus={onToggleStatus ? () => onToggleStatus(s) : undefined}
                />
            ))}
        </div>
    );
}