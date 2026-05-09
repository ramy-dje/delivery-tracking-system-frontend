"use client";

import { useState } from "react";
import {
    Hash,
    Truck,
    Building2,
    User,
    Package,
    Boxes,
    Snowflake,
    Loader2,
    X,
    ChevronDown
} from "lucide-react";
import InputField from "@/components/commons/InputField";
import EntityPicker from "@/components/commons/EntityPicker";
import { ICreateVehicleRequest, VehicleOwnershipType, VehicleType } from "@/types/vehicle";
import { listDrivers } from "@/services/DriverService";
import { IDriverResponse } from "@/types/driver";

// ─── Validation ───────────────────────────────────────────────────────────

interface FormErrors {
    licensePlate?: string;
    capacityKg?: string;
    volumeM3?: string;
    brand?: string;
    model?: string;
    type?: string;
    ownershipType?: string;
    ownerDriverId?: string;
}

function validate(f: ICreateVehicleRequest): FormErrors {
    const e: FormErrors = {};

    const pattern = /^\d{5}[- ]\d{3}[- ]\d{2}$/;

    if (!f.licensePlate.trim()) {
        e.licensePlate = "License plate is required";
    } else if (!pattern.test(f.licensePlate)) {
        e.licensePlate = "Format must be: 12345-123-16 or 12345 123 16";
    }

    if (f.capacityKg < 0) e.capacityKg = "Must be positive";
    if (f.volumeM3 < 0) e.volumeM3 = "Must be positive";

    if (!f.type) e.type = "Select a vehicle type";
    if (!f.ownershipType) e.ownershipType = "Select ownership type";

    // If ownership is Driver, a driver must be selected
    if (f.ownershipType === "Driver" && !f.ownerDriverId) {
        e.ownerDriverId = "Select a driver for this vehicle";
    }

    return e;
}

// ─── Props ────────────────────────────────────────────────────────────────

