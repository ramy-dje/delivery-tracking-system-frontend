"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import { ITariffEntry } from "@/types/deliveryFee";
import DeliveryFeeRow from "./DeliveryFeeRow";
import EmptyState from "@/components/commons/EmptyState";
import { Truck } from "lucide-react";

interface DeliveryFeeListProps {
    fees: ITariffEntry[];
    loading?: boolean;
    onViewDetail?: (fee: ITariffEntry) => void;
    onEdit?: (fee: ITariffEntry) => void;
    onDelete?: (fee: ITariffEntry) => void;
    onAddClick?: () => void;
}

export default function DeliveryFeeList({
    fees,
    loading,
    onAddClick,
    onViewDetail,
    onEdit,
    onDelete,
}: DeliveryFeeListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div className="flex-1" style={tableStyle}><SkeletonList rows={5} /></div>;

    if (fees.length === 0) {
        return (
            <div className="flex-1 flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Tariffs set yet"
                    description="Define your first tariff by selecting wilaya pairs and entering their prices."
                    icon={Truck}
                    actionLabel="+ Add Tariff"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto" style={tableStyle}>
            <div
                className="hidden md:grid md:grid-cols-[1fr_200px_200px_140px] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Wilaya Pair", "Stopdesk Price", "Domicile Price", "Actions"].map((h, i) => (
                    <div key={i} className={`text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold ${i === 3 ? "text-center" : "text-start"} `}>
                        {h}
                    </div>
                ))}
            </div>
            {fees.map((fee, idx) => (
                <DeliveryFeeRow
                    key={`${fee.from.id}-${fee.to.id}`}
                    fee={fee}
                    isLast={idx === fees.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(fee) : undefined}
                    onEdit={onEdit ? () => onEdit(fee) : undefined}
                    onDelete={onDelete ? () => onDelete(fee) : undefined}
                />
            ))}
        </div>
    );
}