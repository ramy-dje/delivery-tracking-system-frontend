"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  loaderGetManifestDetail, loaderScanIn, loaderScanOut, 
  loaderSealManifest, loaderDepartManifest, loaderArriveManifest,
  loaderCloseManifest, loaderRemovePackage, loaderGetPackagesToManifest
} from "@/services/LoaderService";
import { ArrowLeft, Package, Truck, CheckCircle2, AlertCircle, Loader2, ScanLine, XCircle, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";

export default function ManifestDetailPage() {
  const params = useParams();
  const manifestId = params.id as string;
  const router = useRouter();

  const [manifest, setManifest] = useState<any>(null);
  const [awaitingPackages, setAwaitingPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scanning State
  const [scanInput, setScanInput] = useState("");
  const [scanMode, setScanMode] = useState<"in" | "out">("in");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchManifest = async () => {
    try {
      setError(null);
      const res = await loaderGetManifestDetail(manifestId);
      if (res.success) {
        setManifest(res.data);
        
        // Try to fetch packages awaiting transport for this manifest's destination
        try {
          const destId = res.data.destinationBranchId?._id || res.data.destinationBranchId || res.data.destinationBranch?.id || res.data.destinationBranch?._id || res.data.destinationBranch;
          if (destId) {
            const pkgsRes = await loaderGetPackagesToManifest(destId);
            if (pkgsRes && pkgsRes.data) {
              setAwaitingPackages(pkgsRes.data.packages || []);
            }
          } else {
            console.warn("Could not determine destId from manifest:", res.data);
          }
        } catch (pkgErr) {
          console.warn("Could not fetch awaiting packages:", pkgErr);
        }

      } else {
        setError(res.message || "Manifest not found.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load manifest.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (manifestId) fetchManifest();
  }, [manifestId]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    const pkgId = scanInput.trim();
    setScanInput(""); // Clear input immediately for next scan
    
    try {
      setActionLoading(true);
      setError(null);
      if (scanMode === "in") {
        await loaderScanIn(manifestId, pkgId);
      } else {
        await loaderScanOut(manifestId, pkgId);
      }
      await fetchManifest();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || `Failed to scan ${scanMode} package.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStateAction = async (actionFn: (id: string) => Promise<any>, actionName: string) => {
    if (!confirm(`Are you sure you want to ${actionName} this manifest?`)) return;
    try {
      setActionLoading(true);
      setError(null);
      await actionFn(manifestId);
      await fetchManifest();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || `Failed to ${actionName}.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !manifest) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex flex-col items-center justify-center text-center mt-20">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Manifest Not Found</h1>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link href="/dashboard/manifests" className="text-amber-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Search
        </Link>
      </div>
    );
  }

  const status = manifest.status; // pending, loading, sealed, in_transit, arrived, delivered

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/manifests" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Manifests
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Manifest <span className="font-mono text-amber-400">{manifest.manifestNumber || manifest._id.slice(-6).toUpperCase()}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 bg-[#0d1117] border border-white/5 rounded-xl px-4 py-2">
          <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-amber-500' : status === 'sealed' ? 'bg-blue-500' : status === 'in_transit' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
          <span className="text-sm font-bold uppercase tracking-wider text-slate-300">{status.replace('_', ' ')}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Actions & Scanner */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Action Panel */}
          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Manifest Actions</h2>
            <div className="space-y-3">
              {status === "pending" || status === "loading" ? (
                <button
                  onClick={() => handleStateAction(loaderSealManifest, "seal")}
                  disabled={actionLoading || manifest.packages?.length === 0}
                  className="w-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <ShieldCheck size={18} /> Seal Manifest
                </button>
              ) : null}

              {status === "sealed" ? (
                <button
                  onClick={() => handleStateAction(loaderDepartManifest, "depart")}
                  disabled={actionLoading}
                  className="w-full bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <Truck size={18} /> Depart Truck
                </button>
              ) : null}

              {status === "in_transit" ? (
                <button
                  onClick={() => handleStateAction(loaderArriveManifest, "arrive")}
                  disabled={actionLoading}
                  className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <MapPin size={18} /> Mark Arrived
                </button>
              ) : null}

              {status === "arrived" ? (
                <button
                  onClick={() => handleStateAction(loaderCloseManifest, "close")}
                  disabled={actionLoading}
                  className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 size={18} /> Close Manifest
                </button>
              ) : null}
            </div>
          </div>

          {/* Scanner Panel */}
          <div className={`bg-[#0d1117] border ${scanMode === 'in' ? 'border-amber-500/30' : 'border-emerald-500/30'} rounded-2xl p-6 relative overflow-hidden transition-colors duration-300`}>
            {/* Background Glow */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${scanMode === 'in' ? 'bg-amber-500/10' : 'bg-emerald-500/10'} pointer-events-none`} />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Scanner</h2>
              <div className="flex bg-[#161b22] rounded-lg p-1">
                <button
                  onClick={() => setScanMode("in")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${scanMode === "in" ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                >
                  SCAN IN
                </button>
                <button
                  onClick={() => setScanMode("out")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${scanMode === "out" ? "bg-emerald-500 text-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                >
                  SCAN OUT
                </button>
              </div>
            </div>

            <form onSubmit={handleScan} className="relative z-10">
              <div className="relative flex items-center bg-[#161b22] border border-white/10 rounded-xl overflow-hidden focus-within:border-white/30 transition-colors">
                <div className={`pl-4 pr-2 ${scanMode === 'in' ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <ScanLine size={20} />}
                </div>
                <input
                  type="text"
                  autoFocus
                  placeholder={`Scan package to ${scanMode}...`}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  disabled={actionLoading || status === "sealed" || status === "in_transit" || status === "delivered"}
                  className="flex-1 bg-transparent border-none text-white px-2 py-4 focus:outline-none font-mono tracking-wider placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Press Enter to submit or use a physical barcode scanner.
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Details & Package List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Destination</p>
              <p className="text-sm font-bold text-white">{manifest.destinationBranchId?.name || manifest.destinationBranch?.name || manifest.destinationBranchId || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Vehicle</p>
              <p className="text-sm font-bold text-white">{manifest.vehicle?.plateNumber || manifest.vehicle || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Packages</p>
              <p className="text-sm font-bold text-white">{manifest.packages?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Loaded By</p>
              <p className="text-sm font-bold text-white">{manifest.originLoader?.firstName ? `${manifest.originLoader.firstName} ${manifest.originLoader.lastName}` : "Unknown"}</p>
            </div>
          </div>

          {/* Package List */}
          <div className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-sm font-bold text-slate-300">Packages in Manifest</h2>
            </div>
            <div className="divide-y divide-white/5">
              {(!manifest.packages || manifest.packages.length === 0) ? (
                <div className="p-8 text-center text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No packages scanned into this manifest yet.</p>
                </div>
              ) : (
                manifest.packages.map((pkg: any) => (
                  <div key={pkg._id || pkg} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white font-mono">{pkg.trackingNumber || pkg.packageId || pkg._id || "Unknown ID"}</p>
                        <p className="text-xs text-slate-500">{pkg.status?.replace('_', ' ') || "In Manifest"}</p>
                      </div>
                    </div>
                    {/* Allow removal if still pending/loading */}
                    {(status === "pending" || status === "loading") && (
                      <button
                        onClick={() => handleStateAction(() => loaderRemovePackage(manifestId, pkg._id || pkg.packageId || pkg), "remove package")}
                        className="text-slate-500 hover:text-red-400 p-2 transition-colors"
                        title="Remove from manifest"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Packages Awaiting Manifest (Only shown if open/loading) */}
          {(status === "pending" || status === "open" || status === "loading") && awaitingPackages.length > 0 && (
            <div className="bg-[#0d1117] border border-amber-500/20 rounded-2xl overflow-hidden mt-6">
              <div className="p-4 border-b border-white/5 bg-amber-500/5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                  <AlertCircle size={16} /> Packages Awaiting Transport
                </h2>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                  {awaitingPackages.length} Packages
                </span>
              </div>
              <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                {awaitingPackages.map((pkg: any) => {
                  // Don't show if it's already in this manifest
                  if (manifest.packages?.find((mp: any) => (mp._id === pkg._id || mp.trackingNumber === pkg.trackingNumber))) return null;

                  return (
                    <div key={pkg._id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white font-mono">{pkg.trackingNumber}</p>
                          <p className="text-xs text-slate-500">
                            {pkg.destinationBranch?.name || 'Unknown Dest'} • {pkg.weight || 0}kg
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setScanInput(pkg.trackingNumber);
                          setScanMode("in");
                          // The actual scan needs to be submitted manually or we can call handleScan directly, 
                          // but since handleScan expects an event, we just auto-fill the input so they can hit enter.
                        }}
                        className="text-amber-500 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                      >
                        SELECT
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
