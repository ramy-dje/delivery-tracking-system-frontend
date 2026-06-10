import * as XLSX from "xlsx";
import { IBulkShipmentRow } from "@/types/bulk";
import { DeliveryType, PackageType, ICreatePackageBody } from "@/types/shipment";

// ─── Column aliases ───────────────────────────────────────────────────────────

const COLUMN_MAP: Record<string, keyof IBulkShipmentRow> = {
    "full name": "customerFullName",
    "customer name": "customerFullName",
    "name": "customerFullName",
    "phone": "customerPhone",
    "phone number": "customerPhone",
    "customer phone": "customerPhone",
    "alternative phone": "alternativePhone",
    "alt phone": "alternativePhone",
    "commune": "communeRaw",
    "commune id": "communeId",
    "city": "communeRaw",
    "wilaya": "wilayaRaw",
    "state": "wilayaRaw",
    "address": "address",
    "street": "address",
    "postal code": "postalCode",
    "delivery notes": "deliveryNotes",
    "notes": "deliveryNotes",
    "cod": "codAmount",
    "cod amount": "codAmount",
    "amount": "codAmount",
    "total price": "codAmount",
    "description": "description",
    "product": "description",
    "weight": "weightKg",
    "weight kg": "weightKg",
    "delivery type": "deliveryType",
    "type": "deliveryType",
    "delivery priority": "deliveryPriority",
    "priority": "deliveryPriority",
    "package type": "packageType",
    "fragile": "isFragile",
    "declared value": "declaredValue",
    "insurance": "declaredValue",
    "payment method": "paymentMethod",
    "estimated delivery": "estimatedDeliveryTime",
    "destination branch": "destinationBranchId",
};

// ─── Template ─────────────────────────────────────────────────────────────────

export const TEMPLATE_COLUMNS = [
    "Full Name",
    "Phone Number",
    "Alternative Phone",
    "Address",
    "City/Commune",
    "State/Wilaya",
    "Postal Code",
    "Delivery Notes",
    "COD Amount (DZD)",
    "Description",
    "Weight (kg)",
    "Package Type",
    "Fragile (yes/no)",
    "Declared Value (DZD)",
    "Delivery Type",
    "Delivery Priority",
    "Payment Method",
    "Destination Branch ID (for branch pickup)",
    "Estimated Delivery Time (YYYY-MM-DD HH:MM)",
];

