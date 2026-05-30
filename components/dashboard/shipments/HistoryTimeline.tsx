import React from "react";

export default function HistoryTimeline({ packageId }: { packageId: string }) {
  return (
    <div className="rounded-lg border border-white/6 p-4 text-slate-400">
      <h3 className="font-semibold text-white mb-2">History</h3>
      <p className="text-sm">Placeholder for full event history timeline for package {packageId}.</p>
      {/* TODO: connect to GET /branches/:branchId/packages/:packageId/history */}
    </div>
  );
}
