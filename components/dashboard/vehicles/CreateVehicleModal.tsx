"use client";

import { useState } from "react";
import {
    Hash,
    Truck,
    Building2,
    Package,
    Boxes,
    Snowflake,
    Loader2,
    X,
    ChevronDown,
    Calendar,
    Palette
} from "lucide-react";
import InputField from "@/components/commons/InputField";
import { ICreateVehicleRequest, VehicleType } from "@/types/vehicle";

// ─── Validation ───────────────────────────────────────────────────────────

interface FormErrors {
    registrationNumber?: string;
    maxWeight?: string;
    maxVolume?: string;
    brand?: string;
    modelName?: string;
    year?: string;
    type?: string;
}

function validate(f: ICreateVehicleRequest): FormErrors {
    const e: FormErrors = {};

    const pattern = /^[A-Z0-9\s\-]{5,20}$/i;

    if (!f.registrationNumber.trim()) {
        e.registrationNumber = "Registration number is required";
    } else if (!pattern.test(f.registrationNumber)) {
        e.registrationNumber = "Format must be valid alphanumeric registration (5-20 chars)";
    }

    if (f.maxWeight < 1) e.maxWeight = "Must be at least 1 kg";
    if (f.maxVolume < 0.1) e.maxVolume = "Must be at least 0.1 m³";

    if (!f.type) e.type = "Select a vehicle type";
    if (f.year && (f.year < 1900 || f.year > new Date().getFullYear() + 1)) {
        e.year = "Please enter a valid year";
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
        registrationNumber: "",
        maxWeight: 0,
        maxVolume: 0,
        brand: "",
        modelName: "",
        type: "van",
        year: new Date().getFullYear(),
        color: "",
        supportsFragile: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);

    if (!isOpen) return null;

    const set = <K extends keyof ICreateVehicleRequest>(key: K, value: ICreateVehicleRequest[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Registration Number */}
                        <InputField
                            label="Registration Number *"
                            type="text"
                            placeholder="e.g. 12345-123-16"
                            icon={Hash}
                            value={form.registrationNumber}
                            onChange={(e) => set("registrationNumber", e.target.value.toUpperCase())}
                            error={touched ? errors.registrationNumber : undefined}
                        />

                        {/* Vehicle Type */}
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
                                    <option value="motorcycle" className="bg-[#070c15] text-white">Motorcycle</option>
                                    <option value="car" className="bg-[#070c15] text-white">Car</option>
                                    <option value="van" className="bg-[#070c15] text-white">Van</option>
                                    <option value="small_truck" className="bg-[#070c15] text-white">Small Truck</option>
                                    <option value="large_truck" className="bg-[#070c15] text-white">Large Truck</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                            {touched && errors.type && <p className="mt-1 text-sm text-red-400">{errors.type}</p>}
                        </div>
                    </div>

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
                            value={form.modelName ?? ""}
                            onChange={(e) => set("modelName", e.target.value)}
                        />
                    </div>

                    {/* Year + Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Year"
                            type="number"
                            placeholder="e.g. 2022"
                            icon={Calendar}
                            value={form.year?.toString() ?? ""}
                            onChange={(e) => set("year", parseInt(e.target.value) || undefined)}
                            error={touched ? errors.year : undefined}
                        />
                        <InputField
                            label="Color"
                            type="text"
                            placeholder="e.g. White"
                            icon={Palette}
                            value={form.color ?? ""}
                            onChange={(e) => set("color", e.target.value)}
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

                    {/* Capacity + Volume */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Max Weight (kg)"
                            type="number"
                            placeholder="0"
                            icon={Package}
                            value={formatNumber(form.maxWeight)}
                            onChange={(e) => set("maxWeight", parseFloat(e.target.value) || 0)}
                            step="0.1"
                            error={touched ? errors.maxWeight : undefined}
                        />
                        <InputField
                            label="Max Volume (m³)"
                            type="number"
                            placeholder="0"
                            icon={Boxes}
                            value={formatNumber(form.maxVolume)}
                            onChange={(e) => set("maxVolume", parseFloat(e.target.value) || 0)}
                            step="0.1"
                            error={touched ? errors.maxVolume : undefined}
                        />
                    </div>

                    {/* Fragile Toggle */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => set("supportsFragile", !form.supportsFragile)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                            style={{
                                background: form.supportsFragile ? "rgba(56,189,248,0.08)" : "rgba(255,255,255,0.03)",
                                border: form.supportsFragile
                                    ? "1px solid rgba(56,189,248,0.3)"
                                    : "1px solid rgba(255,255,255,0.08)"
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Snowflake className={`w-4 h-4 ${form.supportsFragile ? "text-sky-400" : "text-slate-500"}`} />
                                <span className={`text-[13px] font-medium ${form.supportsFragile ? "text-sky-400" : "text-slate-300"}`}>
                                    Supports Fragile Transport
                                </span>
                                {form.supportsFragile && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold">
                                        ENABLED
                                    </span>
                                )}
                            </div>
                            <div
                                className="w-11 h-6 rounded-full transition-all duration-200 relative flex items-center"
                                style={{
                                    background: form.supportsFragile ? "rgba(56,189,248,0.25)" : "rgba(255,255,255,0.1)",
                                    border: `1px solid ${form.supportsFragile ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.15)"}`
                                }}
                            >
                                <div
                                    className="absolute w-5 h-5 rounded-full transition-all duration-200 shadow-sm"
                                    style={{
                                        left: form.supportsFragile ? "calc(100% - 22px)" : "2px",
                                        background: form.supportsFragile ? "#38bdf8" : "#64748b",
                                        boxShadow: form.supportsFragile ? "0 0 12px rgba(56,189,248,0.5)" : "none",
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