"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import InputField from "@/components/commons/InputField";
import PasswordStrength from "@/components/commons/PasswordStrength";
import ActionBtn from "@/components/commons/ActionButton";
import { resetPassword } from "@/services/AuthService";
import { parseApiError } from "@/utils/apiErrorHandler";
import { showToast } from "nextjs-toast-notify";

export default function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

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
        setErrors({});
        setGeneralError(null);

        const newErrors: Record<string, string> = {};
        if (newPassword.length < 8) newErrors.newPassword = "Min 8 characters";
        if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        setIsLoading(true);
        try {
            console.log("Attempting password reset with token:", token);
            await resetPassword({ newPassword, recovery_token: token });

            setIsSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            const error = parseApiError(err)
            console.log("Password reset error:", error);
            setGeneralError(error.message || "Failed to reset password. The link may have expired.");
            showToast.error(error.message || "Failed to reset password. The link may have expired.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background-main flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-green-500/10 rounded-full blur-[120px]" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-6 relative z-10 max-w-sm"
                >
                    <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <Check size={32} className="text-green-400" />
                        </motion.div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Password Reset</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Your password has been updated. You can now sign in with your new credentials.
                        </p>
                    </div>
                    <p className="text-slate-500 text-sm">Redirecting to login…</p>
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
                            className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4"
                        >
                            <Lock size={24} className="text-amber-400" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Choose a strong password you haven't used before.
                        </p>
                    </div>

                    {/* General error */}
                    {generalError && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"
                        >
                            <AlertCircle size={16} /> {generalError}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="relative">
                            <InputField
                                label="New Password"
                                type={showNew ? "text" : "password"}
                                placeholder="••••••••"
                                icon={Lock}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                error={errors.newPassword}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-9 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <PasswordStrength password={newPassword} />

                        <div className="relative">
                            <InputField
                                label="Confirm Password"
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                icon={Lock}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                error={errors.confirmPassword}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-9 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <ActionBtn
                            type="submit"
                            disabled={isLoading}
                            label={isLoading ? "Resetting…" : "Reset Password"}
                            variant="primary"
                            size="action"
                            className="w-full"
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