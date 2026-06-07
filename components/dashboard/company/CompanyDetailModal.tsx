"use client";

import { useState } from "react";
import { Building2, Mail, Phone, Hash, Save } from "lucide-react";
import InputField from "@/components/commons/InputField";
import { ICompany } from "@/types/company";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    active:    { label: "Active",    color: "#34d399", bg: "rgba(52,211,153,0.1)"   },
    inactive:  { label: "Inactive",  color: "#64748b", bg: "rgba(100,116,139,0.1)"  },
    suspended: { label: "Suspended", color: "#f87171", bg: "rgba(248,113,113,0.1)"  },
};

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
    company: { label: "Company", color: "#22d3ee", bg: "rgba(34,211,238,0.1)" },
    solo:    { label: "Solo",    color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
};

function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

interface CompanyDetailModalProps {
    isOpen: boolean;
    company: ICompany;
    onClose: () => void;
    onSave: (id: string, data: Partial<ICompany>) => Promise<void>;
    saving?: boolean;
}

export default function CompanyDetailModal({ isOpen, company, onClose, onSave, saving }: CompanyDetailModalProps) {
    const [name, setName]                             = useState(company.name ?? "");
    const [email, setEmail]                           = useState(company.email ?? "");
    const [phone, setPhone]                           = useState(company.phone ?? "");
    const [registrationNumber, setRegistrationNumber] = useState(company.registrationNumber ?? "");
    const [dirty, setDirty]                           = useState(false);

    const statusMeta = STATUS_META[company.status] ?? STATUS_META.active;
    const typeMeta   = TYPE_META[company.businessType] ?? TYPE_META.company;

    const handleSave = async () => {
        await onSave(company._id, {
            name: name.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            registrationNumber: registrationNumber.trim() || undefined,
        } as Partial<ICompany>);
        setDirty(false);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-2xl rounded-2xl overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                        {company.logo ? (
                            <img src={company.logo} alt="logo" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        ) : (
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[14px] font-bold shrink-0"
                                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
                                {company.name?.[0]?.toUpperCase() ?? "C"}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-white truncate">{company.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{ background: statusMeta.bg, color: statusMeta.color }}>
                                    <span className="w-1 h-1 rounded-full" style={{ background: statusMeta.color }} />
                                    {statusMeta.label}
                                </span>
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                    style={{ background: typeMeta.bg, color: typeMeta.color }}>
                                    {typeMeta.label}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all shrink-0">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">

                    {/* Read-only info row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { label: "Created", value: company.createdAt ? fmt(company.createdAt) : "—" },
                            { label: "Updated", value: company.updatedAt ? fmt(company.updatedAt) : "—" },
                            { label: "Reg. No.", value: company.registrationNumber ?? "—" },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl px-4 py-3"
                                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div className="text-[9.5px] uppercase tracking-widest text-slate-700 font-semibold mb-1">{label}</div>
                                <div className="text-[12.5px] text-slate-300 font-medium">{value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        <span className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">Edit Profile</span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                    </div>

                    {/* Editable fields */}
                    <InputField
                        label="Company Name"
                        placeholder="WaselGo Logistics"
                        icon={Building2}
                        value={name}
                        onChange={(e) => { setName(e.target.value); setDirty(true); }}
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Email"
                            type="email"
                            placeholder="contact@company.dz"
                            icon={Mail}
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setDirty(true); }}
                        />
                        <InputField
                            label="Phone"
                            type="tel"
                            placeholder="+213 5XX XXX XXX"
                            icon={Phone}
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setDirty(true); }}
                        />
                    </div>

                    <InputField
                        label="Registration Number"
                        placeholder="RC 12345678"
                        icon={Hash}
                        value={registrationNumber}
                        onChange={(e) => { setRegistrationNumber(e.target.value); setDirty(true); }}
                    />

                    {company.headquarters && (
                        <div className="rounded-xl px-4 py-3"
                            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="text-[9.5px] uppercase tracking-widest text-slate-700 font-semibold mb-1">Headquarters</div>
                            <div className="text-[12.5px] text-slate-400">
                                {[company.headquarters.street, company.headquarters.city, company.headquarters.state]
                                    .filter(Boolean).join(", ")}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    <p className="text-[11.5px] text-slate-700">
                        {dirty ? "You have unsaved changes." : "All changes saved."}
                    </p>
                    <div className="flex items-center gap-2.5">
                        <button type="button" onClick={onClose} disabled={saving}
                            className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/[0.13] transition-all disabled:opacity-40">
                            Close
                        </button>
                        <button type="button" onClick={handleSave} disabled={saving || !dirty}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: dirty ? "0 4px 16px rgba(251,191,36,0.2)" : "none" }}>
                            {saving
                                ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Saving…</>
                                : <><Save size={13} />Save Changes</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
