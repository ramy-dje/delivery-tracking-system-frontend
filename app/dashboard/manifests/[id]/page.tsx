"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  loaderGetManifestDetail, loaderScanIn, loaderScanOut,
  loaderSealManifest, loaderDepartManifest, loaderArriveManifest,
  loaderCloseManifest, loaderRemovePackage, loaderGetPackagesToManifest,
  loaderLoadOnTruck,
} from "@/services/LoaderService";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight, Package, Truck, CheckCircle2, AlertCircle,
  Loader2, ScanLine, XCircle, ShieldCheck, MapPin, Activity, Hash, Weight, Calendar,
  ChevronRight, Clock, QrCode, Building2, Search, AlertTriangle, CircleDot, TrendingUp,
  Printer, Download, RotateCcw, Box, Check, X, Trash2, GitBranch, Send, Route,
} from "lucide-react";
import Link from "next/link";
import { IManifestDetail, ManifestStatus } from "@/types/manifest";
import { showToast } from "nextjs-toast-notify";
import ConfirmDialog from "@/components/commons/ConfirmDialog";
import ErrorBaner from "@/components/commons/ErrorBaner";
import LoadingSpinner from "@/components/commons/LoadingSpinner";
import { downloadManifestHtml, handlePrintManifest } from "@/utils/manifestPrintHelper";
import LoadOnTruckModal from "@/components/dashboard/manifests/LoadOnTruckModal";

