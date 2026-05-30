import * as XLSX from "xlsx";
import { IBulkShipmentRow } from "@/types/bulk";
import { DELIVERY_TYPE_MAP, DELIVERY_TYPE_VALUES, DeliveryType } from "@/types/deliveryFee";

// ─── Column aliases ───────────────────────────────────────────────────────────

const COLUMN_MAP: Record<string, keyof IBulkShipmentRow> = {
    "full name": "customerFullName",
    "customer name": "customerFullName",
    "name": "customerFullName",
    "phone": "customerPhone",
    "phone number": "customerPhone",
    "customer phone": "customerPhone",
    "commune": "communeRaw",
    "commune id": "communeId",
    "wilaya": "wilayaRaw",
    "cod": "codAmount",
    "cod amount": "codAmount",
    "amount": "codAmount",
    "description": "description",
    "product": "description",
    "weight": "weightKg",
    "weight kg": "weightKg",
    "delivery type": "deliveryType",
    "type": "deliveryType",
};

// ─── Template ─────────────────────────────────────────────────────────────────

export const TEMPLATE_COLUMNS = [
    "Full Name",
    "Phone Number",
    "Commune",
    "Wilaya",
    "COD Amount",
    "Description",
    "Weight Kg",
    "Delivery Type",
];

export const TEMPLATE_EXAMPLE_ROW = [
    "Ahmed Bensalem",
    "0555123456",
    "Alger Centre",
    "Alger",
    "2500",
    "Smartphone",
    "0.5",
    "home",
];

export function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_COLUMNS, TEMPLATE_EXAMPLE_ROW]);
    ws["!cols"] = TEMPLATE_COLUMNS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shipments");
    XLSX.writeFile(wb, "shipment_import_template.xlsx");
}

// ─── Parse file ───────────────────────────────────────────────────────────────

export async function parseBulkFile(file: File): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
                    raw: false,
                    defval: "",
                });
                resolve(json);
            } catch {
                reject(new Error("Could not read file. Make sure it's a valid .xlsx or .csv file."));
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsArrayBuffer(file);
    });
}

// ─── Validate rows ────────────────────────────────────────────────────────────

const PHONE_RE = /^0[5-7]\d{8}$/;

function normalizeKey(raw: string): keyof IBulkShipmentRow | null {
    return COLUMN_MAP[raw.toLowerCase().trim()] ?? null;
}

function parseBool(val: string): boolean {
    return ["true", "yes", "1", "oui"].includes(val.toLowerCase().trim());
}

export function validateBulkRows(raw: Record<string, string>[]): IBulkShipmentRow[] {
    return raw.map((rawRow, idx) => {
        const norm: Partial<Record<keyof IBulkShipmentRow, string>> = {};
        for (const [k, v] of Object.entries(rawRow)) {
            const mapped = normalizeKey(k);
            if (mapped) norm[mapped] = String(v);
        }

        const errors: string[] = [];

        const customerFullName = (norm.customerFullName as string | undefined)?.trim() ?? "";
        if (!customerFullName) errors.push("Full name is required");

        const customerPhone = (norm.customerPhone as string | undefined)?.trim() ?? "";
        if (!customerPhone) errors.push("Phone is required");
        else if (!PHONE_RE.test(customerPhone))
            errors.push("Phone must be a valid Algerian number (e.g. 0555123456)");

        const communeRaw = (norm.communeRaw as string | undefined)?.trim() ?? "";
        if (!communeRaw) errors.push("Commune is required");

        const wilayaRaw = (norm.wilayaRaw as string | undefined)?.trim() ?? "";
        if (!wilayaRaw) errors.push("Wilaya is required");

        const codRaw = (norm.codAmount as string | undefined)?.trim() ?? "";
        const codAmount = parseFloat(codRaw);
        if (!codRaw) errors.push("COD amount is required");
        else if (isNaN(codAmount) || codAmount < 0)
            errors.push("COD amount must be a positive number");

        const description = (norm.description as string | undefined)?.trim() ?? "";

        const weightRaw = (norm.weightKg as string | undefined)?.trim() ?? "";
        const weightKg = parseFloat(weightRaw);
        if (!weightRaw) errors.push("Weight is required");
        else if (isNaN(weightKg) || weightKg <= 0)
            errors.push("Weight must be a positive number");

        const dtRaw = ((norm.deliveryType as string | undefined) ?? "home").toLowerCase().trim();
        const deliveryType = DELIVERY_TYPE_MAP[dtRaw] ?? DeliveryType.Home;
        if (!DELIVERY_TYPE_MAP[dtRaw]) {
            errors.push(
                `Delivery type "${dtRaw}" is invalid. Use: ${DELIVERY_TYPE_VALUES.join(", ")}`
            );
        }

        return {
            customerFullName,
            customerPhone,
            communeId: "",          // filled by resolveCommuneIds()
            communeRaw,
            wilayaRaw,
            codAmount: isNaN(codAmount) ? 0 : codAmount,
            description,
            weightKg: isNaN(weightKg) ? 0 : weightKg,
            deliveryType,
            _rowIndex: idx + 2,
            _valid: errors.length === 0,
            _errors: errors,
        } satisfies IBulkShipmentRow;
    });
}

