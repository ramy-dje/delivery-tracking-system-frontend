import React from "react";
import { X, CheckCircle, Package, Truck, AlertCircle } from "lucide-react";

interface QrModalProps {
  data: any;
  onClose: () => void;
}

export default function SupervisorQrModal({ data, onClose }: QrModalProps) {
  if (!data) return null;

  const isStartRoute = data.type === "start_route";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200"
        style={{
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: isStartRoute ? "0 25px 50px -12px rgba(59, 130, 246, 0.25)" : "0 25px 50px -12px rgba(16, 185, 129, 0.25)"
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: isStartRoute ? "rgba(59, 130, 246, 0.15)" : "rgba(16, 185, 129, 0.15)",
              color: isStartRoute ? "#3b82f6" : "#10b981"
            }}
          >
            {isStartRoute ? <Truck size={32} /> : <CheckCircle size={32} />}
          </div>
          <h2 className="text-[22px] font-bold text-white mb-2">
            {isStartRoute ? "Transporter Departing" : "Transporter Arrived"}
          </h2>
          <p className="text-[14px] text-slate-400 max-w-[280px]">
            {data.message || (isStartRoute
              ? "A transporter is ready to depart. Scan to verify."
              : "A transporter has arrived at this branch. Scan to verify receipt.")}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-inner mb-6 relative">
          {/* Ensure the QR image is displayed without stretching */}
          {data.qrImage ? (
            <img
              src={data.qrImage}
              alt="Verification QR Code"
              className="w-56 h-56 object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-xl">
              <AlertCircle size={32} className="mb-2 text-slate-300" />
              <span>QR Error</span>
            </div>
          )}

          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-lg border border-slate-700 whitespace-nowrap">
            Scan with Supervisor App
          </div>
        </div>

        <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-3">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-slate-400 text-[13px]">Route</span>
            <span className="text-white font-medium flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] bg-white/10 uppercase text-slate-300">
                {data.routeType || "HUB"}
              </span>
              {data.routeNumber || "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-slate-400 text-[13px]">Transporter ID</span>
            <span className="text-white font-mono text-[13px]">
              {data.transporterId?.slice(-6).toUpperCase() || "N/A"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[13px]">Load Details</span>
            <span className="text-white font-medium flex items-center gap-1.5 text-[14px]">
              <Package size={14} className="text-amber-400" />
              {data.manifestCount ? `${data.manifestCount} Manifests` : `${data.packageCount || 0} Packages`}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl font-medium transition-colors text-[14px]"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
