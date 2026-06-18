// manifestPrintHelper.ts

import { IManifestDetail, ManifestStatus } from "@/types/manifest";
import { IBranchResponse } from "@/types/branch";

function formatDate(iso: string): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("fr-DZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatusBadgeClass(status: ManifestStatus): string {
    const statusMap: Record<ManifestStatus, string> = {
        open: "status-open",
        sealed: "status-sealed",
        loaded: "status-loaded",
        in_transit: "status-transit",
        arrived: "status-arrived",
        unloading: "status-unloading",
        closed: "status-closed",
        discrepancy: "status-discrepancy",
        cancelled: "status-cancelled",
    };
    return statusMap[status] || "status-default";
}

function getStatusLabel(status: ManifestStatus): string {
    const labels: Record<ManifestStatus, string> = {
        open: "OUVERT",
        sealed: "SCELLÉ",
        loaded: "CHARGÉ",
        in_transit: "EN TRANSIT",
        arrived: "ARRIVÉ",
        unloading: "DÉCHARGEMENT",
        closed: "CLÔTURÉ",
        discrepancy: "DISCREPANCE",
        cancelled: "ANNULÉ",
    };
    return labels[status] || status.toUpperCase();
}

function getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
        standard: "STANDARD",
        express: "EXPRESS",
        urgent: "URGENT",
    };
    return labels[priority] || priority.toUpperCase();
}

function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        standard: "#666",
        express: "#e67e22",
        urgent: "#e74c3c",
    };
    return colors[priority] || "#666";
}

