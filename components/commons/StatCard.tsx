const StatCard = ({
    label,
    value,
    accent,
}: {
    label: string;
    value: number | string;
    accent: string;
}) => {
    return (
        <div
            className="flex flex-col gap-1 px-5 py-4 rounded-xl border"
            style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
            }}
        >
            <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-slate-600">
                {label}
            </span>
            <span className="text-2xl font-bold tabular-nums" style={{ color: accent }}>
                {value}
            </span>
        </div>
    );
}

export default StatCard;