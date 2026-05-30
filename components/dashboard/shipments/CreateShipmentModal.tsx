"use client";
import { useEffect, useState } from "react";
import { Phone, FileText, Weight, X, DollarSign, Package, Truck } from "lucide-react";
import InputField from "@/components/commons/InputField";
import EntityPicker from "@/components/commons/EntityPicker";
import { ICreateShipment } from "@/types/shipment";
import { ICommune } from "@/types/common";
import { DeliveryType } from "@/types/deliveryFee";
import { IMerchant } from "@/types/merchant";
import { listMerchants } from "@/services/MerchantService";
import { listDisponibleCommunes } from "@/services/LocationService";
import { parseApiError } from "@/utils/apiErrorHandler";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: ICreateShipment, mode: "merchant" | "receptionist", merchantId?: string) => Promise<void>;
    loading?: boolean;
    merchantId?: string;
    mode?: "merchant" | "receptionist";
}

export default function CreateShipmentModal({ isOpen, onClose, onSubmit, loading, mode = "merchant" }: Props) {
    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [communeId, setCommuneId] = useState<string | null>(null);
    const [merchantSelectedId, setMerchantSelectedId] = useState<string | null>(null);
    const [codAmount, setCodAmount] = useState("");
    const [weightKg, setWeightKg] = useState("");
    const [description, setDescription] = useState("");
    const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.Home);
    const [communeSearch, setCommuneSearch] = useState("");
    const [merchantSearch, setMerchantSearch] = useState("");
    const [errors, setErrors] = useState<any>({});
    const [touched, setTouched] = useState(false);

    if (!isOpen) return null;

    const validate = () => {
        const e: any = {};
        if (!customerName) e.customerName = "Required";
        if (!phoneNumber) e.phoneNumber = "Required";
        if (!communeId) e.communeId = "Required";
        if (!codAmount || Number(codAmount) < 0) e.codAmount = "Invalid";
        if (!weightKg || Number(weightKg) < 0) e.weightKg = "Required";
        if (mode === "receptionist" && !merchantSelectedId) e.merchantId = "Select merchant";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length > 0) return;

        const payload: ICreateShipment = {
            customer: { fullName: customerName, phoneNumber, communeId: communeId! },
            codAmount: Number(codAmount),
            weightKg: Number(weightKg),
            description: description || undefined,
            deliveryType,
        };

        await onSubmit(payload, mode, mode === "receptionist" ? merchantSelectedId! : undefined);
        onClose();
    };

    const isReceptionist = mode === "receptionist";




    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="w-full max-w-xl rounded-2xl overflow-hidden" style={{ background: "#070c15", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                            <Package className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">{isReceptionist ? "Walk-in Shipment" : "Pickup Shipment"}</div>
                            <div className="text-[11px] text-slate-600">Create a new shipment record</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Full Name"
                            type="text"
                            placeholder="e.g. Mohamed Bekk"
                            icon={Phone} value={customerName}
                            onChange={(e) => {
                                setCustomerName(e.target.value);
                                setErrors((prev: any) => ({ ...prev, customerName: undefined }));
                            }}
                            error={errors.customerName}
                        />
                        <InputField
                            label="Phone"
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

                    <EntityPicker<ICommune>
                        value={communeId}
                        onChange={setCommuneId}
                        fetchData={() => listDisponibleCommunes({ search: communeSearch, pageNumber: 1, pageSize: 30 })}
                        getId={(c) => c.id}
                        getLabel={(c) => c.nameFr}
                        onSearchChange={setCommuneSearch}
                        label="Commune"
                        placeholder="Search..."
                        error={errors.communeId}
                    />

                    {isReceptionist && (
                        <EntityPicker<IMerchant>
                            value={merchantSelectedId}
                            onChange={setMerchantSelectedId}
                            fetchData={async () => (await listMerchants({ search: merchantSearch, pageNumber: 1, pageSize: 20 })).items}
                            getId={(m) => m.id}
                            getLabel={(m) => `${m.firstName} ${m.lastName}`}
                            onSearchChange={setMerchantSearch}
                            label="Merchant"
                            placeholder="Select merchant..."
                            error={errors.merchantId}
                        />
                    )}

                    {/* Delivery Type */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">Delivery Type</span>
                        <div className="grid grid-cols-2 gap-2">
                            {([
                                { val: DeliveryType.Home, label: "Home", icon: <Package size={13} /> },
                                { val: DeliveryType.StopDesk, label: "Stop Desk", icon: <Truck size={13} /> }
                            ] as const).map(opt => {
                                const active = deliveryType === opt.val;
                                return (
                                    <button key={opt.val} type="button" onClick={() => setDeliveryType(opt.val)}
                                        className="relative flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-150"
                                        style={{
                                            background: active ? "rgba(251,191,36,0.07)" : "rgba(255,255,255,0.025)",
                                            border: active ? "1px solid rgba(251,191,36,0.32)" : "1px solid rgba(255,255,255,0.07)",
                                            boxShadow: active ? "0 0 20px rgba(251,191,36,0.07)" : "none",
                                        }}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center transition-all ${active ? "bg-amber-400/20 border-amber-400/50" : "bg-white/4 border-white/10"}`} style={{ border: "1px solid" }}>
                                            {active && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                        </div>
                                        <span className="text-[12px] font-semibold" style={{ color: active ? "#fbbf24" : "#94a3b8" }}>{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="COD Amount"
                            type="number"
                            placeholder="e.g. 2000"
                            icon={DollarSign}
                            value={codAmount}
                            onChange={(e) => {
                                setCodAmount(e.target.value);
                                setErrors((prev: any) => ({ ...prev, codAmount: undefined }));
                            }}
                            error={errors.codAmount}
                        />
                        <InputField
                            label="Weight (kg)"
                            type="number"
                            placeholder="e.g. 1.5"
                            icon={Weight}
                            value={weightKg}
                            onChange={(e) => {
                                setWeightKg(e.target.value);
                                setErrors((prev: any) => ({ ...prev, weightKg: undefined }));
                            }}
                            error={errors.weightKg}
                        />
                    </div>

                    <InputField label="Description" type="text" placeholder="Additional details..." icon={FileText} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    <div className="text-[11px] text-slate-500">
                        {Object.keys(errors).length > 0 ? <span className="text-red-400 italic">Please fix errors</span> : `Creating ${isReceptionist ? "Walk-in" : "Pickup"} Shipment`}
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all disabled:opacity-40">
                            Cancel
                        </button>
                        <button
                            type="submit" onClick={handleSubmit} disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                        >
                            {loading ? (
                                <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Creating…</>
                            ) : (
                                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>Create Shipment</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}