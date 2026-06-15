"use client";

import React, { useEffect, useState } from "react";
import { loaderCheckIn, loaderCheckOut, loaderGetMyShift, loaderGetMyStats } from "@/services/LoaderService";
import { Package, Truck, AlertCircle, Clock, CheckCircle2, Play, Square, Loader2, MapPin } from "lucide-react";

export default function LoaderDashboard() {
  const [shift, setShift] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [shiftRes, statsRes] = await Promise.all([
        loaderGetMyShift().catch(() => ({ data: null })),
        loaderGetMyStats().catch(() => ({ data: null }))
      ]);
      setShift(shiftRes?.data || null);
      setStats(statsRes?.data || null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleShiftAction = async (action: "in" | "out") => {
    try {
      setActionLoading(true);
      setError(null);
      if (action === "in") {
        await loaderCheckIn();
      } else {
        await loaderCheckOut();
      }
      await fetchDashboardData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || `Failed to check ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isCheckedIn = shift?.isCheckedIn === true;
  const currentShift = shift?.shift;
  const activeManifests = shift?.activeManifests || [];
  const arrivingManifests = shift?.arrivingManifests || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Loader Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your shift, manifests, and packages.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SHIFT CARD */}
        <div className="lg:col-span-1 bg-[#0d1117] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
          {isCheckedIn ? (
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
          ) : (
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-600" />
          )}
          
          <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
            {isCheckedIn ? (
              <Clock className="w-10 h-10 text-amber-400" />
            ) : (
              <Square className="w-10 h-10 text-slate-500" />
            )}
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            {isCheckedIn ? "Shift Active" : "Shift Inactive"}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {isCheckedIn 
              ? `Started at ${new Date(currentShift?.startedAt || Date.now()).toLocaleTimeString()}`
              : "You are currently off-duty. Check in to begin loading."}
          </p>

          <button
            onClick={() => handleShiftAction(isCheckedIn ? "out" : "in")}
            disabled={actionLoading}
            className={`w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isCheckedIn
                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                : "bg-amber-500 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
            }`}
          >
            {actionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isCheckedIn ? (
              <>
                <Square size={18} fill="currentColor" /> Check Out
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" /> Check In
              </>
            )}
          </button>
        </div>

        {/* STATS OVERVIEW */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
              <Package size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.packagesLoadedToday || 0}</p>
              <p className="text-slate-400 text-sm font-medium mt-1">Packages Loaded Today</p>
            </div>
          </div>

          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.manifestsHandledToday || 0}</p>
              <p className="text-slate-400 text-sm font-medium mt-1">Manifests Handled</p>
            </div>
          </div>

          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.packagesScannedOutToday || 0}</p>
              <p className="text-slate-400 text-sm font-medium mt-1">Packages Unloaded Today</p>
            </div>
          </div>

          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{stats?.discrepanciesFlagged || 0}</p>
              <p className="text-slate-400 text-sm font-medium mt-1">Discrepancies Flagged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Manifests Section */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Active Manifests (Origin)</h2>
          <a href="/dashboard/manifests" className="text-amber-500 hover:underline text-sm font-medium">View All</a>
        </div>
        
        {activeManifests.length === 0 ? (
          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-8 text-center text-slate-500">
            <Truck className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No active manifests at your branch right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeManifests.map((m: any) => (
              <a 
                key={m._id} 
                href={`/dashboard/manifests/${m._id}`}
                className="bg-[#0d1117] border border-white/10 rounded-xl p-5 hover:border-amber-500/50 hover:bg-white/[0.02] transition-colors group block"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono font-bold text-white group-hover:text-amber-400 transition-colors">
                    {m.manifestCode || m._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md font-bold uppercase">
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400 mt-4">
                  <div className="flex items-center gap-1"><Package size={14} /> {m.packageCount || 0} Pkgs</div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold group-hover:translate-x-1 transition-transform">
                    SCAN IN <Play size={12} fill="currentColor" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <h2 className="text-xl font-bold text-white">Arriving Manifests (Destination)</h2>
        </div>
        
        {arrivingManifests.length === 0 ? (
          <div className="bg-[#0d1117] border border-white/5 rounded-2xl p-8 text-center text-slate-500">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>No manifests arriving at your branch right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {arrivingManifests.map((m: any) => (
              <a 
                key={m._id} 
                href={`/dashboard/manifests/${m._id}`}
                className="bg-[#0d1117] border border-white/10 rounded-xl p-5 hover:border-emerald-500/50 hover:bg-white/[0.02] transition-colors group block"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {m.manifestCode || m._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md font-bold uppercase">
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400 mt-4">
                  <div className="flex items-center gap-1"><Package size={14} /> {m.packageCount || 0} Pkgs</div>
                  <div className="flex items-center gap-1 text-emerald-500 font-bold group-hover:translate-x-1 transition-transform">
                    SCAN OUT <Play size={12} fill="currentColor" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
