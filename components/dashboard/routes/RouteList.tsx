"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { Route } from "lucide-react";
import RouteRow from "./RouteRow";
import { IRoute } from "@/types/route";

interface RouteListProps {
    routes: IRoute[];
    loading?: boolean;
    onViewDetail?: (id: string) => void;
    onToggleCancel?: (route: IRoute) => void;
}

const tableStyle: React.CSSProperties = {
    background: "#060a10",
    height: "100%",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
};

export default function RouteList({ routes, loading, onViewDetail, onToggleCancel }: RouteListProps) {
    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (routes.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Routes found"
                    description="Routes are created automatically when packages are dispatched between branches."
                    icon={Route}
                    tone="warning"
                />
            </div>
        );
    }

    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[160px_1fr_120px_100px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Status", "Route Path", "Transporter", "Packages", ""].map((h, i) => (
                    <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
                        {h}
                    </div>
                ))}
            </div>
            {routes.map((r, idx) => (
                <RouteRow
                    key={r.id}
                    route={r}
                    isLast={idx === routes.length - 1}
                    onViewDetail={onViewDetail ? () => onViewDetail(r.id) : undefined}
                    onToggleCancel={onToggleCancel ? () => onToggleCancel(r) : undefined}
                />
            ))}
        </div>
    );
}
