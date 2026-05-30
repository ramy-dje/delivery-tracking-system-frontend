"use client";
import { CheckCircle2, XCircle, FileText } from "lucide-react";

interface BulkImportSummaryProps {
    total: number;
    valid: number;
    invalid: number;
}

export default function BulkImportSummary({ total, valid, invalid }: BulkImportSummaryProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <SummaryCard
                label="Total Rows"
                value={total}
                icon={<FileText size={15} className="text-slate-400" />}
                color="rgba(255,255,255,0.04)"
                textColor="text-white"
            />
            <SummaryCard
                label="Ready to Import"
                value={valid}
                icon={<CheckCircle2 size={15} className="text-emerald-400" />}
                color="rgba(52,211,153,0.06)"
                textColor="text-emerald-400"
                border="rgba(52,211,153,0.15)"
            />
            <SummaryCard
                label="With Errors"
                value={invalid}
                icon={<XCircle size={15} className="text-red-400" />}
                color="rgba(239,68,68,0.06)"
                textColor="text-red-400"
                border="rgba(239,68,68,0.15)"
            />
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon,
    color,
    textColor,
    border = "rgba(255,255,255,0.05)",
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    textColor: string;
    border?: string;
}) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: color, border: `1px solid ${border}` }}
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.05)" }}
            >
                {icon}
            </div>
            <div>
                <p className={`text-[20px] font-bold tabular-nums leading-tight ${textColor}`}>
                    {value}
                </p>
                <p className="text-[11px] text-slate-500">{label}</p>
            </div>
        </div>
    );
}