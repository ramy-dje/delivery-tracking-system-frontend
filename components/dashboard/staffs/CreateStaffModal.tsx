"use client";

import { useMemo, useState } from "react";
import { ROLES, Role } from "@/lib/roles";
import { IStaffRegister } from "@/types/staff";

// ─── Role options ─────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: Role; label: string; desc: string; color: string; rgb: string }[] = [
    { value: ROLES.DRIVER, label: "Driver", desc: "Local delivery & parcel pickup", color: "#22d3ee", rgb: "34,211,238" },
    { value: ROLES.TRUCK_DRIVER, label: "Truck Driver", desc: "Long-haul and inter-hub transport", color: "#38bdf8", rgb: "56,189,248" },
    { value: ROLES.LEAD_DRIVER, label: "Lead Driver", desc: "Coordinates driver teams and routes", color: "#a78bfa", rgb: "167,139,250" },
    { value: ROLES.SORTER, label: "Sorter", desc: "Parcel sorting and processing", color: "#fbbf24", rgb: "251,191,36" },
    { value: ROLES.RECEPTIONIST, label: "Receptionist", desc: "Customer intake and drop-off handling", color: "#34d399", rgb: "52,211,153" },
    { value: ROLES.INVENTORY_AUDITOR, label: "Inventory Auditor", desc: "Stock tracking and audit compliance", color: "#fb7185", rgb: "251,113,133" },
    { value: ROLES.SHIFT_SUPERVISOR, label: "Shift Supervisor", desc: "Oversees node operations per shift", color: "#f59e0b", rgb: "245,158,11" },
    { value: ROLES.SECURITY_OFFICER, label: "Security Officer", desc: "Facility and access security", color: "#60a5fa", rgb: "96,165,250" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function Field({ label, required, error, children }: {
    label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {label}{required && <span className="text-amber-400 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-[11px] text-red-400 mt-0.5">{error}</p>}
        </div>
    );
}

function TextInput({ type = "text", value, onChange, placeholder, hasError, autoComplete, rightSlot }: {
    type?: string; value: string; onChange: (v: string) => void; placeholder?: string;
    hasError?: boolean; autoComplete?: string; rightSlot?: React.ReactNode;
}) {
    return (
        <div className="relative">
            <input
                type={type} value={value} autoComplete={autoComplete} placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white placeholder:text-slate-700 focus:outline-none transition-all"
                style={{
                    background: "rgba(255,255,255,0.03)",
                    border: hasError ? "1px solid rgba(239,68,68,0.45)" : "1px solid rgba(255,255,255,0.08)",
                    paddingRight: rightSlot ? "2.5rem" : undefined,
                }}
                onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(251,191,36,0.35)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.07)"; }}
                onBlur={(e) => { e.currentTarget.style.border = hasError ? "1px solid rgba(239,68,68,0.45)" : "1px solid rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            {rightSlot && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
            )}
        </div>
    );
}

// ─── Validation ───────────────────────────────────────────────────────────

interface FormErrors { firstName?: string; lastName?: string; email?: string; password?: string; phoneNumber?: string; role?: string; }