interface CreateVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ICreateVehicleRequest) => Promise<void>;
    loading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function CreateVehicleModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
}: CreateVehicleModalProps) {
    const [form, setForm] = useState<ICreateVehicleRequest>({
        licensePlate: "",
        capacityKg: 0,
        volumeM3: 0,
        brand: "",
        model: "",
        type: "Truck",
        ownershipType: "Company",
        ownerDriverId: undefined,
        isRefrigerated: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<IDriverResponse | null>(null);

    if (!isOpen) return null;

    const set = <K extends keyof ICreateVehicleRequest>(key: K, value: ICreateVehicleRequest[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        // Revalidate field when touched
        if (touched) {
            setErrors(validate({ ...form, [key]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);

        const errs = validate(form);
        setErrors(errs);

        if (Object.keys(errs).length > 0) return;

        await onSubmit(form);
    };

    const handleDriverChange = (id: string | null, driver?: IDriverResponse | null) => {
        set("ownerDriverId", id ?? undefined);
        setSelectedDriver(driver ?? null);
    };

    // Format number inputs for display
    const formatNumber = (value: number): string => value > 0 ? value.toString() : "";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b shrink-0"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}
                        >
                            <Truck className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">Add New Vehicle</div>
                            <div className="text-[11px] text-slate-500">Register a vehicle to your fleet</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all disabled:opacity-40"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5 overflow-y-auto custom-scrollbar space-y-5">

                    {/* Section: Identification */}
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                            <Hash className="w-3 h-3" />
                            Vehicle Identification
                        </h3>
                        <div className="h-px bg-white/10" />
                    </div>

                    {/* License Plate */}
                    <InputField
                        label="License Plate *"
                        type="text"
                        placeholder="123-456-16"
                        icon={Hash}
                        value={form.licensePlate}
                        onChange={(e) => set("licensePlate", e.target.value)}
                        error={touched ? errors.licensePlate : undefined}
                    />

                    {/* Brand + Model */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Brand"
                            type="text"
                            placeholder="e.g. Mercedes-Benz"
                            icon={Building2}
                            value={form.brand ?? ""}
                            onChange={(e) => set("brand", e.target.value)}
                        />
                        <InputField
                            label="Model"
                            type="text"
                            placeholder="e.g. Actros 2546"
                            icon={Package}
                            value={form.model ?? ""}
                            onChange={(e) => set("model", e.target.value)}
                        />
                    </div>

                    {/* Section: Specifications */}
                    <div className="space-y-1 pt-2">
                        <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                            <Boxes className="w-3 h-3" />
                            Specifications
                        </h3>
                        <div className="h-px bg-white/10" />
                    </div>

                    {/* Type + Ownership */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Vehicle Type *
                            </label>
                            <div className={`relative rounded-xl border ${errors.type && touched ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'} focus-within:border-amber-500/50 transition`}>
                                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    value={form.type}
                                    onChange={(e) => set("type", e.target.value as VehicleType)}
                                    className="w-full bg-transparent pl-12 pr-4 py-3 text-white appearance-none focus:outline-none cursor-pointer"
                                >
                                    {(["Moto", "Car", "Van", "Truck"] as VehicleType[]).map((t) => (
                                        <option key={t} value={t} className="bg-[#070c15] text-white">
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                            {touched && errors.type && <p className="mt-1 text-sm text-red-400">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Ownership Type *
                            </label>
                            <div className={`relative rounded-xl border ${errors.ownershipType && touched ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'} focus-within:border-amber-500/50 transition`}>
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    value={form.ownershipType}
                                    onChange={(e) => {
                                        const val = e.target.value as VehicleOwnershipType;
                                        set("ownershipType", val);
                                        // Clear driver selection if switching to Company
                                        if (val === "Company") {
                                            set("ownerDriverId", undefined);
                                            setSelectedDriver(null);
                                        }
                                    }}
                                    className="w-full bg-transparent pl-12 pr-4 py-3 text-white appearance-none focus:outline-none cursor-pointer"
                                >
                                    {(["Company", "Driver"] as VehicleOwnershipType[]).map((o) => (
                                        <option key={o} value={o} className="bg-[#070c15] text-white">
                                            {o === "Driver" ? "Driver (Owner-Operator)" : o}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                            {touched && errors.ownershipType && <p className="mt-1 text-sm text-red-400">{errors.ownershipType}</p>}
                        </div>
                    </div>

                    {/* Capacity + Volume */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Capacity (kg)"
                            type="number"
                            placeholder="0"
                            icon={Package}
                            value={formatNumber(form.capacityKg)}
                            onChange={(e) => set("capacityKg", parseFloat(e.target.value) || 0)}
                            step="0.1"
                            error={touched ? errors.capacityKg : undefined}
                        />
                        <InputField
                            label="Volume (m³)"
                            type="number"
                            placeholder="0"
                            icon={Boxes}
                            value={formatNumber(form.volumeM3)}
                            onChange={(e) => set("volumeM3", parseFloat(e.target.value) || 0)}
                            step="0.1"
                            error={touched ? errors.volumeM3 : undefined}
                        />
                    </div>

                    {/* Section: Assignment */}
                    <div className="space-y-1 pt-2">
                        <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3 h-3" />
                            Driver Assignment
                        </h3>
                        <div className="h-px bg-white/10" />
                    </div>

                    {/* Driver Picker - Only show if ownership is Driver */}
                    {form.ownershipType === "Driver" && (
                        <div className="space-y-1">
                            <EntityPicker<IDriverResponse>
                                value={form.ownerDriverId ?? null}
                                onChange={handleDriverChange}
                                fetchData={async () => {
                                    const res = await listDrivers({ pageSize: 100, pageNumber: 1 });
                                    return res.items;
                                }}
                                getId={(d) => d.id}
                                getLabel={(d) => d.fullName}
                                getSubLabel={(d) => d.email}
                                renderIcon={(d) => (
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-amber-400" />
                                    </div>
                                )}
                                label="Assigned Driver *"
                                placeholder="Search and select a driver..."
                                required
                                error={touched ? errors.ownerDriverId : undefined}
                            />
                            {selectedDriver && (
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Selected: <span className="text-slate-300">{selectedDriver.fullName}</span> • {selectedDriver.phoneNumber}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Refrigerated Toggle */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => set("isRefrigerated", !form.isRefrigerated)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                            style={{
                                background: form.isRefrigerated ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.03)",
                                border: form.isRefrigerated
                                    ? "1px solid rgba(56,189,248,0.3)"
                                    : "1px solid rgba(255,255,255,0.08)"
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Snowflake className={`w-4 h-4 ${form.isRefrigerated ? "text-sky-400" : "text-slate-500"}`} />
                                <span className={`text-[13px] font-medium ${form.isRefrigerated ? "text-sky-400" : "text-slate-300"}`}>
                                    Refrigerated Unit
                                </span>
                                {form.isRefrigerated && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold">
                                        ENABLED
                                    </span>
                                )}
                            </div>
                            <div
                                className="w-11 h-6 rounded-full transition-all duration-200 relative flex items-center"
                                style={{
                                    background: form.isRefrigerated ? "rgba(56,189,248,0.25)" : "rgba(255,255,255,0.1)",
                                    border: `1px solid ${form.isRefrigerated ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.15)"}`
                                }}
                            >
                                <div
                                    className="absolute w-5 h-5 rounded-full transition-all duration-200 shadow-sm"
                                    style={{
                                        left: form.isRefrigerated ? "calc(100% - 22px)" : "2px",
                                        background: form.isRefrigerated ? "#38bdf8" : "#64748b",
                                        boxShadow: form.isRefrigerated ? "0 0 12px rgba(56,189,248,0.5)" : "none",
                                    }}
                                />
                            </div>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div
                    className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-[13px] text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10 disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form=""
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        style={{
                            background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                            boxShadow: "0 4px 16px rgba(251,191,36,0.2)"
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Truck className="w-4 h-4" />
                                Add Vehicle
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}