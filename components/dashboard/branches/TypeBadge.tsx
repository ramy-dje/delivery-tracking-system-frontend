import { NodeType } from "@/types/branch";
import { TYPE_META } from "./TypeMeta";

const TypeBadge = ({ type }: { type: NodeType }) => {
    const m = TYPE_META[type] ?? TYPE_META.Branch;
    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide font-mono"
            style={{ background: m.bg, color: m.text, border: `1px solid ${m.border}` }}
        >
            <span className="text-[9px]">{m.icon}</span>
            {type}
        </span>
    );
}

export default TypeBadge;