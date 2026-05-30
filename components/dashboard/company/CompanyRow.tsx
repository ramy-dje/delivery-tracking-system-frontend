import { Eye, Power, Mail } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import { ICompany } from "@/types/company";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    active:    { label: "Active",    color: "#34d399", bg: "rgba(52,211,153,0.08)"   },
    inactive:  { label: "Inactive",  color: "#64748b", bg: "rgba(100,116,139,0.08)"  },
    suspended: { label: "Suspended", color: "#f87171", bg: "rgba(248,113,113,0.08)"  },
};

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
    company: { label: "Company", color: "#22d3ee", bg: "rgba(34,211,238,0.08)" },
    solo:    { label: "Solo",    color: "#fbbf24", bg: "rgba(251,191,36,0.08)"  },
};

function fmt(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const CompanyRow = ({
    company,
    isLast,
    onViewDetail,
    onToggleBlock,
}: {
    company: ICompany;
    isLast: boolean;
    onViewDetail?: () => void;
    onToggleBlock?: () => void;
}) => {
    const statusMeta = STATUS_META[company.status] ?? STATUS_META.active;
    const typeMeta   = TYPE_META[company.businessType] ?? TYPE_META.company;
    const initial    = company.name?.[0]?.toUpperCase() ?? "C";

    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[200px_110px_120px_1fr_auto]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/[0.025]
                ${company.status === "suspended" ? "bg-red-500/[0.02]" : ""}
                ${!isLast ? "border-b border-white/[0.04]" : ""}
            `}
        >
            {/* Logo + name */}
            <div className="flex items-center gap-3 min-w-0">
                {company.logo?.url ? (
                    <img src={company.logo.url} alt="logo"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 transition-transform duration-150 group-hover:scale-[1.06]" />
                ) : (
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
                        style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}
                    >
                        {initial}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-slate-100 truncate leading-tight">{company.name}</div>
                    <div className="text-[11px] text-slate-700 mt-0.5">Since {company.createdAt ? fmt(company.createdAt) : "—"}</div>
                </div>
            </div>

            {/* Type */}
            <div className="hidden md:block">
                <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: typeMeta.bg, color: typeMeta.color }}
                >
                    {typeMeta.label}
                </span>
            </div>

            {/* Status */}
            <div className="hidden md:flex items-center gap-2">
                <span
                    className={`w-2 h-2 rounded-full shrink-0 ${company.status === "active" ? "animate-pulse" : ""}`}
                    style={{
                        background: statusMeta.color,
                        boxShadow: company.status === "active" ? "0 0 8px rgba(52,211,153,0.6)" : "none",
                    }}
                />
                <span className="text-[12px] font-medium" style={{ color: statusMeta.color }}>
                    {statusMeta.label}
                </span>
            </div>

            {/* Contact */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                {company.email ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Mail size={11} className="text-slate-700 shrink-0" />
                        <span className="text-[11.5px] text-slate-500 truncate">{company.email}</span>
                    </div>
                ) : (
                    <span className="text-[11px] text-slate-700 italic">No contact</span>
                )}
                {company.phone && (
                    <span className="text-[11px] text-slate-600 truncate">{company.phone}</span>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn title="View & edit" variant="emerald" onClick={onViewDetail} revealOnHover>
                        <Eye size={13} />
                    </ActionBtn>
                )}
                {onToggleBlock && (
                    <ActionBtn
                        onClick={onToggleBlock}
                        title={company.status === "suspended" ? "Unblock company" : "Suspend company"}
                        variant={company.status === "suspended" ? "emerald" : "red"}
                        revealOnHover
                    >
                        <Power size={13} className={company.status === "suspended" ? "text-emerald-400" : "text-rose-400"} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
};

export default CompanyRow;
