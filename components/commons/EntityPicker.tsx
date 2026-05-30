// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { Search, X } from "lucide-react";

// interface EntityPickerProps<T> {
//     value: string | null;
//     onChange: (id: string | null, item?: T | null) => void;

//     fetchData: () => Promise<T[]>;

//     /** When provided, the picker operates in server-search mode:
//      *  the callback fires (debounced 300 ms) on every keystroke so the parent
//      *  can rebuild `fetchData` with the new search term. */
//     onSearchChange?: (search: string) => void;

//     getId: (item: T) => string;
//     getLabel: (item: T) => string;
//     getSubLabel?: (item: T) => string | undefined;

//     renderIcon?: (item: T) => React.ReactNode;

//     label?: string;
//     placeholder?: string;
//     required?: boolean;
//     error?: string;

//     /** Client-side post-filter. Runs after server results arrive. */
//     filterFn?: (item: T) => boolean;
//     /** Client-side search override — only used when onSearchChange is NOT provided. */
//     searchFn?: (item: T, search: string) => boolean;
// }

// export default function EntityPicker<T>({
//     value,
//     onChange,
//     fetchData,
//     onSearchChange,
//     getId,
//     getLabel,
//     getSubLabel,
//     renderIcon,
//     label,
//     placeholder = "Select an option",
//     required = false,
//     error,
//     filterFn,
//     searchFn,
// }: EntityPickerProps<T>) {
//     const serverMode = !!onSearchChange;

//     const [open, setOpen] = useState(false);
//     const [items, setItems] = useState<T[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [fetched, setFetched] = useState(false);
//     const [search, setSearch] = useState("");

//     // Cache resolved items so the selected display survives re-fetches
//     const itemCache = useRef<Map<string, T>>(new Map());

//     const ref = useRef<HTMLDivElement>(null);
//     const inputRef = useRef<HTMLInputElement>(null);
//     const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//     // ── Outside click ───────────────────────────────────────────────────────
//     useEffect(() => {
//         const handler = (e: MouseEvent) => {
//             if (ref.current && !ref.current.contains(e.target as Node)) {
//                 setOpen(false);
//                 setSearch("");
//                 if (serverMode) onSearchChange!("");
//             }
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, [serverMode]);

//     // ── Focus search on open ────────────────────────────────────────────────
//     useEffect(() => {
//         if (open) setTimeout(() => inputRef.current?.focus(), 50);
//     }, [open]);

//     // ── Fetch ───────────────────────────────────────────────────────────────
//     const doFetch = useCallback(async () => {
//         setLoading(true);
//         try {
//             const data = await fetchData();
//             data.forEach((item) => itemCache.current.set(getId(item), item));
//             setItems(data);
//             if (!serverMode) setFetched(true);
//         } finally {
//             setLoading(false);
//         }
//     }, [fetchData]);

//     // Client mode: fetch once
//     useEffect(() => {
//         if (serverMode || !open || fetched) return;
//         doFetch();
//     }, [open, fetched, serverMode]);

//     // Server mode: re-fetch whenever fetchData identity changes (parent rebuilt it)
//     useEffect(() => {
//         if (!serverMode || !open) return;
//         doFetch();
//     }, [fetchData, open, serverMode]);

//     // ── Search input ────────────────────────────────────────────────────────
//     const handleSearchInput = (q: string) => {
//         setSearch(q);
//         if (!serverMode) return;
//         if (debounceRef.current) clearTimeout(debounceRef.current);
//         debounceRef.current = setTimeout(() => onSearchChange!(q), 300);
//     };

//     // ── Derived list ────────────────────────────────────────────────────────
//     const filtered = items.filter((i) => {
//         if (filterFn && !filterFn(i)) return false;
//         if (serverMode || !search) return true;
//         if (searchFn) return searchFn(i, search);
//         return (
//             getLabel(i).toLowerCase().includes(search.toLowerCase()) ||
//             getSubLabel?.(i)?.toLowerCase().includes(search.toLowerCase())
//         );
//     });

//     const selected = value ? (itemCache.current.get(value) ?? items.find((i) => getId(i) === value) ?? null) : null;

//     // ── Select / clear ──────────────────────────────────────────────────────
//     const handleSelect = (item: T | null) => {
//         if (item) itemCache.current.set(getId(item), item);
//         onChange(item ? getId(item) : null, item);
//         setOpen(false);
//         setSearch("");
//         if (serverMode) onSearchChange!("");
//     };

