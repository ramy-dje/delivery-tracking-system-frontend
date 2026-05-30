"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { Building2 } from "lucide-react";
import CompanyRow from "./CompanyRow";
import { ICompany } from "@/types/company";

interface CompanyListProps {
    companies: ICompany[];
    loading?: boolean;
    onAddClick?: () => void;
    onViewDetail?: (company: ICompany) => void;
    onToggleBlock?: (company: ICompany) => void;
}

const tableStyle: React.CSSProperties = {
    background: "#060a10",
    height: "100%",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
};

export default function CompanyList({ companies, loading, onAddClick, onViewDetail, onToggleBlock }: CompanyListProps) {
    if (loading) return <div style={tableStyle}><SkeletonList rows={3} /></div>;

    if (companies.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Company yet"
                    description="Create your company to start managing branches and shipments."
                    icon={Building2}
                    actionLabel="+ Create Company"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[200px_110px_120px_1fr_auto] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Company", "Type", "Status", "Contact", ""].map((h, i) => (
                    <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">{h}</div>
                ))}
            </div>
            {companies.map((c, idx) => (
                <CompanyRow
                    key={c._id}
                    company={c}
                    isLast={idx === companies.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(c) : undefined}
                    onToggleBlock={onToggleBlock ? () => onToggleBlock(c) : undefined}
                />
            ))}
        </div>
    );
}
