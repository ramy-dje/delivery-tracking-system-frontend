"use client";

import { useState } from "react";
import { Phone, MapPin, Package, DollarSign, FileText, Weight, X } from "lucide-react";
import InputField from "@/components/commons/InputField";
import EntityPicker from "@/components/commons/EntityPicker";
import { ICreateWalkInShipment } from "@/types/shipment";
import { showToast } from "nextjs-toast-notify";
import { ICommune } from "@/types/common";
import { getAllCommunes } from "@/services/LocationService";
import { IBranchResponse } from "@/types/branch";
import { listBranches } from "@/services/BranchService";
import { parseApiError } from "@/utils/apiErrorHandler";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ICreateWalkInShipment) => Promise<void>;
    loading?: boolean;
    merchantId: string;
}

interface FormErrors {
    customerName?: string;
    phoneNumber?: string;
    communeId?: string;
    destinationHubId?: string;
    dropOffHubId?: string;
    codAmount?: string;
    deliveryFee?: string;
}

function validate(f: any): FormErrors {
    const e: FormErrors = {};
    if (!f.customerName?.trim()) e.customerName = "Required";
    if (!f.phoneNumber?.trim()) e.phoneNumber = "Required";
    if (!f.communeId) e.communeId = "Select commune";
    if (!f.destinationHubId) e.destinationHubId = "Select destination hub";
    if (!f.dropOffHubId) e.dropOffHubId = "Select drop-off hub";
    if (!f.codAmount || parseFloat(f.codAmount) < 0) e.codAmount = "Invalid amount";
    if (!f.deliveryFee || parseFloat(f.deliveryFee) < 0) e.deliveryFee = "Invalid fee";
    return e;
}

export default function CreateWalkInModal({ isOpen, onClose, onSubmit, loading, merchantId }: Props) {
    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [communeId, setCommuneId] = useState<string | null>(null);
    const [destinationHubId, setDestinationHubId] = useState<string | null>(null);
    const [dropOffHubId, setDropOffHubId] = useState<string | null>(null);
    const [codAmount, setCodAmount] = useState("");
    const [deliveryFee, setDeliveryFee] = useState("");
    const [description, setDescription] = useState("");
    const [weightKg, setWeightKg] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = { customerName, phoneNumber, communeId, destinationHubId, dropOffHubId, codAmount, deliveryFee, description, weightKg };
        const v = validate(form);
        if (Object.keys(v).length) { setErrors(v); return; }
        try {
            const payload: ICreateWalkInShipment = {
                merchantId,
                customer: { fullName: customerName, phoneNumber, communeId: communeId! },
                destinationHubId: destinationHubId!,
                dropOffHubId: dropOffHubId!,
                codAmount: parseFloat(codAmount),
                deliveryFee: parseFloat(deliveryFee),
                description: description || undefined,
                weightKg: weightKg ? parseFloat(weightKg) : undefined,
            };
            await onSubmit(payload);
            showToast.success("Walk-in shipment created");
            handleClose();
        } catch (err: any) {
            const e = parseApiError(err);
            showToast.error(e.message || "Failed to create walk-in shipment");
        }
    };

    const handleClose = () => {
        setCustomerName(""); setPhoneNumber(""); setCommuneId(null); setDestinationHubId(null); setDropOffHubId(null);
        setCodAmount(""); setDeliveryFee(""); setDescription(""); setWeightKg(""); setErrors({}); onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/95 to-slate-950/95 shadow-2xl">
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-100">Create Walk-in Shipment</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-200 transition-colors"><X size={14} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-200">Customer Information</h3>
                        <InputField type="string" label="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer full name" icon={Phone} error={errors.customerName} />
                        <InputField type="string" label="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+213..." icon={Phone} error={errors.phoneNumber} />
                        <div>
                            <label className="text-sm font-medium text-slate-200 mb-2 block">Destination Commune</label>
                            <EntityPicker<ICommune> value={communeId} onChange={(id) => { setCommuneId(id); setErrors({ ...errors, communeId: undefined }) }} fetchData={async () => getAllCommunes()} getId={(c) => c.id} getLabel={(c) => c.nameFr} getSubLabel={(c) => `Wilaya Code: ${c.wilayaId}`} label="Commune *" placeholder="Search communes…" required error={errors.communeId} searchFn={(item, search) => item.nameFr.toLowerCase().includes(search.toLowerCase())} />
                            {errors.communeId && <p className="text-xs text-red-400 mt-1">{errors.communeId}</p>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-200">Hub Information</h3>
                        <div>
                            <label className="text-sm font-medium text-slate-200 mb-2 block">Destination Hub</label>
                            <EntityPicker<IBranchResponse> value={destinationHubId} onChange={(id) => { setDestinationHubId(id); setErrors({ ...errors, destinationHubId: undefined }) }} fetchData={async () => (await listBranches()).items} getId={(b) => b.id} getLabel={(b) => b.name} getSubLabel={(b) => `Wilaya Code: ${b.wilayaId}`} label="Branch *" placeholder="Search branches…" required error={errors.destinationHubId} searchFn={(item, search) => item.name.toLowerCase().includes(search.toLowerCase())} />
                            {errors.destinationHubId && <p className="text-xs text-red-400 mt-1">{errors.destinationHubId}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-200 mb-2 block">Drop-off Hub (Branch)</label>
                            <EntityPicker<IBranchResponse> value={dropOffHubId} onChange={(id) => { setDropOffHubId(id); setErrors({ ...errors, dropOffHubId: undefined }) }} fetchData={async () => (await listBranches()).items} getId={(b) => b.id} getLabel={(b) => b.name} getSubLabel={(b) => `Wilaya Code: ${b.wilayaId}`} label="Branch *" placeholder="Select drop-off hub" required error={errors.dropOffHubId} searchFn={(item, search) => item.name.toLowerCase().includes(search.toLowerCase())} />
                            {errors.dropOffHubId && <p className="text-xs text-red-400 mt-1">{errors.dropOffHubId}</p>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-200">Pricing</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="COD Amount" type="number" value={codAmount} onChange={(e) => setCodAmount(e.target.value)} placeholder="0.00" icon={DollarSign} error={errors.codAmount} />
                            <InputField label="Delivery Fee" type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="0.00" icon={DollarSign} error={errors.deliveryFee} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-slate-200">Additional Info</h3>
                        <InputField type="string" label="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Package contents, special instructions..." icon={FileText} />
                        <InputField label="Weight (kg) (Optional)" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="0.00" icon={Weight} />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                        <button type="button" onClick={handleClose} className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium transition-colors">{loading ? "Creating..." : "Create Walk-in"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
