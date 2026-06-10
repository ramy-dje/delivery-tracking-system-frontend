"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Mail, AlertCircle } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { confirmChangeEmail } from "@/services/AuthService";

export default function ConfirmEmailPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();

    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Mouse tilt
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2, 2]), { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(""));
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const activation_number = otp.join("");
        if (activation_number.length < 6) return setError("Please enter the full 6-digit code.");
        setError(null);
        setIsLoading(true);

        try {
            await confirmChangeEmail({ email_token: token, activation_number });
            setIsSuccess(true);
            setTimeout(() => router.push("/profile/settings"), 2500);
        } catch (err: any) {
            setError(err?.message || "Invalid or expired code.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background-main flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-6 relative z-10"
                >
                    <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="text-green-400"
                        >
                            <Check size={32} />
                        </motion.div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Email Confirmed</h2>
                        <p className="text-slate-400">Your email address has been updated successfully.</p>
                    </div>
                    <p className="text-slate-500 text-sm">Redirecting you back to settings…</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-main flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-amber-500/30">

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-amber-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: "1000px" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="relative bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden">

                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4"
                        >
                            <Mail className="text-amber-400" size={24} />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Enter the 6-digit code we sent to your new email address.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"
                        >
                            <AlertCircle size={16} /> {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-7">

                        {/* OTP Inputs */}
                        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border bg-white/5 text-white outline-none transition-all duration-200 focus:border-amber-500 focus:bg-amber-500/5 ${digit ? "border-amber-500/50" : "border-white/10"
                                        }`}
                                />
                            ))}
                        </div>

                        <ActionBtn
                            type="submit"
                            disabled={isLoading || otp.join("").length < 6}
                            label={isLoading ? "Verifying…" : "Confirm Email Change"}
                            variant="primary"
                            className="w-11/12 mx-auto"
                            size="action"
                        />
                    </form>

                    {/* Resend */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-sm">
                            Didn't receive it?{" "}
                            <button
                                type="button"
                                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                onClick={() => router.push("/profile/settings?tab=email")}
                            >
                                Resend code
                            </button>
                        </p>
                    </div>
                </div>

                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-amber-500/20 blur-xl rounded-[100%]" />
            </motion.div>
        </div>
    );
}