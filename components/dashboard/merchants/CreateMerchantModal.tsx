"use client";

import { useState, useEffect } from "react";
import { IRegisterMerchant, PaymentMethod } from "@/types/merchant";
import { ILocation, IWilaya } from "@/types/common";
import { Store, Mail, Phone, User, MapPin, CreditCard, Building2 } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { showToast } from "nextjs-toast-notify";
import EntityPicker from "@/components/commons/EntityPicker";
import { getWilayas } from "@/services/LocationService";
import GlassEffectCard from "@/components/commons/GlassEffectCard";

interface CreateMerchantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: IRegisterMerchant) => Promise<void>;
    loading?: boolean;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PaymentMethod.Cash]: "Cash",
    [PaymentMethod.Bank]: "Bank",
    [PaymentMethod.CCP]: "CCP",
};

export default function CreateMerchantModal({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
}: CreateMerchantModalProps) {
    const [wilayas, setWilayas] = useState<IWilaya[]>([]);

    // Form state - address is separate from ILocation
    const [form, setForm] = useState<{
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        password: string;
        businessName: string;
        wilayaId: string;
        paymentMethod: PaymentMethod;
        storeLocation: ILocation;
        RIB?: string;
        CCP?: string;
    }>({
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        password: "",
        businessName: "",
        wilayaId: "",
        paymentMethod: PaymentMethod.Cash,
        storeLocation: { latitude: 0, longitude: 0 },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedWilaya, setSelectedWilaya] = useState<IWilaya | null>(null);

    // Load wilayas when modal opens
    useEffect(() => {
        if (isOpen && wilayas.length === 0) {
            getWilayas()
                .then(setWilayas)
                .catch(() => showToast.error("Failed to load wilayas"));
        }
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setForm({
                email: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                password: "",
                businessName: "",
                wilayaId: "",
                paymentMethod: PaymentMethod.Cash,
                storeLocation: { latitude: 0, longitude: 0 },
            });
            setErrors({});
            setSelectedWilaya(null);
        }
    }, [isOpen]);

    const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key as string]) {
            setErrors((prev) => {
                const { [key as string]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";

        if (!form.firstName.trim()) newErrors.firstName = "First name is required";
        if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!form.phoneNumber.trim()) newErrors.phoneNumber = "Phone is required";

        if (!form.password || form.password.length < 6)
            newErrors.password = "Password must be at least 6 characters";

        if (!form.businessName.trim()) newErrors.businessName = "Business name is required";
        if (!form.wilayaId) newErrors.wilayaId = "Wilaya is required";

        if (form.paymentMethod === PaymentMethod.Bank && !form.RIB?.trim())
            newErrors.RIB = "RIB is required for bank payments";
        if (form.paymentMethod === PaymentMethod.CCP && !form.CCP?.trim())
            newErrors.CCP = "CCP number is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("Submitting form with data:", form);
        e.preventDefault();
        if (!validate()) {
            showToast.error("Please fix the form errors");
            return;
        }

        // Construct IRegisterMerchant with proper ILocation
        const payload: IRegisterMerchant = {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
            password: form.password,
            businessName: form.businessName,
            wilayaId: form.wilayaId,
            paymentMethod: form.paymentMethod,
            RIB: form.RIB,
            CCP: form.CCP,
            storeLocation: form.storeLocation, // ILocation with lat/lng only
        };

        await onSubmit(payload);
    };

    return (
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Register Merchant"
            subtitle="Add a new merchant to your logistics network"
            headerIcon={<Store size={17} style={{ color: "#a78bfa" }} />}
            showCloseButton={true}
            accentColor="violet"
            withNoise={true}
            withSweep={true}
            maxWidth="640px"
            footer={
                <div className="flex items-center gap-2">
                    <ActionBtn
                        onClick={onClose}
                        disabled={loading}
                        label="Cancel"
                        variant="slate"
                        size="action"
                    />
                    <ActionBtn
                        onClick={(e) => handleSubmit(e)}
                        disabled={loading}
                        label={loading ? "Registering…" : "Register Merchant"}
                        variant="amber"
                        type="button"
                        size="action"
                    />
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 pr-1 custom-scrollbar max-h-[65vh] overflow-y-auto">

                {/* ─── Personal Info ─── */}
                <div>
                    <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                        <User size={14} />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={(e) => updateField("firstName", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-[13px] bg-white/5 border ${errors.firstName ? "border-red-500/50" : "border-white/10"
                                    } text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors`}
                                placeholder="e.g. Ahmed"
                            />
                            {errors.firstName && <p className="text-[10px] text-red-400 mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={(e) => updateField("lastName", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-[13px] bg-white/5 border ${errors.lastName ? "border-red-500/50" : "border-white/10"
                                    } text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors`}
                                placeholder="e.g. Benali"
                            />
                            {errors.lastName && <p className="text-[10px] text-red-400 mt-1">{errors.lastName}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-[13px] bg-white/5 border ${errors.email ? "border-red-500/50" : "border-white/10"
                                        } text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors`}
                                    placeholder="merchant@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                Phone *
                            </label>
                            <div className="relative">
                                <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                                <input
                                    type="tel"
                                    value={form.phoneNumber}
                                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-[13px] bg-white/5 border ${errors.phoneNumber ? "border-red-500/50" : "border-white/10"
                                        } text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors`}
                                    placeholder="0555123456"
                                />
                            </div>
                            {errors.phoneNumber && <p className="text-[10px] text-red-400 mt-1">{errors.phoneNumber}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                Password *
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => updateField("password", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-[13px] bg-white/5 border ${errors.password ? "border-red-500/50" : "border-white/10"
                                    } text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-[10px] text-red-400 mt-1">{errors.password}</p>}
                        </div>
                    </div>
                </div>

                {/* ─── Business Info ─── */}
                <div>
                    <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Building2 size={14} />
                        Business Information
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                Business Name *
                            </label>
                            <input
                                type="text"
                                value={form.businessName}
                                onChange={(e) => updateField("businessName", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-[13px] bg-white/5 border ${errors.businessName ? "border-red-500/50" : "border-white/10"
                                    } text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors`}
                                placeholder="e.g. Benali Electronics"
                            />
                            {errors.businessName && <p className="text-[10px] text-red-400 mt-1">{errors.businessName}</p>}
                        </div>

                        {/* Wilaya Picker - Using your EntityPicker */}
                        <div>
                            <EntityPicker<IWilaya>
                                value={form.wilayaId}
                                onChange={(id, item) => {
                                    updateField("wilayaId", id ?? "");
                                    setSelectedWilaya(item ?? null);
                                }}
                                fetchData={async () => wilayas}
                                getId={(w) => w.id}
                                getLabel={(w) => w.nameFr}
                                getSubLabel={(w) => `Code: ${w.code}`}
                                renderIcon={(w) => (
                                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                                        <MapPin className="w-3.5 h-3.5 text-violet-400" />
                                    </div>
                                )}
                                label="Wilaya *"
                                placeholder="Search wilayas…"
                                required
                                error={errors.wilayaId}
                                searchFn={(item, search) =>
                                    item.nameFr.toLowerCase().includes(search.toLowerCase())
                                }
                            />
                        </div>

                        {/* Optional: Lat/Lng inputs if you want manual entry */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.storeLocation.latitude || ""}
                                    onChange={(e) => updateField("storeLocation", {
                                        ...form.storeLocation,
                                        latitude: parseFloat(e.target.value) || 0
                                    })}
                                    className="w-full px-3 py-2 rounded-lg text-[13px] bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                                    placeholder="36.7528"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.storeLocation.longitude || ""}
                                    onChange={(e) => updateField("storeLocation", {
                                        ...form.storeLocation,
                                        longitude: parseFloat(e.target.value) || 0
                                    })}
                                    className="w-full px-3 py-2 rounded-lg text-[13px] bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                                    placeholder="3.042"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Payment Info ─── */}
                <div>
                    <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CreditCard size={14} />
                        Payment Method
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {Object.values(PaymentMethod)
                            .map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => updateField("paymentMethod", method as PaymentMethod)}
                                    className={`px-3 py-2 rounded-lg text-[11px] font-medium border transition-all ${form.paymentMethod === method
                                        ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                                        : "bg-white/5 border-white/10 text-slate-400 hover:border-violet-500/20"
                                        }`}
                                >
                                    {PAYMENT_METHOD_LABELS[method as PaymentMethod]}
                                </button>
                            ))}
                    </div>

                    {form.paymentMethod === PaymentMethod.Bank && (
                        <div>
                            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                RIB *
                            </label>
                            <input
                                type="text"
                                value={form.RIB || ""}
                                onChange={(e) => updateField("RIB", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-[13px] bg-white/5 border ${errors.RIB ? "border-red-500/50" : "border-white/10"
                                    } text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors`}
                                placeholder="20-digit RIB number"
                            />
                            {errors.RIB && <p className="text-[10px] text-red-400 mt-1">{errors.RIB}</p>}
                        </div>
                    )}

                    {form.paymentMethod === PaymentMethod.CCP && (
                        <div>
                            <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">
                                CCP Number *
                            </label>
                            <input
                                type="text"
                                value={form.CCP || ""}
                                onChange={(e) => updateField("CCP", e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-[13px] bg-white/5 border ${errors.CCP ? "border-red-500/50" : "border-white/10"
                                    } text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors`}
                                placeholder="CCP account number"
                            />
                            {errors.CCP && <p className="text-[10px] text-red-400 mt-1">{errors.CCP}</p>}
                        </div>
                    )}
                </div>
            </form>
        </GlassEffectCard>
    );
}