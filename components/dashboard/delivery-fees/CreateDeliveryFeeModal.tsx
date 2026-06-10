"use client";

import { useState } from "react";
import { IUpsertTariffPayload } from "@/types/deliveryFee";
import EntityPicker from "@/components/commons/EntityPicker";
import { getWilayas } from "@/services/LocationService";
import { IWilaya } from "@/types/common";
import InputField from "@/components/commons/InputField";

// ── Validation ────────────────────────────────────────────────────────────

interface FormErrors {
    wilayaFrom?: string;
    wilayaTo?: string;
    stopdesk?: string;
    domicile?: string;
}

function validate(f: {
    wilayaFrom: string;
    wilayaTo: string;
    stopdesk: string;
    domicile: string;
}): FormErrors {
    const e: FormErrors = {};

    if (!f.wilayaFrom) e.wilayaFrom = "Required";
    if (!f.wilayaTo) e.wilayaTo = "Required";

    if (!f.stopdesk || isNaN(Number(f.stopdesk)) || Number(f.stopdesk) < 0)
        e.stopdesk = "Enter a valid stopdesk price";

    if (!f.domicile || isNaN(Number(f.domicile)) || Number(f.domicile) < 0) {
        e.domicile = "Enter a valid domicile price";
    } else if (Number(f.domicile) < Number(f.stopdesk)) {
        e.domicile = "Domicile price must be ≥ stopdesk price";
    }

    return e;
}

// ── Props ──────────────────────────────────────────────────────────────────

interface CreateDeliveryFeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: IUpsertTariffPayload) => Promise<void>;
    loading?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CreateDeliveryFeeModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
}: CreateDeliveryFeeModalProps) {
    const [wilayaFrom, setWilayaFrom] = useState<string>("");
    const [wilayaTo, setWilayaTo] = useState<string>("");

    const [originSearch, setOriginSearch] = useState("");
    const [destinationSearch, setDestinationSearch] = useState("");

    const [stopdesk, setStopdesk] = useState("");
    const [domicile, setDomicile] = useState("");

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);

    const revalidate = () => {
        if (!touched) return;
        setErrors(
            validate({
                wilayaFrom,
                wilayaTo,
                stopdesk,
                domicile,
            })
        );
    };

    const handleSubmit = async () => {
        setTouched(true);

        const errs = validate({
            wilayaFrom,
            wilayaTo,
            stopdesk,
            domicile,
        });

        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        await onSubmit({
            wilayaFrom: Number(wilayaFrom),
            wilayaTo: Number(wilayaTo),
            stopdesk: Number(stopdesk),
            domicile: Number(domicile),
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
                        Add Tariff
                    </div>
                    <div className="text-[11px] text-slate-600">
                        Define pricing rules between two wilayas
                    </div>
                </div>

                {/* BODY */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* WILAYAS */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* ORIGIN */}
                        <EntityPicker<IWilaya>
                            value={wilayaFrom}
                            onChange={(id) => {
                                setWilayaFrom(id ?? "");
                                revalidate();
                            }}
                            label="Origin Wilaya"
                            required
                            error={errors.wilayaFrom}
                            placeholder="Select origin"
                            fetchData={async () =>
                                (await getWilayas()).data
                            }
                            onSearchChange={setOriginSearch}
                            getId={(w) => w.code.toString()}
                            getLabel={(w) => w.code + " - " + w.name}
                        />

                        {/* DESTINATION */}
                        <EntityPicker<IWilaya>
                            value={wilayaTo}
                            onChange={(id) => {
                                setWilayaTo(id ?? "");
                                revalidate();
                            }}
                            label="Destination Wilaya"
                            required
                            error={errors.wilayaTo}
                            placeholder="Select destination"
                            fetchData={async () =>
                                (await getWilayas()).data
                            }
                            onSearchChange={setDestinationSearch}
                            getId={(w) => w.code.toString()}
                            getLabel={(w) => w.code + " - " + w.name}
                        />
                    </div>

                    {/* PRICING */}
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Stopdesk Price (DZD) *"
                            type="number"
                            value={stopdesk}
                            onChange={(e) => {
                                setStopdesk(e.target.value);
                                revalidate();
                            }}
                            placeholder="e.g. 450"
                            error={errors.stopdesk}
                        />

                        <InputField
                            label="Domicile Price (DZD) *"
                            type="number"
                            value={domicile}
                            onChange={(e) => {
                                setDomicile(e.target.value);
                                revalidate();
                            }}
                            placeholder="e.g. 650"
                            error={errors.domicile}
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 px-4 py-2"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-lg text-black font-semibold"
                        style={{
                            background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                        }}
                    >
                        {loading ? "Creating..." : "Save Tariff"}
                    </button>
                </div>
            </div>
        </div>
    );
}