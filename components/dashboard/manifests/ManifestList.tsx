"use client";

import { SkeletonList } from "@/components/commons/Skeleton";
import EmptyState from "@/components/commons/EmptyState";
import { FileText } from "lucide-react";
import { IManifest } from "@/types/manifest";
import ManifestRow from "./ManifestRow";

interface ManifestListProps {
    manifests: IManifest[];
    loading?: boolean;
    onView?: (manifestId: string) => void;
    onAddClick?: () => void;
}

export default function ManifestList({ manifests, loading, onAddClick, onView }: ManifestListProps) {
    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        flex: 1,
        overflow: "auto",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
    };

    if (loading) return <div style={tableStyle}><SkeletonList rows={5} /></div>;

    if (manifests.length === 0) {
        return (
            <div className="flex justify-center items-center" style={tableStyle}>
                <EmptyState
                    title="No Manifests yet"
                    description="Create your first manifest to start moving packages."
                    icon={FileText}
                    actionLabel="+ New Manifest"
                    tone="warning"
                    onAction={onAddClick}
                />
            </div>
        );
    }

    return (
        <div style={tableStyle}>
            <div
                className="hidden md:grid grid-cols-[160px_1fr_130px_120px_auto] gap-4 px-5 py-2.5 border-b border-white/5"
                style={{ background: "rgba(255,255,255,0.015)" }}
            >
                {["Manifest", "Route", "Packages", "Status", ""].map((h, i) => (
                    <div key={i} className="text-[9.5px] uppercase tracking-[0.14em] text-slate-800 font-semibold">
                        {h}
                    </div>
                ))}
            </div>
            {manifests.map((m, idx) => (
                <ManifestRow
                    key={m._id}
                    manifest={m}
                    isLast={idx === manifests.length - 1}
                    onView={onView ? () => onView(m._id) : undefined}
                />
            ))}
        </div>
    );
}