import { DeliveryType } from "@/types/deliveryFee";
import { IShipmentSummary } from "@/types/shipment";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import image from "@/public/logo/logolight .png";


function generateBarcodeDataUrl(value: string): string {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, {
        format: "CODE128",
        width: 2,
        height: 60,
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
        width: 120,
        color: { dark: "#000000", light: "#ffffff" },
    });
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-DZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function wilayaCode(code: number): string {
    return String(code).padStart(2, "0");
}


export async function handlePrint(shipment: IShipmentSummary): Promise<void> {
    // Pre-generate images before opening the popup
    const barcodeUrl = generateBarcodeDataUrl(shipment.trackingCode);
    const qrUrl = await generateQrDataUrl(
        `https://track.courierdz.dz/${shipment.trackingCode}`
    );

    const printWindow = window.open("", "_blank", "width=460,height=680");
    if (!printWindow) {
        alert("Popup blocked. Please allow popups for this site to print labels.");
        return;
    }

    const deliveryTypeLabel =
        shipment.deliveryType === DeliveryType.Home
            ? "Domicile"
            : shipment.deliveryType === DeliveryType.StopDesk
                ? "Relais"
                : shipment.deliveryType;

    const isRtoLabel = shipment.isRto ? "RTO" : "";
    const swapLabel = shipment.hasBeenSwapped ? "ÉCHANGE" : "";
    const specialFlags = [isRtoLabel, swapLabel].filter(Boolean).join(" · ");

    printWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bordereau ${shipment.trackingCode}</title>
  <style>
    /* ── Page setup ─────────────────────────────────────── */
    @page { size: 100mm 150mm; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
    /* ── Base ───────────────────────────────────────────── */
    body {
      font-family: 'Arial Narrow', Arial, sans-serif;
      font-size: 9pt;
      color: #0a0a0a;
      background: #fff;
      width: 100mm;
      height: 150mm;
      overflow: hidden;
    }
 
    /* ── Outer label card ───────────────────────────────── */
    .label {
      width: 100mm;
      height: 150mm;
      border: 2pt solid #0a0a0a;
      display: flex;
      flex-direction: column;
    }
 
    /* ── Header band ────────────────────────────────────── */
    .header {
      display: flex;
      align-items: stretch;
      border-bottom: 2pt solid #0a0a0a;
      background: #0a0a0a;
      color: #fff;
      min-height: 14mm;
    }
    .header-logo {
      padding: 4px 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-right: 1.5pt solid #444;
    }
    .logo-name {
      font-size: 14pt;
      font-weight: 900;
      letter-spacing: 1px;
      line-height: 1;
      text-transform: uppercase;
    }
    .logo-tagline {
      font-size: 6.5pt;
      letter-spacing: 2px;
      color: #aaa;
      margin-top: 1px;
      text-transform: uppercase;
    }
    .header-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      padding: 4px 6px;
      font-size: 7pt;
      line-height: 1.5;
      color: #ccc;
    }
    .header-meta strong { color: #fff; font-size: 7.5pt; }
 
    /* Delivery type badge */
    .type-badge {
      display: inline-block;
      background: #fff;
      color: #0a0a0a;
      font-weight: 900;
      font-size: 7pt;
      letter-spacing: 1px;
      padding: 1px 5px;
      margin-top: 2px;
      text-transform: uppercase;
    }
 
    /* ── Wilaya band ────────────────────────────────────── */
    .wilaya-band {
      display: flex;
      align-items: center;
      border-bottom: 2pt solid #0a0a0a;
      background: #f0f0f0;
      padding: 3px 6px;
      gap: 6px;
    }
    .wilaya-code {
      font-size: 26pt;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -1px;
      min-width: 14mm;
      text-align: center;
    }
    .wilaya-info { flex: 1; }
    .wilaya-name { font-size: 11pt; font-weight: 900; text-transform: uppercase; line-height: 1; }
    .commune-name { font-size: 8.5pt; color: #333; margin-top: 1px; }
    .hub-info { font-size: 7pt; color: #555; margin-top: 2px; }
 
    ${specialFlags ? `
    .flag-band {
      background: #c0392b;
      color: #fff;
      font-size: 7pt;
      font-weight: 900;
      letter-spacing: 2px;
      text-align: center;
      padding: 2px;
      border-bottom: 1.5pt solid #0a0a0a;
      text-transform: uppercase;
    }` : ""}
 
    /* ── Tracking / barcode section ─────────────────────── */
    .tracking-section {
      border-bottom: 2pt solid #0a0a0a;
      padding: 4px 5px 3px;
      text-align: center;
    }
    .tracking-label { font-size: 6.5pt; letter-spacing: 2px; color: #555; text-transform: uppercase; }
    .tracking-code { font-size: 16pt; font-weight: 900; letter-spacing: 3px; line-height: 1.1; }
    .barcode-img { display: block; margin: 3px auto 0; height: 40px; }
 
    /* ── Sender / Receiver grid ─────────────────────────── */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 2pt solid #0a0a0a;
    }
    .party {
      padding: 4px 5px;
    }
    .party:first-child { border-right: 1.5pt solid #0a0a0a; }
    .party-title {
      font-size: 6.5pt;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #555;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2px;
      margin-bottom: 3px;
    }
    .party-name { font-size: 9pt; font-weight: 700; line-height: 1.2; }
    .party-phone { font-size: 8.5pt; margin-top: 1px; }
    .party-address { font-size: 7.5pt; color: #444; margin-top: 1px; line-height: 1.2; }
 
    /* ── Financial row ──────────────────────────────────── */
    .financials {
      display: flex;
      border-bottom: 2pt solid #0a0a0a;
    }
    .fin-item {
      flex: 1;
      padding: 4px 4px;
      text-align: center;
    }
    .fin-item + .fin-item { border-left: 1.5pt solid #0a0a0a; }
    .fin-label { font-size: 6pt; letter-spacing: 1.5px; text-transform: uppercase; color: #555; }
    .fin-value { font-size: 11pt; font-weight: 900; margin-top: 1px; line-height: 1; }
    .fin-value.cod { font-size: 13pt; color: #0a0a0a; }
    .fin-unit { font-size: 6pt; color: #777; }
 
    /* ── Footer QR + instructions ───────────────────────── */
    .footer {
      display: flex;
      align-items: center;
      padding: 4px 5px;
      gap: 6px;
      flex: 1;
    }
    .qr-img { width: 28mm; height: 28mm; flex-shrink: 0; }
    .footer-text { font-size: 6.5pt; line-height: 1.4; color: #444; flex: 1; }
    .footer-text strong { display: block; font-size: 7pt; color: #0a0a0a; margin-bottom: 2px; }
    .footer-bottom {
      font-size: 6pt;
      color: #888;
      text-align: center;
      padding: 2px 5px 3px;
      border-top: 1px solid #ddd;
    }
 
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body onload="window.print(); setTimeout(() => window.close(), 600);">
  <div class="label">
 
    <!-- ── HEADER ─────────────────────────────────────────── -->
    <div class="header">
      <div class="header-logo">
        <img src=${image.src} alt="Courier DZ" style="width: 32px; height: auto;" />
      </div>
      <div class="header-meta">
        <div>Date: <strong>${formatDate(shipment.createdAt)}</strong></div>
        <div>Réf: <strong>${shipment.id.slice(0, 8).toUpperCase()}</strong></div>
        <span class="type-badge">${deliveryTypeLabel}</span>
      </div>
    </div>
 
    <!-- ── WILAYA BAND ────────────────────────────────────── -->
    <div class="wilaya-band">
      <div class="wilaya-code">${wilayaCode(shipment.finalDestinationWilayaCode)}</div>
      <div class="wilaya-info">
        <div class="wilaya-name">${shipment.finalDestinationWilayaName}</div>
        <div class="commune-name">${shipment.finalDestinationCommuneName}</div>
        <div class="hub-info">Hub: ${shipment.finalDestinationNodeName}</div>
      </div>
    </div>
 
    ${specialFlags ? `<div class="flag-band">⚑ ${specialFlags}</div>` : ""}
 
    <!-- ── TRACKING + BARCODE ─────────────────────────────── -->
    <div class="tracking-section">
      <div class="tracking-label">N° Suivi</div>
      <div class="tracking-code">${shipment.trackingCode}</div>
      <img class="barcode-img" src="${barcodeUrl}" alt="Barcode ${shipment.trackingCode}" />
    </div>
 
    <!-- ── SENDER / RECEIVER ──────────────────────────────── -->
    <div class="parties-grid">
      <div class="party">
        <div class="party-title">Expéditeur</div>
        <div class="party-name">${shipment.merchantBusinessName || "Marchand"}</div>
        <div class="party-phone">${shipment.merchantPhoneNumber || ""}</div>
      </div>
      <div class="party">
        <div class="party-title">Destinataire</div>
        <div class="party-name">${shipment.customer.fullName}</div>
        <div class="party-phone">${shipment.customer.phoneNumber}</div>
        <div class="party-address">${shipment.finalDestinationCommuneName}, ${shipment.finalDestinationWilayaName}</div>
      </div>
    </div>
 
    <!-- ── FINANCIALS ─────────────────────────────────────── -->
    <div class="financials">
      <div class="fin-item">
        <div class="fin-label">Montant COD</div>
        <div class="fin-value cod">${shipment.codAmount.toLocaleString("fr-DZ")}</div>
        <div class="fin-unit">DZD</div>
      </div>
      <div class="fin-item">
        <div class="fin-label">Frais livr.</div>
        <div class="fin-value">${shipment.deliveryFee.toLocaleString("fr-DZ")}</div>
        <div class="fin-unit">DZD</div>
      </div>
      <div class="fin-item">
        <div class="fin-label">Poids</div>
        <div class="fin-value">${shipment.weightKg ?? "—"}</div>
        <div class="fin-unit">kg</div>
      </div>
      <div class="fin-item">
        <div class="fin-label">Tentatives</div>
        <div class="fin-value">${shipment.deliveryAttempts}</div>
        <div class="fin-unit">/ 3</div>
      </div>
    </div>
 
    <!-- ── FOOTER ─────────────────────────────────────────── -->
    <div class="footer">
      <img class="qr-img" src="${qrUrl}" alt="QR Code" />
      <div class="footer-text">
        <strong>Instructions de livraison</strong>
        Conserver l'étiquette visible et intacte.
        Ne pas plier sur le code-barres.
        En cas de problème: 3020 ou support@courierdz.dz
      </div>
    </div>
    <div class="footer-bottom">© 2026 Courier DZ · Tous droits réservés · Conditions générales applicables</div>
 
  </div>
</body>
</html>`);

    printWindow.document.close();
}
