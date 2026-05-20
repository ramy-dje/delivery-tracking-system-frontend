"use client";

import { useEffect, useRef, useState } from "react";
import { ICommune, IWilaya } from "@/types/common";
import { getAllCommunes, getWilayas } from "@/services/LocationService";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationPickerValue {
    wilayaId: string;
    communeId: string;
    wilaya?: IWilaya;
    commune?: ICommune;
}

interface LocationPickerProps {
    value?: Partial<LocationPickerValue>;
    onChange: (val: LocationPickerValue) => void;
    error?: { wilaya?: string; commune?: string };
    disabled?: boolean;
    /** Label language preference, defaults to "fr" */
    lang?: "fr" | "ar";
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const FIELD_BASE =
    "w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border text-sm text-white placeholder:text-slate-600 focus:outline-none transition-all";

const FIELD_NORMAL = `${FIELD_BASE} border-white/[0.08] focus:border-amber-500/40 focus:bg-white/[0.06]`;
const FIELD_ERROR = `${FIELD_BASE} border-red-500/40 focus:border-red-500/60`;
const FIELD_DISABLED = `${FIELD_BASE} border-white/5 opacity-50 cursor-not-allowed`;

const LABEL = "block text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5";

// ─── Searchable dropdown ──────────────────────────────────────────────────────

interface DropdownOption {
    id: string;
    label: string;
    sublabel?: string;
}

interface SearchableDropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (id: string, option: DropdownOption) => void;
    placeholder: string;
    loading?: boolean;
    disabled?: boolean;
    hasError?: boolean;
    emptyMessage?: string;
}