export const TEMPLATE_EXAMPLE_ROW = [
    "Ahmed Bensalem",
    "0555123456",
    "0555987654",
    "12 Rue Didouche Mourad",
    "Alger Centre",
    "Alger",
    "16000",
    "Call before delivery",
    "2500",
    "Smartphone",
    "0.5",
    "electronic",
    "yes",
    "5000",
    "home",
    "express",
    "cod",
    "",
    "2024-12-25 14:00",
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
const PACKAGE_TYPES: PackageType[] = ["document", "parcel", "fragile", "heavy", "perishable", "electronic", "clothing"];
const DELIVERY_TYPE_MAP: Record<string, DeliveryType> = {
    "home": "home",
    "domicile": "home",
    "branch_pickup": "branch_pickup",
    "relais": "branch_pickup",
    "stopdesk": "branch_pickup",
};
const DELIVERY_PRIORITIES = ["standard", "express", "same_day"];
const PAYMENT_METHODS = ["cash", "card", "cod", "wallet", "bank_transfer", "branch_payment"];

function normalizeKey(raw: string): keyof IBulkShipmentRow | null {
    return COLUMN_MAP[raw.toLowerCase().trim()] ?? null;
}

function parseBool(val: string): boolean {
    return ["true", "yes", "1", "oui", "y"].includes(val.toLowerCase().trim());
}

export function validateBulkRows(raw: Record<string, string>[]): IBulkShipmentRow[] {
    return raw.map((rawRow, idx) => {
        const norm: Partial<Record<keyof IBulkShipmentRow, string>> = {};
        for (const [k, v] of Object.entries(rawRow)) {
            const mapped = normalizeKey(k);
            if (mapped) norm[mapped] = String(v);
        }

        const errors: string[] = [];

        // Recipient info
        const customerFullName = (norm.customerFullName as string | undefined)?.trim() ?? "";
        if (!customerFullName) errors.push("Full name is required");

        const customerPhone = (norm.customerPhone as string | undefined)?.trim() ?? "";
        if (!customerPhone) errors.push("Phone is required");
        else if (!PHONE_RE.test(customerPhone))
            errors.push("Phone must be a valid Algerian number (e.g. 0555123456)");

        const alternativePhone = (norm.alternativePhone as string | undefined)?.trim() ?? "";
        if (alternativePhone && !PHONE_RE.test(alternativePhone))
            errors.push("Alternative phone must be a valid Algerian number");

        // Address info
        const address = (norm.address as string | undefined)?.trim() ?? "";
        if (!address) errors.push("Address is required");

        const communeRaw = (norm.communeRaw as string | undefined)?.trim() ?? "";
        if (!communeRaw) errors.push("City/Commune is required");

        const wilayaRaw = (norm.wilayaRaw as string | undefined)?.trim() ?? "";
        if (!wilayaRaw) errors.push("State/Wilaya is required");

        const postalCode = (norm.postalCode as string | undefined)?.trim() ?? "";
        const deliveryNotes = (norm.deliveryNotes as string | undefined)?.trim() ?? "";

        // Pricing
        const codRaw = (norm.codAmount as string | undefined)?.trim() ?? "";
        const codAmount = parseFloat(codRaw);
        if (!codRaw) errors.push("COD amount is required");
        else if (isNaN(codAmount) || codAmount < 0)
            errors.push("COD amount must be a positive number");

        // Package details
        const description = (norm.description as string | undefined)?.trim() ?? "";

        const weightRaw = (norm.weightKg as string | undefined)?.trim() ?? "";
        const weightKg = parseFloat(weightRaw);
        if (!weightRaw) errors.push("Weight is required");
        else if (isNaN(weightKg) || weightKg <= 0)
            errors.push("Weight must be a positive number");

        const packageType = ((norm.packageType as string | undefined) ?? "parcel").toLowerCase().trim();
        if (!PACKAGE_TYPES.includes(packageType as PackageType)) {
            errors.push(`Package type "${packageType}" is invalid. Use: ${PACKAGE_TYPES.join(", ")}`);
        }

        const isFragile = parseBool((norm.isFragile as string) ?? "false");

        const declaredValueRaw = (norm.declaredValue as string | undefined)?.trim() ?? "";
        const declaredValue = declaredValueRaw ? parseFloat(declaredValueRaw) : undefined;
        if (declaredValueRaw && (isNaN(declaredValue) || declaredValue < 0))
            errors.push("Declared value must be a positive number");

        // Delivery options
        const dtRaw = ((norm.deliveryType as string | undefined) ?? "home").toLowerCase().trim();
        const deliveryType = DELIVERY_TYPE_MAP[dtRaw] ?? "home";
        if (!DELIVERY_TYPE_MAP[dtRaw]) {
            errors.push(`Delivery type "${dtRaw}" is invalid. Use: home, branch_pickup`);
        }

        const deliveryPriority = ((norm.deliveryPriority as string | undefined) ?? "standard").toLowerCase().trim();
        if (!DELIVERY_PRIORITIES.includes(deliveryPriority)) {
            errors.push(`Delivery priority "${deliveryPriority}" is invalid. Use: standard, express, same_day`);
        }

        const paymentMethod = ((norm.paymentMethod as string | undefined) ?? "").toLowerCase().trim();
        if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
            errors.push(`Payment method "${paymentMethod}" is invalid. Use: cash, card, cod, wallet, bank_transfer, branch_payment`);
        }

        const destinationBranchId = (norm.destinationBranchId as string | undefined)?.trim() ?? "";
        if (deliveryType === "branch_pickup" && !destinationBranchId) {
            errors.push("Destination branch ID is required for branch_pickup delivery type");
        }

        const estimatedDeliveryTime = (norm.estimatedDeliveryTime as string | undefined)?.trim() ?? "";

        return {
            customerFullName,
            customerPhone,
            alternativePhone,
            address,
            communeRaw,
            wilayaRaw,
            postalCode,
            deliveryNotes,
            communeId: "",
            codAmount: isNaN(codAmount) ? 0 : codAmount,
            description,
            weightKg: isNaN(weightKg) ? 0 : weightKg,
            packageType: packageType as PackageType,
            isFragile,
            declaredValue: isNaN(declaredValue) ? undefined : declaredValue,
            deliveryType,
            deliveryPriority: deliveryPriority as "standard" | "express" | "same_day",
            paymentMethod: paymentMethod || undefined,
            destinationBranchId: destinationBranchId || undefined,
            estimatedDeliveryTime: estimatedDeliveryTime || undefined,
            _rowIndex: idx + 2,
            _valid: errors.length === 0,
            _errors: errors,
        } satisfies IBulkShipmentRow;
    });
}

