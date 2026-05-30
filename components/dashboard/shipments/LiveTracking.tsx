import React from "react";

export default function LiveTracking({ packageId }: { packageId: string }) {
  return (
    <div className="rounded-lg border border-white/6 p-4 text-slate-400">
      <h3 className="font-semibold text-white mb-2">Live Tracking</h3>
      <p className="text-sm">Placeholder for live map tracking for package {packageId} (connect to tracking endpoint).</p>
      {/* TODO: integrate map component and GET /branches/:branchId/packages/:packageId/tracking */}
    </div>
  );
}
