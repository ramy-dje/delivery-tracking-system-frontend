"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Check, AlertCircle, ShieldCheck } from "lucide-react";
import InputField from "@/components/commons/InputField";
import ActionBtn from "@/components/commons/ActionButton";
import { passwordRecovery } from "@/services/AuthService";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.includes("@")) return setError("Please enter a valid email address.");

        setIsLoading(true);
        try {
            await passwordRecovery({ email });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err?.message || "Failed to send recovery email.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background-main flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-amber-500/10 rounded-full blur-[120px]" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-6 relative z-10 max-w-sm"
                >
                    <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <Check size={32} className="text-amber-400" />
                        </motion.div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Check Your Inbox</h2>
                        <p className="text-slate-400 leading-relaxed">
                            We sent a password reset link to{" "}
                            <span className="text-amber-400 font-medium">{email}</span>.
                            It expires in 30 minutes.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-slate-500 text-sm">
                            Didn't receive it?{" "}
                            <button
                                onClick={() => { setIsSuccess(false); setEmail(""); }}
                                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                            >
                                Try again
                            </button>
                        </p>
                        <Link href="/login" className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 transition-colors">
                            <ArrowLeft size={14} /> Back to login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-main flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-amber-500/30">

            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-amber-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-blue-500/10 rounded-full blur-[120px]" />
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
                            className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4"
                        >
                            <ShieldCheck size={24} className="text-amber-400" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            No worries. Enter your account email and we'll send you a secure reset link.
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
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            label="Email Address"
                            type="email"
                            placeholder="mohamed@company.com"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <ActionBtn
                            type="submit"
                            disabled={isLoading}
                            label={isLoading ? "Sending…" : "Send Reset Link"}
                            variant="primary"
                            className="w-full"
                            size="action"
                        />
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-slate-500 hover:text-slate-300 text-sm flex items-center justify-center gap-1 transition-colors"
                        >
                            <ArrowLeft size={14} /> Back to login
                        </Link>
                    </div>

                </div>

                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-amber-500/20 blur-xl rounded-[100%]" />
            </motion.div>
        </div>
    );
}