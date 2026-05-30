"use client";
import { useState, useMemo } from "react";
import { IBulkShipmentRow } from "@/types/bulk";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Upload, RotateCcw, Trash2, MapPin } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { downloadErrorReport } from "@/utils/bulkImportHelper";

interface BulkPreviewTableProps {
    rows: IBulkShipmentRow[];
    onRowsChange: (rows: IBulkShipmentRow[]) => void;
    onSubmit: () => void;
    onReset: () => void;
}

type Filter = "all" | "valid" | "invalid";

export default function BulkPreviewTable({ rows, onRowsChange, onSubmit, onReset }: BulkPreviewTableProps) {
    const [filter, setFilter] = useState<Filter>("all");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const validCount = rows.filter((r) => r._valid).length;
    const invalidCount = rows.length - validCount;

    const filtered = useMemo(() => {
        if (filter === "valid") return rows.filter((r) => r._valid);
        if (filter === "invalid") return rows.filter((r) => !r._valid);
        return rows;
    }, [rows, filter]);

    const handleRemoveRow = (rowIndex: number) => {
        onRowsChange(rows.filter((r) => r._rowIndex !== rowIndex));
        if (expandedRow === rowIndex) setExpandedRow(null);
    };

    const tableStyle: React.CSSProperties = {
        background: "#060a10",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
    };

    // grid columns: status | row# | customer | phone | commune | COD | weight | actions
    const GRID = "32px 52px 170px 130px 160px 110px 80px 56px";

    return (
        <div className="flex flex-col gap-3 flex-1 min-h-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div
                    className="flex items-center gap-1 p-1 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                    {(["all", "valid", "invalid"] as Filter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-all duration-150 ${filter === f
                                ? "bg-amber-400/10 text-amber-400"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            {f === "all"
                                ? `All (${rows.length})`
                                : f === "valid"
                                    ? `Valid (${validCount})`
                                    : `Errors (${invalidCount})`}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {invalidCount > 0 && (
                        <ActionBtn
                            type="button"
                            variant="slate"
                            size="action"
                            label="Export Errors"
                            onClick={() => downloadErrorReport(rows)}
                            revealOnHover
                        />
                    )}
                    <ActionBtn
                        type="button"
                        variant="slate"
                        size="action"
                        label="Start Over"
                        onClick={onReset}
                        revealOnHover
                    >
                        <RotateCcw size={12} />
                    </ActionBtn>
                    <button
                        onClick={onSubmit}
                        disabled={validCount === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                    >
                        <Upload size={13} />
                        Import {validCount} Shipment{validCount !== 1 ? "s" : ""}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={tableStyle} className="flex flex-col min-h-0 flex-1">
                {/* Header */}
                <div
                    className="grid gap-3 px-4 py-2.5 text-[9.5px] uppercase tracking-[0.14em] text-slate-600 font-semibold"
                    style={{
                        gridTemplateColumns: GRID,
                        background: "rgba(255,255,255,0.015)",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <span />
                    <span>Row</span>
                    <span>Customer</span>
                    <span>Phone</span>
                    <span>Commune</span>
                    <span>COD</span>
                    <span>Weight</span>
                    <span />
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1">
                    {filtered.length === 0 && (
                        <div className="flex items-center justify-center py-16 text-slate-600 text-[13px]">
                            No rows to display.
                        </div>
                    )}

                    {filtered.map((row) => (
                        <div key={row._rowIndex}>
                            {/* Row */}
                            <div
                                className="grid gap-3 px-4 py-3 items-center transition-colors duration-150 cursor-pointer"
                                style={{
                                    gridTemplateColumns: GRID,
                                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                                    background: row._valid
                                        ? "transparent"
                                        : "rgba(239,68,68,0.03)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.background = row._valid
                                        ? "rgba(255,255,255,0.02)"
                                        : "rgba(239,68,68,0.05)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.background = row._valid
                                        ? "transparent"
                                        : "rgba(239,68,68,0.03)";
                                }}
                                onClick={() =>
                                    setExpandedRow(expandedRow === row._rowIndex ? null : row._rowIndex)
                                }
                            >
                                {/* Status */}
                                <div>
                                    {row._valid ? (
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                    ) : (
                                        <AlertCircle size={14} className="text-red-400" />
                                    )}
                                </div>

                                {/* Row # */}
                                <span className="text-[11px] text-slate-500 tabular-nums">
                                    #{row._rowIndex}
                                </span>

                                {/* Customer */}
                                <span className="text-[13px] text-slate-200 truncate font-medium">
                                    {row.customerFullName || (
                                        <span className="text-red-400 italic">Missing</span>
                                    )}
                                </span>

                                {/* Phone */}
                                <span className="text-[12px] text-slate-400 truncate font-mono">
                                    {row.customerPhone || (
                                        <span className="text-red-400 italic">Missing</span>
                                    )}
                                </span>

                                {/* Commune */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {row.communeId ? (
                                        <MapPin size={11} className="text-emerald-400 shrink-0" />
                                    ) : row.communeRaw ? (
                                        <MapPin size={11} className="text-red-400 shrink-0" />
                                    ) : null}
                                    <span className="text-[12px] text-slate-400 truncate">
                                        {row.communeRaw
                                            ? `${row.communeRaw}${row.wilayaRaw ? `, ${row.wilayaRaw}` : ""}`
                                            : <span className="text-red-400 italic">Missing</span>}
                                    </span>
                                </div>

                                {/* COD */}
                                <span className="text-[12px] text-slate-300 tabular-nums">
                                    {row.codAmount > 0
                                        ? `${row.codAmount.toFixed(2)} DA`
                                        : <span className="text-red-400 italic">—</span>}
                                </span>

                                {/* Weight */}
                                <span className="text-[12px] text-slate-400 tabular-nums">
                                    {row.weightKg > 0 ? `${row.weightKg} kg` : "—"}
                                </span>

                                {/* Actions */}
                                <div
                                    className="flex items-center gap-0.5"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => handleRemoveRow(row._rowIndex)}
                                        className="p-1.5 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"
                                        title="Remove row"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setExpandedRow(expandedRow === row._rowIndex ? null : row._rowIndex)
                                        }
                                        className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors"
                                    >
                                        {expandedRow === row._rowIndex ? (
                                            <ChevronUp size={12} />
                                        ) : (
                                            <ChevronDown size={12} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded panel */}
                            {expandedRow === row._rowIndex && (
                                <div
                                    className="px-6 py-3"
                                    style={{
                                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                                        background: row._valid
                                            ? "rgba(255,255,255,0.01)"
                                            : "rgba(239,68,68,0.04)",
                                    }}
                                >
                                    {/* Errors */}
                                    {!row._valid && (
                                        <div className="mb-3">
                                            <p className="text-[10px] font-semibold text-red-400 mb-1.5 uppercase tracking-wide">
                                                Validation Errors
                                            </p>
                                            <ul className="flex flex-col gap-1">
                                                {row._errors.map((err, i) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-2 text-[12px] text-red-300"
                                                    >
                                                        <span className="text-red-500 mt-0.5 shrink-0">•</span>
                                                        {err}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Extra details */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                                        {[
                                            ["Description", row.description || "—"],
                                            ["Delivery Type", row.deliveryType],
                                            ["Commune ID", row.communeId || (row.communeRaw ? "Not resolved" : "—")],
                                        ].map(([label, val]) => (
                                            <div key={label as string}>
                                                <span className="text-[10px] text-slate-600 uppercase tracking-wider">
                                                    {label}
                                                </span>
                                                <p
                                                    className={`text-[12px] mt-0.5 ${label === "Commune ID" && !row.communeId
                                                        ? "text-red-400 italic"
                                                        : "text-slate-300"
                                                        }`}
                                                >
                                                    {val as string}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}