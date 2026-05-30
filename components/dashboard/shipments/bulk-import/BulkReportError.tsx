"use client";
import { IBulkImportResult } from "@/types/bulk";
import { CheckCircle2, XCircle, SkipForward, Download, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

interface BulkErrorReportProps {
    result: IBulkImportResult;
    onReset: () => void;
}

export default function BulkErrorReport({ result, onReset }: BulkErrorReportProps) {
    const { succeeded, failed, skipped } = result;

    const downloadFailedReport = () => {
        const data = failed.map((f) => ({
            "Row #": f.row._rowIndex,
            "Full Name": f.row.customerFullName,
            "Phone": f.row.customerPhone,
            "COD": f.row.codAmount,
            "Reason": f.reason,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        ws["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 60 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Failed");
        XLSX.writeFile(wb, "import_failed.xlsx");
    };

    const allSucceeded = failed.length === 0;

    return (
        <div className="flex flex-col gap-4 flex-1">
            {/* Result banner */}
            <div
                className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                style={{
                    background: allSucceeded ? "rgba(52,211,153,0.06)" : "rgba(239,68,68,0.06)",
                    border: `1px solid ${allSucceeded ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
            >
                {allSucceeded ? (
                    <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                ) : (
                    <XCircle size={24} className="text-red-400 shrink-0" />
                )}
                <div className="flex-1">
                    <p className={`text-[15px] font-bold ${allSucceeded ? "text-emerald-400" : "text-red-400"}`}>
                        {allSucceeded
                            ? `All ${succeeded.length} shipments imported successfully!`
                            : `Import completed with ${failed.length} error${failed.length !== 1 ? "s" : ""}`}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                        {succeeded.length} created · {failed.length} failed · {skipped.length} skipped (invalid rows)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {failed.length > 0 && (
                        <button
                            onClick={downloadFailedReport}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-red-400 transition-all hover:bg-red-400/10"
                            style={{ border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                            <Download size={12} />
                            Export Failed
                        </button>
                    )}
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-400 transition-all hover:bg-white/5"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <RotateCcw size={12} />
                        Import More
                    </button>
                    <Link
                        href="/dashboard/shipments"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-amber-400 transition-all hover:bg-amber-400/10"
                        style={{ border: "1px solid rgba(251,191,36,0.2)" }}
                    >
                        View Shipments
                        <ArrowRight size={12} />
                    </Link>
                </div>
            </div>

            {/* Failed rows detail */}
            {failed.length > 0 && (
                <div
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{ background: "#060a10", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                    <div
                        className="px-5 py-3 flex items-center gap-2"
                        style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                        <XCircle size={13} className="text-red-400" />
                        <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-red-400">
                            Failed Shipments ({failed.length})
                        </span>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
                        {failed.map(({ row, reason }, i) => (
                            <div
                                key={i}
                                className="grid gap-4 px-5 py-3 items-center border-b border-white/4 last:border-0"
                                style={{ gridTemplateColumns: "48px 1fr 130px 1fr" }}
                            >
                                <span className="text-[11px] text-slate-600 tabular-nums">#{row._rowIndex}</span>
                                <div>
                                    <p className="text-[13px] font-medium text-slate-200">{row.customerFullName}</p>
                                    <p className="text-[11px] text-slate-500 font-mono">{row.customerPhone}</p>
                                </div>
                                <span className="text-[12px] text-slate-400 tabular-nums">{row.codAmount.toFixed(2)} DA</span>
                                <div className="flex items-start gap-1.5">
                                    <XCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
                                    <span className="text-[12px] text-red-300">{reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Succeeded preview */}
            {succeeded.length > 0 && (
                <div
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{ background: "#060a10", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                    <div
                        className="px-5 py-3 flex items-center gap-2"
                        style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-emerald-400">
                            Successfully Created ({succeeded.length})
                        </span>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
                        {succeeded.map((row, i) => (
                            <div
                                key={i}
                                className="grid gap-4 px-5 py-2.5 items-center border-b border-white/4 last:border-0"
                                style={{ gridTemplateColumns: "48px 1fr 130px 1fr" }}
                            >
                                <span className="text-[11px] text-slate-600 tabular-nums">#{row._rowIndex}</span>
                                <div>
                                    <p className="text-[13px] font-medium text-slate-200">{row.customerFullName}</p>
                                    <p className="text-[11px] text-slate-500 font-mono">{row.customerPhone}</p>
                                </div>
                                <span className="text-[12px] text-slate-400 tabular-nums">{row.codAmount.toFixed(2)} DA</span>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                                    <span className="text-[12px] text-emerald-400/70">Created</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skipped rows */}
            {skipped.length > 0 && (
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: "#060a10", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                    <div
                        className="px-5 py-3 flex items-center gap-2"
                        style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                        <SkipForward size={13} className="text-slate-500" />
                        <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-slate-500">
                            Skipped — Invalid Before Submit ({skipped.length})
                        </span>
                    </div>
                    <div className="px-5 py-3">
                        <p className="text-[12px] text-slate-500">
                            These rows had validation errors and were not submitted. Fix them and re-import.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}