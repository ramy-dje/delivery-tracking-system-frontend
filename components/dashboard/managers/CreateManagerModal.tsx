"use client";

import { useState } from "react";
import { ICreateManagerRequest, ManagerAccessLevel } from "@/types/manager";

// ─── Field wrapper ────────────────────────────────────────────────────────

function Field({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {label}
                {required && <span className="text-amber-400 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-[11px] text-red-400 mt-0.5">{error}</p>}
        </div>
    );
}

function TextInput({
    type = "text",
    value,
    onChange,
    placeholder,
    hasError,
    autoComplete,
}: {
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    hasError?: boolean;
    autoComplete?: string;
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white placeholder:text-slate-700 focus:outline-none transition-all"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: hasError
                    ? "1px solid rgba(239,68,68,0.45)"
                    : "1px solid rgba(255,255,255,0.08)",
            }}
            onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(251,191,36,0.35)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.07)";
            }}
            onBlur={(e) => {
                e.currentTarget.style.border = hasError
                    ? "1px solid rgba(239,68,68,0.45)"
                    : "1px solid rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
            }}
        />
    );
}

// ─── Validation ───────────────────────────────────────────────────────────

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
}

function validate(f: {
    fullName: string;
    email: string;
    password: string;
}): FormErrors {
    const e: FormErrors = {};
    if (!f.fullName.trim()) e.fullName = "Full name is required";
    if (!f.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        e.email = "Invalid email address";
    if (!f.password) e.password = "Password is required";
    else if (f.password.length < 8) e.password = "Must be at least 8 characters";
    return e;
}

// ─── Props ────────────────────────────────────────────────────────────────

interface CreateManagerModalProps {
    onClose: () => void;
    onSubmit: (data: ICreateManagerRequest) => Promise<void>;
    loading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function CreateManagerModal({
    onClose,
    onSubmit,
    loading,
}: CreateManagerModalProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    
    // New fields replacing node selection
    const [accessLevel, setAccessLevel] = useState<ManagerAccessLevel>("limited");
    const [allBranches, setAllBranches] = useState(true);

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);

    const revalidate = (patch: Partial<{ fullName: string; email: string; password: string }>) => {
        if (!touched) return;
        setErrors(validate({ fullName, email, password, ...patch }));
    };

    const _currentValidation = validate({ fullName, email, password });
    const isFormValid = Object.keys(_currentValidation).length === 0;

    const handleSubmit = async () => {
        setTouched(true);

        const errs = validate({ fullName, email, password });
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        // Split fullName → firstName + lastName
        const [firstName, ...rest] = fullName.trim().split(" ");
        const lastName = rest.join(" ") || firstName;

        await onSubmit({
            firstName,
            lastName,
            email,
            password,
            phoneNumber: phoneNumber.trim() || undefined,
            accessLevel,
            branchAccess: {
                allBranches,
                specificBranches: [] // We can expand this later to use a BranchPicker
            }
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-lg rounded-2xl overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)",
                }}
            >
                {/* ── Header ────────────────────────────────────────────── */}
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                                    stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                />
                                <path
                                    d="M19 8l2 2-4 4"
                                    stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">Create Manager</div>
                            <div className="text-[11px] text-slate-600">
                                Add a co-manager with specific access
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* ── Body ──────────────────────────────────────────────── */}
                <div className="px-6 py-5 space-y-4 max-h-[68vh] overflow-y-auto">

                    {/* Access level (Step 1) */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Access Level" required>
                            <select
                                value={accessLevel}
                                onChange={(e) => setAccessLevel(e.target.value as ManagerAccessLevel)}
                                className="w-full px-3 py-2.5 rounded-lg text-[13px] text-white focus:outline-none transition-all appearance-none cursor-pointer"
                                style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}
                            >
                                <option value="full">Full Access</option>
                                <option value="limited">Limited Access</option>
                                <option value="view_only">View Only</option>
                            </select>
                        </Field>

                        <Field label="Branch Access">
                            <div className="flex items-center gap-2 h-[41px] px-3 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setAllBranches(!allBranches)}>
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${allBranches ? 'bg-amber-500 border-amber-500' : 'border-slate-500'}`}>
                                    {allBranches && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span className="text-[13px] text-slate-300">All Branches</span>
                            </div>
                        </Field>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-0.5 mt-2">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        <span className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">
                            Manager Details
                        </span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                    </div>

                    {/* Name + Email */}
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Full Name" required error={errors.fullName}>
                            <TextInput
                                value={fullName}
                                onChange={(v) => { setFullName(v); revalidate({ fullName: v }); }}
                                placeholder="Jane Doe"
                                hasError={!!errors.fullName}
                            />
                        </Field>
                        <Field label="Email" required error={errors.email}>
                            <TextInput
                                type="email"
                                value={email}
                                onChange={(v) => { setEmail(v); revalidate({ email: v }); }}
                                placeholder="jane@company.com"
                                autoComplete="off"
                                hasError={!!errors.email}
                            />
                        </Field>
                    </div>

                    {/* Password */}
                    <Field label="Password" required error={errors.password}>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    revalidate({ password: e.target.value });
                                }}
                                placeholder="Min. 8 characters"
                                autoComplete="new-password"
                                className="w-full pl-3 pr-10 py-2.5 rounded-lg text-[13px] text-white placeholder:text-slate-700 focus:outline-none transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: errors.password
                                        ? "1px solid rgba(239,68,68,0.45)"
                                        : "1px solid rgba(255,255,255,0.08)",
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.border = "1px solid rgba(251,191,36,0.35)";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(251,191,36,0.07)";
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.border = errors.password
                                        ? "1px solid rgba(239,68,68,0.45)"
                                        : "1px solid rgba(255,255,255,0.08)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                            >
                                {showPassword ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </Field>

                    {/* Phone */}
                    <Field label="Phone Number">
                        <TextInput
                            type="tel"
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            placeholder="+213 xxx xxx xxx"
                        />
                    </Field>
                </div>

                {/* ── Footer ────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-t"
                    style={{
                        borderColor: "rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.01)",
                    }}
                >
                    <div className="flex items-center gap-2.5 ml-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !isFormValid}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                                boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                                    </svg>
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                    Create Manager
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}