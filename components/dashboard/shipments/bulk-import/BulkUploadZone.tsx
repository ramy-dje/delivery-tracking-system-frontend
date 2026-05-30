"use client";
import { useCallback, useRef, useState } from "react";
import { FileSpreadsheet, Upload, Download, AlertCircle, Loader2 } from "lucide-react";
import { downloadTemplate } from "@/utils/bulkImportHelper";

interface BulkUploadZoneProps {
    onFileParsed: (file: File) => void;
    resolving?: boolean;
}

const ACCEPTED = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    ".xlsx", ".xls", ".csv",
];

export default function BulkUploadZone({ onFileParsed, resolving = false }: BulkUploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFile = useCallback((file: File | null | undefined) => {
        if (!file) return;
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!["xlsx", "xls", "csv"].includes(ext || "")) {
            setError("Only .xlsx, .xls, or .csv files are accepted.");
            return;
        }
        setError(null);
        setFileName(file.name);
        onFileParsed(file);
    }, [onFileParsed]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    }, [handleFile]);

    const busy = !!fileName || resolving;

    return (
        <div className="flex flex-col gap-4 flex-1">
            {/* Drop Zone */}
            <div
                onClick={() => !busy && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!busy) setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className="flex-1 flex flex-col items-center justify-center gap-5 rounded-2xl transition-all duration-200 select-none"
                style={{
                    border: dragging
                        ? "1.5px dashed rgba(251,191,36,0.7)"
                        : "1.5px dashed rgba(255,255,255,0.08)",
                    background: dragging ? "rgba(251,191,36,0.04)" : "#060a10",
                    minHeight: 280,
                    cursor: busy ? "default" : "pointer",
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED.join(",")}
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />

                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200"
                    style={{ background: dragging ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)" }}
                >
                    {resolving ? (
                        <Loader2 size={28} className="text-amber-400 animate-spin" />
                    ) : fileName ? (
                        <FileSpreadsheet size={28} className="text-emerald-400" />
                    ) : (
                        <Upload size={28} className={dragging ? "text-amber-400" : "text-slate-500"} />
                    )}
                </div>

                <div className="flex flex-col items-center gap-1.5 text-center px-4">
                    {resolving ? (
                        <>
                            <p className="text-[14px] font-semibold text-amber-400">{fileName}</p>
                            <p className="text-[12px] text-slate-500">
                                Resolving commune names — this may take a moment…
                            </p>
                        </>
                    ) : fileName ? (
                        <>
                            <p className="text-[14px] font-semibold text-emerald-400">{fileName}</p>
                            <p className="text-[12px] text-slate-500">Parsing file…</p>
                        </>
                    ) : (
                        <>
                            <p className="text-[14px] font-semibold text-white">
                                Drop your file here, or{" "}
                                <span className="text-amber-400">browse</span>
                            </p>
                            <p className="text-[12px] text-slate-500">
                                Supports .xlsx, .xls, and .csv files
                            </p>
                        </>
                    )}
                </div>

                {error && (
                    <div
                        className="flex items-center gap-2 px-4 py-2 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                        <AlertCircle size={13} className="text-red-400 shrink-0" />
                        <span className="text-[12px] text-red-400">{error}</span>
                    </div>
                )}
            </div>

            {/* Helper cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 hover:bg-white/4 group"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.1)" }}>
                        <Download size={15} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-white group-hover:text-amber-400 transition-colors">
                            Download Template
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Get the Excel template with all required columns
                        </p>
                    </div>
                </button>

                <div
                    className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(99,179,237,0.1)" }}>
                        <FileSpreadsheet size={15} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-white mb-1">Required Columns</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Full Name · Phone · Commune · Wilaya · COD Amount · Weight Kg · Delivery Type
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}