"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, User } from "lucide-react";
import InputField from "@/components/commons/InputField";
import { IDelivererResponse, IUpdateDelivererPayload } from "@/types/driver";
import EntityPicker from "@/components/commons/EntityPicker";
import { getCompanyVehicles } from "@/services/VehicleService";
import userStore from "@/stores/userStore";
import { IVehicleResponse } from "@/types/vehicle";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

function validate(f: { firstName: string; lastName: string; email: string; phone: string }): FormErrors {
  const e: FormErrors = {};
  if (!f.firstName.trim()) e.firstName = "Required";
  else if (f.firstName.trim().length < 2) e.firstName = "Min 2 characters";
  if (!f.lastName.trim()) e.lastName = "Required";
  else if (f.lastName.trim().length < 2) e.lastName = "Min 2 characters";
  if (!f.email.trim()) e.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Invalid email";
  if (!f.phone.trim()) e.phone = "Required";
  return e;
}

interface EditDriverModalProps {
  isOpen: boolean;
  driver: IDelivererResponse | null;
  onClose: () => void;
  onSubmit: (data: IUpdateDelivererPayload) => Promise<void>;
  loading?: boolean;
}

export default function EditDriverModal({ isOpen, driver, onClose, onSubmit, loading }: EditDriverModalProps) {
  const { user, associated } = userStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentVehicleId, setCurrentVehicleId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (driver && isOpen) {
      setFirstName(driver.userId?.firstName ?? "");
      setLastName(driver.userId?.lastName ?? "");
      setEmail(driver.userId?.email ?? "");
      setPhone(driver.userId?.phone ?? "");
      setCurrentVehicleId(driver.currentVehicleId ?? null);
      setErrors({});
      setTouched(false);
    }
  }, [driver, isOpen]);

  const revalidate = () => {
    if (!touched) return;
    setErrors(validate({ firstName, lastName, email, phone }));
  };

  const handleSubmit = async () => {
    setTouched(true);
    const errs = validate({ firstName, lastName, email, phone });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      currentVehicleId: currentVehicleId ?? undefined,
    });
  };

  const handleClose = () => {
    setErrors({});
    setTouched(false);
    onClose();
  };

  if (!isOpen || !driver) return null;

  const fullName = `${driver.userId?.firstName || ""} ${driver.userId?.lastName || ""}`.trim();

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
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(52,211,153,0.05)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-white">Edit Deliverer</div>
              <div className="text-[11px] text-slate-600">Update profile for {fullName}</div>
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
            <InputField label="Email" type="email" placeholder="driver@company.dz" icon={Mail}
              value={email} onChange={(e) => { setEmail(e.target.value); revalidate(); }} error={errors.email} />
            <InputField label="Phone Number" type="tel" placeholder="+213 5XX XXX XXX" icon={Phone}
              value={phone} onChange={(e) => { setPhone(e.target.value); revalidate(); }} error={errors.phone} />
          </div>

          <EntityPicker<IVehicleResponse>
            label="Assigned Vehicle (Optional)"
            placeholder="Select a vehicle"
            value={currentVehicleId}
            onChange={(id) => setCurrentVehicleId(id)}
            fetchData={async () => {
                const companyId = user?.companyId || associated?.companyId;
                if (!companyId) return [];
                try {
                    const res = await getCompanyVehicles(companyId as string, { limit: 100 });
                    return res?.data || [];
                } catch (error) {
                    console.error("Error fetching vehicles:", error);
                    return [];
                }
            }}
            getId={(v) => v._id}
            getLabel={(v) => `${v.registrationNumber} - ${v.brand || ''} ${v.modelName || ''}`.trim()}
            getSubLabel={(v) => v.type.replace('_', ' ')}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
          <button type="button" onClick={handleClose} disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/[0.13] transition-all disabled:opacity-40">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#34d399,#10b981)", boxShadow: "0 4px 16px rgba(52,211,153,0.2)" }}>
            {loading
              ? <><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Saving…</>
              : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
