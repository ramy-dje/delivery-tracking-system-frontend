"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { activateUser } from "@/services/AuthService";
import ActionBtn from "@/components/commons/ActionButton";

const DIGITS = 4;

// File location: app/activation/[token]/page.tsx
export default function ActivationPage({
    params
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = use(params);

    const [code, setCode] = useState<string[]>(Array(DIGITS).fill(""));
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shake, setShake] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Mouse tilt effect
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

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newCode = [...code];
        newCode[index] = digit;
        setCode(newCode);
        setError("");
        if (digit && index < DIGITS - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (code[index]) {
                const newCode = [...code];
                newCode[index] = "";
                setCode(newCode);
            } else if (index > 0) {
                inputsRef.current[index - 1]?.focus();
                const newCode = [...code];
                newCode[index - 1] = "";
                setCode(newCode);
            }
        }
        if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < DIGITS - 1) inputsRef.current[index + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
        if (!pasted) return;
        const newCode = Array(DIGITS).fill("");
        pasted.split("").forEach((ch, i) => { newCode[i] = ch; });
        setCode(newCode);
        inputsRef.current[Math.min(pasted.length, DIGITS - 1)]?.focus();
    };

    const triggerError = (message: string) => {
        setError(message);
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const activation_number = code.join("");

        if (activation_number.length < DIGITS) {
            triggerError("Please enter the complete 6-digit code.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const { data } = await activateUser({
                activation_number,
                activation_token: token
            })
            setIsSuccess(true);
            console.log("Activation Data : ", data)
        } catch {
            triggerError("Activation failed. Please try again.");

        } finally {
            setIsLoading(false);
        }
    };

    // ── Success state ──────────────────────────────────────────
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
                        <h2 className="text-3xl font-bold text-white mb-2">Account Activated</h2>
                        <p className="text-slate-400">Your account has been verified successfully.</p>
                    </div>
                    <Link href="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                        >
                            Go to Dashboard
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── Main page ──────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background-main flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-amber-500/30">

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-amber-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Card */}
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: "1000px" }}
                className="w-full max-w-md relative z-10"
            >
                <motion.div
                    animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden"
                >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                            className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4"
                        >
                            <ShieldCheck className="text-amber-400" size={24} />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Verify Your Account</h1>
                        <p className="text-slate-400 text-sm">
                            Enter the 6-digit code sent to your email address.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-3 text-center tracking-widest uppercase">
                                Activation Code
                            </label>
                            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                                {Array(DIGITS).fill(null).map((_, i) => (
                                    <motion.input
                                        key={i}
                                        ref={el => { inputsRef.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={code[i]}
                                        onChange={e => handleChange(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                        className={[
                                            "w-11 h-14 text-center text-xl font-bold rounded-xl border bg-white/5 text-white",
                                            "transition-all duration-150 outline-none caret-transparent",
                                            "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-amber-500/5",
                                            code[i] ? "border-amber-500/60 bg-amber-500/10" : "border-white/10",
                                            error ? "border-red-500/60" : "",
                                        ].join(" ")}
                                    />
                                ))}
                            </div>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 text-center text-xs text-red-400"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </div>

                        {/* Progress dots */}
                        <div className="flex justify-center gap-1.5">
                            {Array(DIGITS).fill(null).map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        backgroundColor: code[i] ? "rgb(245 158 11)" : "rgb(255 255 255 / 0.1)",
                                        scale: code[i] ? 1.2 : 1,
                                    }}
                                    transition={{ duration: 0.15 }}
                                    className="w-1.5 h-1.5 rounded-full"
                                />
                            ))}
                        </div>
                        <ActionBtn
                            label="Activate Account"
                            variant="primary"
                            size="action"
                            disabled={isLoading} />
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center space-y-2">
                        <p className="text-slate-500 text-sm">
                            Didn't receive a code?{" "}
                            <button
                                type="button"
                                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                onClick={() => {/* resend logic */ }}
                            >
                                Resend
                            </button>
                        </p>
                        <p className="text-slate-500 text-sm">
                            Wrong account?{" "}
                            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                                Go back
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Glow under card */}
                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-amber-500/20 blur-xl rounded-[100%]" />
            </motion.div>
        </div>
    );
}