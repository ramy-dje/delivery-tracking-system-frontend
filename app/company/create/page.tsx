"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    Building2, Mail, Phone, MapPin, Upload, Navigation,
    ArrowRight, ArrowLeft, CheckCircle2, Globe, Hash, Check
} from "lucide-react";

import { createCompany } from "@/services/CompanyService";
import { showToast } from "nextjs-toast-notify";
import { ICreateCompanyInput } from "@/types/company";
import userStore from "@/stores/userStore";

/* ─── Step definitions ─── */
const STEPS = [
    { id: 0, label: "Company Identity", sub: "Name & registration", icon: Building2 },
    { id: 1, label: "Contact & Brand", sub: "Email, phone & logo", icon: Mail },
    { id: 2, label: "Headquarters", sub: "Address & coordinates", icon: MapPin },
];

/* ─── Tiny reusable field wrapper ─── */
function Field({
    label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-widest uppercase text-white/30">
                {label}{required && <span className="text-amber-400/70 ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                    {error}
                </p>
            )}
        </div>
    );
}

/* ─── Styled input ─── */
function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={[
                "w-full bg-white/3er border-white/7 rounded-xl",
                "px-3.5 py-3 text-[13px] text-white/85 font-['DM_Sans',sans-serif]",
                "placeholder-white/15 outline-none transition-all duration-200",
                "focus:border-amber-400/30 focus:bg-amber-400/2",
                "focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]",
                props.className ?? "",
            ].join(" ")}
        />
    );
}

/* ─── Section card ─── */
function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={[
            "relative bg-[#0a0c16]/60 backdrop-blur-lg",
            "border border-white/4 rounded-2xl p-7",
            "before:absolute before:top-0 before:left-8 before:right-8 before:h-px",
            "before:bg-linear-to-r before:from-transparent before:via-amber-500/40 before:to-transparent",
            "hover:border-white/7 transition-colors duration-300",
            className,
        ].join(" ")}>
            {children}
        </div>
    );
}

