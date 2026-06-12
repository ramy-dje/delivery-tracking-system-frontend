"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Search, Package, MapPin, AlertCircle, Loader2, Info, QrCode } from "lucide-react";
import { trackPublicPackage } from "@/services/ShipmentService";
import TrackingMap from "@/components/track/TrackingMap";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialTracking = searchParams.get("tracking") || "";
  const qrPayload = searchParams.get("payload");

  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-track if URL has tracking number on first load
  useEffect(() => {
    if (initialTracking) {
      handleTrack();
    }
  }, [initialTracking]);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await trackPublicPackage(trackingNumber.trim());

      if (response.success) {
        setResult(response.data);
      } else if (response.restricted) {
        setError(response.message || "This package cannot be tracked at this time.");
      } else {
        setError(response.message || "Package not found. Please check the tracking number.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while tracking the package.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col font-sans selection:bg-amber-500/30">
      {/* Navbar (Simplified for public page) */}
      <nav className="border-b border-white/5 bg-[#030712]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/logolight .png"
              alt="FlashShip"
              width={120}
              height={30}
              className="object-contain"
            />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-16 px-4 pb-24 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[800px] h-[600px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-3xl relative z-10 flex flex-col items-center">
          {/* Header */}
          <div className="text-center space-y-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.3)]">
              <Package size={32} className="text-slate-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Track Your Package
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-lg">
              Enter your tracking number below to get real-time updates on your delivery status.
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleTrack}
            className="w-full relative group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-500/0 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
            <div className="relative flex items-center bg-[#0d1117] border border-white/10 rounded-2xl p-2 transition-all group-hover:border-amber-500/50 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50">
              <div className="pl-4 pr-2 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="e.g. PKG-123456789"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 bg-transparent border-none text-white px-2 py-4 focus:outline-none text-lg placeholder:text-slate-600 font-mono tracking-wider"
              />
              <button
                type="submit"
                disabled={loading || !trackingNumber.trim()}
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-[#030712] font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Track"}
              </button>
            </div>
          </form>

          {/* QR Code Section */}
          {qrPayload && (
            <div className="w-full mt-10 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-amber-500/10 rounded-full blur-3xl" />
              
              <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-semibold border border-amber-500/30">
                  <QrCode size={16} />
                  Delivery Code
                </div>
                <h3 className="text-2xl font-bold">Show this to your deliverer</h3>
                <p className="text-slate-300 max-w-sm mx-auto md:mx-0">
                  When you receive your package, present this secure QR code to the deliverer to confirm and complete the delivery safely.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)] relative z-10">
                <QRCodeSVG
                  value={qrPayload}
                  size={160}
                  level={"M"}
                  bgColor={"#ffffff"}
                  fgColor={"#0f172a"}
                  includeMargin={false}
                />
              </div>
            </div>
          )}

          {/* Results Area */}
          <div className="w-full mt-12 space-y-6">
            {/* Error / Restricted Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                <h3 className="text-lg font-semibold text-red-400 mb-1">Tracking Unavailable</h3>
                <p className="text-slate-300">{error}</p>
              </div>
            )}

            {/* Tracking Data */}
            {result && !error && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Status Card */}
                <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Tracking Number</p>
                    <p className="text-2xl font-mono font-bold tracking-wider">{result.trackingNumber}</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <p className="text-sm font-medium text-slate-400 mb-1">Current Status</p>
                    <div 
                      className="px-4 py-2 rounded-lg font-bold text-sm"
                      style={{ 
                        backgroundColor: `${result.statusColor}15`, 
                        color: result.statusColor,
                        border: `1px solid ${result.statusColor}30`
                      }}
                    >
                      {result.statusDisplay}
                    </div>
                  </div>
                </div>

                {/* Map View */}
                {result.currentLocation?.coordinates ? (
                  <div className="rounded-2xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-4 left-4 z-20 bg-[#0d1117]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg shadow-xl flex items-center gap-2">
                      <MapPin size={16} className="text-amber-400" />
                      <span className="text-sm font-medium text-slate-200">
                        {result.currentLocation.message || "Current Location"}
                      </span>
                    </div>
                    <TrackingMap packageData={result} />
                  </div>
                ) : (
                  <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <Info className="w-12 h-12 text-slate-500 mb-3" />
                    <p className="text-slate-400">Map location is not available for this package yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PublicTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
