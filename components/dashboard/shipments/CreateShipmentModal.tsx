"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
    Phone, FileText, Weight, X, DollarSign, Package, Truck,
    MapPin, AlertTriangle, Ruler, Layers, Calendar, CreditCard,
    Search as SearchIcon, Building2, Navigation
} from "lucide-react";
import InputField from "@/components/commons/InputField";
import SelectField from "@/components/commons/SelectField";
import DeliveryMapPicker from "@/components/commons/DeliveryMapPicker";
import { ICreatePackageBody, PackageType } from "@/types/shipment";
import { DeliveryType } from "@/types/deliveryFee";
import { searchBranchesForPickup, IBranchPickupOption } from "@/services/ShipmentService";
import { getNodeId, getUserRole } from "@/hooks/useAuth";
import { ROLES } from "@/lib/roles";
import debounce from "lodash/debounce";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: ICreatePackageBody) => Promise<void>;
    loading?: boolean;
    mode?: "merchant" | "receptionist";
}

const PACKAGE_TYPES: { value: PackageType; label: string }[] = [
    { value: "document", label: "Document" },
    { value: "parcel", label: "Parcel" },
    { value: "fragile", label: "Fragile" },
    { value: "heavy", label: "Heavy" },
    { value: "perishable", label: "Perishable" },
    { value: "electronic", label: "Electronic" },
    { value: "clothing", label: "Clothing" },
];

const DELIVERY_PRIORITIES = [
    { value: "standard", label: "Standard" },
    { value: "express", label: "Express" },
    { value: "same_day", label: "Same Day" },
];

