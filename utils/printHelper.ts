import { DeliveryType } from "@/types/deliveryFee";
import { IPackage } from "@/types/shipment";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

function generateBarcodeDataUrl(value: string): string {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2.5,
    height: 70,
    displayValue: false,
    margin: 0,
    background: "#ffffff",
    lineColor: "#000000",
  });
  return canvas.toDataURL("image/png");
}

async function generateQrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 140,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

function formatDate(iso: string): string {
  if(!iso) return "";
  return new Date(iso).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildLabelHtml(
  shipment: IPackage,
  barcodeUrl: string,
  qrUrl: string
): string {
  const deliveryTypeLabel =
    shipment.deliveryType === 'home'
      ? "DOMICILE"
      : shipment.deliveryType === 'branch_pickup'
        ? "RELAIS"
        : shipment.deliveryType;

  return `
<div class="label">
  <div class="header">
    <div class="brand">
      <div class="brand-meta">
        <div class="company-name">COURIER DZ</div>
      </div>
    </div>
    <div class="shipment-meta">
      <div><strong>Date:</strong> ${formatDate(shipment.createdAt)}</div>
      <div><strong>Réf:</strong> ${shipment._id.slice(0, 8).toUpperCase()}</div>
      <div class="delivery-badge">${deliveryTypeLabel}</div>
    </div>
  </div>

  <div class="destination-block">
    <div class="destination-info">
      <div class="destination-wilaya">${shipment.destination.state || "N/A"}</div>
      <div class="destination-commune">${shipment.destination.city || "N/A"}</div>
      <div class="destination-hub">ADRESSE · ${shipment.destination.address || "N/A"}</div>
    </div>
  </div>

  ${shipment.returnInfo?.isReturn ? `
  <div class="status-flags">
    ${shipment.returnInfo?.isReturn ? `<div class="flag flag-danger">RTO</div>` : ""}
  </div>` : ""}

  <div class="tracking-section">
    <div class="tracking-label">Numéro de suivi</div>
    <div class="tracking-code">${shipment.trackingNumber}</div>
    <img class="barcode-img" src="${barcodeUrl}" alt="Barcode" />
  </div>

  <div class="people">
    <div class="person">
      <div class="person-title">Expéditeur</div>
      <div class="person-name">Marchand</div>
    </div>
    <div class="person">
      <div class="person-title">Destinataire</div>
      <div class="person-name">${shipment.destination.recipientName}</div>
      <div class="person-phone">${shipment.destination.recipientPhone}</div>
      <div class="person-address">${shipment.destination.city}, ${shipment.destination.state}</div>
    </div>
  </div>

  <div class="amounts">
    <div class="cod-box">
      <div class="cod-label">Montant à encaisser</div>
      <div class="cod-value">${shipment.totalPrice.toLocaleString("fr-DZ")} DZD</div>
    </div>
    <div class="secondary-financials">
      <div><span>Poids</span><strong>${shipment.weight ?? "—"} kg</strong></div>
      <div><span>Tentatives</span><strong>${shipment.attemptCount}/${shipment.maxAttempts}</strong></div>
    </div>
  </div>

  <div class="footer">
    <img class="qr-img" src="${qrUrl}" alt="QR Code" />
    <div class="footer-text">
      <div class="footer-title">Instructions</div>
      Conserver l'étiquette visible et intacte.<br/>
      Ne pas plier sur le code-barres.<br/>
      Support: 3020<br/>
      support@courierdz.dz
    </div>
  </div>
  <div class="footer-bottom">© 2026 Courier DZ · Tous droits réservés</div>
</div>`;
}

const LABEL_STYLES = `
  @page { size: 100mm 150mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; font-family: Inter, Arial, Helvetica, sans-serif; color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .label { width: 100mm; height: 150mm; border: 2px solid #000; display: flex; flex-direction: column; page-break-after: always; }
  .label:last-child { page-break-after: auto; }
  .header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 2px solid #000; background: #fff; min-height: 72px; }
  .brand { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .company-logo { width: 48px; height: 48px; object-fit: contain; flex-shrink: 0; }
  .brand-meta { min-width: 0; }
  .company-name { font-size: 13pt; font-weight: 900; line-height: 1; text-transform: uppercase; overflow-wrap: break-word; }
  .company-subdomain { margin-top: 4px; font-size: 7pt; color: #666; }
  .shipment-meta { text-align: right; font-size: 7pt; line-height: 1.5; margin-left: 8px; }
  .shipment-meta strong { color: #000; }
  .delivery-badge { margin-top: 4px; display: inline-block; background: #000; color: #fff; padding: 4px 8px; border-radius: 999px; font-size: 7pt; font-weight: 900; letter-spacing: 1px; }
  .destination-block { display: flex; align-items: center; background: #f3f3f3; border-bottom: 3px solid #000; padding: 10px; }
  .destination-code { width: 68px; flex-shrink: 0; text-align: center; font-size: 34pt; font-weight: 900; line-height: 1; }
  .destination-info { flex: 1; padding-left: 10px; min-width: 0; }
  .destination-wilaya { font-size: 16pt; font-weight: 900; text-transform: uppercase; line-height: 1; overflow-wrap: break-word; }
  .destination-commune { margin-top: 4px; font-size: 10pt; overflow-wrap: break-word; }
  .destination-hub { margin-top: 5px; font-size: 7pt; color: #666; letter-spacing: 1px; }
  .status-flags { display: flex; gap: 6px; padding: 6px 10px; border-bottom: 1px solid #000; }
  .flag { padding: 4px 10px; border-radius: 999px; font-size: 7pt; font-weight: 900; letter-spacing: 1px; }
  .flag-danger { background: #000; color: #fff; }
  .flag-warning { border: 2px solid #000; color: #000; background: #fff; }
  .tracking-section { border-bottom: 2px solid #000; text-align: center; padding: 8px 8px 6px; }
  .tracking-label { font-size: 6.5pt; color: #666; letter-spacing: 2px; text-transform: uppercase; }
  .tracking-code { margin-top: 2px; font-size: 18pt; font-weight: 900; letter-spacing: 4px; line-height: 1.1; }
  .barcode-img { display: block; width: 92%; height: 52px; margin: 6px auto 0; object-fit: contain; image-rendering: crisp-edges; }
  .people { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 2px solid #000; }
  .person { padding: 8px; min-height: 78px; }
  .person:first-child { border-right: 1px solid #000; }
  .person-title { font-size: 6pt; letter-spacing: 2px; text-transform: uppercase; color: #666; margin-bottom: 6px; font-weight: 900; }
  .person-name { font-size: 9pt; font-weight: 800; line-height: 1.25; overflow-wrap: break-word; }
  .person-phone { margin-top: 4px; font-size: 8pt; font-weight: 600; }
  .person-address { margin-top: 4px; font-size: 7pt; color: #444; line-height: 1.3; overflow-wrap: break-word; }
  .amounts { border-bottom: 2px solid #000; }
  .cod-box { background: #000; color: #fff; padding: 10px; text-align: center; }
  .cod-label { font-size: 7pt; letter-spacing: 2px; text-transform: uppercase; }
  .cod-value { margin-top: 4px; font-size: 24pt; font-weight: 900; line-height: 1; }
  .secondary-financials { display: flex; justify-content: space-between; padding: 7px 10px; font-size: 7pt; gap: 8px; }
  .secondary-financials div { display: flex; flex-direction: column; gap: 2px; text-align: center; flex: 1; }
  .secondary-financials span { color: #666; text-transform: uppercase; letter-spacing: 1px; }
  .secondary-financials strong { font-size: 8pt; }
  .footer { flex: 1; display: flex; gap: 10px; align-items: center; padding: 10px; }
  .qr-img { width: 92px; height: 92px; object-fit: contain; image-rendering: crisp-edges; flex-shrink: 0; }
  .footer-text { flex: 1; font-size: 6.5pt; line-height: 1.5; color: #444; }
  .footer-title { font-size: 7pt; font-weight: 900; color: #000; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .footer-bottom { border-top: 1px solid #ddd; text-align: center; font-size: 6pt; color: #777; padding: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

/** Print a single shipment label (existing behaviour) */
export async function handlePrint(shipment: IPackage): Promise<void> {
  const barcodeUrl = generateBarcodeDataUrl(shipment.trackingNumber);
  const qrUrl = await generateQrDataUrl(
    `https://courierdz.dz/track/${shipment.trackingNumber}`
  );

  const printWindow = window.open("", "_blank", "width=500,height=800");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for printing.");
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Bordereau ${shipment.trackingNumber}</title>
<style>${LABEL_STYLES}</style>
</head>
<body onload="window.print(); setTimeout(() => window.close(), 600);">
${buildLabelHtml(shipment, barcodeUrl, qrUrl)}
</body></html>`);
  printWindow.document.close();
}

/** Print multiple shipment labels in one print dialog */
export async function handleBatchPrint(shipments: IPackage[]): Promise<void> {
  if (shipments.length === 0) return;

  // Generate all barcodes + QR codes in parallel
  const assets = await Promise.all(
    shipments.map(async (s) => ({
      barcode: generateBarcodeDataUrl(s.trackingNumber),
      qr: await generateQrDataUrl(
        `https://courierdz.dz/track/${s.trackingNumber}`
      ),
    }))
  );

  const labelsHtml = shipments
    .map((s, i) => buildLabelHtml(s, assets[i].barcode, assets[i].qr))
    .join("\n");

  const printWindow = window.open("", "_blank", "width=600,height=900");
  if (!printWindow) {
    alert("Popup blocked. Please allow popups for printing.");
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>Batch Print — ${shipments.length} labels</title>
<style>${LABEL_STYLES}</style>
</head>
<body onload="window.print(); setTimeout(() => window.close(), 800);">
${labelsHtml}
</body></html>`);
  printWindow.document.close();
}