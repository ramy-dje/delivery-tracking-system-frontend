import { IBranchResponse } from '@/types/branch';
import { TYPE_META } from './TypeMeta';
import TypeBadge from './TypeBadge';
import { Edit, LocateIcon, Trash, Undo2 } from 'lucide-react';
import ActionBtn from '@/components/commons/ActionButton';
import Link from 'next/link';

const BranchRow = ({
    branch,
    isLast,
    isDeleted,
    onEdit,
    onDelete,
    onRestore,
}: {
    branch: IBranchResponse;
    isLast: boolean;
    isDeleted: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onRestore?: () => void;
}) => {
    const m = TYPE_META[branch.type] ?? TYPE_META.Branch;
    return (
        <div
            className={`
                group flex flex-col md:grid md:grid-cols-[1fr_120px_270px_160px_auto]
                gap-3 md:gap-4 px-5 py-3.5 transition-all duration-150
                hover:bg-white/[0.018]
                ${!isLast ? "border-b border-white/4" : ""}
                ${isDeleted ? "opacity-55 hover:opacity-75" : ""}
            `}
        >
            {/* Name */}
            <Link href={`/dashboard/branches/${branch.id}`} className="flex items-center gap-3 min-w-0">
                <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[13px] font-bold transition-all duration-200 group-hover:scale-105"
                    style={{
                        background: m.bg,
                        color: m.text,
                        border: `1px solid ${m.border}`,
                        boxShadow: `0 0 0 0 ${m.glow}`,
                    }}
                >
                    {m.icon}
                </div>
                <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-slate-100 truncate leading-tight">
                        {branch.name}
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono mt-0.5 truncate">
                        {branch.code}
                    </div>
                </div>
            </Link>

            {/* Type */}
            <div className="hidden md:flex items-center justify-center">
                <TypeBadge type={branch.type} />
            </div>

            {/* Location */}
            <div className="hidden md:flex items-center gap-1.5">
                <LocateIcon size={15} />
                <span className="text-[12px] text-slate-500 truncate">
                    {branch.wilaya?.nameFr}
                    {branch.commune?.nameFr ? `, ${branch.commune.nameFr}` : ""}
                </span>
            </div>

            {/* Created date */}
            <div className="hidden md:flex items-center pl-3 text-[11px] text-slate-600 tabular-nums ">
                {new Date(branch.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:justify-end">
                {!isDeleted ? (
                    <>
                        <ActionBtn revealOnHover onClick={onEdit} title="Edit" variant="amber">
                            <Edit size={13} />
                        </ActionBtn>
                        <ActionBtn revealOnHover onClick={onDelete} title="Delete" variant="red">
                            <Trash size={13} />
                        </ActionBtn>
                    </>
                ) : (
                    <ActionBtn
                        variant="emerald"
                        size="action"
                        label="Restore"
                        onClick={onRestore}
                        revealOnHover
                    >
                        <Undo2 size={13} />
                    </ActionBtn>
                )}
            </div>
        </div >
    );
}


export default BranchRow;