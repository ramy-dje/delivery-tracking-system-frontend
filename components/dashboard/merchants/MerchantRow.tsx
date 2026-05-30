"use client";

import { IMerchant, IMerchantDetails, PaymentMethod } from "@/types/merchant";
import { Eye, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";

interface MerchantRowProps {
    merchant: IMerchant;
    isLast?: boolean;
    onViewDetail?: () => void;
}

const PAYMENT_METHOD_BADGE: Record<PaymentMethod, { label: string; color: string }> = {
    [PaymentMethod.Cash]: { label: "Cash", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    [PaymentMethod.Bank]: { label: "Bank", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
    [PaymentMethod.CCP]: { label: "CCP", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

export default function MerchantRow({ merchant, isLast = false, onViewDetail }: MerchantRowProps) {
    const paymentBadge = PAYMENT_METHOD_BADGE[merchant.paymentMethod];

    console.log("Rendering MerchantRow for:", merchant);

    return (
        <div
            className="group grid grid-cols-[1fr_300px_160px_160px] gap-4 px-5 py-3 items-center border-b border-white/5 hover:bg-white/2 transition-colors"
            style={!isLast ? {} : { borderBottom: "none" }}
        >
            {/* ─── Column 1: Merchant (Name + ID) ─── */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                        background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,58,237,0.1))",
                        border: "1px solid rgba(167,139,250,0.25)",
                    }}
                >
                    <span className="text-[11px] font-bold text-violet-300">
                        {merchant.firstName.charAt(0)}{merchant.lastName.charAt(0)}
                    </span>
                </div>
                <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">
                        {merchant.firstName} {merchant.lastName}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono truncate">
                        ID: {merchant.id.slice(0, 8)}…
                    </p>
                </div>
            </div>

            {/* ─── Column 2: Contact (Email + Phone) ─── */}
            <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[12px] text-slate-300">
                    <Mail size={10} className="text-slate-600 shrink-0" />
                    <span className="truncate">{merchant.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                    <Phone size={10} className="text-slate-600 shrink-0" />
                    <span>{merchant.phoneNumber}</span>
                </div>
            </div>

            {/* ─── Column 3: Business (Name + Payment) ─── */}
            <div className="flex flex-col gap-1.5">
                <p className="text-[13px] font-medium text-white truncate">
                    {merchant.businessName}
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border w-fit ${paymentBadge?.color}`}>
                    <CreditCard size={8} className="mr-1" />
                    {paymentBadge?.label}
                </span>
            </div>



            {/* ─── Column 4: Actions ─── */}
            <div className="flex justify-end">
                <ActionBtn
                    onClick={onViewDetail}
                    title="View Details"
                    label="View Details"
                    variant="emerald"
                    size="icon"
                    revealOnHover={true}
                >
                    <Eye size={13} />
                </ActionBtn>
            </div>
        </div>
    );
}