"use client";
import { useState, useCallback } from "react";
import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { Package, Printer } from "lucide-react";
import ShipmentRow from "./ShipmentRow";
import { IShipmentSummary } from "@/types/shipment";
import { Role } from "@/lib/roles";
import ActionBtn from "@/components/commons/ActionButton";

interface ShipmentListProps {
    shipments: IShipmentSummary[];
    userRole: Role | undefined;
    loading?: boolean;
    onViewDetail?: (shipmentId: string) => void;
    onCancelClick?: () => void;
    onSwapClick?: () => void;
    onAddClick?: () => void;
    onBatchPrint?: (shipments: IShipmentSummary[]) => void;
    setSelectedShipment: (shipment: IShipmentSummary | null) => void;
}

export default function ShipmentList({
    shipments,
    userRole,
    loading,
    onViewDetail,
    onCancelClick,
    onSwapClick: onSwaplClick,
    onAddClick,
    onBatchPrint,
    setSelectedShipment,
}: ShipmentListProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        height: "100%",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    const handleSelect = useCallback((id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            checked ? next.add(id) : next.delete(id);
            return next;
        });
    }, []);

    const allSelected = shipments.length > 0 && selectedIds.size === shipments.length;
    const someSelected = selectedIds.size > 0 && !allSelected;

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? new Set(shipments.map((s) => s.id)) : new Set());
    };

    const handleBatchPrint = () => {
        const toPrint = shipments.filter((s) => selectedIds.has(s.id));
        onBatchPrint?.(toPrint);
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (shipments.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Shipments yet"
                    description="Create your first shipment to get started."
                    icon={Package}
                    actionLabel="+ Create Shipment"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div style={tableStyle} className="flex flex-col h-full min-h-0">

            {/* HEADER */}
            <div
                className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[32px_240px_1fr_180px_150px_150px]
                gap-4 px-5 py-3 items-center"
                style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
                {/* Select All checkbox */}
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-amber-400 cursor-pointer"
                        aria-label="Select all shipments"
                    />
                </div>

                {/* Column labels */}
                {["Tracking", "Details", "Status", "Attempts & RTO", "Activity"].map((h, i) => (
                    <div
                        key={i}
                        className={`text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold ${i >= 2 ? "text-center" : "text-start"}`}
                    >
                        {h}
                    </div>
                ))}
            </div>

            <div
                className="overflow-hidden transition-all duration-200"
                style={{
                    maxHeight: selectedIds.size > 0 ? "60px" : "0px",
                    opacity: selectedIds.size > 0 ? 1 : 0,
                }}
            >
                <div
                    className="flex items-center justify-between gap-3 px-5 py-2"
                    style={{
                        background: "rgba(251,191,36,0.07)",
                        borderBottom: "1px solid rgba(251,191,36,0.15)",
                    }}
                >
                    <ActionBtn type="button" revealOnHover className="py-0 m-0" size="action" variant="slate" label="Clear" onClick={() => setSelectedIds(new Set())} />
                    <span className="text-[11.5px] font-semibold text-amber-400 tabular-nums">
                        {selectedIds.size} selected
                    </span>
                    <ActionBtn type="button" className="py-0 m-0 flex" size="action" variant="primary" onClick={handleBatchPrint} >
                        <span className="flex items-center gap-1.5">
                            <Printer size={12} />
                            Print {selectedIds.size} label{selectedIds.size !== 1 ? "s" : ""}
                        </span>
                    </ActionBtn>
                </div>
            </div>

            {/* SCROLL AREA */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {shipments.map((shipment, idx) => (
                    <ShipmentRow
                        key={shipment.id}
                        shipment={shipment}
                        userRole={userRole}
                        onCancelClick={onCancelClick}
                        onSwaplClick={onSwaplClick}
                        isLast={idx === shipments.length - 1}
                        setSelectedShipment={setSelectedShipment}
                        onViewDetail={onViewDetail ? () => onViewDetail(shipment.id) : undefined}
                        selected={selectedIds.has(shipment.id)}
                        onSelect={handleSelect}
                    />
                ))}
            </div>
        </div>
    );
}