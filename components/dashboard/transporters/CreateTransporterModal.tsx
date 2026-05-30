"use client";

import { useState } from "react";
import { Mail, Phone, User, Lock, Truck } from "lucide-react";
import InputField from "@/components/commons/InputField";
import { ICreateTransporter } from "@/types/transporter";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
}

function validate(f: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string }): FormErrors {
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
  return e;
}

interface CreateTransporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateTransporter) => Promise<void>;
  loading?: boolean;
}

export default function CreateTransporterModal({ isOpen, onClose, onSubmit, loading }: CreateTransporterModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);

  const revalidate = () => {
    if (!touched) return;
    setErrors(validate({ firstName, lastName, email, password, phoneNumber }));
  };

  const handleSubmit = async () => {
    setTouched(true);
    const errs = validate({ firstName, lastName, email, password, phoneNumber });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, phoneNumber: phoneNumber.trim() });
  };

  const handleClose = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setPhoneNumber("");
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <Truck className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-white">Register Transporter</div>
              <div className="text-[11px] text-slate-600">Add a new transporter for inter-branch routes</div>
            </div>
          </div>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="First Name" type="text" placeholder="Ahmed" icon={User}
              value={firstName} onChange={(e) => { setFirstName(e.target.value); revalidate(); }} error={errors.firstName} />
            <InputField label="Last Name" type="text" placeholder="Benali" icon={User}
              value={lastName} onChange={(e) => { setLastName(e.target.value); revalidate(); }} error={errors.lastName} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="Email" type="email" placeholder="transporter@company.dz" icon={Mail}
              value={email} onChange={(e) => { setEmail(e.target.value); revalidate(); }} error={errors.email} />
            <InputField label="Phone Number" type="tel" placeholder="+213 5XX XXX XXX" icon={Phone}
              value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); revalidate(); }} error={errors.phoneNumber} />
          </div>

          <InputField label="Password" type={showPw ? "text" : "password"} placeholder="Min. 8 characters" icon={Lock}
            value={password} onChange={(e) => { setPassword(e.target.value); revalidate(); }} error={errors.password} />
          <div className="flex justify-end -mt-2">
            <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
              {showPw ? "Hide" : "Show"} password
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
          <button type="button" onClick={handleClose} disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/[0.13] transition-all disabled:opacity-40">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 16px rgba(251,191,36,0.2)" }}>
            {loading
              ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Registering…</>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>Register Transporter</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
