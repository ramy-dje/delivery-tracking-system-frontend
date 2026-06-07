"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, ScanLine, Search, XCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { markDroppedAtBranch } from "@/services/ShipmentService";
import { parseApiError } from "@/utils/apiErrorHandler";
import { showToast } from "nextjs-toast-notify";
import RoleGuard from "@/lib/RoleGuard";
import { ROLES } from "@/lib/roles";
import { getNodeId } from "@/hooks/useAuth";

export default function BranchDropScannerPage() {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const [trackingCode, setTrackingCode] = useState("");
    const [shipmentId, setShipmentId] = useState("");
    const [loading, setLoading] = useState(false);
    const [cameraStarted, setCameraStarted] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);

    const stopScanner = useCallback(async () => {
        try {
            if (scannerRef.current?.isScanning) {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, [stopScanner]);

    const handleDropAtBranch = async (id: string) => {
        if (!id) return;

        try {
            setLoading(true);

            await markDroppedAtBranch(getNodeId() ?? "", [id]);

            setLastScanned(id);
            showToast.success("Shipment marked as dropped at branch");
        } catch (err: any) {
            const error = parseApiError(err);
            showToast.error(error.message || "Failed to mark shipment");
        } finally {
            setLoading(false);
        }
    };

    const startScanner = async () => {
        try {
            const scanner = new Html5Qrcode("shipment-scanner");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 120,
                    },
                },
                async (decodedText) => {
                    if (!decodedText || loading) return;

                    await stopScanner();
                    setCameraStarted(false);

                    setShipmentId(decodedText);
                    await handleDropAtBranch(decodedText);
                }
            );

            setCameraStarted(true);
        } catch (err) {
            console.error(err);
            showToast.error("Unable to access camera scanner");
        }
    };

    return (
        <RoleGuard
            allowedRoles={[ROLES.RECEPTIONIST]}
            fallbackPath="/unauthorized"
        >
            <div className="min-h-screen bg-slate-950 p-6">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* HEADER */}
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Branch Drop Scanner
                        </h1>

                        <p className="text-slate-400 mt-1 text-sm">
                            Scan shipment barcode / QR code when customer drops package at branch.
                        </p>
                    </div>

                    {/* SCANNER CARD */}
                    <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-xl overflow-hidden">

                        <div className="p-5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <ScanLine className="w-5 h-5 text-emerald-400" />
                                </div>

                                <div>
                                    <p className="text-white font-semibold">
                                        Shipment Scanner
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Use barcode scanner or mobile camera
                                    </p>
                                </div>
                            </div>

                            {!cameraStarted ? (
                                <button
                                    onClick={startScanner}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Camera size={16} />
                                    Start Camera
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        await stopScanner();
                                        setCameraStarted(false);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
                                >
                                    Stop Scanner
                                </button>
                            )}
                        </div>

                        <div className="p-5 space-y-5">

                            {/* CAMERA */}
                            <div
                                id="shipment-scanner"
                                className="overflow-hidden rounded-2xl border border-white/10 bg-black min-h-70"
                            />

                            {/* MANUAL INPUT */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">
                                    Manual Shipment ID
                                </label>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />

                                        <input
                                            value={trackingCode}
                                            onChange={(e) => setTrackingCode(e.target.value)}
                                            placeholder="Scan or paste shipment id"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40"
                                        />
                                    </div>

                                    <button
                                        disabled={loading || !trackingCode.trim()}
                                        onClick={() => handleDropAtBranch(trackingCode.trim())}
                                        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Confirm"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LAST SCANNED */}
                    {lastScanned && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm text-slate-400">
                                    Last scanned shipment
                                </p>

                                <p className="text-white font-semibold truncate">
                                    {lastScanned}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