// ─── Commune normalisation ────────────────────────────────────────────────────
// Strips accents, lowercases, collapses spaces/hyphens/underscores so that
// "Alger-Centre", "alger center", "Alger centre" all become "alger centre".

function normalizeCommune(name: string): string {
    return name
        .normalize("NFD")                          // decompose accented chars
        .replace(/[\u0300-\u036f]/g, "")          // strip accent marks
        .toLowerCase()
        .replace(/[-_]+/g, " ")                    // hyphens/underscores → space
        .replace(/\s+/g, " ")                      // collapse whitespace
        .trim();
}

// ─── Commune resolution ───────────────────────────────────────────────────────
// Fetches all available communes once, builds a normalised lookup map, then
// matches each row's communeRaw against it (with optional wilaya scoping).
//
// listDisponibleCommunes returns an array like:
//   { id: string; name: string; wilayaName?: string }[]
//
// If the commune name alone is ambiguous (same name in multiple wilayas) we
// try to narrow by wilayaRaw before falling back to the first match.

export interface ICommuneOption {
    id: string;
    name: string;
    wilayaName?: string;
}

export async function resolveCommuneIds(
    rows: IBulkShipmentRow[],
    listDisponibleCommunes: () => Promise<ICommuneOption[]>,
): Promise<IBulkShipmentRow[]> {
    // Fetch the full list once.
    let communes: ICommuneOption[] = [];
    try {
        communes = await listDisponibleCommunes();
    } catch {
        // If the fetch fails, mark every previously-valid row as unresolvable.
        return rows.map((row) => {
            if (!row._valid || !row.communeRaw) return row;
            return {
                ...row,
                _valid: false,
                _errors: [...row._errors, "Could not load commune list — please try again"],
            };
        });
    }

    // Build a normalised map: normalisedName → matching communes.
    // We keep an array per key so we can handle duplicates across wilayas.
    const index = new Map<string, ICommuneOption[]>();
    for (const c of communes) {
        const key = normalizeCommune(c.name);
        if (!index.has(key)) index.set(key, []);
        index.get(key)!.push(c);
    }

    return rows.map((row) => {
        // Skip rows that already failed validation or have no commune text.
        if (!row._valid || !row.communeRaw) return row;

        const normInput = normalizeCommune(row.communeRaw);
        const candidates = index.get(normInput);

        if (!candidates || candidates.length === 0) {
            return {
                ...row,
                _valid: false,
                _errors: [
                    ...row._errors,
                    `Commune "${row.communeRaw}" was not found. Check the spelling or use the exact name from the template.`,
                ],
            };
        }

        // If there's exactly one match, use it immediately.
        if (candidates.length === 1) {
            return { ...row, communeId: candidates[0].id };
        }

        // Multiple wilayas share this commune name — try to narrow by wilayaRaw.
        if (row.wilayaRaw) {
            const normWilaya = normalizeCommune(row.wilayaRaw);
            const scoped = candidates.find(
                (c) => c.wilayaName && normalizeCommune(c.wilayaName) === normWilaya
            );
            if (scoped) return { ...row, communeId: scoped.id };
        }

        // Fall back to the first match and accept it (ambiguous but best effort).
        return { ...row, communeId: candidates[0].id };
    });
}

// ─── Build ICreateShipment payload ───────────────────────────────────────────

export function rowToPayload(row: IBulkShipmentRow) {
    return {
        customer: {
            fullName: row.customerFullName,
            phoneNumber: row.customerPhone,
            communeId: row.communeId,
        },
        codAmount: row.codAmount,
        weightKg: row.weightKg,
        description: row.description || undefined,
        deliveryType: row.deliveryType,
    };
}

// ─── Error report export ──────────────────────────────────────────────────────

export function downloadErrorReport(rows: IBulkShipmentRow[]) {
    const invalid = rows.filter((r) => !r._valid);
    if (invalid.length === 0) return;

    const data = invalid.map((r) => ({
        "Row #": r._rowIndex,
        "Full Name": r.customerFullName,
        "Phone": r.customerPhone,
        "Commune": r.communeRaw,
        "Errors": r._errors.join("; "),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "import_errors.xlsx");
}