function validate(f: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string; role: string }): FormErrors {
    const e: FormErrors = {};
    if (!f.firstName.trim()) e.firstName = "Required";
    else if (f.firstName.trim().length < 2) e.firstName = "Min 2 characters";
    if (!f.lastName.trim()) e.lastName = "Required";
    else if (f.lastName.trim().length < 2) e.lastName = "Min 2 characters";
    if (!f.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Invalid email";
    if (!f.password) e.password = "Required";
    else if (f.password.length < 8) e.password = "Min 8 characters";
    if (!f.phoneNumber.trim()) e.phoneNumber = "Required";
    if (!f.role) e.role = "Select a role";
    return e;
}

// ─── Props ────────────────────────────────────────────────────────────────

interface CreateStaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: IStaffRegister) => Promise<void>;
    loading?: boolean;
    defaultNodeId?: string | null;   // kept for compat, used internally but not shown
    lockNodeSelection?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function CreateStaffModal({ isOpen, onClose, onSubmit, loading, defaultNodeId }: CreateStaffModalProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [role, setRole] = useState<Role | "">("");
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);

    const revalidate = (patch?: Partial<{ firstName: string; lastName: string; email: string; password: string; phoneNumber: string; role: string }>) => {
        if (!touched) return;
        setErrors(validate({ firstName, lastName, email, password, role, phoneNumber }));
    };

    const handleSubmit = async () => {
        setTouched(true);
        const errs = validate({ firstName, lastName, email, password, phoneNumber, role });
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        await onSubmit({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            phoneNumber: phoneNumber.trim(),
            role: role as Role,
            logisticNodeId: defaultNodeId as string,
        });
    };

    const selectedRole = ROLE_OPTIONS.find((r) => r.value === role) ?? null;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">Create Staff Member</div>
                            <div className="text-[11px] text-slate-600">Add a new staff member to your node</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="First Name" required error={errors.firstName}>
                            <TextInput value={firstName} onChange={(v) => { setFirstName(v); revalidate({ firstName: v }); }} placeholder="Jane" hasError={!!errors.firstName} />
                        </Field>
                        <Field label="Last Name" required error={errors.lastName}>
                            <TextInput value={lastName} onChange={(v) => { setLastName(v); revalidate({ lastName: v }); }} placeholder="Doe" hasError={!!errors.lastName} />
                        </Field>
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Email" required error={errors.email}>
                            <TextInput type="email" value={email} onChange={(v) => { setEmail(v); revalidate({ email: v }); }} placeholder="jane@company.com" autoComplete="off" hasError={!!errors.email} />
                        </Field>
                        <Field label="Phone Number" required error={errors.phoneNumber}>
                            <TextInput type="tel" value={phoneNumber} onChange={(v) => { setPhoneNumber(v); revalidate({ phoneNumber: v }); }} placeholder="+213 xxx xxx xxx" hasError={!!errors.phoneNumber} />
                        </Field>
                    </div>

                    {/* Password */}
                    <Field label="Password" required error={errors.password}>
                        <TextInput
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(v) => { setPassword(v); revalidate({ password: v }); }}
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            hasError={!!errors.password}
                            rightSlot={
                                <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)} className="text-slate-600 hover:text-slate-400 transition-colors">
                                    {showPw
                                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>
                                    }
                                </button>
                            }
                        />
                    </Field>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-0.5">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        <span className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">Role</span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                    </div>

                    {/* Role grid */}
                    <div className="flex flex-col gap-1.5">
                        <div className="grid grid-cols-2 gap-2">
                            {ROLE_OPTIONS.map((r) => {
                                const active = role === r.value;
                                return (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => { setRole(r.value); revalidate({ role: r.value }); }}
                                        className="relative flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-150"
                                        style={{
                                            background: active ? `rgba(${r.rgb},0.07)` : "rgba(255,255,255,0.025)",
                                            border: active ? `1px solid rgba(${r.rgb},0.32)` : errors.role ? "1px solid rgba(239,68,68,0.18)" : "1px solid rgba(255,255,255,0.07)",
                                            boxShadow: active ? `0 0 20px rgba(${r.rgb},0.07)` : "none",
                                        }}
                                    >
                                        {/* Radio */}
                                        <div
                                            className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center transition-all"
                                            style={{
                                                background: active ? `rgba(${r.rgb},0.15)` : "rgba(255,255,255,0.04)",
                                                border: `1px solid ${active ? `rgba(${r.rgb},0.5)` : "rgba(255,255,255,0.1)"}`,
                                            }}
                                        >
                                            {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[12px] font-semibold truncate" style={{ color: active ? r.color : "#94a3b8" }}>{r.label}</div>
                                            <div className="text-[10px] text-slate-700 truncate mt-0.5">{r.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.role && <p className="text-[11px] text-red-400">{errors.role}</p>}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    <div className="text-[11px]">
                        {selectedRole
                            ? <span className="text-slate-500">Creating <span className="font-semibold" style={{ color: selectedRole.color }}>{selectedRole.label}</span></span>
                            : <span className="text-slate-800 italic">No role selected</span>
                        }
                    </div>
                    <div className="flex items-center gap-2.5">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all disabled:opacity-40">Cancel</button>
                        <button
                            type="button" onClick={handleSubmit} disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}
                        >
                            {loading
                                ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Creating…</>
                                : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>Create Staff</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}