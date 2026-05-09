"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import Link from "next/link";
import { Lock, LogOutIcon, Mail } from "lucide-react";
import InputField from "@/components/commons/InputField";
import PasswordStrength from "@/components/commons/PasswordStrength";
import { loginUser } from "@/services/AuthService";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import { login } from "@/hooks/useAuth";
import ActionBtn from "@/components/commons/ActionButton";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Mouse tilt effect for the card
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2, 2]), { stiffness: 150, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Basic Validation
        const newErrors: Record<string, string> = {};
        if (!formData.email.includes("@")) newErrors.email = "Invalid email address";
        if (formData.password.length < 8) newErrors.password = "Min 8 characters";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            const data = await loginUser(formData);
            showToast.success("Login Success! 🎉");
            console.log("Login response:", data);
            login(data.user, data.accessToken);
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
        } catch (error) {
            showToast.error("Login Failed!", {
                duration: 3000,
                position: "top-right",
                transition: "bounceIn",
                icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
                sound: true,
                progress: true
            });
            console.log("Login error:", error);
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div className="min-h-screen bg-background-main flex items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-amber-500/30">

            {/* ─── Background Elements ─── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Dot Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                {/* Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-amber-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-1255h-125blue-500/10 rounded-full blur-[120px]" />
            </div>

            {/* ─── Card Container ─── */}
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: "1000px" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Glass Card */}
                <div className="relative bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden">

                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-4"
                        >
                            <LogOutIcon />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-slate-400 text-sm">Join the logistics intelligence network.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">


                        <InputField
                            label="Email Address"
                            type="email"
                            placeholder="john@company.com"
                            icon={Mail}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                        />

                        <div>
                            <InputField
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={Lock}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                            />
                            <PasswordStrength password={formData.password} />
                        </div>

                        <ActionBtn type="submit" disabled={isLoading} className="w-full" label="Sign In" variant="primary" size="action" />
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            You Don't Have an account?{" "}
                            <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Reflection/Glow under card */}
                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-amber-500/20 blur-xl rounded-[100%]" />
            </motion.div>
        </div>
    );
}