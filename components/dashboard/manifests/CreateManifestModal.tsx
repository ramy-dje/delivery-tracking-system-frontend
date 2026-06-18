"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import EntityPicker from "@/components/commons/EntityPicker";
import { IBranchResponse } from "@/types/branch";
import { IDelivererResponse } from "@/types/driver";
import { IVehicleResponse } from "@/types/vehicle";
import { listDrivers } from "@/services/DriverService";
import { getCompanyVehicles } from "@/services/VehicleService";
import userStore from "@/stores/userStore";
import { getBranchId } from "@/hooks/useAuth";
import { listBranches } from "@/services/BranchService";

// ─── Validation ───────────────────────────────────────────────────────────

interface FormErrors {
    destinationBranchId?: string;
}

function validate(f: { destinationBranchId: string | null }): FormErrors {
    const e: FormErrors = {};
    if (!f.destinationBranchId) e.destinationBranchId = "Required";
    return e;
}

// ─── Props ────────────────────────────────────────────────────────────────

interface CreateManifestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        destinationBranchId: string;
        vehicleId?: string;
        driverId?: string;
        plannedDeparture?: string;
    }) => Promise<void>;
    loading?: boolean;
    prefillDestinationBranchId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function CreateManifestModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
    prefillDestinationBranchId,
}: CreateManifestModalProps) {
    const { user, associated } = userStore();
    const branchId = getBranchId() ?? "";

    const [destinationBranchId, setDestinationBranchId] = useState<string | null>(null);
    const [vehicleId, setVehicleId] = useState<string | null>(null);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [plannedDeparture, setPlannedDeparture] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);

    // Pre-fill from grouped packages card click
    useEffect(() => {
        if (isOpen) {
            setDestinationBranchId(prefillDestinationBranchId ?? null);
            setVehicleId(null);
            setDriverId(null);
            setPlannedDeparture("");
            setErrors({});
            setTouched(false);
        }
    }, [isOpen, prefillDestinationBranchId]);

    const revalidate = (patch?: Partial<{ destinationBranchId: string | null }>) => {
        if (!touched) return;
        setErrors(validate({ destinationBranchId, ...patch }));
    };

    const handleSubmit = async () => {
        setTouched(true);
        const errs = validate({ destinationBranchId });
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        await onSubmit({
            destinationBranchId: destinationBranchId!,
            vehicleId: vehicleId ?? undefined,
            driverId: driverId ?? undefined,
            plannedDeparture: plannedDeparture || undefined,
        });
    };

    if (!isOpen) return null;

    const companyId = user?.companyId || associated?.companyId;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-xl rounded-2xl overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: "rgba(251,191,36,0.1)",
                                border: "1px solid rgba(251,191,36,0.2)",
                            }}
                        >
                            <Truck className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">Create Manifest</div>
                            <div className="text-[11px] text-slate-600">Start a new outbound manifest</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Destination Branch */}
                    <EntityPicker<IBranchResponse>
                        label="Destination Branch"
                        placeholder="Select destination branch"
                        value={destinationBranchId}
                        onChange={(id) => {
                            setDestinationBranchId(id);
                            revalidate({ destinationBranchId: id });
                        }}
                        fetchData={async () => (await listBranches({ pageSize: 100 })).data.filter((b) => b._id !== branchId)}
                        getId={(b) => b._id}
                        getLabel={(b) => b.name}
                        getSubLabel={(b) => b.branchType?.replace(/_/g, " ") ?? "Branch"}
                        error={errors.destinationBranchId}
                    />

                    {/* Vehicle */}
                    <EntityPicker<IVehicleResponse>
                        label="Assigned Vehicle (Optional)"
                        placeholder="Select a vehicle"
                        value={vehicleId}
                        onChange={(id) => setVehicleId(id)}
                        fetchData={async () => {
                            if (!companyId) return [];
                            try {
                                const res = await getCompanyVehicles(companyId as string, { limit: 100 });
                                return res?.data || [];
                            } catch {
                                return [];
                            }
                        }}
                        getId={(v) => v._id}
                        getLabel={(v) => `${v.registrationNumber} - ${v.brand || ""} ${v.modelName || ""}`.trim()}
                        getSubLabel={(v) => v.type.replace(/_/g, " ")}
                    />

                    {/* Driver */}
                    <EntityPicker<IDelivererResponse>
                        label="Assigned Driver (Optional)"
                        placeholder="Select a driver"
                        value={driverId}
                        onChange={(id) => setDriverId(id)}
                        fetchData={async () => {
                            if (!branchId) return [];
                            try {
                                const res = await listDrivers(branchId, { pageSize: 100 });
                                return res?.data || [];
                            } catch {
                                return [];
                            }
                        }}
                        getId={(d) => d._id}
                        getLabel={(d) =>
                            `${d.userId?.firstName ?? ""} ${d.userId?.lastName ?? ""}`.trim()
                        }
                        getSubLabel={(d) => d.userId?.phone ?? d.userId?.email ?? ""}
                    />

                    {/* Planned Departure */}
                    <div>
                        <label className="block text-[11.5px] font-medium text-slate-500 mb-1.5">
                            Planned Departure (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={plannedDeparture}
                            onChange={(e) => setPlannedDeparture(e.target.value)}
                            className="w-full text-[12.5px] text-white focus:outline-none px-3 py-2 rounded-lg"
                            style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-t"
                    style={{
                        borderColor: "rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.01)",
                    }}
                >
                    <div className="text-[11px]">
                        <span className="text-slate-500">
                            Creating new <span className="font-semibold text-amber-400">Manifest</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/13 transition-all disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                                boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                                    </svg>
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                    Create &amp; Scan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}