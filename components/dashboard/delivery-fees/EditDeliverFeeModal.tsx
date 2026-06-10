"use client";

import { useEffect, useState } from "react";
import { IUpsertTariffPayload, ITariffEntry } from "@/types/deliveryFee";
import InputField from "@/components/commons/InputField";

// ── Validation ────────────────────────────────────────────────────────────

interface FormErrors {
    stopdesk?: string;
    domicile?: string;
}

function validate(f: {
    stopdesk: string;
    domicile: string;
}): FormErrors {
    const e: FormErrors = {};

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

interface EditDeliveryFeeModalProps {
    isOpen: boolean;
    fee: ITariffEntry;
    onClose: () => void;
    onSubmit: (data: IUpsertTariffPayload) => Promise<void>;
    loading?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function EditDeliveryFeeModal({
    isOpen,
    fee,
    onClose,
    onSubmit,
    loading,
}: EditDeliveryFeeModalProps) {
    const [stopdesk, setStopdesk] = useState(fee.stopdesk.toString());
    const [domicile, setDomicile] = useState(fee.domicile.toString());

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStopdesk(fee.stopdesk.toString());
            setDomicile(fee.domicile.toString());
            setErrors({});
            setTouched(false);
        }
    }, [isOpen, fee]);

    const revalidate = () => {
        if (!touched) return;
        setErrors(
            validate({
                stopdesk,
                domicile,
            })
        );
    };

    const handleSubmit = async () => {
        setTouched(true);

        const errs = validate({
            stopdesk,
            domicile,
        });

        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        await onSubmit({
            wilayaFrom: fee.from.id,
            wilayaTo: fee.to.id,
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
            <div className="w-full max-w-md rounded-2xl overflow-hidden bg-[#070c15] border border-white/10">

                {/* HEADER */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="text-white font-semibold">
                        Edit Tariff Prices
                    </div>
                    <div className="text-[12px] text-slate-400 mt-1">
                        {fee.from.name} ↔ {fee.to.name}
                    </div>
                </div>

                {/* BODY */}
                <div className="px-6 py-5 space-y-4">

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
                            background: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
                        }}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}