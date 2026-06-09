import { ITariffEntry } from "@/types/deliveryFee";
import { Eye, Pencil, Trash2, Route } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";

export function formatFee(amount: number) {
    return new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD", minimumFractionDigits: 0 }).format(amount);
}

const DeliveryFeeRow = ({
    fee,
    isLast,
    onViewDetail,
    onEdit,
    onDelete,
}: {
    fee: ITariffEntry;
    isLast: boolean;
    onViewDetail?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}) => {
    return (
        <div
            className={`
                group grid grid-cols-[1fr_auto] md:grid-cols-[1fr_200px_200px_140px]
                gap-4 px-5 py-4 items-center transition-all duration-150
                hover:bg-white/2.5
                ${!isLast ? "border-b border-white/4" : ""}
            `}
        >
            {/* Route: origin → destination */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-[1.06]"
                    style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)" }}
                >
                    <Route size={16} color="#fbbf24" />
                </div>
                <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-slate-100 truncate leading-tight">
                        {fee.from.name}
                        <span className="mx-1.5 text-slate-700">↔</span>
                        {fee.to.name}
                    </div>
                </div>
            </div>

            {/* Stopdesk Price */}
            <div className="hidden md:flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-[13.5px] font-semibold text-sky-400">{formatFee(fee.stopdesk)}</span>
                </div>
            </div>

            {/* Domicile Price */}
            <div className="hidden md:flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-[13.5px] font-semibold text-emerald-400">{formatFee(fee.domicile)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-150">
                {onViewDetail && (
                    <ActionBtn title="View details" variant="emerald" onClick={onViewDetail} revealOnHover>
                        <Eye size={13} />
                    </ActionBtn>
                )}
                {onEdit && (
                    <ActionBtn title="Edit fee" variant="sky" onClick={onEdit} revealOnHover>
                        <Pencil size={13} />
                    </ActionBtn>
                )}
                {onDelete && (
                    <ActionBtn
                        onClick={onDelete}
                        title="Delete fee"
                        variant="red"
                        revealOnHover
                    >
                        <Trash2 size={13} />
                    </ActionBtn>
                )}
            </div>
        </div>
    );
};

export default DeliveryFeeRow;