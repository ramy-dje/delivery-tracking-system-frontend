import { getRoleLabel, getRoleMeta } from "../dashboard/staffs/SatffRow";

const RoleBadge = ({ role }: { role: string }) => {
    const m = getRoleMeta(role);
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold tracking-wide whitespace-nowrap"
            style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
        >
            {getRoleLabel(role)}
        </span>
    );
}

export default RoleBadge;