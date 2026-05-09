"use client";

import { IPaginatedResponse } from "@/types/paginate";

interface PaginationProps {
    pageNumber: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    onChange: (page: number) => void;
}

export default function Pagination({ pageNumber, totalPages, hasNext, hasPrev, onChange }: PaginationProps) {


    if (totalPages <= 1) return null;

    const generatePages = () => {
        const pages: (number | "...")[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (pageNumber > 3) pages.push("...");

            const start = Math.max(2, pageNumber - 1);
            const end = Math.min(totalPages - 1, pageNumber + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (pageNumber < totalPages - 2) pages.push("...");

            pages.push(totalPages);
        }

        return pages;
    };

    const pages = generatePages();

    return (
        <div className="flex items-center justify-between">
            {/* Info */}
            <span className="text-[11px] text-slate-600 tabular-nums">
                Page <span className="text-slate-300">{pageNumber}</span> of{" "}
                <span className="text-slate-400">{totalPages}</span>
            </span>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button
                    disabled={!hasPrev}
                    onClick={() => onChange(pageNumber - 1)}
                    className="px-3 py-1.5 rounded-lg text-[12px] border transition-all
                        border-white/6 text-slate-500
                        hover:border-white/15 hover:text-slate-300
                        disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    ←
                </button>

                {/* Pages */}
                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={i} className="px-2 text-slate-600 text-[12px]">
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            className="w-8 h-8 rounded-lg text-[12px] font-medium transition-all"
                            style={
                                p === pageNumber
                                    ? {
                                        background: "rgba(251,191,36,0.12)",
                                        border: "1px solid rgba(251,191,36,0.25)",
                                        color: "#fbbf24",
                                        boxShadow: "0 0 10px rgba(251,191,36,0.15)",
                                    }
                                    : {
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        color: "#64748b",
                                    }
                            }
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    disabled={!hasNext}
                    onClick={() => onChange(pageNumber + 1)}
                    className="px-3 py-1.5 rounded-lg text-[12px] border transition-all
                        border-white/6 text-slate-500
                        hover:border-white/15 hover:text-slate-300
                        disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    →
                </button>
            </div>
        </div>
    );
}