function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder,
    loading,
    disabled,
    hasError,
    emptyMessage = "No results",
}: SearchableDropdownProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = options.find((o) => o.id === value);

    const filtered = query.trim()
        ? options.filter(
            (o) =>
                o.label.toLowerCase().includes(query.toLowerCase()) ||
                o.sublabel?.toLowerCase().includes(query.toLowerCase())
        )
        : options;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setOpen(false); setQuery(""); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const handleOpen = () => {
        if (disabled) return;
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 30);
    };

    const handleSelect = (opt: DropdownOption) => {
        onChange(opt.id, opt);
        setOpen(false);
        setQuery("");
    };

    const fieldClass = disabled
        ? FIELD_DISABLED
        : hasError
            ? FIELD_ERROR
            : FIELD_NORMAL;

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className={`${fieldClass} flex items-center justify-between gap-2 text-left`}
            >
                <span className={selected ? "text-white" : "text-slate-600"}>
                    {loading ? (
                        <span className="flex items-center gap-2 text-slate-500">
                            <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                                    strokeDasharray="60" strokeDashoffset="20" />
                            </svg>
                            Loading…
                        </span>
                    ) : selected ? (
                        <span className="flex items-center gap-2">
                            {selected.sublabel && (
                                <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                                    {selected.sublabel}
                                </span>
                            )}
                            {selected.label}
                        </span>
                    ) : (
                        placeholder
                    )}
                </span>
                <svg
                    className={`shrink-0 text-slate-600 transition-transform ${open ? "rotate-180" : ""}`}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="absolute z-50 mt-1.5 w-full rounded-xl border border-white/1 shadow-2xl overflow-hidden"
                    style={{ background: "#0d1117" }}
                >
                    {/* Search input */}
                    <div className="p-2 border-b border-white/6">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/[0.07]">
                            <svg className="text-slate-600 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search…"
                                className="bg-transparent text-[13px] text-white placeholder:text-slate-600 focus:outline-none flex-1 min-w-0"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="text-slate-600 hover:text-slate-400 shrink-0"
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options list */}
                    <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-5 text-center text-[13px] text-slate-600">
                                {emptyMessage}
                            </div>
                        ) : (
                            filtered.map((opt) => {
                                const isSelected = opt.id === value;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleSelect(opt)}
                                        className={`
                                            w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors
                                            ${isSelected
                                                ? "bg-amber-500/10"
                                                : "hover:bg-white/4"
                                            }
                                        `}
                                    >
                                        {opt.sublabel && (
                                            <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                                                {opt.sublabel}
                                            </span>
                                        )}
                                        <span className={`text-[13px] ${isSelected ? "text-amber-300" : "text-slate-300"}`}>
                                            {opt.label}
                                        </span>
                                        {isSelected && (
                                            <svg className="ml-auto shrink-0 text-amber-400" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Count footer */}
                    {filtered.length > 0 && (
                        <div className="px-3.5 py-2 border-t border-white/5 text-[10px] text-slate-700">
                            {filtered.length} {filtered.length === 1 ? "result" : "results"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── LocationPicker ────────────────────────────────────────────────────────────

export default function LocationPicker({
    value,
    onChange,
    error,
    disabled,
    lang = "fr",
}: LocationPickerProps) {
    const [wilayas, setWilayas] = useState<IWilaya[]>([]);
    const [communes, setCommunes] = useState<ICommune[]>([]);
    const [loadingWilayas, setLoadingWilayas] = useState(false);
    const [loadingCommunes, setLoadingCommunes] = useState(false);

    const selectedWilayaId = value?.wilayaId ?? "";
    const selectedCommuneId = value?.communeId ?? "";

    // Load wilayas once
    useEffect(() => {
        setLoadingWilayas(true);
        getWilayas()
            .then(setWilayas)
            .catch(console.error)
            .finally(() => setLoadingWilayas(false));
    }, []);

    // Load communes when wilaya changes
    useEffect(() => {
        if (!selectedWilayaId) {
            setCommunes([]);
            return;
        }
        setLoadingCommunes(true);
        getAllCommunes({ wilayaId: selectedWilayaId, pageNumber: 1, pageSize: 50 })
            .then(setCommunes)
            .catch(console.error)
            .finally(() => setLoadingCommunes(false));
    }, [selectedWilayaId]);

    const wilayaOptions: DropdownOption[] = wilayas.map((w) => ({
        id: w.id,
        label: lang === "ar" ? w.nameAr : w.nameFr,
        sublabel: String(w.code).padStart(2, "0"),
    }));

    const communeOptions: DropdownOption[] = communes.map((c) => ({
        id: c.id,
        label: lang === "ar" ? c.nameAr : c.nameFr,
    }));

    const handleWilayaChange = (id: string, _opt: DropdownOption) => {
        const wilaya = wilayas.find((w) => w.id === id);
        onChange({ wilayaId: id, communeId: "", wilaya, commune: undefined });
    };

    const handleCommuneChange = (id: string, _opt: DropdownOption) => {
        const commune = communes.find((c) => c.id === id);
        const wilaya = wilayas.find((w) => w.id === selectedWilayaId);
        onChange({ wilayaId: selectedWilayaId, communeId: id, wilaya, commune });
    };

    return (
        <div className="space-y-4 relative z-9999">
            {/* Wilaya */}
            <div>
                <label className={LABEL}>
                    Wilaya
                </label>
                <SearchableDropdown
                    options={wilayaOptions}
                    value={selectedWilayaId}
                    onChange={handleWilayaChange}
                    placeholder="Select a wilaya…"
                    loading={loadingWilayas}
                    disabled={disabled}
                    hasError={!!error?.wilaya}
                    emptyMessage="No wilayas found"
                />
                {error?.wilaya && (
                    <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {error.wilaya}
                    </p>
                )}
            </div>

            {/* Commune */}
            <div>
                <label className={LABEL}>
                    Commune
                    {selectedWilayaId && communes.length > 0 && (
                        <span className="ml-2 text-[9px] text-slate-600 normal-case tracking-normal font-normal">
                            {communes.length} available
                        </span>
                    )}
                </label>
                <SearchableDropdown
                    options={communeOptions}
                    value={selectedCommuneId}
                    onChange={handleCommuneChange}
                    placeholder={!selectedWilayaId ? "Select a wilaya first…" : "Select a commune…"}
                    loading={loadingCommunes}
                    disabled={disabled || !selectedWilayaId}
                    hasError={!!error?.commune}
                    emptyMessage="No communes found for this wilaya"
                />
                {error?.commune && (
                    <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {error.commune}
                    </p>
                )}
            </div>
        </div>
    );
}