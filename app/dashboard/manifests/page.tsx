"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loaderCreateManifest } from "@/services/LoaderService";
import { Search, Plus, Truck, AlertCircle, Loader2 } from "lucide-react";
import userStore from "@/stores/userStore";

export default function ManifestsPage() {
  const router = useRouter();
  const { user } = userStore();
  const [manifestIdSearch, setManifestIdSearch] = useState("");
  
  // Create Manifest State
  const [isCreating, setIsCreating] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destBranch, setDestBranch] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manifestIdSearch.trim()) {
      router.push(`/dashboard/manifests/${manifestIdSearch.trim()}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destBranch) {
      setError("Destination branch is required.");
      return;
    }
    
    try {
      setCreateLoading(true);
      setError(null);
      
      const res = await loaderCreateManifest({
        destinationBranchId: destBranch,
        vehicleId: vehicleId || undefined
      });
      
      if (res.success && res.data?._id) {
        router.push(`/dashboard/manifests/${res.data._id}`);
      } else {
        setError("Failed to create manifest.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manifest Operations</h1>
          <p className="text-slate-400 text-sm mt-1">Create or manage delivery manifests.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-amber-500 text-slate-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/20"
        >
          <Plus size={18} />
          New Manifest
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Existing Manifest */}
        <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Search size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Find Manifest</h2>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Manifest ID / Barcode</label>
              <input
                type="text"
                autoFocus
                placeholder="Scan or enter Manifest ID"
                value={manifestIdSearch}
                onChange={(e) => setManifestIdSearch(e.target.value)}
                className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!manifestIdSearch.trim()}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              Open Manifest
            </button>
          </form>
        </div>

        {/* Create New Manifest Form */}
        {isCreating && (
          <div className="bg-[#0d1117] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden animate-in slide-in-from-right-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Truck size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Create New Manifest</h2>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm">
                <AlertCircle size={16} />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Destination Branch ID</label>
                <input
                  type="text"
                  placeholder="e.g. 64abc123..."
                  value={destBranch}
                  onChange={(e) => setDestBranch(e.target.value)}
                  className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Vehicle ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. V-1002"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-[#161b22] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full bg-amber-500 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
              >
                {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create & Start Scanning"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
