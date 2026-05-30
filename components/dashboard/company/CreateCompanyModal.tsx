"use client";

import { useState } from "react";
import { Building2, Mail, Phone, Hash } from "lucide-react";
import InputField from "@/components/commons/InputField";
import { ICreateCompanyInput, CompanyBusinessType } from "@/types/company";

const BUSINESS_TYPES: { value: CompanyBusinessType; label: string; desc: string; color: string; rgb: string }[] = [
    { value: "company", label: "Company",    desc: "Multi-branch registered business", color: "#22d3ee", rgb: "34,211,238"   },
    { value: "solo",    label: "Solo",       desc: "Individual / freelance operator",  color: "#fbbf24", rgb: "251,191,36"   },
];

interface FormErrors {
    name?: string;
    businessType?: string;
    email?: string;
    phone?: string;
}

function validate(f: { name: string; businessType: string; email: string; phone: string }): FormErrors {
    const e: FormErrors = {};
    if (!f.name.trim()) e.name = "Required";
    else if (f.name.trim().length < 2) e.name = "Min 2 characters";
    if (!f.businessType) e.businessType = "Select a type";
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Invalid email";
    return e;
}

interface CreateCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ICreateCompanyInput) => Promise<void>;
    loading?: boolean;
}

export default function CreateCompanyModal({ isOpen, onClose, onSubmit, loading }: CreateCompanyModalProps) {
    const [name, setName]                           = useState("");
    const [businessType, setBusinessType]           = useState<CompanyBusinessType | "">("");
    const [email, setEmail]                         = useState("");
    const [phone, setPhone]                         = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [errors, setErrors]                       = useState<FormErrors>({});
    const [touched, setTouched]                     = useState(false);

    const revalidate = () => {
        if (!touched) return;
        setErrors(validate({ name, businessType, email, phone }));
    };

    const handleSubmit = async () => {
        setTouched(true);
        const errs = validate({ name, businessType, email, phone });
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        await onSubmit({
            name: name.trim(),
            businessType: businessType as CompanyBusinessType,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            registrationNumber: registrationNumber.trim() || undefined,
        });
    };

    const handleClose = () => {
        setName(""); setBusinessType(""); setEmail(""); setPhone(""); setRegistrationNumber("");
        setErrors({}); setTouched(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div
                className="w-full max-w-xl rounded-2xl overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                            <Building2 className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">Create Company</div>
                            <div className="text-[11px] text-slate-600">Register a new company in the system</div>
                        </div>
                    </div>
                    <button onClick={handleClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Name */}
                    <InputField
                        label="Company Name"
                        placeholder="WaselGo Logistics"
                        icon={Building2}
                        value={name}
                        onChange={(e) => { setName(e.target.value); revalidate(); }}
                        error={errors.name}
                    />

                    {/* Business type selector */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">Business Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {BUSINESS_TYPES.map((t) => {
                                const active = businessType === t.value;
                                return (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => { setBusinessType(t.value); revalidate(); }}
                                        className="relative flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-150"
                                        style={{
                                            background: active ? `rgba(${t.rgb},0.07)` : "rgba(255,255,255,0.025)",
                                            border: active ? `1px solid rgba(${t.rgb},0.32)` : errors.businessType ? "1px solid rgba(239,68,68,0.18)" : "1px solid rgba(255,255,255,0.07)",
                                        }}
                                    >
                                        <div className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center transition-all"
                                            style={{
                                                background: active ? `rgba(${t.rgb},0.15)` : "rgba(255,255,255,0.04)",
                                                border: `1px solid ${active ? `rgba(${t.rgb},0.5)` : "rgba(255,255,255,0.1)"}`,
                                            }}>
                                            {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[12px] font-semibold truncate" style={{ color: active ? t.color : "#94a3b8" }}>{t.label}</div>
                                            <div className="text-[10px] text-slate-700 truncate mt-0.5">{t.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.businessType && <p className="text-[11px] text-red-400">{errors.businessType}</p>}
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Email (optional)"
                            type="email"
                            placeholder="contact@company.dz"
                            icon={Mail}
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); revalidate(); }}
                            error={errors.email}
                        />
                        <InputField
                            label="Phone (optional)"
                            type="tel"
                            placeholder="+213 5XX XXX XXX"
                            icon={Phone}
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); revalidate(); }}
                        />
                    </div>

                    {/* Registration number */}
                    <InputField
                        label="Registration No. (optional)"
                        placeholder="RC 12345678"
                        icon={Hash}
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    <button type="button" onClick={handleClose} disabled={loading}
                        className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/[0.13] transition-all disabled:opacity-40">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}>
                        {loading
                            ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Creating…</>
                            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>Create Company</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