const PALETTE = {
  bg: { card: "#060a10", elevated: "#0c121d" },
  border: { subtle: "rgba(255,255,255,0.05)", medium: "rgba(255,255,255,0.08)", strong: "rgba(255,255,255,0.12)" },
  text: { primary: "#e2e8f0", secondary: "#94a3b8", muted: "#64748b", disabled: "#475569" },

  status: {
    open: { base: "#4ade80", glow: "rgba(74,222,128,0.15)", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)" },
    sealed: { base: "#a78bfa", glow: "rgba(167,139,250,0.15)", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
    loaded: { base: "#fbbf24", glow: "rgba(251,191,36,0.15)", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
    in_transit: { base: "#38bdf8", glow: "rgba(56,189,248,0.15)", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)" },
    arrived: { base: "#2dd4bf", glow: "rgba(45,212,191,0.15)", bg: "rgba(45,212,191,0.08)", border: "rgba(45,212,191,0.2)" },
    unloading: { base: "#fb923c", glow: "rgba(251,146,60,0.15)", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)" },
    closed: { base: "#64748b", glow: "rgba(100,116,139,0.15)", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
    discrepancy: { base: "#f87171", glow: "rgba(248,113,113,0.15)", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
    cancelled: { base: "#64748b", glow: "rgba(100,116,139,0.1)", bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.15)" },
  },

  // Reused by the "Close Manifest" action regardless of which status (arrived
  // or unloading) triggers it — both should look identical, it's the same action.
  complete: { base: "#34d399", glow: "rgba(52,211,153,0.15)", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },

  accent: { base: "#fbbf24", hover: "#f59e0b", text: "#05080d" },
  gradient: { header: "linear-gradient(180deg,#fbbf24,#f59e0b66)" },
};

// ── Status metadata ──────────────────────────────────────────────────────
type StatusMeta = {
  label: string; color: string; bg: string; border: string; dot: string; glow: string; pulse: boolean;
  icon: React.ReactNode;
};

function getStatusMeta(status: ManifestStatus): StatusMeta {
  const s = PALETTE.status[status as keyof typeof PALETTE.status] || PALETTE.status.closed;
  const icons: Record<string, React.ReactNode> = {
    open: <Box size={14} />,
    sealed: <ShieldCheck size={14} />,
    loaded: <Truck size={14} />,
    in_transit: <Route size={14} />,
    arrived: <MapPin size={14} />,
    unloading: <Package size={14} />,
    closed: <CheckCircle2 size={14} />,
    discrepancy: <AlertTriangle size={14} />,
    cancelled: <XCircle size={14} />,
  };

  return {
    label: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    color: s.base,
    bg: s.bg,
    border: s.border,
    dot: s.base,
    glow: s.glow,
    pulse: ["in_transit", "unloading", "discrepancy"].includes(status),
    icon: icons[status] || <CircleDot size={14} />,
  };
}

function GlassCard({
  children, className = "", style = {}, hover = true, glow = false, glowColor = PALETTE.accent.base,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className} ${hover ? "transition-all duration-300 hover:border-white/10" : ""}`}
      style={{
        background: PALETTE.bg.card,
        border: `1px solid ${PALETTE.border.subtle}`,
        boxShadow: glow ? `0 0 40px ${glowColor}26, inset 0 1px 0 rgba(255,255,255,0.04)` : "inset 0 1px 0 rgba(255,255,255,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 600;
    const start = display;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{display}{suffix}</span>;
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className="absolute -bottom-1.25 left-1/2 -translate-x-1/2 translate-y-full  px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shadow-lg"
          style={{
            background: PALETTE.bg.elevated,
            border: `1px solid ${PALETTE.border.medium}`,
            color: PALETTE.text.primary,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}
        >
          {text}
          <div
            className="absolute -top-1.25 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
            style={{
              background: PALETTE.bg.elevated,
              borderTop: `1px solid ${PALETTE.border.medium}`,
              borderLeft: `1px solid ${PALETTE.border.medium}`,
            }}
          />
        </div>
      )}
    </div>
  );
}


function SectionHeader({
  icon, label, color = PALETTE.accent.base, action,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}
        >
          {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: PALETTE.text.muted }}>
          {label}
        </span>
      </div>
      {action}
    </div>
  );
}

function InfoPill({
  label, value, mono = false, icon, color = PALETTE.text.secondary,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${PALETTE.border.subtle}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = PALETTE.border.medium;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        e.currentTarget.style.borderColor = PALETTE.border.subtle;
      }}
    >
      {icon && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}10`, color: `${color}80` }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wider" style={{ color: PALETTE.text.muted }}>
          {label}
        </span>
        <span className={`block text-[13px] font-semibold truncate ${mono ? "font-mono" : ""}`} style={{ color: PALETTE.text.primary }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, color, trend,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl p-4 transition-all duration-300"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${PALETTE.border.subtle}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = `${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        e.currentTarget.style.borderColor = PALETTE.border.subtle;
      }}
    >
      <div
        className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${color}20, transparent 70%)` }}
      />

      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color: `${color}90` }}>
          {icon}
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{
              background: trend.positive ? PALETTE.status.open.bg : PALETTE.status.discrepancy.bg,
              color: trend.positive ? PALETTE.status.open.base : PALETTE.status.discrepancy.base,
            }}
          >
            {trend.positive ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="text-[22px] font-bold font-mono mb-0.5" style={{ color: PALETTE.text.primary }}>
        {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
      </div>
      <div className="text-[11px] font-medium" style={{ color: PALETTE.text.muted }}>
        {label}
      </div>
    </div>
  );
}
function EntryStatusChip({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    in_manifest: { color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.15)", icon: <Box size={10} /> },
    unloaded: { color: "#2dd4bf", bg: "rgba(45,212,191,0.08)", border: "rgba(45,212,191,0.15)", icon: <CheckCircle2 size={10} /> },
    remanifested: { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.15)", icon: <GitBranch size={10} /> },
    missing: { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.15)", icon: <AlertTriangle size={10} /> },
    damaged: { color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.15)", icon: <AlertCircle size={10} /> },
  };

  const s = map[status] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.15)", icon: <CircleDot size={10} /> };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.icon}
      {status.replace(/_/g, " ")}
    </span>
  );
}

function ActionButton({
  onClick, disabled, title, label, icon, color, size = "md", fullWidth = true,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  label: string;
  icon: React.ReactNode;
  color: { text: string; bg: string; border: string; hoverBg: string; glow?: string };
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}) {
  const sizeClasses = {
    sm: "px-3 py-2 text-[11px] gap-1.5",
    md: "px-4 py-2.5 text-[13px] gap-2",
    lg: "px-6 py-3 text-[14px] gap-2.5",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center rounded-xl font-semibold transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] hover:scale-[1.02]
        ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`}
      style={{ color: color.text, background: color.bg, border: `1px solid ${color.border}` }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = color.hoverBg;
          e.currentTarget.style.boxShadow = color.glow ? `0 0 20px ${color.glow}` : "none";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = color.bg;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function IconButton({
  onClick, disabled, icon, label, color = PALETTE.text.secondary,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <Tooltip text={label}>
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
          disabled:opacity-40 active:scale-95 hover:scale-105"
        style={{ color, background: "rgba(255,255,255,0.03)", border: `1px solid ${PALETTE.border.subtle}` }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.borderColor = PALETTE.border.medium;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          e.currentTarget.style.borderColor = PALETTE.border.subtle;
        }}
      >
        {icon}
      </button>
    </Tooltip>
  );
}


function SealManifestModal({
  manifestCode, packageCount, totalWeight, loading, error, onConfirm, onCancel,
}: {
  manifestCode: string;
  packageCount: number;
  totalWeight: number;
  loading: boolean;
  error: string | null;
  onConfirm: (sealNumber: string, notes: string) => void;
  onCancel: () => void;
}) {
  const [sealNumber, setSealNumber] = useState("");
  const [notes, setNotes] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const canSubmit = sealNumber.trim().length > 0 && !loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(sealNumber.trim(), notes.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: PALETTE.bg.elevated, border: `1px solid ${PALETTE.status.sealed.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: PALETTE.status.sealed.bg }}>
            <ShieldCheck size={16} style={{ color: PALETTE.status.sealed.base }} />
          </div>
          <h2 className="text-[15px] font-bold" style={{ color: PALETTE.text.primary }}>Seal Manifest</h2>
        </div>
        <p className="text-[12px] mb-4 ml-[42px]" style={{ color: PALETTE.text.muted }}>
          {manifestCode} · {packageCount} packages · {totalWeight} kg. No more packages can be added after sealing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: PALETTE.text.muted }}>
              Seal Number *
            </label>
            <input
              ref={inputRef}
              type="text"
              value={sealNumber}
              onChange={(e) => setSealNumber(e.target.value)}
              placeholder="e.g. SL-00482"
              disabled={loading}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] font-mono focus:outline-none disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PALETTE.border.medium}`, color: PALETTE.text.primary }}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: PALETTE.text.muted }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              disabled={loading}
              className="w-full px-3 py-2.5 rounded-xl text-[13px] focus:outline-none resize-none disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PALETTE.border.medium}`, color: PALETTE.text.primary }}
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11.5px]"
              style={{ background: PALETTE.status.discrepancy.bg, border: `1px solid ${PALETTE.status.discrepancy.border}`, color: PALETTE.status.discrepancy.base }}
            >
              <AlertCircle size={12} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
              style={{ color: PALETTE.text.secondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40"
              style={{ color: "#05080d", background: PALETTE.status.sealed.base }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              {loading ? "Sealing…" : "Seal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCANNER
// ═══════════════════════════════════════════════════════════════════════════

function Scanner({
  scanMode, setScanMode, scanInput, setScanInput, scanLoading, lastScanned,
  scanAllowed, canScanIn, canScanOut, onScan, scanInputRef,
}: {
  scanMode: "in" | "out";
  setScanMode: (mode: "in" | "out") => void;
  scanInput: string;
  setScanInput: (v: string) => void;
  scanLoading: boolean;
  lastScanned: { code: string; ok: boolean; msg?: string } | null;
  scanAllowed: boolean;
  canScanIn: boolean;
  canScanOut: boolean;
  onScan: (e: React.FormEvent) => void;
  scanInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const scanInColor = PALETTE.status.loaded.base;
  const scanOutColor = PALETTE.status.arrived.base;
  const activeColor = scanMode === "in" ? scanInColor : scanOutColor;

  return (
    <GlassCard className="p-5" style={{ borderColor: scanAllowed ? `${activeColor}30` : PALETTE.border.subtle }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${activeColor}15`, color: activeColor }}>
            <ScanLine size={16} />
          </div>
          <div>
            <span className="block text-[12px] font-bold" style={{ color: PALETTE.text.primary }}>Barcode Scanner</span>
            <span className="block text-[10px]" style={{ color: PALETTE.text.muted }}>
              {scanAllowed ? `Ready for ${scanMode === "in" ? "scan-in" : "scan-out"}` : "Scanner locked"}
            </span>
          </div>
        </div>

        <div className="flex rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${PALETTE.border.subtle}` }}>
          {(["in", "out"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setScanMode(m)}
              disabled={m === "in" ? !canScanIn : !canScanOut}
              title={m === "out" && !canScanOut ? "Scan-out unlocks once the manifest has arrived" : undefined}
              className="px-3 py-1.5 rounded-md text-[10px] font-bold transition-all disabled:opacity-30 flex items-center gap-1.5"
              style={scanMode === m ? { background: m === "in" ? scanInColor : scanOutColor, color: "#0f172a" } : { color: PALETTE.text.muted }}
            >
              {m === "in" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {m === "in" ? "IN" : "OUT"}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onScan}>
        <div className="relative">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1.5px solid ${scanAllowed ? `${activeColor}40` : PALETTE.border.subtle}`,
              boxShadow: scanAllowed ? `0 0 0 3px ${activeColor}10, inset 0 1px 0 rgba(255,255,255,0.05)` : "none",
            }}
          >
            {scanLoading
              ? <Loader2 size={18} className="animate-spin shrink-0" style={{ color: activeColor }} />
              : <QrCode size={18} className="shrink-0" style={{ color: scanAllowed ? activeColor : PALETTE.text.disabled }} />
            }
            <input
              ref={scanInputRef}
              type="text"
              autoFocus
              placeholder={scanAllowed ? `Scan barcode to ${scanMode}…` : "Scanner unavailable in this state"}
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              disabled={!scanAllowed || scanLoading}
              className="flex-1 bg-transparent text-[13px] font-mono focus:outline-none min-w-0 disabled:opacity-40"
              style={{ color: PALETTE.text.primary, caretColor: activeColor }}
            />
            {scanInput && (
              <button
                type="button"
                onClick={() => setScanInput("")}
                className="shrink-0 p-1 rounded-md transition-colors hover:bg-white/5"
                style={{ color: PALETTE.text.muted }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </form>

      {lastScanned && (
        <div
          className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-medium"
          style={{
            background: lastScanned.ok ? PALETTE.complete.bg : PALETTE.status.discrepancy.bg,
            border: `1px solid ${lastScanned.ok ? PALETTE.complete.border : PALETTE.status.discrepancy.border}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: lastScanned.ok ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
              color: lastScanned.ok ? PALETTE.complete.base : PALETTE.status.discrepancy.base,
            }}
          >
            {lastScanned.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block font-mono truncate" style={{ color: lastScanned.ok ? PALETTE.complete.base : PALETTE.status.discrepancy.base }}>
              {lastScanned.code}
            </span>
            {lastScanned.msg && (
              <span className="block text-[11px] opacity-70" style={{ color: lastScanned.ok ? PALETTE.complete.base : PALETTE.status.discrepancy.base }}>
                {lastScanned.msg}
              </span>
            )}
          </div>
        </div>
      )}

      <p className="text-[11px] mt-3 text-center" style={{ color: PALETTE.text.disabled }}>
        {scanAllowed
          ? "Press Enter or use a barcode scanner to submit"
          : scanMode === "out"
            ? "Scan-out unlocks once the manifest arrives at destination"
            : "Scan-in closes once the manifest is sealed"}
      </p>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function ManifestDetailPage() {
  const params = useParams();
  const manifestId = params.id as string;
  const router = useRouter();
  const scanInputRef = useRef<HTMLInputElement>(null);

  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [loadLoading, setLoadLoading] = useState(false);

  const [manifest, setManifest] = useState<IManifestDetail & { events?: any[] } | null>(null);
  const [awaitingPackages, setAwaitingPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [packageFilter, setPackageFilter] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());

  const [scanInput, setScanInput] = useState("");
  const [scanMode, setScanMode] = useState<"in" | "out">("in");
  const [scanLoading, setScanLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<{ code: string; ok: boolean; msg?: string } | null>(null);

  const [confirmAction, setConfirmAction] = useState<null | {
    title: string; message: string; label: string; danger?: boolean;
    fn: () => Promise<void>;
  }>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Seal manifest — needs its own modal since it collects a sealNumber
  const [sealModalOpen, setSealModalOpen] = useState(false);
  const [sealSubmitting, setSealSubmitting] = useState(false);
  const [sealError, setSealError] = useState<string | null>(null);

  const fetchManifest = useCallback(async () => {
    try {
      setError(null);
      const res = await loaderGetManifestDetail(manifestId);
      if (res.success) {
        setManifest(res.data);
        try {
          const destId = (res.data.destinationBranchId as any)?._id || res.data.destinationBranchId;
          if (destId) {
            const pkgsRes = await loaderGetPackagesToManifest(destId as string);
            if (pkgsRes?.data) setAwaitingPackages(pkgsRes.data.packages || []);
          }
        } catch { /* non-critical */ }
      } else {
        setError((res as any).message || "Manifest not found.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load manifest.");
    } finally {
      setLoading(false);
    }
  }, [manifestId]);

  useEffect(() => { if (manifestId) fetchManifest(); }, [manifestId, fetchManifest]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = scanInput.trim();
    if (!code) return;
    setScanInput("");
    setScanLoading(true);
    setLastScanned(null);
    try {
      if (scanMode === "in") await loaderScanIn(manifestId, code);
      else await loaderScanOut(manifestId, code);
      setLastScanned({ code, ok: true });
      await fetchManifest();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || `Failed to scan ${scanMode}`;
      setLastScanned({ code, ok: false, msg });
    } finally {
      setScanLoading(false);
      setTimeout(() => scanInputRef.current?.focus(), 50);
    }
  };

  const promptAction = (
    title: string,
    message: string,
    label: string,
    fn: () => Promise<void>,
    danger = false,
  ) => setConfirmAction({ title, message, label, danger, fn });

  const executeAction = async () => {
    if (!confirmAction) return;
    setConfirmLoading(true);
    try {
      await confirmAction.fn();
      await fetchManifest();
      showToast.success(`${confirmAction.label} successful`);
      setConfirmAction(null);
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || err.message || "Action failed.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSealConfirm = async (sealNumber: string, notes: string) => {
    setSealSubmitting(true);
    setSealError(null);
    try {
      await loaderSealManifest(manifestId, sealNumber, notes);
      await fetchManifest();
      showToast.success("Manifest sealed");
      setSealModalOpen(false);
    } catch (err: any) {
      setSealError(err?.response?.data?.message || err.message || "Failed to seal manifest.");
    } finally {
      setSealSubmitting(false);
    }
  };

  const togglePackageSelection = (packageId: string) => {
    setSelectedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(packageId)) next.delete(packageId);
      else next.add(packageId);
      return next;
    });
  };

  const selectAllPackages = () => {
    if (!manifest?.packages) return;
    if (selectedPackages.size === manifest.packages.length) setSelectedPackages(new Set());
    else setSelectedPackages(new Set(manifest.packages.map((p) => p.packageId)));
  };

  const handleBulkRemove = () => {
    if (selectedPackages.size === 0) return;
    const ids = Array.from(selectedPackages);
    promptAction(
      "Remove Packages",
      `Remove ${ids.length} selected package${ids.length > 1 ? "s" : ""} from this manifest?`,
      "Remove",
      async () => {
        for (const id of ids) await loaderRemovePackage(manifestId, id);
        setSelectedPackages(new Set());
      },
      true,
    );
  };

  // Add this function before the return statement
  const handleLoadOnTruck = async (data: {
    transporterUserId: string;
    vehicleId?: string;
    estimatedArrival?: string;
    notes?: string;
  }) => {
    if (!manifest) return;
    setLoadLoading(true);
    try {
      // Call the API with the data
      await loaderLoadOnTruck(manifestId, data);
      await fetchManifest();
      showToast.success(`Manifest ${manifest?.manifestCode} loaded on truck`);
      setLoadModalOpen(false);
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || err.message || "Failed to load on truck.");
    } finally {
      setLoadLoading(false);
    }
  };

  const handlePrint = () => {
    if (manifest) {
      handlePrintManifest(manifest);
    }
  };

  const handleDownload = () => {
    if (manifest) {
      downloadManifestHtml(manifest);
    }
  };

  if (loading && !manifest) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh] gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: PALETTE.status.discrepancy.bg, border: `1px solid ${PALETTE.status.discrepancy.border}` }}>
          <AlertCircle size={32} style={{ color: PALETTE.status.discrepancy.base }} />
        </div>
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: PALETTE.text.primary }}>Manifest Not Found</h1>
          <p className="text-[13px]" style={{ color: PALETTE.text.muted }}>{error}</p>
        </div>
        <Link
          href="/dashboard/manifests"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:scale-105"
          style={{ background: PALETTE.status.loaded.bg, color: PALETTE.status.loaded.base, border: `1px solid ${PALETTE.status.loaded.border}` }}
        >
          <ArrowLeft size={14} /> Back to Manifests
        </Link>
      </div>
    );
  }

  const status = manifest.status as ManifestStatus;
  const sm = getStatusMeta(status);
  const isEditable = status === "open";
  const isSealable = status === "open" && (manifest.packageCount ?? 0) > 0;
  const canScanIn = status === "open";
  const canScanOut = status === "arrived" || status === "unloading";
  const scanAllowed = canScanIn || canScanOut;

  const originName = manifest.originBranchId.name ?? "Origin";
  const destName = manifest.destinationBranchId.name ?? "Destination";
  const originCode = manifest.originBranchId.code;
  const destCode = manifest.destinationBranchId.code;

  const createdAt = manifest.createdAt
    ? new Date(manifest.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const updatedAt = (manifest as any).updatedAt
    ? new Date((manifest as any).updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : createdAt;

  const filteredPackages = manifest.packages?.filter((pkg) =>
    !packageFilter
    || pkg.trackingNumber?.toLowerCase().includes(packageFilter.toLowerCase())
    || pkg.entryStatus?.toLowerCase().includes(packageFilter.toLowerCase())
  ) || [];

  // The single primary action for the current status — shown once, in the header.
  let primaryAction: React.ReactNode = null;

  if (status === "open") {
    primaryAction = (
      <ActionButton
        onClick={() => { setSealError(null); setSealModalOpen(true); }}
        disabled={!isSealable}
        title={!isSealable ? "Add at least one package before sealing" : undefined}
        label="Seal Manifest"
        icon={<ShieldCheck size={16} />}
        fullWidth={false}
        color={{ text: PALETTE.status.sealed.base, bg: PALETTE.status.sealed.bg, border: PALETTE.status.sealed.border, hoverBg: "rgba(167,139,250,0.14)", glow: PALETTE.status.sealed.glow }}
      />
    );
  } else if (status === "sealed") {
    primaryAction = (
      <ActionButton
        onClick={() => setLoadModalOpen(true)}
        label="Load on Truck"
        icon={<Truck size={16} />}
        fullWidth={false}
        color={{
          text: PALETTE.status.loaded.base,
          bg: PALETTE.status.loaded.bg,
          border: PALETTE.status.loaded.border,
          hoverBg: "rgba(251,191,36,0.14)",
          glow: PALETTE.status.loaded.glow
        }}
      />
    );
  } else if (status === "loaded") {
    primaryAction = (
      <ActionButton
        onClick={() => promptAction("Depart Manifest", `Mark manifest ${manifest.manifestCode} as departed? The truck is now in transit.`, "Depart", () => loaderDepartManifest(manifestId))}
        label="Depart Truck"
        icon={<Send size={16} />}
        fullWidth={false}
        color={{ text: PALETTE.status.in_transit.base, bg: PALETTE.status.in_transit.bg, border: PALETTE.status.in_transit.border, hoverBg: "rgba(56,189,248,0.14)", glow: PALETTE.status.in_transit.glow }}
      />
    );
  } else if (status === "in_transit") {
    primaryAction = (
      <ActionButton
        onClick={() => promptAction("Mark Arrived", `Confirm that manifest ${manifest.manifestCode} has arrived at the destination branch?`, "Arrive", () => loaderArriveManifest(manifestId))}
        label="Mark Arrived"
        icon={<MapPin size={16} />}
        fullWidth={false}
        color={{ text: PALETTE.status.arrived.base, bg: PALETTE.status.arrived.bg, border: PALETTE.status.arrived.border, hoverBg: "rgba(45,212,191,0.14)", glow: PALETTE.status.arrived.glow }}
      />
    );
  } else if (status === "arrived" || status === "unloading") {
    primaryAction = (
      <ActionButton
        onClick={() => promptAction("Close Manifest", `Close manifest ${manifest.manifestCode}? This marks unloading as complete.`, "Close", () => loaderCloseManifest(manifestId))}
        label="Close Manifest"
        icon={<CheckCircle2 size={16} />}
        fullWidth={false}
        color={{ text: PALETTE.complete.base, bg: PALETTE.complete.bg, border: PALETTE.complete.border, hoverBg: "rgba(52,211,153,0.14)", glow: PALETTE.complete.glow }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 min-h-0">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/manifests"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
              style={{ color: PALETTE.text.muted, background: "rgba(255,255,255,0.03)", border: `1px solid ${PALETTE.border.subtle}` }}
            >
              <ArrowLeft size={12} /> Manifests
            </Link>
            <ChevronRight size={12} style={{ color: PALETTE.text.disabled }} />
            <span className="text-[11px] font-mono" style={{ color: PALETTE.text.disabled }}>{manifest.manifestCode}</span>
          </div>

          <div className="flex items-center gap-2">
            <IconButton icon={<Printer size={14} />} label="Print manifest" onClick={handlePrint} />
            <IconButton icon={<Download size={14} />} label="Download manifest" onClick={handleDownload} />
            <div className="w-px h-5 mx-1" style={{ background: PALETTE.border.subtle }} />
            <IconButton icon={<RotateCcw size={14} />} label="Refresh" onClick={fetchManifest} />
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="w-1 h-8 rounded-full" style={{ background: PALETTE.gradient.header }} />
              <h1 className="text-[24px] font-bold tracking-tight font-mono truncate" style={{ color: PALETTE.text.primary }}>
                {manifest.manifestCode}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0" style={{ background: sm.bg, border: `1px solid ${sm.border}` }}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${sm.pulse ? "animate-pulse" : ""}`} style={{ background: sm.dot, boxShadow: sm.pulse ? `0 0 10px ${sm.dot}80` : "none" }} />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: sm.color }}>{sm.label}</span>
              </div>
              {!primaryAction && (status === "closed" || status === "cancelled") && (
                <span className="text-[11px]" style={{ color: PALETTE.text.disabled }}>No further actions</span>
              )}
            </div>

            <div className="flex items-center gap-3 ml-4 flex-wrap">
              {originCode && destCode && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${PALETTE.border.subtle}` }}>
                  <span className="text-[11px] font-bold font-mono" style={{ color: PALETTE.status.open.base }}>{originCode}</span>
                  <ArrowRight size={12} style={{ color: PALETTE.text.disabled }} />
                  <span className="text-[11px] font-bold font-mono" style={{ color: PALETTE.status.arrived.base }}>{destCode}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: PALETTE.text.muted }}>
                <Calendar size={12} /> Created {createdAt}
              </div>
              {updatedAt !== createdAt && (
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: PALETTE.text.muted }}>
                  <Clock size={12} /> Updated {updatedAt}
                </div>
              )}
            </div>
          </div>

          {primaryAction && <div className="shrink-0">{primaryAction}</div>}
        </div>
      </div>

      {error && <ErrorBaner error={error} setError={setError} />}

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Packages" value={manifest.packageCount ?? 0} icon={<Package size={16} />} color={PALETTE.status.open.base} />
        <StatCard label="Total Weight" value={`${manifest.totalDeclaredWeight ?? 0} kg`} icon={<Weight size={16} />} color={PALETTE.status.loaded.base} />
        <StatCard label="Origin Branch" value={originCode || "—"} icon={<Building2 size={16} />} color={PALETTE.status.sealed.base} />
        <StatCard label="Destination" value={destCode || "—"} icon={<MapPin size={16} />} color={PALETTE.status.arrived.base} />
      </div>

      {/* ═══ MAIN CONTENT GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 flex-1 min-h-0">

        {/* ── Left column ── */}
        <div className="flex flex-col gap-4">

          <GlassCard className="p-5">
            <SectionHeader icon={<Activity size={12} />} label="Manifest Details" />
            <div className="grid grid-cols-1 gap-2">
              <InfoPill label="Origin" value={originName} icon={<MapPin size={12} />} color={PALETTE.status.open.base} />
              <InfoPill label="Destination" value={destName} icon={<MapPin size={12} />} color={PALETTE.status.arrived.base} />
              <InfoPill label="Route" value={`${originCode || "—"} → ${destCode || "—"}`} icon={<Route size={12} />} color={PALETTE.status.in_transit.base} />
              <InfoPill label="Created" value={createdAt} icon={<Calendar size={12} />} />
              {manifest.sealInfo && (
                <InfoPill label="Seal Number" value={manifest.sealInfo.sealNumber} mono icon={<ShieldCheck size={12} />} color={PALETTE.status.sealed.base} />
              )}
            </div>
          </GlassCard>

          <Scanner
            scanMode={scanMode}
            setScanMode={setScanMode}
            scanInput={scanInput}
            setScanInput={setScanInput}
            scanLoading={scanLoading}
            lastScanned={lastScanned}
            scanAllowed={scanAllowed}
            canScanIn={canScanIn}
            canScanOut={canScanOut}
            onScan={handleScan}
            scanInputRef={scanInputRef}
          />
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4 min-h-0">

          <GlassCard className="flex flex-col flex-1 min-h-0">
            <div className="px-5 py-4 flex items-center justify-between border-b shrink-0 flex-wrap gap-3" style={{ borderColor: PALETTE.border.subtle, background: "rgba(255,255,255,0.015)" }}>
              <div className="flex items-center gap-3">
                <SectionHeader icon={<Package size={12} />} label="Packages" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0" style={{ background: PALETTE.status.loaded.bg, color: PALETTE.status.loaded.base, border: `1px solid ${PALETTE.status.loaded.border}` }}>
                  {manifest.packageCount ?? 0}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${PALETTE.border.subtle}` }}>
                  <Search size={12} style={{ color: PALETTE.text.muted }} />
                  <input
                    type="text"
                    placeholder="Filter packages..."
                    value={packageFilter}
                    onChange={(e) => setPackageFilter(e.target.value)}
                    className="bg-transparent text-[11px] focus:outline-none w-32"
                    style={{ color: PALETTE.text.primary }}
                  />
                  {packageFilter && (
                    <button onClick={() => setPackageFilter("")} style={{ color: PALETTE.text.muted }}>
                      <X size={12} />
                    </button>
                  )}
                </div>

                {isEditable && manifest.packages && manifest.packages.length > 0 && (
                  <button
                    onClick={selectAllPackages}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    style={{ color: PALETTE.text.muted, background: "rgba(255,255,255,0.03)", border: `1px solid ${PALETTE.border.subtle}` }}
                  >
                    {selectedPackages.size === manifest.packages.length ? "Deselect All" : "Select All"}
                  </button>
                )}

                {isEditable && selectedPackages.size > 0 && (
                  <button
                    onClick={handleBulkRemove}
                    className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                    style={{ color: PALETTE.status.discrepancy.base, background: PALETTE.status.discrepancy.bg, border: `1px solid ${PALETTE.status.discrepancy.border}` }}
                  >
                    <Trash2 size={11} /> Remove {selectedPackages.size}
                  </button>
                )}
              </div>
            </div>

            {filteredPackages.length > 0 && (
              <div className="hidden md:grid grid-cols-[40px_1fr_100px_100px_72px] gap-4 px-5 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
                <div />
                {["Tracking #", "Weight", "Status", ""].map((h, i) => (
                  <div key={i} className="text-[9.5px] uppercase tracking-[0.13em] font-semibold" style={{ color: PALETTE.text.disabled }}>{h}</div>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {filteredPackages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${PALETTE.border.subtle}` }}>
                    <Package size={24} style={{ color: PALETTE.text.disabled }} />
                  </div>
                  <p className="text-[13px] font-medium mb-1" style={{ color: PALETTE.text.muted }}>
                    {packageFilter ? "No packages match your filter" : "No packages scanned in yet"}
                  </p>
                  {canScanIn && !packageFilter && (
                    <p className="text-[11px]" style={{ color: PALETTE.text.disabled }}>Use the scanner on the left to add packages</p>
                  )}
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                  {filteredPackages.map((pkg) => (
                    <div key={pkg.packageId} className="grid grid-cols-[40px_1fr_100px_100px_72px] gap-4 px-5 py-3 items-center hover:bg-white/[0.015] transition-colors group">
                      <div className="flex items-center">
                        {isEditable ? (
                          <button
                            onClick={() => togglePackageSelection(pkg.packageId)}
                            className="w-5 h-5 rounded border flex items-center justify-center transition-all"
                            style={{
                              borderColor: selectedPackages.has(pkg.packageId) ? PALETTE.status.open.base : PALETTE.border.subtle,
                              background: selectedPackages.has(pkg.packageId) ? `${PALETTE.status.open.base}20` : "transparent",
                            }}
                          >
                            {selectedPackages.has(pkg.packageId) && <Check size={12} style={{ color: PALETTE.status.open.base }} />}
                          </button>
                        ) : <div className="w-5 h-5" />}
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${PALETTE.border.subtle}` }}>
                          <Hash size={11} style={{ color: PALETTE.text.disabled }} />
                        </div>
                        <span className="text-[12.5px] font-semibold font-mono truncate" style={{ color: PALETTE.text.primary }}>{pkg.trackingNumber}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[12px] font-mono" style={{ color: PALETTE.text.secondary }}>
                        <Weight size={11} style={{ color: PALETTE.text.disabled }} />
                        {pkg.weight} kg
                      </div>

                      <div>
                        <EntryStatusChip status={pkg.entryStatus} />
                      </div>

                      <div className="flex justify-end">
                        {isEditable && pkg.entryStatus === "in_manifest" && (
                          <button
                            onClick={() => promptAction("Remove Package", `Remove package ${pkg.trackingNumber} from this manifest?`, "Remove", () => loaderRemovePackage(manifestId, pkg.packageId), true)}
                            title={`Remove ${pkg.trackingNumber}`}
                            aria-label={`Remove ${pkg.trackingNumber}`}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors opacity-60 group-hover:opacity-100"
                            style={{ color: PALETTE.status.discrepancy.base }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredPackages.length > 0 && (
              <div className="px-5 py-2 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
                <span className="text-[10px]" style={{ color: PALETTE.text.disabled }}>
                  {filteredPackages.length} of {manifest.packages?.length ?? 0} packages
                </span>
                {selectedPackages.size > 0 && (
                  <span className="text-[10px] font-bold" style={{ color: PALETTE.status.open.base }}>{selectedPackages.size} selected</span>
                )}
              </div>
            )}
          </GlassCard>

          {canScanIn && awaitingPackages.length > 0 && (
            <GlassCard style={{ border: `1px solid ${PALETTE.status.loaded.border}` }}>
              <div className="px-5 py-4 flex items-center justify-between border-b shrink-0" style={{ borderColor: PALETTE.status.loaded.border, background: PALETTE.status.loaded.bg }}>
                <div className="flex items-center gap-3">
                  <SectionHeader icon={<AlertCircle size={12} />} label="Awaiting Transport" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0" style={{ background: PALETTE.status.loaded.bg, color: PALETTE.status.loaded.base, border: `1px solid ${PALETTE.status.loaded.border}` }}>
                    {awaitingPackages.filter((p) => !manifest.packages?.find((mp: any) => mp._id === p._id || mp.trackingNumber === p.trackingNumber)).length}
                  </span>
                </div>
                <span className="text-[10px]" style={{ color: PALETTE.text.muted }}>Click to scan in</span>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {awaitingPackages.map((pkg: any) => {
                  const alreadyIn = manifest.packages?.find((mp: any) => mp._id === pkg._id || mp.trackingNumber === pkg.trackingNumber);
                  if (alreadyIn) return null;
                  return (
                    <div
                      key={pkg._id}
                      className="group flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => { setScanInput(pkg.trackingNumber); setScanMode("in"); scanInputRef.current?.focus(); }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${PALETTE.status.loaded.base}10`, border: `1px solid ${PALETTE.status.loaded.border}` }}>
                        <Package size={14} style={{ color: PALETTE.status.loaded.base }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-semibold font-mono truncate block" style={{ color: PALETTE.text.primary }}>{pkg.trackingNumber}</span>
                        <span className="text-[10.5px]" style={{ color: PALETTE.text.muted }}>
                          {pkg.destinationBranch?.name ?? "Unknown"} · {pkg.weight ?? 0} kg
                        </span>
                      </div>
                      <div
                        className="opacity-60 group-hover:opacity-100 transition-all flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                        style={{ background: PALETTE.status.loaded.bg, color: PALETTE.status.loaded.base, border: `1px solid ${PALETTE.status.loaded.border}` }}
                      >
                        <ScanLine size={10} /> SCAN IN
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Seal Manifest Modal */}
      {sealModalOpen && (
        <SealManifestModal
          manifestCode={manifest.manifestCode}
          packageCount={manifest.packageCount ?? 0}
          totalWeight={manifest.totalDeclaredWeight ?? 0}
          loading={sealSubmitting}
          error={sealError}
          onConfirm={handleSealConfirm}
          onCancel={() => { if (!sealSubmitting) setSealModalOpen(false); }}
        />
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.label}
          danger={confirmAction.danger}
          loading={confirmLoading}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Load on Truck Modal */}
      {loadModalOpen && (
        <LoadOnTruckModal
          isOpen={loadModalOpen}
          onClose={() => !loadLoading && setLoadModalOpen(false)}
          manifestCode={manifest.manifestCode}
          onConfirm={handleLoadOnTruck}
          loading={loadLoading}
        />
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.label}
          danger={confirmAction.danger}
          loading={confirmLoading}
          onConfirm={executeAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}