//     // ──────────────────────────────────────────────────────────────────────
//     return (
//         <div className="relative flex flex-col gap-1.5" ref={ref}>
//             {/* Label */}
//             {label && (
//                 <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
//                     {label}
//                     {required && <span className="text-amber-400 ml-0.5">*</span>}
//                 </label>
//             )}

//             {/* Trigger */}
//             <button
//                 type="button"
//                 onClick={() => setOpen((v) => !v)}
//                 className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all"
//                 style={{
//                     background: "rgba(255,255,255,0.03)",
//                     border: error
//                         ? "1px solid rgba(239,68,68,0.45)"
//                         : open
//                             ? "1px solid rgba(251,191,36,0.35)"
//                             : "1px solid rgba(255,255,255,0.08)",
//                 }}
//             >
//                 {selected ? (
//                     <>
//                         {renderIcon && renderIcon(selected)}
//                         <div className="flex-1 min-w-0">
//                             <div className="text-[13px] text-white truncate">{getLabel(selected)}</div>
//                             {getSubLabel && (
//                                 <div className="text-[10px] text-slate-600 truncate">{getSubLabel(selected)}</div>
//                             )}
//                         </div>
//                         <span
//                             role="button"
//                             onClick={(e) => { e.stopPropagation(); handleSelect(null); }}
//                             className="cursor-pointer text-slate-500 hover:text-white transition-colors"
//                         >
//                             <X size={12} />
//                         </span>
//                     </>
//                 ) : (
//                     <span className="text-slate-500 text-[13px]">{placeholder}</span>
//                 )}
//             </button>

//             {error && <p className="text-[11px] text-red-400">{error}</p>}

//             {/* Dropdown */}
//             {open && (
//                 <div
//                     className="absolute top-full left-0 z-50 mt-1 w-full rounded-xl overflow-hidden shadow-2xl"
//                     style={{
//                         background: "#0a0f1a",
//                         border: "1px solid rgba(255,255,255,0.09)",
//                     }}
//                 >
//                     {/* Search */}
//                     <div
//                         className="flex items-center gap-2 px-3 py-2.5"
//                         style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
//                     >
//                         <Search size={13} className="text-slate-600 shrink-0" />
//                         <input
//                             ref={inputRef}
//                             autoFocus
//                             value={search}
//                             onChange={(e) => handleSearchInput(e.target.value)}
//                             onKeyDown={(e) => {
//                                 if (e.key === "Escape") { setOpen(false); setSearch(""); if (serverMode) onSearchChange!(""); }
//                             }}
//                             placeholder={serverMode ? "Type to search…" : "Search…"}
//                             className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-600"
//                         />
//                         {search && (
//                             <button type="button" onClick={() => { setSearch(""); if (serverMode) onSearchChange!(""); }} className="text-slate-600 hover:text-slate-400">
//                                 <X size={11} />
//                             </button>
//                         )}
//                         {serverMode && loading && (
//                             <span className="w-3 h-3 border border-slate-700 border-t-slate-400 rounded-full animate-spin shrink-0" />
//                         )}
//                     </div>

//                     {/* Hint */}
//                     {serverMode && !search && !loading && items.length === 0 && (
//                         <div className="py-6 text-center text-slate-600 text-[12px]">
//                             Start typing to search
//                         </div>
//                     )}

//                     {/* Options */}
//                     <div className="max-h-52 overflow-y-auto">
//                         {loading && items.length === 0 ? (
//                             <div className="flex items-center justify-center gap-2 py-8 text-slate-600 text-[12px]">
//                                 <span className="w-3.5 h-3.5 border border-slate-700 border-t-slate-400 rounded-full animate-spin" />
//                                 Loading…
//                             </div>
//                         ) : filtered.length === 0 && (search || !serverMode) ? (
//                             <div className="py-8 text-center text-slate-500 text-[12px]">No results</div>
//                         ) : (
//                             <>
//                                 {!required && (
//                                     <button
//                                         type="button"
//                                         onClick={() => handleSelect(null)}
//                                         className="w-full text-left px-3 py-2 text-[12px] text-slate-500 hover:bg-white/5"
//                                     >
//                                         None
//                                     </button>
//                                 )}
//                                 {filtered.map((item) => {
//                                     const id = getId(item);
//                                     const isSel = id === value;
//                                     return (
//                                         <button
//                                             key={id}
//                                             type="button"
//                                             onClick={() => handleSelect(item)}
//                                             className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors"
//                                             style={{ background: isSel ? "rgba(251,191,36,0.08)" : "transparent" }}
//                                             onMouseEnter={(e) => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
//                                             onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isSel ? "rgba(251,191,36,0.08)" : "transparent"; }}
//                                         >
//                                             {renderIcon && renderIcon(item)}
//                                             <div className="flex-1 min-w-0">
//                                                 <div className="text-[13px] text-white truncate">{getLabel(item)}</div>
//                                                 {getSubLabel && (
//                                                     <div className="text-[11px] text-slate-500 truncate">{getSubLabel(item)}</div>
//                                                 )}
//                                             </div>
//                                             {isSel && <span className="text-amber-400 text-[11px]">✔</span>}
//                                         </button>
//                                     );
//                                 })}
//                             </>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }




"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

interface EntityPickerProps<T> {
    value: string | null;
    onChange: (id: string | null, item?: T | null) => void;

    fetchData: () => Promise<T[]>;

    /** When provided, the picker operates in server-search mode:
     *  the callback fires (debounced 300 ms) on every keystroke so the parent
     *  can rebuild `fetchData` with the new search term. */
    onSearchChange?: (search: string) => void;

    /** Optional: fetch a single item by ID.
     *  Required for UPDATE mode in server-search to display the initial label
     *  without the pre-selected item necessarily appearing in the first page. */
    fetchById?: () => Promise<T | null>;

    getId: (item: T) => string;
    getLabel: (item: T) => string;
    getSubLabel?: (item: T) => string | undefined;

    renderIcon?: (item: T) => React.ReactNode;

    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;

    /** Client-side post-filter. Runs after server results arrive. */
    filterFn?: (item: T) => boolean;
    /** Client-side search override — only used when onSearchChange is NOT provided. */
    searchFn?: (item: T, search: string) => boolean;
}

export default function EntityPicker<T>({
    value,
    onChange,
    fetchData,
    onSearchChange,
    fetchById,
    getId,
    getLabel,
    getSubLabel,
    renderIcon,
    label,
    placeholder = "Select an option",
    required = false,
    error,
    filterFn,
    searchFn,
}: EntityPickerProps<T>) {
    const serverMode = !!onSearchChange;

    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [search, setSearch] = useState("");

    // Cache resolved items so the selected display survives re-fetches
    const itemCache = useRef<Map<string, T>>(new Map());

    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Outside click ───────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
                if (serverMode) onSearchChange!("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [serverMode]);

    // ── Focus search on open ────────────────────────────────────────────────
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    // ── Fetch ───────────────────────────────────────────────────────────────
    const doFetch = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchData();
            data.forEach((item) => itemCache.current.set(getId(item), item));
            setItems(data);
            if (!serverMode) setFetched(true);
        } finally {
            setLoading(false);
        }
    }, [fetchData]);

    // Client mode: fetch once on open
    useEffect(() => {
        if (serverMode || !open || fetched) return;
        doFetch();
    }, [open, fetched, serverMode]);

    // Server mode: re-fetch whenever fetchData identity changes (parent rebuilt it)
    useEffect(() => {
        if (!serverMode || !open) return;
        doFetch();
    }, [fetchData, open, serverMode]);

    // ── Pre-fetch selected item (UPDATE mode) ───────────────────────────────
    // Fires once when a value is provided but not yet in the cache.
    // This ensures the label is visible before the user opens the dropdown.
    useEffect(() => {
        if (!value || itemCache.current.has(value)) return;

        (async () => {
            if (fetchById) {
                // Precise path: dedicated by-ID endpoint
                const item = await fetchById();
                if (item) {
                    itemCache.current.set(getId(item), item);
                    setItems((prev) => {
                        const exists = prev.some((i) => getId(i) === getId(item));
                        return exists ? prev : [item, ...prev];
                    });
                }
            } else if (!serverMode) {
                // Client mode without fetchById: load the full list so
                // the label resolves from the complete dataset.
                const data = await fetchData();
                data.forEach((i) => itemCache.current.set(getId(i), i));
                setItems(data);
                setFetched(true);
            }
            // Server mode without fetchById: no safe fallback.
            // Provide fetchById to support UPDATE mode in server-search pickers.
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]); // intentionally depends only on value — fires once per ID change

    // ── Search input ────────────────────────────────────────────────────────
    const handleSearchInput = (q: string) => {
        setSearch(q);
        if (!serverMode) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => onSearchChange!(q), 300);
    };

    // ── Derived list ────────────────────────────────────────────────────────
    const filtered = items.filter((i) => {
        if (filterFn && !filterFn(i)) return false;
        if (serverMode || !search) return true;
        if (searchFn) return searchFn(i, search);
        return (
            getLabel(i).toLowerCase().includes(search.toLowerCase()) ||
            getSubLabel?.(i)?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const selected = value
        ? (itemCache.current.get(value) ?? items.find((i) => getId(i) === value) ?? null)
        : null;

    // ── Select / clear ──────────────────────────────────────────────────────
    const handleSelect = (item: T | null) => {
        if (item) itemCache.current.set(getId(item), item);
        onChange(item ? getId(item) : null, item);
        setOpen(false);
        setSearch("");
        if (serverMode) onSearchChange!("");
    };

    // ──────────────────────────────────────────────────────────────────────
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
                            <div className="text-[13px] text-white truncate">{getLabel(selected)}</div>
                            {getSubLabel && (
                                <div className="text-[10px] text-slate-600 truncate">{getSubLabel(selected)}</div>
                            )}
                        </div>
                        <span
                            role="button"
                            onClick={(e) => { e.stopPropagation(); handleSelect(null); }}
                            className="cursor-pointer text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={12} />
                        </span>
                    </>
                ) : (
                    <span className="text-slate-500 text-[13px]">{placeholder}</span>
                )}
            </button>

            {error && <p className="text-[11px] text-red-400">{error}</p>}

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute top-full left-0 z-50 mt-1 w-full rounded-xl overflow-hidden shadow-2xl"
                    style={{
                        background: "#0a0f1a",
                        border: "1px solid rgba(255,255,255,0.09)",
                    }}
                >
                    {/* Search */}
                    <div
                        className="flex items-center gap-2 px-3 py-2.5"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        <Search size={13} className="text-slate-600 shrink-0" />
                        <input
                            ref={inputRef}
                            autoFocus
                            value={search}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                    setOpen(false);
                                    setSearch("");
                                    if (serverMode) onSearchChange!("");
                                }
                            }}
                            placeholder={serverMode ? "Type to search…" : "Search…"}
                            className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-slate-600"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearch(""); if (serverMode) onSearchChange!(""); }}
                                className="text-slate-600 hover:text-slate-400"
                            >
                                <X size={11} />
                            </button>
                        )}
                        {serverMode && loading && (
                            <span className="w-3 h-3 border border-slate-700 border-t-slate-400 rounded-full animate-spin shrink-0" />
                        )}
                    </div>

                    {/* Hint */}
                    {serverMode && !search && !loading && items.length === 0 && (
                        <div className="py-6 text-center text-slate-600 text-[12px]">
                            Start typing to search
                        </div>
                    )}

                    {/* Options */}
                    <div className="max-h-52 overflow-y-auto">
                        {loading && items.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-slate-600 text-[12px]">
                                <span className="w-3.5 h-3.5 border border-slate-700 border-t-slate-400 rounded-full animate-spin" />
                                Loading…
                            </div>
                        ) : filtered.length === 0 && (search || !serverMode) ? (
                            <div className="py-8 text-center text-slate-500 text-[12px]">No results</div>
                        ) : (
                            <>
                                {!required && (
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(null)}
                                        className="w-full text-left px-3 py-2 text-[12px] text-slate-500 hover:bg-white/5"
                                    >
                                        None
                                    </button>
                                )}
                                {filtered.map((item) => {
                                    const id = getId(item);
                                    const isSel = id === value;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => handleSelect(item)}
                                            className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors"
                                            style={{ background: isSel ? "rgba(251,191,36,0.08)" : "transparent" }}
                                            onMouseEnter={(e) => {
                                                if (!isSel) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = isSel
                                                    ? "rgba(251,191,36,0.08)"
                                                    : "transparent";
                                            }}
                                        >
                                            {renderIcon && renderIcon(item)}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] text-white truncate">{getLabel(item)}</div>
                                                {getSubLabel && (
                                                    <div className="text-[11px] text-slate-500 truncate">{getSubLabel(item)}</div>
                                                )}
                                            </div>
                                            {isSel && <span className="text-amber-400 text-[11px]">✔</span>}
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