function buildManifestHtml(
    manifest: IManifestDetail,
    barcodeUrl?: string
): string {
    const originBranch = manifest.originBranchId as IBranchResponse;
    const destinationBranch = manifest.destinationBranchId as IBranchResponse;
    const createdBy = manifest.createdBy;

    const statusLabel = getStatusLabel(manifest.status);
    const statusClass = getStatusBadgeClass(manifest.status);
    const priorityLabel = getPriorityLabel(manifest.priority);
    const priorityColor = getPriorityColor(manifest.priority);

    const sealInfo = manifest.sealInfo;
    const transportLeg = manifest.transportLeg;

    // Calculate package stats
    const packages = manifest.packages || [];
    const totalPackages = packages.length;
    const totalWeight = packages.reduce((sum, pkg) => sum + (pkg.weight || 0), 0);

    // Package status counts
    const statusCounts = packages.reduce((acc, pkg) => {
        const status = pkg.entryStatus || "in_manifest";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manifest ${manifest.manifestCode}</title>
  <style>
    @page { 
      size: A4; 
      margin: 15mm;
    }
    
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      background: #fff; 
      color: #111; 
      line-height: 1.5;
      padding: 10px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .manifest-container {
      max-width: 210mm;
      margin: 0 auto;
    }
    
    /* Header */
    .manifest-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 16px;
      border-bottom: 3px solid #000;
      margin-bottom: 20px;
    }
    
    .header-left {
      flex: 1;
    }
    
    .company-name {
      font-size: 22pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -1px;
    }
    
    .company-sub {
      font-size: 9pt;
      color: #666;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .manifest-title {
      font-size: 18pt;
      font-weight: 900;
      text-transform: uppercase;
      margin-top: 4px;
    }
    
    .header-right {
      text-align: right;
      flex-shrink: 0;
      margin-left: 20px;
    }
    
    .manifest-code {
      font-size: 20pt;
      font-weight: 900;
      letter-spacing: 2px;
      font-family: 'Courier New', monospace;
    }
    
    .manifest-meta {
      font-size: 8pt;
      color: #666;
      margin-top: 4px;
    }
    
    .manifest-meta span {
      display: block;
    }
    
    /* Status Badges */
    .badge-container {
      display: flex;
      gap: 10px;
      margin-top: 8px;
      justify-content: flex-end;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 8pt;
      font-weight: 900;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    
    .badge-status {
      background: #000;
      color: #fff;
    }
    
    .badge-status.status-open { background: #3498db; }
    .badge-status.status-sealed { background: #2ecc71; }
    .badge-status.status-loaded { background: #f39c12; }
    .badge-status.status-transit { background: #9b59b6; }
    .badge-status.status-arrived { background: #1abc9c; }
    .badge-status.status-unloading { background: #e67e22; }
    .badge-status.status-closed { background: #2c3e50; }
    .badge-status.status-discrepancy { background: #e74c3c; }
    .badge-status.status-cancelled { background: #95a5a6; }
    
    .badge-priority {
      background: #000;
      color: #fff;
    }
    
    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      font-weight: 900;
    }
    
    .info-value {
      font-size: 10pt;
      font-weight: 600;
      margin-top: 2px;
    }
    
    .info-value.branch-name {
      font-size: 12pt;
      font-weight: 800;
    }
    
    /* Branch Route */
    .route-section {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px;
      background: #f0f0f0;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #000;
    }
    
    .route-arrow {
      font-size: 24pt;
      color: #999;
      font-weight: 300;
    }
    
    .branch-detail {
      flex: 1;
    }
    
    .branch-detail .label {
      font-size: 6.5pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      font-weight: 900;
    }
    
    .branch-detail .name {
      font-size: 13pt;
      font-weight: 800;
    }
    
    .branch-detail .address {
      font-size: 8pt;
      color: #666;
      margin-top: 2px;
    }
    
    /* Seal & Transport */
    .seal-transport {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .seal-box, .transport-box {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .seal-box .title, .transport-box .title {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      font-weight: 900;
      margin-bottom: 6px;
    }
    
    .seal-box .detail, .transport-box .detail {
      font-size: 9pt;
    }
    
    .seal-box .detail strong, .transport-box .detail strong {
      color: #000;
    }
    
    /* Package Table */
    .package-section {
      margin: 20px 0;
    }
    
    .package-section .title {
      font-size: 10pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    
    .package-summary {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    
    .summary-item {
      font-size: 9pt;
    }
    
    .summary-item strong {
      font-weight: 900;
    }
    
    .package-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
    }
    
    .package-table th {
      background: #000;
      color: #fff;
      padding: 8px 10px;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 900;
    }
    
    .package-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .package-table tr:last-child td {
      border-bottom: none;
    }
    
    .package-table .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #e0e0e0;
      color: #333;
    }
    
    .package-table .status-badge.in_manifest { background: #3498db; color: #fff; }
    .package-table .status-badge.unloaded { background: #2ecc71; color: #fff; }
    .package-table .status-badge.remanifested { background: #f39c12; color: #fff; }
    .package-table .status-badge.missing { background: #e74c3c; color: #fff; }
    .package-table .status-badge.damaged { background: #e67e22; color: #fff; }
    
    .package-table .text-center {
      text-align: center;
    }
    
    /* Footer */
    .manifest-footer {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 2px solid #000;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 7pt;
      color: #666;
    }
    
    .footer-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .footer-right {
      text-align: right;
    }
    
    .signature-line {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #ddd;
      font-size: 7pt;
      color: #999;
    }
    
    @media print {
      body {
        padding: 0;
        background: #fff;
      }
      
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="manifest-container">
    <!-- Header -->
    <div class="manifest-header">
      <div class="header-left">
        <div class="company-name">COURIER DZ</div>
        <div class="company-sub">Transport & Logistique</div>
        <div class="manifest-title">Manifest de transport</div>
      </div>
      <div class="header-right">
        <div class="manifest-code">${manifest.manifestCode}</div>
        <div class="manifest-meta">
          <span>Créé le: ${formatDate(manifest.createdAt)}</span>
          ${manifest.updatedAt ? `<span>Mis à jour: ${formatDate(manifest.updatedAt)}</span>` : ''}
        </div>
        <div class="badge-container">
          <span class="badge badge-status ${statusClass}">${statusLabel}</span>
          <span class="badge badge-priority" style="background: ${priorityColor}">${priorityLabel}</span>
        </div>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Colis</span>
        <span class="info-value">${totalPackages} package${totalPackages > 1 ? 's' : ''}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Poids total</span>
        <span class="info-value">${totalWeight.toFixed(2)} kg</span>
      </div>
      <div class="info-item">
        <span class="info-label">Créé par</span>
        <span class="info-value">${createdBy?.firstName || ''} ${createdBy?.lastName || ''}</span>
      </div>
    </div>

    <!-- Route -->
    <div class="route-section">
      <div class="branch-detail">
        <div class="label">Origine</div>
        <div class="name">${originBranch?.name || 'N/A'}</div>
        <div class="address">${originBranch?.address || ''} ${originBranch?.address?.city || ''}</div>
      </div>
      
      <div class="route-arrow">→</div>
      
      <div class="branch-detail">
        <div class="label">Destination</div>
        <div class="name">${destinationBranch?.name || 'N/A'}</div>
        <div class="address">${destinationBranch?.address || ''} ${destinationBranch?.address?.city || ''}</div>
      </div>
    </div>

    <!-- Seal & Transport -->
    <div class="seal-transport">
      <div class="seal-box">
        <div class="title">🔒 Scellé</div>
        ${sealInfo ? `
          <div class="detail">
            <div><strong>N° de scellé:</strong> ${sealInfo.sealNumber || 'N/A'}</div>
            <div><strong>Par:</strong> ${typeof sealInfo.sealedBy === 'object' && sealInfo.sealedBy ?
                `${sealInfo.sealedBy.firstName || ''} ${sealInfo.sealedBy.lastName || ''}` :
                sealInfo.sealedBy || 'N/A'}</div>
            <div><strong>Date:</strong> ${formatDate(sealInfo.sealedAt)}</div>
            <div><strong>Colis:</strong> ${sealInfo.packageCount || 0}</div>
            <div><strong>Poids:</strong> ${(sealInfo.totalWeight || 0).toFixed(2)} kg</div>
          </div>
        ` : `
          <div class="detail" style="color: #999;">Non scellé</div>
        `}
      </div>
      
      <div class="transport-box">
        <div class="title">🚚 Transport</div>
        ${transportLeg ? `
          <div class="detail">
            ${transportLeg.vehicleId ? `<div><strong>Véhicule:</strong> ${transportLeg.vehicleId}</div>` : ''}
            <div><strong>Transporteur:</strong> ${typeof transportLeg.transporterId === 'object' && transportLeg.transporterId ?
                `${transportLeg.transporterId.firstName || ''} ${transportLeg.transporterId.lastName || ''}` :
                transportLeg.transporterId || 'N/A'}</div>
            <div><strong>Assigné:</strong> ${formatDate(transportLeg.assignedAt)}</div>
            ${transportLeg.departedAt ? `<div><strong>Départ:</strong> ${formatDate(transportLeg.departedAt)}</div>` : ''}
            ${transportLeg.arrivedAt ? `<div><strong>Arrivée:</strong> ${formatDate(transportLeg.arrivedAt)}</div>` : ''}
          </div>
        ` : `
          <div class="detail" style="color: #999;">Non assigné</div>
        `}
      </div>
    </div>

    <!-- Package Status Summary -->
    ${Object.keys(statusCounts).length > 0 ? `
    <div class="package-section">
      <div class="title">Statut des colis</div>
      <div class="package-summary">
        ${Object.entries(statusCounts).map(([status, count]) => `
          <span class="summary-item">
            <span class="package-table .status-badge ${status}">${status.replace('_', ' ').toUpperCase()}</span>
            <strong>: ${count}</strong>
          </span>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- Package Table -->
    <div class="package-section">
      <div class="title">Liste des colis</div>
      ${packages.length > 0 ? `
      <table class="package-table">
        <thead>
          <tr>
            <th>#</th>
            <th>N° de suivi</th>
            <th>Poids (kg)</th>
            <th>Statut</th>
            <th>Scanné</th>
          </tr>
        </thead>
        <tbody>
          ${packages.map((pkg, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><strong>${pkg.trackingNumber}</strong></td>
              <td>${pkg.weight ? pkg.weight.toFixed(2) : '—'}</td>
              <td><span class="status-badge ${pkg.entryStatus || 'in_manifest'}">${(pkg.entryStatus || 'in_manifest').replace('_', ' ').toUpperCase()}</span></td>
              <td>${formatDate(pkg.scannedInAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : `
        <p style="color: #999; font-style: italic; padding: 20px 0;">Aucun colis dans ce manifest</p>
      `}
    </div>

    <!-- Notes -->
    ${manifest.notes ? `
      <div style="margin: 16px 0; padding: 12px; background: #fcf8e8; border-left: 4px solid #f39c12; border-radius: 4px;">
        <div style="font-size: 7pt; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 900; margin-bottom: 4px;">Notes</div>
        <div style="font-size: 9pt;">${manifest.notes}</div>
      </div>
    ` : ''}

    <!-- Discrepancy -->
    ${manifest.discrepancy ? `
      <div style="margin: 16px 0; padding: 12px; background: #fdf0ef; border-left: 4px solid #e74c3c; border-radius: 4px;">
        <div style="font-size: 7pt; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 900; margin-bottom: 4px;">⚠️ Discrepancy</div>
        <div style="font-size: 9pt;">
          <div><strong>Rapporté par:</strong> ${manifest.discrepancy.reportedBy}</div>
          <div><strong>Date:</strong> ${formatDate(manifest.discrepancy.reportedAt)}</div>
          <div><strong>Attendu:</strong> ${manifest.discrepancy.expectedCount} / <strong>Réel:</strong> ${manifest.discrepancy.actualCount}</div>
          ${manifest.discrepancy.missingPackageIds.length > 0 ? `<div><strong>Manquants:</strong> ${manifest.discrepancy.missingPackageIds.join(', ')}</div>` : ''}
          ${manifest.discrepancy.notes ? `<div style="margin-top: 4px;">${manifest.discrepancy.notes}</div>` : ''}
        </div>
      </div>
    ` : ''}

    <!-- Footer -->
    <div class="manifest-footer">
      <div class="footer-left">
        <div>Courier DZ — Transport & Logistique</div>
        <div>support@courierdz.dz · 3020</div>
        <div>© 2026 Courier DZ · Tous droits réservés</div>
      </div>
      <div class="footer-right">
        <div>Page 1/1</div>
        <div style="font-size: 6pt; color: #ccc;">${manifest._id}</div>
        ${manifest.isSealed ? '<div style="margin-top: 4px;">🔒 Scellé</div>' : ''}
      </div>
    </div>
    
    <div class="signature-line">
      <div style="display: flex; justify-content: space-between; gap: 40px;">
        <div>Signature départ: ____________________</div>
        <div>Signature arrivée: ____________________</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Print a single manifest
 */
export async function handlePrintManifest(manifest: IManifestDetail): Promise<void> {
    const htmlContent = buildManifestHtml(manifest);

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
        alert("Popup blocked. Please allow popups for printing.");
        return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function () {
        printWindow.print();
        // Close after printing (or after timeout if user cancels)
        setTimeout(() => printWindow.close(), 1000);
    };
}

/**
 * Print multiple manifests (for batch printing)
 */
export async function handlePrintManifests(manifests: IManifestDetail[]): Promise<void> {
    if (manifests.length === 0) {
        alert("No manifests to print.");
        return;
    }

    const combinedHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manifests (${manifests.length})</title>
</head>
<body>
  ${manifests.map(m => buildManifestHtml(m)).join('\n<hr style="page-break-after: always; border: none; margin: 0;">\n')}
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
        alert("Popup blocked. Please allow popups for printing.");
        return;
    }

    printWindow.document.write(combinedHtml);
    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
    };
}

/**
 * Download manifest as HTML file (for offline printing)
 */
export function downloadManifestHtml(manifest: IManifestDetail): void {
    const htmlContent = buildManifestHtml(manifest);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest_${manifest.manifestCode}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}