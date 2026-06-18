"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  listManifests,
  loaderCreateManifest,
  loaderGetPackagesToManifestGrouped,
} from "@/services/LoaderService";
import {
  Search,
  Plus,
  Loader2,
  MapPin,
  Package,
  X,
  FileText,
  ArrowRight,
} from "lucide-react";
import userStore from "@/stores/userStore";
import StatCard from "@/components/commons/StatCard";
import ErrorBaner from "@/components/commons/ErrorBaner";
import { showToast } from "nextjs-toast-notify";
import { parseApiError } from "@/utils/apiErrorHandler";
import Pagination from "@/components/commons/Pagination";
import { IManifest } from "@/types/manifest";
import ManifestList from "@/components/dashboard/manifests/ManifestList";
import CreateManifestModal from "@/components/dashboard/manifests/CreateManifestModal";

export default function ManifestsPage() {
  const router = useRouter();
  const { user } = userStore();

  // ── List State ─────────────────────────────────────────────────────────
  const [manifests, setManifests] = useState<IManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ── Create State ───────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [prefillBranchId, setPrefillBranchId] = useState<string | undefined>();

  // ── Search/Navigate State ──────────────────────────────────────────────
  const [manifestIdSearch, setManifestIdSearch] = useState("");

  // ── Grouped Packages ───────────────────────────────────────────────────
  const [groupedPackages, setGroupedPackages] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // ── Fetch Manifests ────────────────────────────────────────────────────
  const fetchManifests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listManifests({ pageSize, pageNumber, search: search || undefined });
      if (res.success) {
        setManifests(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (e: any) {
      const err = parseApiError(e);
      setError(err.message ?? "Failed to fetch manifests");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search]);

  useEffect(() => {
    const delay = setTimeout(() => fetchManifests(), 400);
    return () => clearTimeout(delay);
  }, [fetchManifests]);

  // ── Fetch Grouped Packages ─────────────────────────────────────────────
  const fetchGroupedPackages = async () => {
    try {
      setLoadingGroups(true);
      const res = await loaderGetPackagesToManifestGrouped();
      if (res.success) {
        setGroupedPackages(res.data?.destinations || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroupedPackages();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────
  const inTransitCount = manifests.filter((m) => m.status === "in_transit").length;
  const totalCount = manifests.length;

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manifestIdSearch.trim()) {
      router.push(`/dashboard/manifests/${manifestIdSearch.trim()}`);
    }
  };

  const handleCreate = async (data: {
    destinationBranchId: string;
    vehicleId?: string;
    driverId?: string;
    plannedDeparture?: string;
  }) => {
    setCreateLoading(true);
    try {
      const res = await loaderCreateManifest(data);
      if (res.success && (res.data?.manifestId || res.data?._id)) {
        showToast.success("Manifest created successfully");
        setCreateOpen(false);
        setPrefillBranchId(undefined);
        router.push(`/dashboard/manifests/${res.data.manifestId || res.data._id}`);
      } else {
        showToast.error("Failed to create manifest.");
      }
    } catch (e: any) {
      const err = parseApiError(e);
      showToast.error(err.message ?? "An error occurred.");
    } finally {
      setCreateLoading(false);
    }
  };

  const openCreateForBranch = (branchId: string) => {
    setPrefillBranchId(branchId);
    setCreateOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 h-full min-h-0">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-1 h-6 rounded-full"
              style={{ background: "linear-gradient(180deg,#fbbf24,#f59e0b66)" }}
            />
            <h1 className="text-[22px] font-bold text-white tracking-tight">Manifests</h1>
          </div>
          <p className="text-[13px] text-slate-500 ml-3.5 pl-0.5">
            Create and manage delivery manifests.
          </p>
        </div>
        <button
          onClick={() => { setPrefillBranchId(undefined); setCreateOpen(true); }}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-background-main transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
            boxShadow: "0 4px 16px rgba(251,191,36,0.2)",
          }}
        >
          <Plus size={13} />
          New Manifest
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total" value={totalCount} accent="#94a3b8" />
        <StatCard label="In Transit" value={inTransitCount} accent="#fbbf24" />
      </div>

      {error && <ErrorBaner error={error} setError={setError} />}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Free-text search */}
        <div
          className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Search size={13} className="text-slate-700 shrink-0" />
          <input
            type="text"
            placeholder="Search manifests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-700 hover:text-slate-500">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Quick jump by ID */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <FileText size={13} className="text-slate-700 shrink-0" />
            <input
              type="text"
              placeholder="Jump to Manifest ID…"
              value={manifestIdSearch}
              onChange={(e) => setManifestIdSearch(e.target.value)}
              className="bg-transparent text-[12.5px] text-white placeholder:text-slate-700 focus:outline-none w-44 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!manifestIdSearch.trim()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold text-slate-300 border border-white/[0.07] hover:border-white/13 transition-all disabled:opacity-40"
          >
            <ArrowRight size={13} />
            Open
          </button>
        </form>

        <span className="text-[11px] text-slate-700 ml-auto hidden sm:block tabular-nums">
          {manifests.length} manifest{manifests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Manifest List */}
      <ManifestList
        manifests={manifests}
        loading={loading}
        onAddClick={() => { setPrefillBranchId(undefined); setCreateOpen(true); }}
        onView={(id) => router.push(`/dashboard/manifests/${id}`)}
      />

      {totalPages > 1 && (
        <Pagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          hasNext={pageNumber < totalPages}
          hasPrev={pageNumber > 1}
          onChange={(p) => setPageNumber(p)}
        />
      )}

      {/* Packages Awaiting Manifest */}
      <div className="mt-2 space-y-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: "rgba(251,191,36,0.1)",
              border: "1px solid rgba(251,191,36,0.15)",
            }}
          >
            <Package size={10} style={{ color: "#fbbf24" }} />
          </div>
          <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400 whitespace-nowrap">
            Packages Awaiting Manifest
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>

        {loadingGroups ? (
          <div
            className="flex justify-center items-center py-8 rounded-xl"
            style={{ background: "#060a10", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : groupedPackages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
            style={{ background: "#060a10", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <Package className="w-8 h-8 mb-2 text-slate-700" />
            <p className="text-[12px] text-slate-600">No packages waiting to be manifested.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groupedPackages.map((group: any) => (
              <div
                key={group.branchId}
                className="group rounded-xl p-4 transition-all hover:border-amber-500/30"
                style={{
                  background: "#060a10",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(251,191,36,0.1)",
                        border: "1px solid rgba(251,191,36,0.15)",
                      }}
                    >
                      <MapPin size={13} style={{ color: "#fbbf24" }} />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-100 truncate">
                      {group.branchName || group.branchId}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded ml-2 shrink-0"
                    style={{
                      background: "rgba(251,191,36,0.1)",
                      color: "#fbbf24",
                      border: "1px solid rgba(251,191,36,0.15)",
                    }}
                  >
                    {group.packageCount} pkgs
                  </span>
                </div>

                <div className="text-[11.5px] text-slate-500 mb-3">
                  Total weight:{" "}
                  <span className="text-slate-400 font-medium">{group.totalWeight} kg</span>
                </div>

                <button
                  onClick={() => openCreateForBranch(group.branchId)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold text-slate-300 transition-all hover:text-white"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <Plus size={12} />
                  Create Manifest
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateManifestModal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setPrefillBranchId(undefined); }}
        onSubmit={handleCreate}
        loading={createLoading}
        prefillDestinationBranchId={prefillBranchId}
      />
    </div>
  );
}
