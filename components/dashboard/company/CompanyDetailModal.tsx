"use client";

import { Building2, Mail, Phone, Hash } from "lucide-react";
import { ICompany } from "@/types/company";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Active", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    inactive: { label: "Inactive", color: "#64748b", bg: "rgba(100,116,139,0.1)" },
    suspended: { label: "Suspended", color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
    company: { label: "Company", color: "#22d3ee", bg: "rgba(34,211,238,0.1)" },
    solo: { label: "Solo", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
};

function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

interface CompanyDetailModalProps {
    isOpen: boolean;
    company: ICompany;
    onClose: () => void;
}

export default function CompanyDetailModal({
    isOpen,
    company,
    onClose,
}: CompanyDetailModalProps) {
    if (!isOpen) return null;

    const statusMeta = STATUS_META[company.status] ?? STATUS_META.active;
    const typeMeta = TYPE_META[company.businessType] ?? TYPE_META.company;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="w-full max-w-2xl rounded-2xl overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        {company.logo ? (
                            <img
                                src={company.logo}
                                alt="logo"
                                className="w-9 h-9 rounded-xl object-cover shrink-0"
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[14px] font-bold shrink-0"
                                style={{
                                    background: "rgba(251,191,36,0.1)",
                                    border: "1px solid rgba(251,191,36,0.2)",
                                    color: "#fbbf24",
                                }}
                            >
                                {company.name?.[0]?.toUpperCase() ?? "C"}
                            </div>
                        )}

                        <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-white truncate">
                                {company.name}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{
                                        background: statusMeta.bg,
                                        color: statusMeta.color,
                                    }}
                                >
                                    <span
                                        className="w-1 h-1 rounded-full"
                                        style={{ background: statusMeta.color }}
                                    />
                                    {statusMeta.label}
                                </span>

                                <span
                                    className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{
                                        background: typeMeta.bg,
                                        color: typeMeta.color,
                                    }}
                                >
                                    {typeMeta.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            {
                                label: "Created",
                                value: company.createdAt ? fmt(company.createdAt) : "—",
                            },
                            {
                                label: "Updated",
                                value: company.updatedAt ? fmt(company.updatedAt) : "—",
                            },
                            {
                                label: "Reg. No.",
                                value: company.registrationNumber ?? "—",
                            },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="rounded-xl px-4 py-3"
                                style={{
                                    background: "rgba(255,255,255,0.025)",
                                    border: "1px solid rgba(255,255,255,0.05)",
                                }}
                            >
                                <div className="text-[9.5px] uppercase tracking-widest text-slate-700 font-semibold mb-1">
                                    {label}
                                </div>
                                <div className="text-[12.5px] text-slate-300 font-medium">
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Company fields */}
                    <div
                        className="space-y-3 rounded-xl p-4"
                        style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <div className="flex items-center gap-2 text-slate-400 text-[12px]">
                            <Building2 size={14} /> Company Name
                        </div>
                        <div className="text-white text-[13px] font-medium">
                            {company.name}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div
                            className="space-y-2 rounded-xl p-4"
                            style={{
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.05)",
                            }}
                        >
                            <div className="flex items-center gap-2 text-slate-400 text-[12px]">
                                <Mail size={14} /> Email
                            </div>
                            <div className="text-white text-[13px]">
                                {company.email ?? "—"}
                            </div>
                        </div>

                        <div
                            className="space-y-2 rounded-xl p-4"
                            style={{
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.05)",
                            }}
                        >
                            <div className="flex items-center gap-2 text-slate-400 text-[12px]">
                                <Phone size={14} /> Phone
                            </div>
                            <div className="text-white text-[13px]">
                                {company.phone ?? "—"}
                            </div>
                        </div>
                    </div>

                    <div
                        className="space-y-2 rounded-xl p-4"
                        style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                        }}
                    >
                        <div className="flex items-center gap-2 text-slate-400 text-[12px]">
                            <Hash size={14} /> Registration Number
                        </div>
                        <div className="text-white text-[13px]">
                            {company.registrationNumber ?? "—"}
                        </div>
                    </div>

                    {/* Headquarters */}
                    {company.headquarters && (
                        <div
                            className="rounded-xl px-4 py-3"
                            style={{
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.05)",
                            }}
                        >
                            <div className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold mb-1">
                                Headquarters
                            </div>
                            <div className="text-[12.5px] text-slate-400">
                                {[
                                    company.headquarters.street,
                                    company.headquarters.city,
                                    company.headquarters.state,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 border-t flex justify-end"
                    style={{
                        borderColor: "rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.01)",
                    }}
                >
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[13px] text-slate-400 hover:text-slate-200 border border-white/[0.07] hover:border-white/15 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}