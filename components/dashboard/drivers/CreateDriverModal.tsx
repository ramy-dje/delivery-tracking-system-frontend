"use client";

import { JSX, useState } from "react";
import { Mail, Phone, User, Lock, Truck, UserCog } from "lucide-react";
import InputField from "@/components/commons/InputField"; // Adjust path as needed
import { ROLES } from "@/lib/roles"; // Ensure DriverRole is exported
import { DriverRole, IDriverRegister } from "@/types/driver"; // Adjust path to your types

// ─── Driver Role Options ──────────────────────────────────────────────────

const DRIVER_ROLE_OPTIONS: Array<{
    value: DriverRole;
    label: string;
    desc: string;
    icon: JSX.Element;
    color: string;
    rgb: string;
}> = [
        {
            value: ROLES.DRIVER,
            label: "Driver",
            desc: "Standard delivery driver",
            icon: <UserCog className="w-4 h-4" />,
            color: "#fbbf24",
            rgb: "251, 191, 36",
        },
        {
            value: ROLES.TRUCK_DRIVER,
            label: "Truck Driver",
            desc: "Heavy vehicle operator",
            icon: <Truck className="w-4 h-4" />,
            color: "#60a5fa",
            rgb: "96, 165, 250",
        },
    ];

// ─── Validation ───────────────────────────────────────────────────────────

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    role?: string;
    logisticNodeId?: string;
}

function validate(f: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: string;
    logisticNodeId: string;
}): FormErrors {
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
    // Optional: Add phone format validation for Algeria (+213)
    // else if (!/^\+213\d{9}$/.test(f.phoneNumber.replace(/\s/g, ''))) e.phoneNumber = "Invalid format";
    if (!f.role) e.role = "Select a role";
    if (!f.logisticNodeId) e.logisticNodeId = "Node assignment required";
    return e;
}

// ─── Props ────────────────────────────────────────────────────────────────

interface CreateDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: IDriverRegister) => Promise<void>;
    loading?: boolean;
    logisticNodeId: string; // Required for driver registration
}

// ─── Component ────────────────────────────────────────────────────────────

export default function CreateDriverModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
    logisticNodeId,
}: CreateDriverModalProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [role, setRole] = useState<DriverRole | "">("");
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState(false);

    const revalidate = (patch?: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phoneNumber: string;
        role: string;
    }>) => {
        if (!touched) return;
        setErrors(validate({ firstName, lastName, email, password, phoneNumber, role, logisticNodeId }));
    };

    const handleSubmit = async () => {
        setTouched(true);
        const errs = validate({ firstName, lastName, email, password, phoneNumber, role, logisticNodeId });
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        await onSubmit({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            phoneNumber: phoneNumber.trim(),
            role: role as DriverRole,
            logisticNodeId, // Pass the required node ID
        });
    };

    const selectedRole = DRIVER_ROLE_OPTIONS.find((r) => r.value === role) ?? null;

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
                            <Truck className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <div className="text-[14px] font-semibold text-white">Register Driver</div>
                            <div className="text-[11px] text-slate-600">Add a new driver to your logistics node</div>
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
                        <InputField
                            label="First Name"
                            type="text"
                            placeholder="Ahmed"
                            icon={User}
                            value={firstName}
                            onChange={(e) => { setFirstName(e.target.value); revalidate({ firstName: e.target.value }); }}
                            error={errors.firstName}
                        />
                        <InputField
                            label="Last Name"
                            type="text"
                            placeholder="Benali"
                            icon={User}
                            value={lastName}
                            onChange={(e) => { setLastName(e.target.value); revalidate({ lastName: e.target.value }); }}
                            error={errors.lastName}
                        />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Email"
                            type="email"
                            placeholder="driver@solara.dz"
                            icon={Mail}
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); revalidate({ email: e.target.value }); }}
                            error={errors.email}
                        />
                        <InputField
                            label="Phone Number"
                            type="tel"
                            placeholder="+213 5XX XXX XXX"
                            icon={Phone}
                            value={phoneNumber}
                            onChange={(e) => { setPhoneNumber(e.target.value); revalidate({ phoneNumber: e.target.value }); }}
                            error={errors.phoneNumber}
                        />
                    </div>

                    {/* Password */}
                    <InputField
                        label="Password"
                        type={showPw ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        icon={Lock}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); revalidate({ password: e.target.value }); }}
                        error={errors.password}
                    // Note: InputField doesn't support rightSlot by default.
                    // If you need the eye toggle, extend InputField or add a wrapper div.
                    />
                    {/* Password Visibility Toggle (Manual placement since InputField doesn't support rightSlot) */}
                    <div className="flex justify-end -mt-2">
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPw((v) => !v)}
                            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                        >
                            {showPw ? "Hide" : "Show"} password
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-0.5">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                        <span className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold">Driver Type</span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                    </div>

                    {/* Role grid */}
                    <div className="flex flex-col gap-1.5">
                        <div className="grid grid-cols-2 gap-2">
                            {DRIVER_ROLE_OPTIONS.map((r) => {
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
                                        {/* Radio indicator */}
                                        <div
                                            className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center transition-all"
                                            style={{
                                                background: active ? `rgba(${r.rgb},0.15)` : "rgba(255,255,255,0.04)",
                                                border: `1px solid ${active ? `rgba(${r.rgb},0.5)` : "rgba(255,255,255,0.1)"}`,
                                            }}
                                        >
                                            {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span style={{ color: active ? r.color : "#94a3b8" }}>{r.icon}</span>
                                                <div className="text-[12px] font-semibold truncate" style={{ color: active ? r.color : "#94a3b8" }}>{r.label}</div>
                                            </div>
                                            <div className="text-[10px] text-slate-700 truncate mt-0.5">{r.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.role && <p className="text-[11px] text-red-400">{errors.role}</p>}
                    </div>

                    {/* Hidden Node ID (for validation display if needed) */}
                    {logisticNodeId && (
                        <div className="pt-2">
                            <label className="text-[10px] uppercase tracking-widest text-slate-700 font-semibold block mb-1">
                                Assigned Node
                            </label>
                            <p className="text-[12px] text-slate-400 font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                {logisticNodeId}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                    <div className="text-[11px]">
                        {selectedRole
                            ? <span className="text-slate-500">Registering <span className="font-semibold" style={{ color: selectedRole.color }}>{selectedRole.label}</span></span>
                            : <span className="text-slate-800 italic">No driver type selected</span>
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
                                ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Registering…</>
                                : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>Register Driver</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}