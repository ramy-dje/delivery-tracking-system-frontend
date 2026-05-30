"use client";

import { useState } from "react";
import {
    Package,
    Phone,
    RefreshCcw,
    Loader2,
} from "lucide-react";

import InputField from "@/components/commons/InputField";
import EntityPicker from "@/components/commons/EntityPicker";

import { ICommune } from "@/types/common";
import {
    IShipmentSummary,
    ISwapRequest,
} from "@/types/shipment";

import { listDisponibleCommunes, getCommuneById } from "@/services/LocationService";
import { showToast } from "nextjs-toast-notify";
import { initiateSwap } from "@/services/ShipmentService";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    shipment: IShipmentSummary | null;
    loading?: boolean;
}

function SwapShipmentModal({
    isOpen,
    onClose,
    shipment,
}: Props) {
    const [fullName, setFullName] = useState(shipment?.customer.fullName || "");
    const [phoneNumber, setPhoneNumber] = useState(shipment?.customer.phoneNumber || "");
    const [communeId, setCommuneId] = useState<string | null>(shipment?.customer.communeId || null);

    const [communeSearch, setCommuneSearch] = useState("");

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const validate = () => {
        const e: any = {};
        if (!fullName) e.fullName = "Required";
        if (!phoneNumber) e.phoneNumber = "Required";
        if (!communeId) e.communeId = "Required";
        return e;
    };
    console.log("Shipment in modal:", shipment);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validate();
        setErrors(validation);
        if (Object.keys(validation).length > 0) return;

        try {
            setLoading(true);

            const payload: ISwapRequest = {
                newCustomer: {
                    fullName,
                    phoneNumber,
                    communeId: communeId!,
                },
            };

            await initiateSwap(shipment!.id, payload);
            showToast.success("Shipment swap successful");
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(6px)",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="w-full max-w-xl rounded-2xl"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
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
                            <RefreshCcw className="w-4 h-4 text-amber-400" />
                        </div>

                        <div>
                            <div className="text-[14px] font-semibold text-white">
                                Swap Shipment
                            </div>
                            <div className="text-[11px] text-slate-600">
                                Update customer or reroute shipment
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <InputField
                            label="Full Name"
                            type="text"
                            placeholder="Customer full name"
                            icon={Package}
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                setErrors((prev: any) => ({ ...prev, fullName: undefined }));
                            }}
                            error={errors.fullName}
                        />

                        <InputField
                            label="Phone Number"
                            type="tel"
                            placeholder="06 XX XX XX XX"
                            icon={Phone}
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                setErrors((prev: any) => ({ ...prev, phoneNumber: undefined }));
                            }}
                            error={errors.phoneNumber}
                        />
                    </div>

                    {/* Commune */}
                    <EntityPicker<ICommune>
                        value={communeId}
                        onChange={(id) => {
                            setCommuneId(id);
                            setErrors((prev: any) => ({ ...prev, communeId: undefined }));
                        }}
                        fetchData={() =>
                            listDisponibleCommunes({
                                search: communeSearch,
                                pageNumber: 1,
                                pageSize: 30,
                            })
                        }
                        fetchById={() => getCommuneById(communeId!)}
                        getId={(c) => c.id}
                        getLabel={(c) => c.nameFr}
                        onSearchChange={setCommuneSearch}
                        label="Commune"
                        placeholder={"Search commune..."}
                        error={errors.communeId}
                    />
                </div>

                {/* Footer */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-t"
                    style={{
                        borderColor: "rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.01)",
                    }}
                >
                    <div className="text-[11px] text-slate-500">
                        Modify shipment delivery destination
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all disabled:opacity-40"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
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
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="w-4 h-4" />
                                    Confirm Swap
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SwapShipmentModal;