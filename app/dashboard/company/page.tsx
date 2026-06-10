"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Building2,
    MapPin,
    Mail,
    Phone,
    Hash,
    Briefcase,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    GitBranch,
    Layers,
    Edit3,
    Save,
    X,
    AlertCircle,
    Loader2,
    Lock,
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { ROLES } from "@/lib/roles";
import RoleGuard from "@/lib/RoleGuard";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { parseApiError } from "@/utils/apiErrorHandler";
import { ICompany, IMyCompanyManager, IMyCompanySummary, IUpdateCompanyInput, ManagerPermission } from "@/types/company";
import { getMyCompany, updateCompany } from "@/services/CompanyService";
import InputField from "@/components/commons/InputField";

// ── Permission label map ──────────────────────────────────────────────────────

const PERMISSION_LABELS: Record<ManagerPermission, string> = {
    can_manage_users: "Manage Users",
    can_manage_branches: "Manage Branches",
    can_view_financials: "View Financials",
    can_manage_settings: "Manage Settings",
    can_manage_subscription: "Manage Subscription",
    can_view_all_branches: "View All Branches",
    can_export_data: "Export Data",
    can_manage_vehicles: "Manage Vehicles",
    can_manage_deliverers: "Manage Deliverers",
    can_manage_supervisors: "Manage Supervisors",
    can_manage_cashiers: "Manage Cashiers",
    can_manage_loaders: "Manage Loaders",
    can_view_analytics: "View Analytics",
    can_manage_reports: "Manage Reports",
};

// ── Access level badge ────────────────────────────────────────────────────────

function AccessLevelBadge({ level }: { level: string }) {
    const map: Record<string, { color: string; bg: string; border: string }> = {
        full: { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)" },
        limited: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
        view_only: { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.25)" },
    };
    const s = map[level] ?? map.view_only;
    return (
        <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize"
            style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
        >
            {level.replace("_", " ")}
        </span>
    );
}

// ── Section card wrapper ──────────────────────────────────────────────────────