// ─── Commune normalisation ────────────────────────────────────────────────────

function normalizeCommune(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export interface ICommuneOption {
    id: string;
    name: string;
    wilayaName?: string;
}

export async function resolveCommuneIds(
    rows: IBulkShipmentRow[],
    listDisponibleCommunes: () => Promise<ICommuneOption[]>,
): Promise<IBulkShipmentRow[]> {
    let communes: ICommuneOption[] = [];
    try {
        communes = await listDisponibleCommunes();
    } catch {
        return rows.map((row) => {
            if (!row._valid || !row.communeRaw) return row;
            return {
                ...row,
                _valid: false,
                _errors: [...row._errors, "Could not load commune list — please try again"],
            };
        });
    }

    const index = new Map<string, ICommuneOption[]>();
    for (const c of communes) {
        const key = normalizeCommune(c.name);
        if (!index.has(key)) index.set(key, []);
        index.get(key)!.push(c);
    }

    return rows.map((row) => {
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

        if (candidates.length === 1) {
            return { ...row, communeId: candidates[0].id };
        }

        if (row.wilayaRaw) {
            const normWilaya = normalizeCommune(row.wilayaRaw);
            const scoped = candidates.find(
                (c) => c.wilayaName && normalizeCommune(c.wilayaName) === normWilaya
            );
            if (scoped) return { ...row, communeId: scoped.id };
        }

        return { ...row, communeId: candidates[0].id };
    });
}

// ─── Build ICreatePackageBody payload ─────────────────────────────────────────

export function rowToPayload(row: IBulkShipmentRow): ICreatePackageBody {
    const payload: ICreatePackageBody = {
        recipientName: row.customerFullName,
        recipientPhone: row.customerPhone,
        alternativePhone: row.alternativePhone || undefined,
        recipientAddress: row.address,
        recipientCity: row.communeRaw,
        recipientState: row.wilayaRaw,
        recipientPostalCode: row.postalCode || undefined,
        deliveryNotes: row.deliveryNotes || undefined,

        weight: row.weightKg,
        isFragile: row.isFragile,
        type: row.packageType,
        description: row.description || undefined,
        declaredValue: row.declaredValue,

        deliveryType: row.deliveryType,
        deliveryPriority: row.deliveryPriority,
        destinationBranchId: row.destinationBranchId,

        totalPrice: row.codAmount,
        paymentMethod: row.paymentMethod,

        estimatedDeliveryTime: row.estimatedDeliveryTime,
        originBranchId: "", // Will be set by the API or ignored for freelancer
    };

    // Add dimensions if provided (you can add this to the template if needed)
    if (row.dimensions) {
        payload.dimensions = row.dimensions;
    }

    return payload;
}

// ─── Error report export ──────────────────────────────────────────────────────

export function downloadErrorReport(rows: IBulkShipmentRow[]) {
    const invalid = rows.filter((r) => !r._valid);
    if (invalid.length === 0) return;

    const data = invalid.map((r) => ({
        "Row #": r._rowIndex,
        "Full Name": r.customerFullName,
        "Phone": r.customerPhone,
        "City": r.communeRaw,
        "Errors": r._errors.join("; "),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 60 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "import_errors.xlsx");
}