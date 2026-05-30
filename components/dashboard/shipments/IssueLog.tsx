import React from "react";

export default function IssueLog({ packageId }: { packageId: string }) {
  return (
    <div className="rounded-lg border border-white/6 p-4 text-slate-400">
      <h3 className="font-semibold text-white mb-2">Issues</h3>
      <p className="text-sm">Placeholder for package issues list and add/resolve controls for package {packageId}.</p>
      {/* TODO: connect to POST /branches/:branchId/packages/:packageId/issues and resolve endpoint */}
    </div>
  );
}
