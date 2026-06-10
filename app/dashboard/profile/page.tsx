"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import {
    Check,
    Lock,
    Mail,
    User,
    Eye,
    EyeOff,
    Camera,
    AlertCircle,
    Shield,
    KeyRound,
    AtSign,
    Save,
    X,
    ImagePlus,
    Loader2,
} from "lucide-react";
import InputField from "@/components/commons/InputField";
import PasswordStrength from "@/components/commons/PasswordStrength";
import ActionBtn from "@/components/commons/ActionButton";
import { updateProfile, updateProfilePicture } from "@/services/AuthService";
import { getUser, setProfile } from "@/hooks/useAuth";

type Tab = "profile" | "password" | "email";

export default function ProfileSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    // ── Avatar state ───────────────────────────────────────────────────────
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Initialize as null/empty on both server and client to avoid hydration mismatch.
    // getUser() reads localStorage/cookies which are only available client-side.
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    // ── Profile tab state ──────────────────────────────────────────────────
    const [profileData, setProfileData] = useState({ firstName: "", lastName: "" });

    // ── Hydrate client-only user data after mount ──────────────────────────
    useEffect(() => {
        const user = getUser();
        if (!user) return;
        setAvatarPreview(user.imageUrl?.url ?? null);
        setProfileData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
        });
    }, []);

    // Safe client-only reference (for email display etc.)
    const user = typeof window !== "undefined" ? getUser() : null;

    // ── Password tab state ─────────────────────────────────────────────────
    const [passwordData, setPasswordData] = useState({
        password: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    // ── Email tab state ────────────────────────────────────────────────────
    const [email, setEmail] = useState("");

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isEmailPending, setIsEmailPending] = useState(false);

    const clearMessages = () => {
        setErrors({});
        setSuccessMessage(null);
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        clearMessages();
    };

    // ── Avatar handlers ────────────────────────────────────────────────────

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError(null);

        // Client-side guards matching backend (5 MB, jpeg/png/webp)
        if (file.size > 5 * 1024 * 1024) {
            setAvatarError("File too large. Maximum size is 5 MB.");
            return;
        }
        const ext = file.type.split("/")[1]?.toLowerCase();
        if (!["jpeg", "jpg", "png", "webp"].includes(ext ?? "")) {
            setAvatarError("Invalid format. Use JPEG, PNG, or WebP.");
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setAvatarLoading(true);
        setAvatarError(null);
        try {
            const formData = new FormData();
            formData.append("image", avatarFile);
            const res = await updateProfilePicture(formData);
            setProfile(res?.data?.user);
            setAvatarPreview(res.data.imageUrl.url);
            setAvatarFile(null);
            setSuccessMessage("Profile picture updated successfully.");
        } catch (err: any) {
            setAvatarError(err?.message ?? "Failed to upload picture.");
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleAvatarDiscard = () => {
        setAvatarFile(null);
        setAvatarPreview(user?.imageUrl?.url ?? null);
        setAvatarError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Form submit handlers ───────────────────────────────────────────────

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        const newErrors: Record<string, string> = {};
        if (!profileData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!profileData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        setIsLoading(true);
        try {
            const res = await updateProfile(profileData);
            setProfile(res.user);
            setSuccessMessage("Profile updated successfully.");
        } catch (err: any) {
            setErrors({ general: err?.message || "Failed to update profile." });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        const newErrors: Record<string, string> = {};
        if (!passwordData.password) newErrors.password = "Current password is required";
        if (passwordData.newPassword.length < 8) newErrors.newPassword = "Min 8 characters";
        if (passwordData.newPassword !== passwordData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        setIsLoading(true);
        try {
            await updateProfile({
                password: passwordData.password,
                newPassword: passwordData.newPassword,
            });
            setSuccessMessage("Password updated successfully.");
            setPasswordData({ password: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            setErrors({ general: err?.message || "Failed to update password." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        const newErrors: Record<string, string> = {};
        if (!email.includes("@")) newErrors.email = "Invalid email address";
        if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

        setIsLoading(true);
        try {
            const res = await updateProfile({ email });
            if (res?.isEmailChange) {
                setIsEmailPending(true);
                setSuccessMessage("Verification email sent. Check your new inbox.");
            }
            setProfile(res.user);
        } catch (err: any) {
            setErrors({ general: err?.message || "Failed to send verification email." });
        } finally {
            setIsLoading(false);
        }
    };

    // ── Password strength ──────────────────────────────────────────────────

    const getPasswordStrength = useCallback(() => {
        const pwd = passwordData.newPassword;
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return Math.min(score, 4);
    }, [passwordData.newPassword]);

    const passwordStrength = getPasswordStrength();
    const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
    const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

    const tabs: { key: Tab; label: string; icon: React.ElementType; accent: string }[] = [
        { key: "profile", label: "Profile", icon: User, accent: "#fbbf24" },
        { key: "password", label: "Security", icon: Shield, accent: "#22c55e" },
        { key: "email", label: "Email", icon: AtSign, accent: "#22d3ee" },
    ];

    const displayName =
        profileData.firstName || profileData.lastName
            ? `${profileData.firstName} ${profileData.lastName}`.trim()
            : "Your Name";

    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 pt-1">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                        />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">
                            Account Settings
                        </h1>
                    </div>
                    <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                        Manage your personal information and security preferences.
                    </p>
                </div>
            </div>

            {/* ── Main Card ── */}
            <div
                className="rounded-xl flex flex-col flex-1 overflow-hidden"
                style={{
                    background: "#070c15",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow:
                        "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.05)",
                }}
            >
                {/* Tab Navigation */}
                <div
                    className="flex items-center gap-1 p-2 border-b border-white/6"
                    style={{ background: "rgba(255,255,255,0.015)" }}
                >
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => handleTabChange(t.key)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 relative"
                                style={{
                                    color: isActive ? "#fff" : "#64748b",
                                    background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                                }}
                            >
                                <Icon size={15} style={{ color: isActive ? t.accent : "#64748b" }} />
                                {t.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                                        style={{ background: t.accent }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Global feedback */}
                    <AnimatePresence mode="wait">
                        {successMessage && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: -8, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -8, height: 0 }}
                                className="flex items-center gap-2 p-3 rounded-xl mb-5"
                                style={{
                                    background: "rgba(34,197,94,0.1)",
                                    border: "1px solid rgba(34,197,94,0.2)",
                                }}
                            >
                                <Check size={16} className="text-green-400 shrink-0" />
                                <span className="text-green-400 text-sm">{successMessage}</span>
                                <button
                                    onClick={() => setSuccessMessage(null)}
                                    className="ml-auto text-green-400/60 hover:text-green-400"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        )}
                        {errors.general && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: -8, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -8, height: 0 }}
                                className="flex items-center gap-2 p-3 rounded-xl mb-5"
                                style={{
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                }}
                            >
                                <AlertCircle size={16} className="text-red-400 shrink-0" />
                                <span className="text-red-400 text-sm">{errors.general}</span>
                                <button
                                    onClick={() => setErrors({})}
                                    className="ml-auto text-red-400/60 hover:text-red-400"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">

                        {/* ────────────── Profile Tab ────────────── */}
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* Avatar section */}
                                <div
                                    className="rounded-xl p-5"
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                    }}
                                >
                                    <div className="flex items-start gap-5">
                                        {/* Avatar with click-to-upload */}
                                        <div className="relative group shrink-0">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="relative w-20 h-20 rounded-full overflow-hidden transition-all duration-200 group-hover:ring-2 group-hover:ring-amber-400/40"
                                                style={{
                                                    background: "rgba(255,255,255,0.03)",
                                                    border: "2px solid rgba(255,255,255,0.08)",
                                                }}
                                            >
                                                {avatarPreview ? (
                                                    <img
                                                        src={avatarPreview}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={32} className="text-slate-500 absolute inset-0 m-auto" />
                                                )}
                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ background: "rgba(0,0,0,0.55)" }}>
                                                    <Camera size={18} className="text-white" />
                                                </div>
                                            </button>
                                            {/* Badge */}
                                            <div
                                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center pointer-events-none"
                                                style={{ background: "#fbbf24", border: "2px solid #070c15" }}
                                            >
                                                <Camera size={10} className="text-black" />
                                            </div>
                                        </div>

                                        {/* Info + actions */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-semibold text-[15px] truncate">{displayName}</p>
                                            <p className="text-slate-500 text-[12px] mt-0.5">
                                                {avatarFile
                                                    ? `${avatarFile.name} · ${(avatarFile.size / 1024).toFixed(0)} KB`
                                                    : "JPEG, PNG or WebP · Max 5 MB"}
                                            </p>

                                            {avatarError && (
                                                <p className="text-red-400 text-[11px] mt-1.5 flex items-center gap-1">
                                                    <AlertCircle size={11} /> {avatarError}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 mt-3">
                                                {avatarFile ? (
                                                    <>
                                                        {/* Save picture */}
                                                        <button
                                                            type="button"
                                                            onClick={handleAvatarUpload}
                                                            disabled={avatarLoading}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                                                            style={{
                                                                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                                                                boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                                                            }}
                                                        >
                                                            {avatarLoading ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                <Save size={12} />
                                                            )}
                                                            {avatarLoading ? "Uploading…" : "Save picture"}
                                                        </button>
                                                        {/* Discard */}
                                                        <button
                                                            type="button"
                                                            onClick={handleAvatarDiscard}
                                                            disabled={avatarLoading}
                                                            className="px-3 py-1.5 rounded-lg text-[12px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all disabled:opacity-40"
                                                        >
                                                            Discard
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-slate-400 hover:text-white border border-white/7 hover:border-white/15 transition-all"
                                                    >
                                                        <ImagePlus size={12} />
                                                        Change photo
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Name form */}
                                <div
                                    className="rounded-xl p-5"
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/6">
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                                            style={{
                                                background: "rgba(251,191,36,0.1)",
                                                border: "1px solid rgba(251,191,36,0.2)",
                                            }}
                                        >
                                            <User size={13} className="text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-[13px] font-semibold">Personal Information</p>
                                            <p className="text-slate-600 text-[11px]">Update your display name</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField
                                                type="text"
                                                label="First Name"
                                                placeholder="Mohamed"
                                                icon={User}
                                                value={profileData.firstName}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, firstName: e.target.value })
                                                }
                                                error={errors.firstName}
                                            />
                                            <InputField
                                                type="text"
                                                label="Last Name"
                                                placeholder="Bekk"
                                                icon={User}
                                                value={profileData.lastName}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, lastName: e.target.value })
                                                }
                                                error={errors.lastName}
                                            />
                                        </div>

                                        {/* Footer row matching modal pattern */}
                                        <div
                                            className="flex items-center justify-between pt-3 mt-1 border-t border-white/6"
                                        >
                                            <span className="text-[11px] text-slate-600">
                                                Changes are saved immediately
                                            </span>
                                            <ActionBtn
                                                type="submit"
                                                disabled={isLoading}
                                                label={isLoading ? "Saving…" : "Save Changes"}
                                                variant="primary"
                                                size="action"
                                            >
                                                <Save className="w-4 h-4" />
                                            </ActionBtn>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* ────────────── Password Tab ────────────── */}
                        {activeTab === "password" && (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div
                                    className="rounded-xl p-5"
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                    }}
                                >
                                    {/* Section header matching modal header pattern */}
                                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/6">
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                                            style={{
                                                background: "rgba(34,197,94,0.1)",
                                                border: "1px solid rgba(34,197,94,0.2)",
                                            }}
                                        >
                                            <KeyRound size={13} className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-[13px] font-semibold">Change Password</p>
                                            <p className="text-slate-600 text-[11px]">
                                                Keep your account secure with a strong password
                                            </p>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                                        <div className="relative">
                                            <InputField
                                                label="Current Password"
                                                type={showOld ? "text" : "password"}
                                                placeholder="Enter current password"
                                                icon={Lock}
                                                value={passwordData.password}
                                                onChange={(e) =>
                                                    setPasswordData({ ...passwordData, password: e.target.value })
                                                }
                                                error={errors.password}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOld(!showOld)}
                                                className="absolute right-3 top-9 text-slate-600 hover:text-slate-400 transition-colors"
                                            >
                                                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

                                        <div className="relative">
                                            <InputField
                                                label="New Password"
                                                type={showNew ? "text" : "password"}
                                                placeholder="Min 8 characters"
                                                icon={Lock}
                                                value={passwordData.newPassword}
                                                onChange={(e) =>
                                                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                                                }
                                                error={errors.newPassword}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(!showNew)}
                                                className="absolute right-3 top-9 text-slate-600 hover:text-slate-400 transition-colors"
                                            >
                                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

                                        {passwordData.newPassword && (
                                            <div
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                                                style={{ background: "rgba(255,255,255,0.02)" }}
                                            >
                                                <div className="flex-1">
                                                    <PasswordStrength password={passwordData.newPassword} />
                                                </div>
                                                <div
                                                    className="text-[11px] font-semibold px-2 py-1 rounded-md shrink-0"
                                                    style={{
                                                        color: strengthColors[passwordStrength],
                                                        background: `${strengthColors[passwordStrength]}18`,
                                                    }}
                                                >
                                                    {strengthLabels[passwordStrength]}
                                                </div>
                                            </div>
                                        )}

                                        <InputField
                                            label="Confirm New Password"
                                            type="password"
                                            placeholder="Re-enter new password"
                                            icon={Lock}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword: e.target.value,
                                                })
                                            }
                                            error={errors.confirmPassword}
                                        />

                                        <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/6">
                                            <span className="text-[11px] text-slate-600">
                                                You'll stay logged in after changing
                                            </span>
                                            <ActionBtn
                                                type="submit"
                                                disabled={isLoading}
                                                label={isLoading ? "Updating…" : "Update Password"}
                                                variant="primary"
                                                size="action"
                                            >
                                                <KeyRound className="w-4 h-4" />
                                            </ActionBtn>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {/* ────────────── Email Tab ────────────── */}
                        {activeTab === "email" && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div
                                    className="rounded-xl p-5"
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/6">
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                                            style={{
                                                background: "rgba(34,211,238,0.1)",
                                                border: "1px solid rgba(34,211,238,0.2)",
                                            }}
                                        >
                                            <AtSign size={13} className="text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-[13px] font-semibold">Email Address</p>
                                            <p className="text-slate-600 text-[11px]">
                                                Verification required · Current:{" "}
                                                <span className="text-slate-500">{user?.email ?? "—"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {isEmailPending ? (
                                        <div className="text-center space-y-4 py-8 max-w-md mx-auto">
                                            <div
                                                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                                                style={{
                                                    background: "rgba(251,191,36,0.1)",
                                                    border: "1px solid rgba(251,191,36,0.3)",
                                                }}
                                            >
                                                <Mail size={24} className="text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-white text-[14px] font-semibold">
                                                    Verification Email Sent
                                                </p>
                                                <p className="text-slate-400 text-[12px] mt-2 leading-relaxed">
                                                    A link was sent to{" "}
                                                    <span className="text-amber-400 font-medium">{email}</span>.
                                                    Click it to confirm the change.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setIsEmailPending(false);
                                                    setEmail("");
                                                    clearMessages();
                                                }}
                                                className="text-slate-500 text-[12px] hover:text-slate-300 transition-colors inline-flex items-center gap-1"
                                            >
                                                <X size={12} /> Use a different email
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-lg">
                                            <InputField
                                                label="New Email Address"
                                                type="email"
                                                placeholder="new@company.com"
                                                icon={Mail}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                error={errors.email}
                                            />

                                            <div
                                                className="flex items-start gap-2 p-3 rounded-lg"
                                                style={{
                                                    background: "rgba(251,191,36,0.05)",
                                                    border: "1px solid rgba(251,191,36,0.15)",
                                                }}
                                            >
                                                <AlertCircle
                                                    size={13}
                                                    className="text-amber-400 mt-0.5 shrink-0"
                                                />
                                                <p className="text-slate-400 text-[12px] leading-relaxed">
                                                    A verification link will be sent to the new address.
                                                    Your email won&apos;t change until you confirm it.
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/6">
                                                <span className="text-[11px] text-slate-600">
                                                    Verification required before change
                                                </span>
                                                <ActionBtn
                                                    type="submit"
                                                    disabled={isLoading}
                                                    label={isLoading ? "Sending…" : "Send Verification Link"}
                                                    variant="primary"
                                                    size="action"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </ActionBtn>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}