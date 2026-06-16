"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

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
        // Glassmorphic container to group the pagination bar
        <div className="flex items-center justify-between px-4 py-2.5 mt-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">

            {/* Info Section (Hidden on mobile to save space) */}
            <div className="hidden sm:flex items-center gap-2 text-[12px]">
                <span className="text-slate-500 font-medium uppercase tracking-wider">Page</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                    <span className="text-white font-bold tabular-nums">{pageNumber}</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-400 font-medium tabular-nums">{totalPages}</span>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">

                {/* Prev Button */}
                <button
                    disabled={!hasPrev}
                    onClick={() => onChange(pageNumber - 1)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 transition-all duration-200
                        hover:bg-white/5 hover:text-white active:scale-95
                        disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:active:scale-100"
                >
                    <ChevronLeft size={16} strokeWidth={2} />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {pages.map((p, i) =>
                        p === "..." ? (
                            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-slate-600 text-[11px] font-bold tracking-widest select-none">
                                •••
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onChange(p)}
                                className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-all duration-200 active:scale-95 border ${p === pageNumber
                                    ? "bg-gradient-to-b from-amber-400/20 to-amber-500/10 border-amber-400/40 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/5"
                                    }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                {/* Next Button */}
                <button
                    disabled={!hasNext}
                    onClick={() => onChange(pageNumber + 1)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 transition-all duration-200
                        hover:bg-white/5 hover:text-white active:scale-95
                        disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:active:scale-100"
                >
                    <ChevronRight size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}