function SectionCard({
    icon: Icon,
    iconColor,
    iconBg,
    iconBorder,
    title,
    subtitle,
    children,
    action,
}: {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    iconBorder: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div
            className="rounded-xl p-5"
            style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-white/6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
                    >
                        <Icon size={13} style={{ color: iconColor }} />
                    </div>
                    <div>
                        <p className="text-white text-[13px] font-semibold">{title}</p>
                        {subtitle && <p className="text-slate-600 text-[11px]">{subtitle}</p>}
                    </div>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

// ── Capability row ────────────────────────────────────────────────────────────

function CapRow({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/4 last:border-0">
            <span className="text-slate-400 text-[12px]">{label}</span>
            {enabled ? (
                <CheckCircle2 size={14} className="text-emerald-400" />
            ) : (
                <XCircle size={14} className="text-slate-700" />
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyCompanyPage() {
    const [company, setCompany] = useState<ICompany | null>(null);
    const [manager, setManager] = useState<IMyCompanyManager | null>(null);
    const [summary, setSummary] = useState<IMyCompanySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit state
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState<IUpdateCompanyInput>({});
    const [saveLoading, setSaveLoading] = useState(false);
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchMyCompany = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyCompany();
            setCompany(res.data.company);
            setManager(res.data.manager);
            setSummary(res.data.summary);
        } catch (e: any) {
            const err = parseApiError(e);
            setError(err.message ?? "Failed to load company");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMyCompany(); }, [fetchMyCompany]);

    // ── Edit handlers ─────────────────────────────────────────────────────────

    const startEdit = () => {
        if (!company) return;
        setEditData({
            name: company.name,
            email: company.email ?? "",
            phone: company.phone ?? "",
            registrationNumber: company.registrationNumber ?? "",
        });
        setEditErrors({});
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditData({});
        setEditErrors({});
    };

    const handleSave = async () => {
        if (!company) return;
        const errs: Record<string, string> = {};
        if (!editData.name?.trim()) errs.name = "Company name is required";
        if (editData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email))
            errs.email = "Invalid email address";
        if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }

        setSaveLoading(true);
        try {
            await updateCompany(company._id, editData);
            showToast.success("Company updated successfully");
            setEditing(false);
            fetchMyCompany();
        } catch (e: any) {
            const err = parseApiError(e);
            showToast.error(err.message ?? "Failed to update company");
        } finally {
            setSaveLoading(false);
        }
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────

    if (loading) {
        return (
            <RoleGuard allowedRoles={[ROLES.MANAGER]}>
                <div className="flex flex-col gap-3 h-full">
                    <div className="flex items-center gap-2.5 pt-1 mb-1">
                        <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }} />
                        <h1 className="text-[22px] font-bold text-white tracking-tight">My Company</h1>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={22} className="text-slate-600 animate-spin" />
                    </div>
                </div>
            </RoleGuard>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    const canEdit = manager?.hasFullAccess || manager?.capabilities.canManageUsers;

    return (
        <RoleGuard allowedRoles={[ROLES.MANAGER]}>
            <div className="flex flex-col gap-3 h-full overflow-y-auto">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 pt-1">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="w-1 h-6 rounded-full"
                                style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
                            />
                            <h1 className="text-[22px] font-bold text-white tracking-tight">My Company</h1>
                        </div>
                        <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
                            Your company profile and manager access details.
                        </p>
                    </div>

                    {/* Status badge */}
                    {company && (
                        <div className="shrink-0 flex items-center gap-2 mt-1">
                            <span
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg capitalize`}
                                style={{
                                    color: company.status === "active" ? "#34d399" : company.status === "suspended" ? "#f87171" : "#fbbf24",
                                    background: company.status === "active" ? "rgba(52,211,153,0.1)" : company.status === "suspended" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                                    border: `1px solid ${company.status === "active" ? "rgba(52,211,153,0.25)" : company.status === "suspended" ? "rgba(248,113,113,0.25)" : "rgba(251,191,36,0.25)"}`,
                                }}
                            >
                                {company.status}
                            </span>
                        </div>
                    )}
                </div>

                {error && <ErrorBaner error={error} setError={setError} />}

                {company && manager && summary && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4">

                        {/* ── Company Info ── */}
                        <SectionCard
                            icon={Building2}
                            iconColor="#fbbf24"
                            iconBg="rgba(251,191,36,0.1)"
                            iconBorder="rgba(251,191,36,0.2)"
                            title="Company Information"
                            subtitle="Core profile details"
                            action={
                                canEdit && !editing ? (
                                    <button
                                        onClick={startEdit}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-slate-400 hover:text-white border border-white/7 hover:border-white/15 transition-all"
                                    >
                                        <Edit3 size={12} /> Edit
                                    </button>
                                ) : !canEdit ? (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                        <Lock size={11} /> Read-only
                                    </div>
                                ) : null
                            }
                        >
                            {editing ? (
                                /* ── Edit form ── */
                                <div className="space-y-3">
                                    <InputField
                                        label="Company Name"
                                        type="text"
                                        placeholder="Acme Logistics"
                                        icon={Building2}
                                        value={editData.name ?? ""}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        error={editErrors.name}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField
                                            label="Email"
                                            type="email"
                                            placeholder="contact@company.com"
                                            icon={Mail}
                                            value={editData.email ?? ""}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            error={editErrors.email}
                                        />
                                        <InputField
                                            label="Phone"
                                            type="tel"
                                            placeholder="+213 5XX XXX XXX"
                                            icon={Phone}
                                            value={editData.phone ?? ""}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                            error={editErrors.phone}
                                        />
                                    </div>
                                    <InputField
                                        label="Registration Number"
                                        type="text"
                                        placeholder="RC-123456"
                                        icon={Hash}
                                        value={editData.registrationNumber ?? ""}
                                        onChange={(e) => setEditData({ ...editData, registrationNumber: e.target.value })}
                                        error={editErrors.registrationNumber}
                                    />

                                    {/* Edit footer */}
                                    <div className="flex items-center justify-end gap-2 pt-3 mt-1 border-t border-white/6">
                                        <button
                                            onClick={cancelEdit}
                                            disabled={saveLoading}
                                            className="px-3 py-1.5 rounded-lg text-[12px] text-slate-500 hover:text-slate-300 border border-white/7 hover:border-white/13 transition-all disabled:opacity-40"
                                        >
                                            <span className="flex items-center gap-1"><X size={12} /> Cancel</span>
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saveLoading}
                                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                                            style={{
                                                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                                                boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
                                            }}
                                        >
                                            {saveLoading
                                                ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                                                : <><Save size={12} /> Save Changes</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── Read view ── */
                                <div className="space-y-0">
                                    <InfoRow icon={Building2} label="Name" value={company.name} />
                                    <InfoRow icon={Briefcase} label="Type" value={company.businessType === "solo" ? "Solo Operator" : "Company"} />
                                    <InfoRow icon={Mail} label="Email" value={company.email ?? "—"} />
                                    <InfoRow icon={Phone} label="Phone" value={company.phone ?? "—"} />
                                    <InfoRow icon={Hash} label="Reg. Number" value={company.registrationNumber ?? "—"} />
                                    {company.formattedAddress && (
                                        <InfoRow icon={MapPin} label="Address" value={company.formattedAddress} />
                                    )}
                                </div>
                            )}
                        </SectionCard>

                        {/* ── Manager Access ── */}
                        <SectionCard
                            icon={ShieldCheck}
                            iconColor="#22d3ee"
                            iconBg="rgba(34,211,238,0.1)"
                            iconBorder="rgba(34,211,238,0.2)"
                            title="Your Access"
                            subtitle="Role and permissions granted to you"
                        >
                            <div className="space-y-3">
                                {/* Access level + stats */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-[12px]">Access Level</span>
                                    <AccessLevelBadge level={manager.accessLevel} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div
                                        className="rounded-lg p-3 text-center"
                                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                                    >
                                        <p className="text-white font-bold text-[18px] tabular-nums">{summary.totalPermissions}</p>
                                        <p className="text-slate-600 text-[11px] mt-0.5">Permissions</p>
                                    </div>
                                    <div
                                        className="rounded-lg p-3 text-center"
                                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                                    >
                                        <p className="text-white font-bold text-[18px] tabular-nums">
                                            {manager.branchAccess.allBranches ? "All" : manager.branchAccess.count}
                                        </p>
                                        <p className="text-slate-600 text-[11px] mt-0.5">Branches</p>
                                    </div>
                                </div>

                                {/* Capabilities */}
                                <div className="pt-1">
                                    <p className="text-slate-600 text-[11px] uppercase tracking-wider mb-2">Capabilities</p>
                                    <CapRow label="Manage Users" enabled={manager.capabilities.canManageUsers} />
                                    <CapRow label="Manage Branches" enabled={manager.capabilities.canManageBranches} />
                                    <CapRow label="View Financials" enabled={manager.capabilities.canViewFinancials} />
                                    <CapRow label="View Analytics" enabled={manager.capabilities.canViewAnalytics} />
                                    <CapRow label="Manage Vehicles" enabled={manager.capabilities.canManageVehicles} />
                                    <CapRow label="Manage Deliverers" enabled={manager.capabilities.canManageDeliverers} />
                                    <CapRow label="Export Data" enabled={manager.capabilities.canExportData} />
                                    <CapRow label="Manage Reports" enabled={manager.capabilities.canManageReports} />
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── All Permissions ── */}
                        <SectionCard
                            icon={Layers}
                            iconColor="#a78bfa"
                            iconBg="rgba(167,139,250,0.1)"
                            iconBorder="rgba(167,139,250,0.2)"
                            title="Granted Permissions"
                            subtitle={`${manager.permissions.length} of ${Object.keys(PERMISSION_LABELS).length} permissions active`}
                        >
                            {manager.permissions.length === 0 ? (
                                <div className="flex items-center gap-2 py-3 text-slate-600 text-[12px]">
                                    <AlertCircle size={14} /> No permissions assigned
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(PERMISSION_LABELS) as ManagerPermission[]).map((perm) => {
                                        const granted = manager.permissions.includes(perm);
                                        return (
                                            <span
                                                key={perm}
                                                className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                                                style={{
                                                    color: granted ? "#a78bfa" : "#334155",
                                                    background: granted ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.02)",
                                                    border: `1px solid ${granted ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.05)"}`,
                                                }}
                                            >
                                                {PERMISSION_LABELS[perm]}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </SectionCard>

                        {/* ── Branch Access ── */}
                        <SectionCard
                            icon={GitBranch}
                            iconColor="#34d399"
                            iconBg="rgba(52,211,153,0.1)"
                            iconBorder="rgba(52,211,153,0.2)"
                            title="Branch Access"
                            subtitle={
                                manager.branchAccess.allBranches
                                    ? "You have access to all branches"
                                    : `Access to ${manager.branchAccess.count} specific branch${manager.branchAccess.count !== 1 ? "es" : ""}`
                            }
                        >
                            {manager.branchAccess.allBranches ? (
                                <div
                                    className="flex items-center gap-2.5 p-3 rounded-lg"
                                    style={{
                                        background: "rgba(52,211,153,0.06)",
                                        border: "1px solid rgba(52,211,153,0.15)",
                                    }}
                                >
                                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                    <p className="text-emerald-400 text-[12px] font-medium">
                                        Full access to all branches in the company
                                    </p>
                                </div>
                            ) : manager.branchAccess.count === 0 ? (
                                <div className="flex items-center gap-2 py-2 text-slate-600 text-[12px]">
                                    <AlertCircle size={14} /> No branch access assigned
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <p className="text-slate-500 text-[11px] mb-2">
                                        You have access to {manager.branchAccess.count} branch{manager.branchAccess.count !== 1 ? "es" : ""}. Contact your administrator to modify branch access.
                                    </p>
                                    <div
                                        className="flex items-center gap-2 p-3 rounded-lg"
                                        style={{
                                            background: "rgba(255,255,255,0.02)",
                                            border: "1px solid rgba(255,255,255,0.05)",
                                        }}
                                    >
                                        <GitBranch size={13} className="text-emerald-400 shrink-0" />
                                        <span className="text-slate-300 text-[12px] tabular-nums font-semibold">
                                            {manager.branchAccess.count}
                                        </span>
                                        <span className="text-slate-600 text-[12px]">
                                            specific branch{manager.branchAccess.count !== 1 ? "es" : ""} assigned
                                        </span>
                                    </div>
                                </div>
                            )}
                        </SectionCard>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}

// ── InfoRow helper ────────────────────────────────────────────────────────────

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
            <div className="flex items-center gap-2 text-slate-500 text-[12px]">
                <Icon size={12} />
                {label}
            </div>
            <span className="text-slate-300 text-[12px] font-medium text-right max-w-[55%] truncate">
                {value}
            </span>
        </div>
    );
}