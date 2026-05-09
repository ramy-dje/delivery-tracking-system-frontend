"use client";

import { useEffect, useState } from "react";
import { getMerchant } from "@/services/MerchantService";
import { IMerchantDetails, PaymentMethod } from "@/types/merchant";
import { Store, Mail, Phone, MapPin, CreditCard, Building2, User, X } from "lucide-react";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import ErrorBaner from "@/components/commons/ErrorBaner";
import ActionBtn from "@/components/commons/ActionButton";
import { GlassHero } from "@/components/commons/GlassHero";
import { GlassStatCard } from "@/components/commons/GlassStatCard";
import GlassEffectCard from "@/components/commons/GlassEffectCard";

interface MerchantDetailModalProps {
    merchantId: string;
    isOpen: boolean;
    onClose: () => void;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PaymentMethod.Cash]: "Cash",
    [PaymentMethod.Bank]: "Bank",
    [PaymentMethod.CCP]: "CCP",
};

export default function MerchantDetailModal({ merchantId, isOpen, onClose }: MerchantDetailModalProps) {
    const [merchant, setMerchant] = useState<IMerchantDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !merchantId) return;
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getMerchant(merchantId);
                if (mounted) setMerchant(data);
            } catch (e: any) {
                if (mounted) setError(e?.message ?? "Failed to load merchant details");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [isOpen, merchantId]);

    const metaItems = merchant
        ? [
            { icon: <Mail size={10} />, value: merchant.email, muted: false },
            { icon: <Phone size={10} />, value: merchant.phoneNumber, muted: false },
            { icon: <MapPin size={10} />, value: merchant.wilaya?.nameFr || "—", muted: false },
        ]
        : [];

    return (
        <GlassEffectCard
            isOpen={isOpen}
            onClose={onClose}
            title="Merchant Profile"
            subtitle={merchantId?.slice(0, 14).toUpperCase()}
            headerIcon={<Store size={17} style={{ color: "#a78bfa" }} />}
            showCloseButton={true}
            accentColor="violet"
            withNoise={true}
            withSweep={true}
            withAvatarGlow={false}
            footer={
                <ActionBtn
                    onClick={onClose}
                    title="Close"
                    label="Close"
                    variant="slate"
                    size="action"
                    className="w-fit text-sm! font-medium! capitalize px-4 py-2 text-text-secondary"
                />
            }
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {error && <ErrorBaner error={error} setError={setError} />}

                    {merchant && (
                        <div className="space-y-5">
                            {/* ─── Identity Hero ─── */}
                            <GlassHero
                                title={`${merchant.firstName} ${merchant.lastName}`}
                                subtitle={merchant.businessName}
                                statusLabel="Active"
                                isActive={true}
                                metaItems={metaItems}
                                accentColor="violet"
                            />

                            {/* ─── Business Details ─── */}
                            <div>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div
                                        className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: "rgba(167,139,250,0.1)",
                                            border: "1px solid rgba(167,139,250,0.15)",
                                        }}
                                    >
                                        <Building2 size={10} style={{ color: "#a78bfa" }} />
                                    </div>
                                    <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                        Business Details
                                    </span>
                                    <div className="gef-divider" />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <GlassStatCard
                                        icon={<Store size={11} style={{ color: "#a78bfa" }} />}
                                        label="Business Name"
                                        value={merchant.businessName}
                                        accentColor="violet"
                                    />
                                    <GlassStatCard
                                        icon={<MapPin size={11} style={{ color: "#a78bfa" }} />}
                                        label="Store Location"
                                        value={merchant.storeLocation?.latitude || "—"}
                                        secondaryValue={`Wilaya: ${merchant.wilaya?.nameFr}`}
                                        accentColor="violet"
                                    />
                                </div>
                            </div>

                            {/* ─── Payment Information ─── */}
                            <div>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div
                                        className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: "rgba(167,139,250,0.1)",
                                            border: "1px solid rgba(167,139,250,0.15)",
                                        }}
                                    >
                                        <CreditCard size={10} style={{ color: "#a78bfa" }} />
                                    </div>
                                    <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                        Payment Method
                                    </span>
                                    <div className="gef-divider" />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <GlassStatCard
                                        icon={<CreditCard size={11} style={{ color: "#a78bfa" }} />}
                                        label="Method"
                                        value={PAYMENT_METHOD_LABELS[merchant.paymentMethod]}
                                        badge={{ label: "Primary", color: "amber" }}
                                        accentColor="violet"
                                    />
                                    <GlassStatCard
                                        icon={<Building2 size={11} style={{ color: "#a78bfa" }} />}
                                        label={merchant.paymentMethod == PaymentMethod.Bank ? "RIB" : merchant.paymentMethod == PaymentMethod.CCP ? "CCP" : "Account"}
                                        value={merchant.paymentMethod == PaymentMethod.Bank ? merchant.RIB : merchant.paymentMethod == PaymentMethod.CCP ? merchant.CCP : "N/A"}
                                        emptyState={{ label: "Not provided" }}
                                        accentColor="violet"
                                    />
                                </div>
                            </div>

                            {/* ─── Company & Logistics ─── */}
                            <div>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div
                                        className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
                                        style={{
                                            background: "rgba(167,139,250,0.1)",
                                            border: "1px solid rgba(167,139,250,0.15)",
                                        }}
                                    >
                                        <User size={10} style={{ color: "#a78bfa" }} />
                                    </div>
                                    <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
                                        Company & Logistics
                                    </span>
                                    <div className="gef-divider" />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <GlassStatCard
                                        icon={<Building2 size={11} style={{ color: "#a78bfa" }} />}
                                        label="Company"
                                        value={merchant.company.name || "—"}
                                        secondaryValue={merchant.company?.registrationNumber}
                                        accentColor="violet"
                                    />
                                    <GlassStatCard
                                        icon={<MapPin size={11} style={{ color: "#a78bfa" }} />}
                                        label="Logistics Node"
                                        value={merchant.logisticsNodeName}
                                        secondaryValue={`ID: ${merchant.logisticsNodeId?.slice(0, 8)}…`}
                                        accentColor="violet"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </GlassEffectCard>
    );
}