/* ─── Step indicator dot ─── */
function StepDot({ step, current }: { step: typeof STEPS[0]; current: number }) {
    const done = step.id < current;
    const active = step.id === current;
    const Icon = step.icon;

    return (
        <div
            className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                active ? "bg-amber-400/8" : "hover:bg-white/3",
            ].join(" ")}
        >
            {/* Bullet */}
            <div className={[
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 text-[11px] font-bold",
                done ? "bg-amber-400/15 border border-amber-400/40 text-amber-400"
                    : active ? "border border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                        : "border border-white/10 text-white/25",
            ].join(" ")}>
                {done ? <Check size={11} /> : step.id + 1}
            </div>

            {/* Text */}
            <div className="flex flex-col">
                <span className={[
                    "text-[13px] font-medium transition-colors duration-200",
                    active ? "text-white/90" : done ? "text-white/50" : "text-white/40",
                ].join(" ")}>
                    {step.label}
                </span>
                <span className="text-[11px] text-white/20">{step.sub}</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function CreateCompanyPage() {
    const router = useRouter();

    const { user, setProfile } = userStore();

    /* Step state */
    const [step, setStep] = useState(0);
    const [direction, setDir] = useState(1); // 1 = forward, -1 = backward

    /* Form state */
    const [formData, setFormData] = useState({
        name: "", registrationNumber: "",
        email: "", phone: "",
        hqStreet: "", hqCity: "", hqState: "", hqPostalCode: "",
        hqLat: "", hqLng: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [coordsSet, setCoordsSet] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    /* Helpers */
    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setErrors(prev => ({ ...prev, logo: "Please upload an image file" })); return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, logo: "Image must be less than 5MB" })); return;
        }
        setSelectedFile(file);
        setErrors(prev => { const e = { ...prev }; delete e.logo; return e; });
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            showToast.error("Geolocation not supported", { duration: 3000, position: "top-right" }); return;
        }
        showToast.info("Detecting location…", { duration: 2000, position: "top-right" });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                handleChange("hqLat", pos.coords.latitude.toFixed(6));
                handleChange("hqLng", pos.coords.longitude.toFixed(6));
                setCoordsSet(true);
                showToast.success("Location captured!", { duration: 2000, position: "top-right" });
            },
            () => showToast.error("Could not get location.", { duration: 3000, position: "top-right" })
        );
    };

    /* Validation per step */
    const validateStep = (s: number): boolean => {
        const newErrors: Record<string, string> = {};
        if (s === 0) {
            if (!formData.name.trim()) newErrors.name = "Company name is required";
            if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
        }
        if (s === 1) {
            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                newErrors.email = "Invalid email address";
            if (formData.phone && !/^[\d\s\-\+\(\)]{8,}$/.test(formData.phone))
                newErrors.phone = "Invalid phone number";
        }
        if (s === 2) {
            const { hqStreet, hqCity, hqState, hqLat, hqLng } = formData;
            if (hqStreet || hqCity || hqState || hqLat) {
                if (!hqStreet.trim()) newErrors.hqStreet = "Street is required";
                if (!hqCity.trim()) newErrors.hqCity = "City is required";
                if (!hqState.trim()) newErrors.hqState = "State is required";
                const lat = parseFloat(hqLat), lng = parseFloat(hqLng);
                if (isNaN(lat) || lat < -90 || lat > 90) newErrors.hqCoords = "Invalid latitude";
                if (isNaN(lng) || lng < -180 || lng > 180) newErrors.hqCoords = "Invalid longitude";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const next = () => { if (validateStep(step)) { setDir(1); setStep(s => s + 1); } };
    const prev = () => { setDir(-1); setStep(s => s - 1); };

    /* Final submit */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateStep(2)) return;
        setIsLoading(true);
        try {
            let headquarters = undefined;
            const lat = parseFloat(formData.hqLat);
            const lng = parseFloat(formData.hqLng);
            if (formData.hqStreet.trim() && !isNaN(lat) && !isNaN(lng)) {
                headquarters = {
                    street: formData.hqStreet.trim(),
                    city: formData.hqCity.trim(),
                    state: formData.hqState.trim(),
                    postalCode: formData.hqPostalCode.trim() || undefined,
                    location: { type: "Point" as const, coordinates: [lng, lat] as [number, number] },
                };
            }
            const payload: ICreateCompanyInput = {
                name: formData.name.trim(),
                businessType: "company",
                registrationNumber: formData.registrationNumber.trim(),
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                headquarters,
                logo: undefined,
            };
            const data = await createCompany(payload);
            showToast.success(data.message || "Company created! 🎉", {
                duration: 4000, position: "top-right", transition: "bounceIn", sound: true, progress: true,
            });
            setProfile(data.data.user);
            setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 2000);
        } catch (error: any) {
            const msg = error.response?.data?.message || error.response?.data?.error || "Failed to create company";
            if (error.response?.status === 401) { router.push("/login"); return; }
            showToast.error(msg, { duration: 4000, position: "top-right", transition: "bounceIn", sound: true, progress: true });
        } finally {
            setIsLoading(false);
        }
    };

    /* Progress percentage */
    const progress = ((step + 1) / STEPS.length) * 100;

    /* Animation variants */
    const panelVariants = {
        enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
        center: { opacity: 1, x: 0 },
        exit: (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
    };

    return (
        <div className="min-h-screen bg-background-main flex selection:bg-amber-500/30 overflow-hidden relative"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* ── Background ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-4"
                    style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                {/* Glows */}
                <div className="absolute -top-40 -left-40 w-150 h-150 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(251,191,36,0.09) 0%, transparent 70%)" }} />
                <div className="absolute -bottom-40 -right-40 w-125 h-125 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" }} />
                {/* Scanlines */}
                <div className="absolute inset-0 opacity-3"
                    style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)" }} />
            </div>

            {/* ══ SIDEBAR ══ */}
            <aside className="hidden lg:flex flex-col w-64 min-h-screen sticky top-0 z-20
                              bg-[#0a0c14]/70 border-r border-white/4 backdrop-blur-xl
                              px-6 py-10 shrink-0">
                {/* Brand */}
                <div className="flex items-center gap-2.5 mb-12">
                    <div className="relative w-9 h-9 rounded-xl flex items-center justify-center
                                    bg-linear-to-br from-amber-400/20 to-amber-400/5
                                    border border-amber-400/25">
                        <Building2 size={16} className="text-amber-400" />
                        <span className="absolute -inset-1.25 rounded-[14px] border border-amber-400/10
                                         animate-pulse" />
                    </div>
                    <span className="text-[13px] font-bold tracking-widest uppercase text-white/80"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        SolarOS
                    </span>
                </div>

                {/* Steps */}
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/20 mb-3">
                    Registration
                </p>
                <div className="flex flex-col">
                    {STEPS.map((s, i) => (
                        <div key={s.id}>
                            <StepDot step={s} current={step} />
                            {i < STEPS.length - 1 && (
                                <div className="ml-5.5 w-px h-4 my-0.5"
                                    style={{ background: i < step ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.05)" }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer note */}
                <div className="mt-auto p-4 rounded-xl bg-amber-400/4 border border-amber-400/8">
                    <p className="text-xs text-white/25 leading-relaxed">
                        Fields marked <span className="text-amber-400/60">*</span> are required.
                        You can update details from the dashboard anytime.
                    </p>
                </div>
            </aside>

            {/* ══ MAIN ══ */}
            <main className="flex-1 flex flex-col min-h-screen z-10 relative px-6 py-10 md:px-14 md:py-14 lg:px-16">

                {/* Hero header */}
                <div className="mb-10">
                    {/* Live badge */}
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full mb-4
                                    bg-amber-400/8 border border-amber-400/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[11px] font-semibold tracking-[0.07em] uppercase text-amber-400/80">
                            Company Registration
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white mb-2"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        Register Your{" "}
                        <span className="bg-linear-to-r from-amber-300 via-amber-400 to-yellow-600
                                         bg-clip-text text-transparent">
                            Solar Business
                        </span>
                    </h1>
                    <p className="text-sm text-white/30 max-w-md leading-relaxed">
                        Set up your business profile to start managing solar panel orders and track installations.
                    </p>
                </div>

                {/* Progress bar */}
                <div className="h-0.5 bg-white/5 rounded-full mb-10 overflow-hidden max-w-xl">
                    <motion.div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ background: "linear-gradient(90deg, rgba(251,191,36,0.5), #fbbf24)" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent
                                         animate-[shimmer_2s_ease-in-out_infinite]"
                            style={{ animation: "shimmer 2s ease-in-out infinite" }} />
                    </motion.div>
                </div>

                {/* Animated step panels */}
                <div className="max-w-xl w-full">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={panelVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {/* ── STEP 0: Identity ── */}
                            {step === 0 && (
                                <SectionCard>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center
                                                        bg-amber-400/8 border border-amber-400/12">
                                            <Building2 size={15} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-semibold text-white/85"
                                                style={{ fontFamily: "'Syne', sans-serif" }}>
                                                Company Identity
                                            </p>
                                            <p className="text-[11px] text-white/25">Core business information</p>
                                        </div>
                                        <span className="ml-auto text-[42px] font-black text-white/10 leading-none select-none"
                                            style={{ fontFamily: "'Syne', sans-serif" }}>01</span>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <Field label="Company Name" required error={errors.name}>
                                            <StyledInput
                                                value={formData.name}
                                                onChange={e => handleChange("name", e.target.value)}
                                                placeholder="SolarTech Solutions Inc."
                                            />
                                        </Field>
                                        <Field label="Registration Number" required error={errors.registrationNumber}>
                                            <StyledInput
                                                value={formData.registrationNumber}
                                                onChange={e => handleChange("registrationNumber", e.target.value)}
                                                placeholder="RC123456789"
                                            />
                                        </Field>
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <button onClick={next}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                                                       bg-amber-400/8 border border-amber-400/20 text-amber-400
                                                       hover:bg-amber-400/15 transition-all duration-200">
                                            Continue <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </SectionCard>
                            )}

                            {/* ── STEP 1: Contact & Brand ── */}
                            {step === 1 && (
                                <SectionCard>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center
                                                        bg-amber-400/8 border border-amber-400/12">
                                            <Mail size={15} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-semibold text-white/85"
                                                style={{ fontFamily: "'Syne', sans-serif" }}>
                                                Contact & Brand
                                            </p>
                                            <p className="text-[11px] text-white/25">How clients reach you</p>
                                        </div>
                                        <span className="ml-auto text-[42px] font-black text-white/2 leading-none select-none"
                                            style={{ fontFamily: "'Syne', sans-serif" }}>02</span>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Field label="Contact Email" error={errors.email}>
                                                <StyledInput
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => handleChange("email", e.target.value)}
                                                    placeholder="contact@company.com"
                                                />
                                            </Field>
                                            <Field label="Phone Number" error={errors.phone}>
                                                <StyledInput
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={e => handleChange("phone", e.target.value)}
                                                    placeholder="+213 555 123 456"
                                                />
                                            </Field>
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-3 my-1">
                                            <div className="flex-1 h-px bg-white/5" />
                                            <span className="text-[10px] tracking-widest uppercase text-white/15">
                                                Brand Identity
                                            </span>
                                            <div className="flex-1 h-px bg-white/5" />
                                        </div>

                                        {/* Logo upload */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200
                                                       border border-dashed border-white/8 bg-white/1
                                                       hover:border-amber-400/20 hover:bg-amber-400/2">
                                            {previewUrl ? (
                                                <div className="relative">
                                                    <img src={previewUrl} alt="Logo preview"
                                                        className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                                                    <button
                                                        type="button"
                                                        onClick={e => { e.stopPropagation(); setPreviewUrl(null); setSelectedFile(null); }}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500/90 text-white
                                                                   rounded-full flex items-center justify-center hover:bg-red-600 transition">
                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/10
                                                                flex items-center justify-center text-white/15">
                                                    <Upload size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[13px] font-medium text-white/50 mb-1">
                                                    {previewUrl ? "Logo uploaded" : "Upload company logo"}
                                                </p>
                                                <p className="text-[11px] text-white/20">PNG, JPG or SVG — up to 5MB</p>
                                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]
                                                                font-semibold text-amber-400 bg-amber-400/8 border border-amber-400/15">
                                                    <Upload size={10} />
                                                    {previewUrl ? "Change Logo" : "Choose File"}
                                                </div>
                                            </div>
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*"
                                            onChange={handleLogoChange} className="hidden" />
                                        {errors.logo && (
                                            <p className="text-[11px] text-red-400">{errors.logo}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-6">
                                        <button onClick={prev}
                                            className="flex items-center gap-1.5 text-[12px] text-white/25 hover:text-white/50 transition">
                                            <ArrowLeft size={13} /> Back
                                        </button>
                                        <button onClick={next}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                                                       bg-amber-400/8 border border-amber-400/20 text-amber-400
                                                       hover:bg-amber-400/15 transition-all duration-200">
                                            Continue <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </SectionCard>
                            )}

                            {/* ── STEP 2: Headquarters ── */}
                            {step === 2 && (
                                <form onSubmit={handleSubmit}>
                                    <SectionCard>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center
                                                            bg-amber-400/8 border border-amber-400/12">
                                                <MapPin size={15} className="text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-semibold text-white/85"
                                                    style={{ fontFamily: "'Syne', sans-serif" }}>
                                                    Headquarters
                                                </p>
                                                <p className="text-[11px] text-white/25">Primary business address</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleUseCurrentLocation}
                                                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]
                                                           font-medium text-white/40 border border-white/7 bg-white/3
                                                           hover:border-amber-400/25 hover:text-amber-400 transition-all duration-200">
                                                <Navigation size={11} /> My location
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <Field label="Street Address" error={errors.hqStreet}>
                                                <StyledInput
                                                    value={formData.hqStreet}
                                                    onChange={e => handleChange("hqStreet", e.target.value)}
                                                    placeholder="123 Solar Avenue"
                                                />
                                            </Field>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Field label="City" error={errors.hqCity}>
                                                    <StyledInput
                                                        value={formData.hqCity}
                                                        onChange={e => handleChange("hqCity", e.target.value)}
                                                        placeholder="Algiers"
                                                    />
                                                </Field>
                                                <Field label="State / Wilaya" error={errors.hqState}>
                                                    <StyledInput
                                                        value={formData.hqState}
                                                        onChange={e => handleChange("hqState", e.target.value)}
                                                        placeholder="Algiers"
                                                    />
                                                </Field>
                                            </div>
                                            <Field label="Postal Code">
                                                <StyledInput
                                                    value={formData.hqPostalCode}
                                                    onChange={e => handleChange("hqPostalCode", e.target.value)}
                                                    placeholder="16000"
                                                />
                                            </Field>

                                            {/* Divider */}
                                            <div className="flex items-center gap-3 my-1">
                                                <div className="flex-1 h-px bg-white/5" />
                                                <span className="text-[10px] tracking-widest uppercase text-white/15">
                                                    GPS Coordinates
                                                </span>
                                                <div className="flex-1 h-px bg-white/5" />
                                            </div>

                                            {/* Coords badge */}
                                            {coordsSet && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px]
                                                               bg-emerald-500/7 border border-emerald-500/20 text-emerald-400">
                                                    <CheckCircle2 size={13} />
                                                    Location detected — {formData.hqLat}, {formData.hqLng}
                                                </motion.div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Field label="Latitude" error={errors.hqCoords}>
                                                    <StyledInput
                                                        type="number" step="any"
                                                        value={formData.hqLat}
                                                        onChange={e => handleChange("hqLat", e.target.value)}
                                                        placeholder="36.752887"
                                                    />
                                                </Field>
                                                <Field label="Longitude">
                                                    <StyledInput
                                                        type="number" step="any"
                                                        value={formData.hqLng}
                                                        onChange={e => handleChange("hqLng", e.target.value)}
                                                        placeholder="3.042048"
                                                    />
                                                </Field>
                                            </div>
                                        </div>

                                        {/* Submit row */}
                                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/4">
                                            <button type="button" onClick={prev}
                                                className="flex items-center gap-1.5 text-[12px] text-white/25 hover:text-white/50 transition">
                                                <ArrowLeft size={13} /> Back
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="relative flex items-center gap-2.5 px-7 py-3 rounded-[14px] text-[14px]
                                                           font-bold text-[#0a0700] overflow-hidden transition-all duration-200
                                                           hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(251,191,36,0.3)]
                                                           active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
                                                style={{
                                                    background: "linear-gradient(135deg, #fbbf24, #d97706)",
                                                    fontFamily: "'Syne', sans-serif",
                                                }}>
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {isLoading ? (
                                                        <>
                                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                            </svg>
                                                            Creating…
                                                        </>
                                                    ) : (
                                                        <>
                                                            Create Company
                                                            <ArrowRight size={15} />
                                                        </>
                                                    )}
                                                </span>
                                                {/* Gloss overlay */}
                                                <span className="absolute inset-0 bg-linear-to-br from-white/15 to-transparent pointer-events-none" />
                                            </button>
                                        </div>
                                    </SectionCard>
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer link */}
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-1.5 mt-8 text-[12px] text-white/20 hover:text-amber-400/60 transition-colors">
                    <ArrowLeft size={12} /> Already have a company? Go to Dashboard
                </button>
            </main>
        </div>
    );
}