"use client";

import { useState } from "react";
import { ICreateDeliveryFeePayload, DeliveryType } from "@/types/deliveryFee";
import EntityPicker from "@/components/commons/EntityPicker";
import { getWilayas } from "@/services/LocationService";
import { IWilaya } from "@/types/common";
import InputField from "@/components/commons/InputField";

// ── Delivery type options ──────────────────────────────────────────────────

const DELIVERY_TYPE_OPTIONS = [
    {
        value: DeliveryType.Home,
        label: "Home Delivery",
        desc: "Delivered directly to the recipient's address",
        color: "#34d399",
        rgb: "52,211,153",
    },
    {
        value: DeliveryType.StopDesk,
        label: "Stop Desk",
        desc: "Picked up at the nearest relay desk",
        color: "#38bdf8",
        rgb: "56,189,248",
    },
];

// ── Validation ────────────────────────────────────────────────────────────

interface FormErrors {
    deliveryType?: string;
    originWilayaId?: string;
    destinationWilayaId?: string;
    baseFee?: string;
    extraKgFee?: string;
}

function validate(f: {
    deliveryType: DeliveryType | null;
    originWilayaId: string;
    destinationWilayaId: string;
    baseFee: string;
    extraKgFee: string;
}): FormErrors {
    const e: FormErrors = {};

    if (f.deliveryType === null) e.deliveryType = "Select a delivery type";
    if (!f.originWilayaId) e.originWilayaId = "Required";
    if (!f.destinationWilayaId) e.destinationWilayaId = "Required";

    if (!f.baseFee || isNaN(Number(f.baseFee)) || Number(f.baseFee) < 0)
        e.baseFee = "Enter a valid base fee";

    if (!f.extraKgFee || isNaN(Number(f.extraKgFee)) || Number(f.extraKgFee) < 0)
        e.extraKgFee = "Enter a valid extra kg fee";

    return e;
}

// ── Props ──────────────────────────────────────────────────────────────────

interface CreateDeliveryFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ICreateDeliveryFeePayload) => Promise<void>;
    loading?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CreateDeliveryFeeModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
}: CreateDeliveryFeeModalProps) {
    const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);

    const [originWilayaId, setOriginWilayaId] = useState<string>("");
    const [destinationWilayaId, setDestinationWilayaId] = useState<string>("");

    const [originSearch, setOriginSearch] = useState("");
    const [destinationSearch, setDestinationSearch] = useState("");

    const [baseFee, setBaseFee] = useState("");
    const [extraKgFee, setExtraKgFee] = useState("");
    const [includedWeightKg, setIncludedWeightKg] = useState("");
    const [estimatedHours, setEstimatedHours] = useState("");

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);

    const revalidate = () => {
        if (!touched) return;
        setErrors(
            validate({
                deliveryType,
                originWilayaId,
                destinationWilayaId,
                baseFee,
                extraKgFee,
            })
        );
    };

    const handleSubmit = async () => {
        setTouched(true);

        const errs = validate({
            deliveryType,
            originWilayaId,
            destinationWilayaId,
            baseFee,
            extraKgFee,
        });

        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        await onSubmit({
            deliveryType: deliveryType!,
            originWilayaId,
            destinationWilayaId,
            baseFee: Number(baseFee),
            extraKgFee: Number(extraKgFee),
            includedWeightKg: includedWeightKg
                ? Number(includedWeightKg)
                : undefined,
            estimatedHours: estimatedHours
                ? Number(estimatedHours)
                : undefined,
        });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)" }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-lg rounded-2xl overflow-hidden bg-[#070c15] border border-white/10">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="text-white font-semibold">
                        Create Delivery Fee
                    </div>
                    <div className="text-[11px] text-slate-600">
                        Define pricing rule between two wilayas
                    </div>
                </div>

                {/* BODY */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* DELIVERY TYPE */}
                    <div className="grid grid-cols-2 gap-2">
                        {DELIVERY_TYPE_OPTIONS.map((t) => {
                            const active = deliveryType === t.value;

                            return (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => {
                                        setDeliveryType(t.value);
                                        revalidate();
                                    }}
                                    className="p-3 rounded-lg text-left"
                                    style={{
                                        background: active
                                            ? `rgba(${t.rgb},0.08)`
                                            : "rgba(255,255,255,0.03)",
                                        border: active
                                            ? `1px solid rgba(${t.rgb},0.3)`
                                            : "1px solid rgba(255,255,255,0.06)",
                                    }}
                                >
                                    <div className="text-[12px] text-white font-semibold">
                                        {t.label}
                                    </div>
                                    <div className="text-[10px] text-slate-600">
                                        {t.desc}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* WILAYAS */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* ORIGIN */}
                        <EntityPicker<IWilaya>
                            value={originWilayaId}
                            onChange={(id) => {
                                setOriginWilayaId(id ?? "");
                                revalidate();
                            }}
                            label="Origin Wilaya"
                            required
                            error={errors.originWilayaId}
                            placeholder="Select origin"
                            fetchData={() =>
                                getWilayas({
                                    search: originSearch,
                                    pageNumber: 1,
                                    pageSize: 30,
                                })
                            }
                            onSearchChange={setOriginSearch}
                            getId={(w) => w.id}
                            getLabel={(w) => w.code + " - " + w.nameFr}
                            getSubLabel={(w) => " " + w.nameAr}
                        />

                        {/* DESTINATION */}
                        <EntityPicker<IWilaya>
                            value={destinationWilayaId}
                            onChange={(id) => {
                                setDestinationWilayaId(id ?? "");
                                revalidate();
                            }}
                            label="Destination Wilaya"
                            required
                            error={errors.destinationWilayaId}
                            placeholder="Select destination"
                            fetchData={() =>
                                getWilayas({
                                    search: destinationSearch,
                                    pageNumber: 1,
                                    pageSize: 30,
                                })
                            }
                            onSearchChange={setDestinationSearch}
                            getId={(w) => w.id}
                            getLabel={(w) => w.code + " - " + w.nameFr}
                            getSubLabel={(w) => " " + w.nameAr}
                        />
                    </div>

                    {/* PRICING */}
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Base Fee (DZD)"
                            type="number"
                            value={baseFee}
                            onChange={(e) => {
                                setBaseFee(e.target.value);
                                revalidate();
                            }}
                            placeholder="e.g. 450"
                            error={errors.baseFee}
                        />

                        <InputField
                            label="Extra Kg Fee (DZD)"
                            type="number"
                            value={extraKgFee}
                            onChange={(e) => {
                                setExtraKgFee(e.target.value);
                                revalidate();
                            }}
                            placeholder="e.g. 50"
                            error={errors.extraKgFee}
                        />
                    </div>

                    {/* OPTIONAL */}
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Included Weight (kg)"
                            type="number"
                            value={includedWeightKg}
                            onChange={(e) =>
                                setIncludedWeightKg(e.target.value)
                            }
                            placeholder="e.g. 5"
                        />

                        <InputField
                            label="Estimated Hours"
                            type="number"
                            value={estimatedHours}
                            onChange={(e) =>
                                setEstimatedHours(e.target.value)
                            }
                            placeholder="e.g. 48"
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-black font-semibold"
                        style={{
                            background:
                                "linear-gradient(135deg,#38bdf8,#0ea5e9)",
                        }}
                    >
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}