export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-10">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-slate-300 shadow-lg">
                <svg className="animate-spin text-amber-400" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="31.4"
                        strokeDashoffset="10"
                    />
                </svg>
                <span className="text-[13px] font-medium">Loading…</span>
            </div>
        </div>
    );
}
