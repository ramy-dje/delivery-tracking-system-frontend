"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { Store } from "lucide-react";
import MerchantRow from "./MerchantRow";
import { IMerchant } from "@/types/merchant";

interface MerchantListProps {
    merchants: IMerchant[];
    loading?: boolean;
    onViewDetail?: (merchantId: string) => void;
    onAddClick?: () => void;
}

export default function MerchantList({ merchants, loading, onAddClick, onViewDetail }: MerchantListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        height: "100%",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (merchants.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Merchants yet"
                    description="Register your first merchant in the network."
                    icon={Store}
                    actionLabel="+ Add Merchant"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[1fr_300px_160px_160px] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Merchant", "Contact", "Business", "Actions"].map((h, i) => (
                    <div key={i} className={`text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold ${i === 3 ? "text-end" : "text - start"} `}>
                        {h}
                    </div>
                ))}
            </div>
            {
                merchants.map((m, idx) => (
                    <MerchantRow
                        key={m.id}
                        merchant={m}
                        isLast={idx === merchants.length - 1}
                        onViewDetail={onViewDetail ? () => onViewDetail(m.id) : undefined}
                    />
                ))
            }
        </div >
    );
}