export default function CreateShipmentModal({ isOpen, onClose, onSubmit, loading, mode = "merchant" }: Props) {
    const hubId = getNodeId() ?? "";
    const userRole = getUserRole();
    const isFreelancer = userRole === ROLES.MERCHANT;

    // Recipient info
    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [alternativePhone, setAlternativePhone] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [recipientCity, setRecipientCity] = useState("");
    const [recipientState, setRecipientState] = useState("");
    const [recipientPostalCode, setRecipientPostalCode] = useState("");
    const [deliveryNotes, setDeliveryNotes] = useState("");

    // Package details
    const [weightKg, setWeightKg] = useState("");
    const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" });
    const [isFragile, setIsFragile] = useState(false);
    const [packageType, setPackageType] = useState<PackageType>("parcel");
    const [description, setDescription] = useState("");
    const [declaredValue, setDeclaredValue] = useState("");

    // Delivery options
    const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
    const [deliveryPriority, setDeliveryPriority] = useState<"standard" | "express" | "same_day">("standard");

    // Branch pickup search
    const [branchSearchCity, setBranchSearchCity] = useState("");
    const [branchSearchResults, setBranchSearchResults] = useState<IBranchPickupOption[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<IBranchPickupOption | null>(null);
    const [branchSearchLoading, setBranchSearchLoading] = useState(false);
    const [branchSearchError, setBranchSearchError] = useState<string | null>(null);
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);

    // Home delivery coordinates
    const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Pricing
    const [totalPrice, setTotalPrice] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    // Estimated delivery
    const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("");

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Debounced branch search
    const debouncedBranchSearch = useCallback(
        debounce(async (city: string) => {
            if (!city || city.length < 2) {
                setBranchSearchResults([]);
                setBranchSearchLoading(false);
                return;
            }

            setBranchSearchLoading(true);
            setBranchSearchError(null);

            try {
                const result = await searchBranchesForPickup(city, 10);
                setBranchSearchResults(result.data);
                if (result.data.length === 0) {
                    setBranchSearchError(result.message);
                }
            } catch (err: any) {
                console.error("Branch search error:", err);
                setBranchSearchError(err.response?.data?.message || "Failed to search branches");
                setBranchSearchResults([]);
            } finally {
                setBranchSearchLoading(false);
            }
        }, 500),
        []
    );

    // Trigger search when branchSearchCity changes
    useEffect(() => {
        if (deliveryType === "branch_pickup" && branchSearchCity) {
            debouncedBranchSearch(branchSearchCity);
        }
        return () => {
            debouncedBranchSearch.cancel();
        };
    }, [branchSearchCity, deliveryType, debouncedBranchSearch]);

    // Auto-populate branch search city from recipient city
    useEffect(() => {
        if (deliveryType === "branch_pickup" && recipientCity && !branchSearchCity) {
            setBranchSearchCity(recipientCity);
        }
    }, [deliveryType, recipientCity, branchSearchCity]);

    if (!isOpen) return null;

    const validate = () => {
        const e: Record<string, string> = {};

        // Recipient validation
        if (!recipientName.trim()) e.recipientName = "Recipient name is required";
        if (!recipientPhone.trim()) e.recipientPhone = "Phone number is required";
        if (!recipientAddress.trim()) e.recipientAddress = "Address is required";
        if (!recipientCity.trim()) e.recipientCity = "City is required";
        if (!recipientState.trim()) e.recipientState = "State is required";

        // Package validation
        if (!weightKg || Number(weightKg) <= 0) e.weight = "Valid weight is required";
        if (!totalPrice || Number(totalPrice) < 0) e.totalPrice = "Valid price is required";

        // Delivery type specific validation
        if (deliveryType === "home") {
            if (!deliveryCoords) {
                e.deliveryCoords = "Please select delivery location on the map";
            }
        } else if (deliveryType === "branch_pickup") {
            if (!selectedBranch) {
                e.selectedBranch = "Please select a destination branch";
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const payload: ICreatePackageBody = {
            recipientName: recipientName.trim(),
            recipientPhone: recipientPhone.trim(),
            alternativePhone: alternativePhone.trim() || undefined,
            recipientAddress: recipientAddress.trim(),
            recipientCity: recipientCity.trim(),
            recipientState: recipientState.trim(),
            recipientPostalCode: recipientPostalCode.trim() || undefined,
            deliveryNotes: deliveryNotes.trim() || undefined,

            weight: Number(weightKg),
            dimensions: dimensions.length && dimensions.width && dimensions.height ? {
                length: Number(dimensions.length),
                width: Number(dimensions.width),
                height: Number(dimensions.height),
            } : undefined,
            isFragile,
            type: packageType,
            description: description.trim() || undefined,
            declaredValue: declaredValue ? Number(declaredValue) : undefined,

            deliveryType,
            deliveryPriority,
            destinationBranchId: deliveryType === "branch_pickup" && selectedBranch ? selectedBranch.id : undefined,

            totalPrice: Number(totalPrice),
            paymentMethod: paymentMethod || undefined,

            estimatedDeliveryTime: estimatedDeliveryTime || undefined,
            originBranchId: hubId,
        };

        // Add coordinates for home delivery
        if (deliveryType === "home" && deliveryCoords) {
            payload.deliveryLat = deliveryCoords.lat;
            payload.deliveryLon = deliveryCoords.lng;
        }

        await onSubmit(payload);
    };

    const handleSelectBranch = (branch: IBranchPickupOption) => {
        setSelectedBranch(branch);
        setShowBranchDropdown(false);
        setBranchSearchCity(branch.name);
        // Clear any error
        setErrors(prev => ({ ...prev, selectedBranch: "" }));
    };

    const isReceptionist = mode === "receptionist";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "#070c15", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                            <Package className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">{isReceptionist ? "Walk-in Package" : "Request Pickup"}</div>
                            <div className="text-[11px] text-slate-600">Create a new shipment</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all">
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Recipient Information Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={14} className="text-amber-400" />
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Recipient Information</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Full Name"
                                placeholder="e.g. Mohamed Bekk"
                                value={recipientName}
                                onChange={(e) => { setRecipientName(e.target.value); setErrors(prev => ({ ...prev, recipientName: "" })); }}
                                error={errors.recipientName}
                            />
                            <InputField
                                label="Phone"
                                type="tel"
                                placeholder="06 XX XX XX XX"
                                value={recipientPhone}
                                onChange={(e) => { setRecipientPhone(e.target.value); setErrors(prev => ({ ...prev, recipientPhone: "" })); }}
                                error={errors.recipientPhone}
                            />
                        </div>
                        <div className="mt-3">
                            <InputField
                                label="Alternative Phone (Optional)"
                                type="tel"
                                placeholder="Alternative contact number"
                                value={alternativePhone}
                                onChange={(e) => setAlternativePhone(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={14} className="text-amber-400" />
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Delivery Address</span>
                        </div>
                        <InputField
                            label="Street Address"
                            placeholder="Building, street, area..."
                            value={recipientAddress}
                            onChange={(e) => { setRecipientAddress(e.target.value); setErrors(prev => ({ ...prev, recipientAddress: "" })); }}
                            error={errors.recipientAddress}
                        />
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <InputField
                                label="City"
                                placeholder="City"
                                value={recipientCity}
                                onChange={(e) => { setRecipientCity(e.target.value); setErrors(prev => ({ ...prev, recipientCity: "" })); }}
                                error={errors.recipientCity}
                            />
                            <InputField
                                label="State"
                                placeholder="State/Province"
                                value={recipientState}
                                onChange={(e) => { setRecipientState(e.target.value); setErrors(prev => ({ ...prev, recipientState: "" })); }}
                                error={errors.recipientState}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <InputField
                                label="Postal Code (Optional)"
                                placeholder="Postal code"
                                value={recipientPostalCode}
                                onChange={(e) => setRecipientPostalCode(e.target.value)}
                            />
                            <InputField
                                label="Delivery Notes (Optional)"
                                placeholder="Additional instructions"
                                value={deliveryNotes}
                                onChange={(e) => setDeliveryNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Package Details Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Weight size={14} className="text-amber-400" />
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Package Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Weight (kg)"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 1.5"
                                value={weightKg}
                                onChange={(e) => { setWeightKg(e.target.value); setErrors(prev => ({ ...prev, weight: "" })); }}
                                error={errors.weight}
                            />
                            <SelectField
                                label="Package Type"
                                value={packageType}
                                onChange={(v) => setPackageType(v as PackageType)}
                                options={PACKAGE_TYPES}
                            />
                        </div>

                        {/* Dimensions */}
                        <div className="mt-3">
                            <label className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold block mb-2">Dimensions (cm) - Optional</label>
                            <div className="grid grid-cols-3 gap-2">
                                <InputField
                                    label="Length"
                                    type="number"
                                    step="0.1"
                                    placeholder="cm"
                                    value={dimensions.length}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, length: e.target.value }))}
                                />
                                <InputField
                                    label="Width"
                                    type="number"
                                    step="0.1"
                                    placeholder="cm"
                                    value={dimensions.width}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, width: e.target.value }))}
                                />
                                <InputField
                                    label="Height"
                                    type="number"
                                    step="0.1"
                                    placeholder="cm"
                                    value={dimensions.height}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, height: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isFragile}
                                    onChange={(e) => setIsFragile(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500"
                                />
                                <span className="text-[12px] text-slate-400">This package is fragile</span>
                            </label>
                        </div>

                        <div className="mt-3">
                            <InputField
                                label="Description (Optional)"
                                placeholder="What's inside? (e.g., Electronics, Documents...)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="mt-3">
                            <InputField
                                label="Declared Value (DZD) - Optional"
                                type="number"
                                placeholder="Insurance value"
                                value={declaredValue}
                                onChange={(e) => setDeclaredValue(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Delivery Options Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Truck size={14} className="text-amber-400" />
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Delivery Options</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {([
                                { val: 'home', label: "Home Delivery", icon: <Package size={13} />, description: "Door-to-door delivery" },
                                { val: 'branch_pickup', label: "Branch Pickup", icon: <Building2 size={13} />, description: "Customer picks up from branch" }
                            ] as const).map(opt => {
                                const active = deliveryType === opt.val;
                                return (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => {
                                            setDeliveryType(opt.val);
                                            if (opt.val === 'branch_pickup' && recipientCity && !branchSearchCity) {
                                                setBranchSearchCity(recipientCity);
                                            }
                                        }}
                                        className="relative flex items-start gap-2.5 p-3 rounded-xl text-left transition-all duration-150"
                                        style={{
                                            background: active ? "rgba(251,191,36,0.07)" : "rgba(255,255,255,0.025)",
                                            border: active ? "1px solid rgba(251,191,36,0.32)" : "1px solid rgba(255,255,255,0.07)",
                                        }}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center transition-all ${active ? "bg-amber-400/20" : "bg-white/4"}`} style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                                            {active && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                        </div>
                                        <div>
                                            <div className="text-[12px] font-semibold" style={{ color: active ? "#fbbf24" : "#94a3b8" }}>{opt.label}</div>
                                            <div className="text-[10px] text-slate-600 mt-0.5">{opt.description}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Delivery Priority */}
                        <div className="mt-3">
                            <SelectField
                                label="Delivery Priority"
                                value={deliveryPriority}
                                onChange={(v) => setDeliveryPriority(v as any)}
                                options={DELIVERY_PRIORITIES}
                            />
                        </div>

                        {/* Branch Pickup: Search and select branch */}
                        {deliveryType === "branch_pickup" && (
                            <div className="mt-3">
                                <label className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold block mb-2">Destination Branch</label>

                                {/* Search input */}
                                <div className="relative">
                                    <div className="relative">
                                        <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={branchSearchCity}
                                            onChange={(e) => {
                                                setBranchSearchCity(e.target.value);
                                                setShowBranchDropdown(true);
                                                setSelectedBranch(null);
                                                setBranchSearchError(null);
                                            }}
                                            onFocus={() => setShowBranchDropdown(true)}
                                            placeholder="Search by city name..."
                                            className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
                                        />
                                        {branchSearchLoading && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected branch display */}
                                    {selectedBranch && !showBranchDropdown && (
                                        <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={14} className="text-amber-400" />
                                                    <span className="text-[13px] font-semibold text-white">{selectedBranch.name}</span>
                                                    <span className="text-[10px] text-slate-500">({selectedBranch.code})</span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-1">
                                                    {selectedBranch.address.street}, {selectedBranch.address.city}
                                                </div>
                                                {selectedBranch.distance && (
                                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                                                        <Navigation size={10} />
                                                        {selectedBranch.distance} from city center
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedBranch(null);
                                                    setBranchSearchCity("");
                                                    setShowBranchDropdown(true);
                                                }}
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Search results dropdown */}
                                    {showBranchDropdown && !selectedBranch && branchSearchCity.length >= 2 && (
                                        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-lg bg-[#0d1117] border border-white/10 shadow-xl">
                                            {branchSearchLoading ? (
                                                <div className="p-4 text-center text-slate-500">
                                                    <div className="inline-block w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                                                    <span className="ml-2 text-xs">Searching branches...</span>
                                                </div>
                                            ) : branchSearchResults.length > 0 ? (
                                                branchSearchResults.map((branch) => (
                                                    <button
                                                        key={branch.id}
                                                        type="button"
                                                        onClick={() => handleSelectBranch(branch)}
                                                        className="w-full text-left p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 size={12} className="text-amber-400" />
                                                                    <span className="text-[13px] font-medium text-white">{branch.name}</span>
                                                                    <span className="text-[10px] text-slate-500">({branch.code})</span>
                                                                </div>
                                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                                    {branch.address.street}, {branch.address.city}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                                    📞 {branch.phone}
                                                                </div>
                                                            </div>
                                                            {branch.distance && (
                                                                <div className="text-[10px] text-amber-400 whitespace-nowrap ml-2">
                                                                    {branch.distance}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))
                                            ) : branchSearchCity.length >= 2 && !branchSearchLoading ? (
                                                <div className="p-4 text-center">
                                                    <p className="text-[12px] text-slate-500">{branchSearchError || "No branches found"}</p>
                                                    <p className="text-[10px] text-slate-600 mt-1">
                                                        Try a different city or contact support
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                {errors.selectedBranch && (
                                    <p className="text-red-400 text-xs mt-1">{errors.selectedBranch}</p>
                                )}

                                <p className="text-[10px] text-slate-600 mt-2">
                                    💡 Tip: The customer can pick up their package from this branch. Make sure the branch is convenient for them.
                                </p>
                            </div>
                        )}

                        {/* Home Delivery: Map Picker */}
                        {deliveryType === "home" && (
                            <div className="mt-3">
                                <label className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold block mb-2">Delivery Location on Map</label>
                                <DeliveryMapPicker
                                    value={deliveryCoords || undefined}
                                    onChange={(coords) => { setDeliveryCoords(coords); setErrors(prev => ({ ...prev, deliveryCoords: "" })); }}
                                    address={`${recipientAddress}, ${recipientCity}, ${recipientState}`}
                                />
                                {errors.deliveryCoords && (
                                    <p className="text-red-400 text-xs mt-1">{errors.deliveryCoords}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pricing Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign size={14} className="text-amber-400" />
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Pricing</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Total Price (DZD)"
                                type="number"
                                placeholder="e.g. 2000"
                                value={totalPrice}
                                onChange={(e) => { setTotalPrice(e.target.value); setErrors(prev => ({ ...prev, totalPrice: "" })); }}
                                error={errors.totalPrice}
                            />
                            <SelectField
                                label="Payment Method (Optional)"
                                value={paymentMethod}
                                onChange={(v) => setPaymentMethod(v)}
                                options={[
                                    { value: "", label: "Default (COD for home, Branch for pickup)" },
                                    { value: "cash", label: "Cash" },
                                    { value: "card", label: "Card" },
                                    { value: "cod", label: "Cash on Delivery" },
                                    { value: "wallet", label: "Wallet" },
                                    { value: "bank_transfer", label: "Bank Transfer" },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Estimated Delivery Time */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={14} className="text-amber-400" />
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Estimated Delivery (Optional)</span>
                        </div>
                        <InputField
                            label="Expected Delivery Date"
                            type="datetime-local"
                            value={estimatedDeliveryTime}
                            onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    <div className="text-[11px] text-slate-500">
                        {Object.keys(errors).length > 0 ? <span className="text-red-400 italic">Please fix errors above</span> : "Fill all required fields"}
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all disabled:opacity-40">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                        >
                            {loading ? (
                                <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Creating...</>
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