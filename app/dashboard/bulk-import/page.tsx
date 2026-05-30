"use client";
import { useState } from "react";
import RoleGuard from "@/lib/RoleGuard";
import { ROLES } from "@/lib/roles";
import {
    parseBulkFile,
    validateBulkRows,
    resolveCommuneIds,
    rowToPayload,
    ICommuneOption,
} from "@/utils/bulkImportHelper";
import { IBulkShipmentRow, IBulkImportResult } from "@/types/bulk";
import { createBulkShipments } from "@/services/ShipmentService";
import { listDisponibleCommunes } from "@/services/LocationService";
import { showToast } from "nextjs-toast-notify";
import { parseApiError } from "@/utils/apiErrorHandler";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import BulkImportSummary from "@/components/dashboard/shipments/bulk-import/BulkImportSummary";
import BulkUploadZone from "@/components/dashboard/shipments/bulk-import/BulkUploadZone";
import BulkPreviewTable from "@/components/dashboard/shipments/bulk-import/BulkPreviewTable";
import BulkErrorReport from "@/components/dashboard/shipments/bulk-import/BulkReportError";

type Step = "upload" | "resolving" | "preview" | "submitting" | "done";


async function fetchAllCommunes(): Promise<ICommuneOption[]> {
    const result = await listDisponibleCommunes({ pageNumber: 1, pageSize: 10_000 });
    const raw: any[] = Array.isArray(result) ? result : result ?? [];
    return raw.map((c) => ({
        id: c.id,
        name: c.nameFr ?? c.name ?? "",
        wilayaName: c.wilayaNameFr ?? c.wilayaName ?? undefined,
    }));
}

export default function BulkImportPage() {
    const [step, setStep] = useState<Step>("upload");
    const [rows, setRows] = useState<IBulkShipmentRow[]>([]);
    const [result, setResult] = useState<IBulkImportResult | null>(null);
    const [submitProgress, setSubmitProgress] = useState(0);

    const handleFileParsed = async (file: File) => {
        try {

            const raw = await parseBulkFile(file);


            const validated = validateBulkRows(raw);
            setRows(validated);
            setStep("resolving");

            const resolved = await resolveCommuneIds(validated, fetchAllCommunes);
            setRows(resolved);
            setStep("preview");
        } catch (e: any) {
            showToast.error(e.message || "Failed to parse file");
            setStep("upload");
        }
    };

    const handleSubmit = async () => {
        setStep("submitting");

        const valid = rows.filter((r) => r._valid);

        try {
            const result = await createBulkShipments(
                valid.map(rowToPayload)
            );

            const succeeded: IBulkShipmentRow[] = result
                .filter((r) => r.success)
                .map((r) => valid[r.index]);

            const failed: { row: IBulkShipmentRow; reason: string }[] = result
                .filter((r) => !r.success)
                .map((r) => ({
                    row: valid[r.index],
                    reason: r.error || "Unknown error",
                }));

            setResult({
                succeeded,
                failed,
                skipped: rows.filter((r) => !r._valid),
            });

            setStep("done");

            if (failed.length === 0) {
                showToast.success(
                    `${succeeded.length} shipments created successfully!`
                );
            } else {
                showToast.error(
                    `${failed.length} shipments failed.`
                );
            }
        } catch (err) {
            const error = parseApiError(err);
            console.error("Bulk import failed:", error);
            showToast.error("Bulk import failed.");
        }
    };

    const handleReset = () => {
        setStep("upload");
        setRows([]);
        setResult(null);
        setSubmitProgress(0);
    };

    const validCount = rows.filter((r) => r._valid).length;
    const invalidCount = rows.filter((r) => !r._valid).length;

    return (
        <RoleGuard allowedRoles={[ROLES.MERCHANT]} fallbackPath="/unauthorized">
            <div className="flex overflow-y-auto flex-col gap-5 min-h-0 h-full">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="w-1 h-6 rounded-full"
                                style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                            />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">
                                Bulk Import
                            </h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Upload an Excel or CSV file to create multiple shipments at once.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/shipments"
                        className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-300 transition-colors mt-1"
                    >
                        <ArrowLeft size={13} />
                        Back to Shipments
                    </Link>
                </div>

                {/* Step Indicator */}
                <StepIndicator step={step} />

                {/* Content */}
                {(step === "upload" || step === "resolving") && (
                    <BulkUploadZone
                        onFileParsed={handleFileParsed}
                        resolving={step === "resolving"}
                    />
                )}

                {step === "preview" && (
                    <>
                        <BulkImportSummary
                            total={rows.length}
                            valid={validCount}
                            invalid={invalidCount}
                        />
                        <BulkPreviewTable
                            rows={rows}
                            onRowsChange={setRows}
                            onSubmit={handleSubmit}
                            onReset={handleReset}
                        />
                    </>
                )}

                {step === "submitting" && (
                    <SubmittingState progress={submitProgress} total={validCount} />
                )}

                {step === "done" && result && (
                    <BulkErrorReport result={result} onReset={handleReset} />
                )}
            </div>
        </RoleGuard>
    );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
    const steps = [
        { key: "upload", label: "Upload File" },
        { key: "resolving", label: "Resolve Communes" },
        { key: "preview", label: "Validate & Preview" },
        { key: "submitting", label: "Submitting" },
        { key: "done", label: "Done" },
    ];
    const currentIdx = steps.findIndex((s) => s.key === step);

    return (
        <div className="flex items-center gap-0 flex-wrap">
            {steps.map((s, i) => {
                const isActive = i === currentIdx;
                const isDone = i < currentIdx;
                return (
                    <div key={s.key} className="flex items-center">
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${isDone
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : isActive
                                        ? "bg-amber-500/20 text-amber-400"
                                        : "bg-white/5 text-slate-600"
                                    }`}
                            >
                                {isDone ? "✓" : i + 1}
                            </div>
                            <span
                                className={`text-[11px] font-medium transition-colors duration-300 ${isActive
                                    ? "text-amber-400"
                                    : isDone
                                        ? "text-emerald-400"
                                        : "text-slate-600"
                                    }`}
                            >
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`mx-3 h-px w-8 transition-colors duration-300 ${isDone ? "bg-emerald-500/40" : "bg-white/5"
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Submitting State ─────────────────────────────────────────────────────────

function SubmittingState({ progress, total }: { progress: number; total: number }) {
    return (
        <div
            className="flex-1 flex flex-col items-center justify-center gap-6 rounded-2xl"
            style={{ background: "#060a10", border: "1px solid rgba(255,255,255,0.05)" }}
        >
            <div className="flex flex-col items-center gap-3">
                <Upload size={32} className="text-amber-400 animate-bounce" />
                <p className="text-white font-semibold text-[15px]">Creating shipments…</p>
                <p className="text-slate-500 text-[12px]">
                    {Math.round((progress / 100) * total)} of {total} processed
                </p>
            </div>
            <div className="w-72 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-amber-400 font-bold text-[18px] tabular-nums">{progress}%</span>
        </div>
    );
}