"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Search, Check, ChevronDown } from "lucide-react";

interface MultiEntityPickerProps<T> {
    value: string[];
    onChange: (ids: string[], items: T[]) => void;

    /** Called every time the search input changes (debounced 300 ms).
     *  If provided, the picker switches to server-search mode:
     *  - fetchData() is re-called whenever the debounced value settles
     *  - client-side searchFn / filterFn still run on top of the server results
     *  If omitted, fetchData() is called once and filtered client-side only. */
    onSearchChange?: (search: string) => void;

    fetchData: () => Promise<T[]>;

    getId: (item: T) => string;
    getLabel: (item: T) => string;
    getSubLabel?: (item: T) => string;

    renderIcon?: (item: T) => React.ReactNode;

    label?: string;
    placeholder?: string;
    error?: string;

    /** Client-side post-filter (runs after server results arrive). */
    filterFn?: (item: T) => boolean;
    /** Client-side search override — only used when onSearchChange is NOT provided. */
    searchFn?: (item: T, search: string) => boolean;

    maxItems?: number;
}

export default function MultiEntityPicker<T>({
    value,
    onChange,
    onSearchChange,
    fetchData,
    getId,
    getLabel,
    getSubLabel,
    renderIcon,
    label,
    placeholder = "Search and select…",
    error,
    filterFn,
    searchFn,
    maxItems,
}: MultiEntityPickerProps<T>) {
    const serverMode = !!onSearchChange;

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);   // used only in client mode
    const [search, setSearch] = useState("");

    // Cache of every item ever resolved (by id) so tags survive re-fetches
    const selectedCache = useRef<Map<string, T>>(new Map());

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Outside click ───────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
                if (serverMode) onSearchChange!("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [serverMode]);

    // ── Focus input on open ─────────────────────────────────────────────────
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    // ── Fetch logic ─────────────────────────────────────────────────────────
    const doFetch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchData();
            // Update cache
            data.forEach((item) => selectedCache.current.set(getId(item), item));
            setItems(data);
            if (!serverMode) setFetched(true);
        } finally {
            setLoading(false);
        }
    }, [fetchData]);

    // Client mode: fetch once on first open
    useEffect(() => {
        if (serverMode || !open || fetched) return;
        doFetch();
    }, [open, fetched, serverMode]);

    // Server mode: re-fetch whenever fetchData reference changes
    // (parent rebuilds fetchData with the new search term)
    useEffect(() => {
        if (!serverMode || !open) return;
        doFetch();
    }, [fetchData, open, serverMode]);

    // ── Search input handling ───────────────────────────────────────────────
    const handleSearchInput = (q: string) => {
        setSearch(q);
        if (!serverMode) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearchChange!(q);
        }, 300);
    };

    // ── Derived list ────────────────────────────────────────────────────────
    const filtered = items.filter((i) => {
        if (filterFn && !filterFn(i)) return false;
        // In server mode the server already filtered by search; skip client searchFn
        if (serverMode || !search) return true;
        if (searchFn) return searchFn(i, search);
        return (
            getLabel(i).toLowerCase().includes(search.toLowerCase()) ||
            getSubLabel?.(i)?.toLowerCase().includes(search.toLowerCase())
        );
    });

    // Resolve selected items from cache (survive re-fetches)
    const selectedItems = value
        .map((id) => selectedCache.current.get(id))
        .filter((i): i is T => i !== undefined);

    // ── Toggle ──────────────────────────────────────────────────────────────
    const toggle = (item: T) => {
        const id = getId(item);
        selectedCache.current.set(id, item);
        const alreadyIn = value.includes(id);
        const next = alreadyIn
            ? value.filter((v) => v !== id)
            : maxItems && value.length >= maxItems
                ? value
                : [...value, id];
        onChange(next, next.map((nid) => selectedCache.current.get(nid)!).filter(Boolean));
        // keep dropdown open
        inputRef.current?.focus();
    };

    const removeById = (id: string) => {
        const next = value.filter((v) => v !== id);
        onChange(next, next.map((nid) => selectedCache.current.get(nid)!).filter(Boolean));
    };

    const clearAll = () => onChange([], []);

    const isSelected = (item: T) => value.includes(getId(item));
    const atMax = maxItems !== undefined && value.length >= maxItems;

    // ──────────────────────────────────────────────────────────────────────
    return (
        <div className="relative z-99999999 flex flex-col gap-1.5" ref={containerRef}>
            {/* Label */}
            {label && (
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    {label}
                </label>
            )}

            {/* Tag input trigger */}
            <div
                onClick={() => { if (!atMax) setOpen(true); }}
                className="min-h-[42px] flex flex-wrap items-center gap-1.5 px-2.5 py-2 rounded-lg cursor-text transition-all"
                style={{
                    background: "rgba(255,255,255,0.03)",
                    border: error
                        ? "1px solid rgba(239,68,68,0.45)"
                        : open
                            ? "1px solid rgba(251,191,36,0.35)"
                            : "1px solid rgba(255,255,255,0.08)",
                }}
            >
                {selectedItems.map((item) => {
                    const id = getId(item);
                    return (
                        <span
                            key={id}
                            className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium shrink-0"
                            style={{
                                background: "rgba(251,191,36,0.08)",
                                border: "1px solid rgba(251,191,36,0.18)",
                                color: "#e2c97e",
                            }}
                        >
                            <span className="max-w-[110px] truncate">{getLabel(item)}</span>
                            <button
                                type="button"
                                onMouseDown={(e) => { e.stopPropagation(); removeById(id); }}
                                className="ml-0.5 rounded text-amber-500/40 hover:text-red-400 transition-colors"
                            >
                                <X size={10} />
                            </button>
                        </span>
                    );
                })}

                {selectedItems.length === 0 && !open && (
                    <span className="text-slate-600 text-[13px] flex-1 select-none">{placeholder}</span>
                )}

                {atMax
                    ? <span className="text-[11px] text-slate-600 ml-auto select-none">max {maxItems}</span>
                    : <ChevronDown
                        size={13}
                        className="ml-auto text-slate-600 shrink-0 transition-transform"
                        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                }
            </div>

            {error && <p className="text-[11px] text-red-400">{error}</p>}

            {value.length > 0 && (
                <p className="text-[10px] text-slate-700">
                    {value.length} commune{value.length !== 1 ? "s" : ""} selected
                    {maxItems ? ` · max ${maxItems}` : ""}
                </p>
            )}

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute top-full left-0 z-50 w-full rounded-xl overflow-hidden shadow-2xl mt-1"
                    style={{
                        background: "#0a0f1a",
                        border: "1px solid rgba(255,255,255,0.09)",
                    }}
                >
                    {/* Search row */}
                    <div
                        className="flex items-center gap-2 px-3 py-2.5"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <Search size={13} className="text-slate-600 shrink-0" />
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") { setOpen(false); setSearch(""); if (serverMode) onSearchChange!(""); }
                            }}
                            placeholder={serverMode ? "Type to search…" : "Type to filter…"}
                            className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-600"
                        />
                        {search && (
                            <button type="button" onClick={() => { setSearch(""); if (serverMode) onSearchChange!(""); }} className="text-slate-600 hover:text-slate-400">
                                <X size={11} />
                            </button>
                        )}
                        {serverMode && loading && (
                            <span className="w-3 h-3 border border-slate-700 border-t-slate-400 rounded-full animate-spin shrink-0" />
                        )}
                    </div>

                    {/* Hint for server mode */}
                    {serverMode && !search && !loading && items.length === 0 && (
                        <div className="py-6 text-center text-slate-600 text-[12px]">
                            Start typing to search communes
                        </div>
                    )}

                    {/* List */}
                    <div className="max-h-52 overflow-y-auto overscroll-contain">
                        {loading && items.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-slate-600 text-[12px]">
                                <span className="w-3.5 h-3.5 border border-slate-700 border-t-slate-400 rounded-full animate-spin" />
                                Loading…
                            </div>
                        ) : filtered.length === 0 && (search || !serverMode) ? (
                            <div className="py-8 text-center text-slate-600 text-[12px]">No results</div>
                        ) : (
                            filtered.map((item) => {
                                const id = getId(item);
                                const sel = isSelected(item);
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => toggle(item)}
                                        disabled={atMax && !sel}
                                        className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors disabled:opacity-30"
                                        style={{ background: sel ? "rgba(251,191,36,0.07)" : "transparent" }}
                                        onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = sel ? "rgba(251,191,36,0.07)" : "transparent"; }}
                                    >
                                        {renderIcon && renderIcon(item)}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] text-white truncate">{getLabel(item)}</div>
                                            {getSubLabel && (
                                                <div className="text-[11px] text-slate-500 truncate">{getSubLabel(item)}</div>
                                            )}
                                        </div>
                                        <div
                                            className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                                            style={{
                                                background: sel ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.05)",
                                                border: sel ? "1px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.1)",
                                            }}
                                        >
                                            {sel && <Check size={9} style={{ color: "#fbbf24" }} strokeWidth={3} />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {value.length > 0 && (
                        <div
                            className="flex items-center justify-between px-3 py-2"
                            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            <span className="text-[11px] text-slate-600">{value.length} selected</span>
                            <button type="button" onClick={clearAll} className="text-[11px] text-slate-600 hover:text-red-400 transition-colors">
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}