"use client";

import { useEffect, useRef, useState } from "react";

interface EntityPickerProps<T> {
    value: string | null;
    onChange: (id: string | null, item?: T | null) => void;

    fetchData: () => Promise<T[]>;

    getId: (item: T) => string;
    getLabel: (item: T) => string;
    getSubLabel?: (item: T) => string;

    renderIcon?: (item: T) => React.ReactNode;

    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;

    searchFn?: (item: T, search: string) => boolean;
}

export default function EntityPicker<T>({
    value,
    onChange,
    fetchData,
    getId,
    getLabel,
    getSubLabel,
    renderIcon,
    label,
    placeholder = "Select an option",
    required = false,
    error,
    searchFn,
}: EntityPickerProps<T>) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Fetch data
    useEffect(() => {
        if (!open || items.length > 0) return;

        (async () => {
            setLoading(true);
            try {
                const data = await fetchData();
                setItems(data);
            } finally {
                setLoading(false);
            }
        })();
    }, [open]);

    const selected = items.find((i) => getId(i) === value) ?? null;

    const filtered = items.filter((i) => {
        if (!search) return true;

        if (searchFn) return searchFn(i, search);

        return (
            getLabel(i).toLowerCase().includes(search.toLowerCase()) ||
            getSubLabel?.(i)?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const handleSelect = (item: T | null) => {
        onChange(item ? getId(item) : null, item);
        setOpen(false);
        setSearch("");
    };

    return (
        <div className="relative flex flex-col gap-1.5" ref={ref}>
            {/* Label */}
            {label && (
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    {label}
                    {required && <span className="text-amber-400 ml-0.5">*</span>}
                </label>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                    background: "rgba(255,255,255,0.03)",
                    border: error
                        ? "1px solid rgba(239,68,68,0.45)"
                        : open
                            ? "1px solid rgba(251,191,36,0.35)"
                            : "1px solid rgba(255,255,255,0.08)",
                }}
            >
                {selected ? (
                    <>
                        {renderIcon && renderIcon(selected)}

                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-white truncate">
                                {getLabel(selected)}
                            </div>
                            {getSubLabel && (
                                <div className="text-[10px] text-slate-600 truncate">
                                    {getSubLabel(selected)}
                                </div>
                            )}
                        </div>

                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(null);
                            }}
                            className="cursor-pointer text-slate-500 hover:text-white"
                        >
                            ✕
                        </span>
                    </>
                ) : (
                    <span className="text-slate-500 text-sm">
                        {placeholder}
                    </span>
                )}
            </button>

            {/* Error */}
            {error && <p className="text-[11px] text-red-400">{error}</p>}

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden bg-[#0a0f1a] border border-white/10 shadow-xl">

                    {/* Search */}
                    <div className="px-3 py-2 border-b border-white/10">
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="w-full bg-transparent text-sm text-white outline-none"
                        />
                    </div>

                    {/* Options */}
                    <div className="max-h-52 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-400">
                                Loading...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">
                                No results
                            </div>
                        ) : (
                            <>
                                {!required && (
                                    <button
                                        onClick={() => handleSelect(null)}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-white/5"
                                    >
                                        None
                                    </button>
                                )}

                                {filtered.map((item) => {
                                    const id = getId(item);
                                    const isSelected = id === value;

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => handleSelect(item)}
                                            className={`w-full text-left px-3 py-2 flex items-center gap-2 ${isSelected ? "bg-amber-500/10" : "hover:bg-white/5"
                                                }`}
                                        >
                                            {renderIcon && renderIcon(item)}

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white truncate">
                                                    {getLabel(item)}
                                                </div>
                                                {getSubLabel && (
                                                    <div className="text-xs text-slate-500 truncate">
                                                        {getSubLabel(item)}
                                                    </div>
                                                )}
                                            </div>

                                            {isSelected && <span>✔</span>}
                                        </button>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}