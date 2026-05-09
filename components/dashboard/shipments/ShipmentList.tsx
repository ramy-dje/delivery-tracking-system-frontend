"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { Package } from "lucide-react";
import ShipmentRow from "./ShipmentRow";
import { IShipmentSummary } from "@/types/shipment";

interface ShipmentListProps {
    shipments: IShipmentSummary[];
    loading?: boolean;
    onViewDetail?: (shipmentId: string) => void;
    onAddClick?: () => void;
}

export default function ShipmentList({
    shipments,
    loading,
    onViewDetail,
    onAddClick,
}: ShipmentListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        height: "100%",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (shipments.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Shipments yet"
                    description="Create your first shipment (pickup or walk-in) to get started."
                    icon={Package}
                    actionLabel="+ Create Shipment"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[140px_1fr_120px_100px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Tracking", "Details", "Status", "Activity", ""].map((h, i) => (
                    <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
                        {h}
                    </div>
                ))}
            </div>
            {shipments.map((shipment, idx) => (
                <ShipmentRow
                    key={shipment.id}
                    shipment={shipment}
                    isLast={idx === shipments.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(shipment.id) : undefined}
                />
            ))}
        </div>
    );
}
