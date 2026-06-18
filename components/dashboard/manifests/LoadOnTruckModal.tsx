// In your ManifestDetailPage component, add this modal for loading on truck

import EntityPicker from "@/components/commons/EntityPicker";
import { getBranchId } from "@/hooks/useAuth";
import { listDrivers } from "@/services/DriverService";
import { listTransporters } from "@/services/TransporterService";
import { getCompanyVehicles } from "@/services/VehicleService";
import userStore from "@/stores/userStore";
import { IVehicleListResponse, IVehicleResponse } from "@/types/vehicle";
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";

function LoadOnTruckModal({
    isOpen,
    onClose,
    manifestCode,
    onConfirm,
    loading,
}: {
    isOpen: boolean;
    onClose: () => void;
    manifestCode: string;
    onConfirm: (data: { transporterUserId: string; vehicleId?: string; estimatedArrival?: string; notes?: string }) => Promise<void>;
    loading: boolean;
}) {
    const { user, associated } = userStore();
    const branchId = getBranchId() ?? "";

    const [transporterUserId, setTransporterUserId] = useState<string | null>(null);
    const [vehicleId, setVehicleId] = useState<string | null>(null);
    const [estimatedArrival, setEstimatedArrival] = useState("");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState<{ transporterUserId?: string }>({});


    useEffect(() => {
        if (isOpen) {
            setTransporterUserId(null);
            setVehicleId(null);
            setEstimatedArrival("");
            setNotes("");
            setErrors({});
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!transporterUserId) {
            setErrors({ transporterUserId: "Transporter is required" });
            return;
        }

        await onConfirm({
            transporterUserId,
            vehicleId: vehicleId || undefined,
            estimatedArrival: estimatedArrival || undefined,
            notes: notes || undefined,
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
                            <div className="text-[14px] font-semibold text-white">Load on Truck</div>
                            <div className="text-[11px] text-slate-600">
                                Assign transporter and vehicle for manifest {manifestCode}
                            </div>
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

                    {/* Transporter - REQUIRED */}
                    <EntityPicker<any>
                        label="Transporter"
                        placeholder="Select transporter"
                        value={transporterUserId}
                        onChange={(id) => {
                            setTransporterUserId(id);
                            if (errors.transporterUserId) setErrors({});
                        }}
                        fetchData={async () => {
                            if (!companyId) return [];
                            try {
                                const transportersRes = await listTransporters(companyId, { pageSize: 100 });
                                console.log("Transporters fetched:", transportersRes);
                                return transportersRes?.data || [];
                            } catch {
                                return [];
                            }
                        }}
                        getId={(u) => u.userId} // Use 'id' since your service maps _id to id
                        getLabel={(u) => u.fullName || "Unnamed Transporter"} // Use the mapped fullName
                        getSubLabel={(u) => {
                            const role = u.role || "transporter";
                            return role === "transporter" ? "🚛 Transporter" : "🚗 Driver";
                        }}
                        error={errors.transporterUserId}
                        required
                    />

                    {/* Vehicle - OPTIONAL */}
                    <EntityPicker<IVehicleResponse>
                        label="Vehicle (Optional)"
                        placeholder="Select a vehicle"
                        value={vehicleId}
                        onChange={(id) => setVehicleId(id)}
                        fetchData={async () => {
                            if (!companyId) return [];
                            try {
                                const res = await getCompanyVehicles(companyId as string, { limit: 100 });

                                return (res?.data || []).filter(v => v.status === "available");
                            } catch {
                                return [];
                            }
                        }}
                        getId={(v) => v._id}
                        getLabel={(v) => `${v.registrationNumber} - ${v.brand || ""} ${v.modelName || ""}`.trim()}
                        getSubLabel={(v) => {
                            const status = v.status === "available" ? "✅ Available" : "🔴 In Use";
                            const fragile = v.supportsFragile ? "📦 Fragile" : "📦 Standard";
                            return `${status} · ${fragile}`;
                        }}
                    />

                    {/* Estimated Arrival - OPTIONAL */}
                    <div>
                        <label className="block text-[11.5px] font-medium text-slate-500 mb-1.5">
                            Estimated Arrival (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={estimatedArrival}
                            onChange={(e) => setEstimatedArrival(e.target.value)}
                            className="w-full text-[12.5px] text-white focus:outline-none px-3 py-2 rounded-lg"
                            style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                        />
                    </div>

                    {/* Notes - OPTIONAL */}
                    <div>
                        <label className="block text-[11.5px] font-medium text-slate-500 mb-1.5">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Add any loading notes..."
                            className="w-full text-[12.5px] text-white focus:outline-none px-3 py-2 rounded-lg resize-none"
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
                            Loading <span className="font-semibold text-amber-400">{manifestCode}</span>
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
                            disabled={loading || !transporterUserId}
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
                                    Loading…
                                </>
                            ) : (
                                <>
                                    <Truck size={12} />
                                    Load on Truck
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoadOnTruckModal;