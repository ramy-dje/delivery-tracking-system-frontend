"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    IBranchResponse,
    ICreateBranchPayload,
    IUpdateBranchPayload,
    BranchType,
} from "@/types/branch";
import MapPicker, { MapCoords } from "@/components/commons/MapPicker";
import EntityPicker from "@/components/commons/EntityPicker";
import MultiEntityPicker from "@/components/commons/MultiEntityPicker";
import { GitBranch, Map, MapPin, Network, X } from "lucide-react";
import ActionBtn from "@/components/commons/ActionButton";
import InputField from "@/components/commons/InputField";
import SelectField from "@/components/commons/SelectField";
import { listBranches } from "@/services/BranchService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BranchModalProps {
    branch?: IBranchResponse | null;
    onClose: () => void;
    onSubmit: (payload: ICreateBranchPayload | IUpdateBranchPayload) => Promise<void>;
    loading?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRANCH_TYPES = [
    { label: "Regional Main Hub", value: "regional_main_hub" },
    { label: "Local Branch", value: "local_branch" },
];

function parentTypesFor(type: BranchType): BranchType[] {
    if (type === "local_branch") {
        return ["regional_main_hub"];
    }
    return [];
}

// ─── Component ────────────────────────────────────────────────────────────────

const BranchModal: React.FC<BranchModalProps> = ({
    branch,
    onClose,
    onSubmit,
    loading = false,
}) => {
    const isEdit = !!branch;

    // ── Form state ──────────────────────────────────────────────────────────
    const [name, setName] = useState(branch?.name ?? "");
    const [code, setCode] = useState(branch?.code ?? "");
    const [phone, setPhone] = useState(branch?.phone ?? "");
    const [email, setEmail] = useState(branch?.email ?? "");

    // Address
    const [street, setStreet] = useState(branch?.address?.street ?? "");
    const [city, setCity] = useState(branch?.address?.city ?? "");
    const [state, setState] = useState(branch?.address?.state ?? "");
    const [postalCode, setPostalCode] = useState(branch?.address?.postalCode ?? "");

    // Branch type
    const [branchType, setBranchType] = useState<BranchType>(
        branch?.branchType ?? "local_branch"
    );

    // Location — stored as [longitude, latitude] internally but MapPicker
    // uses { latitude, longitude }, so we convert on init and on submit.
    // State accepts null because MapPicker.onChange emits MapCoords | null.
    const [coords, setCoords] = useState<MapCoords | null>(
        branch?.location?.coordinates
            ? {
                latitude: branch.location.coordinates[1],
                longitude: branch.location.coordinates[0],
            }
            : null
    );

    // Capacity
    const [capacityLimit, setCapacityLimit] = useState<string>(
        branch?.capacityLimit != null ? String(branch.capacityLimit) : ""
    );

    // Parent hub picker
    // EntityPicker controls value by ID (string | null); we keep a lookup map
    // so we can still read the full IBranchResponse for the submit payload.
    const [parentHubId, setParentHubId] = useState<string | null>(
        branch?.parentHubId ?? null
    );
    const [parentHubMap, setParentHubMap] = useState<Record<string, IBranchResponse>>({});
    const [parentHubLoading, setParentHubLoading] = useState(false);

    // Served branches picker
    // MultiEntityPicker.onChange gives us (ids: string[], items: IBranchResponse[])
    // so we store the full objects directly.
    const [servedBranches, setServedBranches] = useState<IBranchResponse[]>([]);
    const [branchSearch, setBranchSearch] = useState("");

    // Operating hours
    const DAYS: Array<keyof typeof defaultHours> = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    const defaultHours = {
        monday: { open: "08:00", close: "17:00" },
        tuesday: { open: "08:00", close: "17:00" },
        wednesday: { open: "08:00", close: "17:00" },
        thursday: { open: "08:00", close: "17:00" },
        friday: { open: "08:00", close: "17:00" },
        saturday: { open: "09:00", close: "13:00" },
        sunday: { open: "09:00", close: "13:00" },
    };

    const [operatingHours, setOperatingHours] = useState<
        Record<string, { open: string; close: string }>
    >(branch?.operatingHours ?? defaultHours);

    // ── Derived helpers ─────────────────────────────────────────────────────
    const canHaveParent = parentTypesFor(branchType).length > 0;
    const canServeBranches = branchType === "regional_main_hub";

    // Clear parent/served when type changes
    useEffect(() => {
        if (!canHaveParent) setParentHubId(null);
        if (!canServeBranches) setServedBranches([]);
    }, [branchType, canHaveParent, canServeBranches]);

    // ── Parent hub fetcher ──────────────────────────────────────────────────
    const fetchParentNodes = useCallback(async (): Promise<IBranchResponse[]> => {
        const branches = (await listBranches()).data;
        return branches.filter((b) =>
            parentTypesFor(branchType).includes(b.branchType)
        );
    }, [branchType]);

    // Pre-populate parent hub when editing — build lookup map from fetched nodes
    useEffect(() => {
        if (!isEdit || !branch?.parentHubId) return;
        setParentHubLoading(true);
        fetchParentNodes()
            .then((nodes) => {
                const map: Record<string, IBranchResponse> = {};
                nodes.forEach((n) => { map[n._id] = n; });
                setParentHubMap(map);
                setParentHubId(branch.parentHubId ?? null);
            })
            .finally(() => setParentHubLoading(false));
    }, [isEdit, branch?.parentHubId, fetchParentNodes]);

    // ── Served branches fetcher ─────────────────────────────────────────────
    const fetchServableBranches = useCallback(async (): Promise<IBranchResponse[]> => {
        const branches = (await listBranches({ search: branchSearch || undefined })).data;
        return branches.filter((b) => b.branchType === "local_branch");
    }, [branchSearch]);

    // Pre-populate served branches when editing
    useEffect(() => {
        if (!isEdit || !branch?.servesBranches?.length) return;
        fetchServableBranches().then((all) => {
            const served = all.filter((b) =>
                branch.servesBranches!.includes(b._id)
            );
            setServedBranches(served);
        });
    }, [isEdit, branch?.servesBranches, fetchServableBranches]);

    // ── Operating hours helper ──────────────────────────────────────────────
    const updateHour = (
        day: string,
        field: "open" | "close",
        value: string
    ) => {
        setOperatingHours((prev) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    };

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const address = { street, city, state, postalCode: postalCode || undefined };

        const location = coords
            ? {
                type: "Point" as const,
                coordinates: [coords.longitude, coords.latitude] as [number, number],
            }
            : undefined;

        if (isEdit) {
            const payload: IUpdateBranchPayload = {
                name: name || undefined,
                address,
                location,
                phone: phone || undefined,
                email: email || undefined,
                operatingHours,
                capacityLimit: capacityLimit ? Number(capacityLimit) : undefined,
                branchType,
                parentHubId: parentHubId ?? null,
                servesBranches: servedBranches.map((b) => b._id),
            };
            await onSubmit(payload);
        } else {
            if (!location) {
                alert("Please select a location on the map.");
                return;
            }
            const payload: ICreateBranchPayload = {
                name,
                code,
                address,
                location,
                phone,
                email,
                operatingHours,
                capacityLimit: capacityLimit ? Number(capacityLimit) : undefined,
                branchType,
                parentHubId: parentHubId ?? undefined,
                servesBranches: servedBranches.map((b) => b._id),
            };
            await onSubmit(payload);
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background-surface shadow-xl">
                {/* Header */}
                <div className="sticky top-0 z-9990 flex items-center justify-between border-b bg-background-surface px-6 py-4">
                    <div className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">
                            {isEdit ? "Edit Branch" : "New Branch"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6 px-6 py-6">
                    {/* ── Basic Info ─────────────────────────────────────── */}
                    <section>
                        <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <InputField
                                label="Branch Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Downtown Hub"
                                required={!isEdit}
                            />
                            <InputField
                                label="Branch Code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g. DT-001"
                                required={!isEdit}
                                disabled={isEdit}
                            />
                            <InputField
                                label="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 555 000 0000"
                                required={!isEdit}
                            />
                            <InputField
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="branch@company.com"
                                required={!isEdit}
                            />
                            <InputField
                                label="Capacity Limit"
                                value={capacityLimit}
                                onChange={(e) => setCapacityLimit(e.target.value)}
                                placeholder="Optional"
                                type="number"
                            />
                            <SelectField
                                label="Branch Type"
                                value={branchType}
                                onChange={(v) => setBranchType(v as BranchType)}
                                options={BRANCH_TYPES}
                            />
                        </div>
                    </section>

                    {/* ── Address ────────────────────────────────────────── */}
                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                            <MapPin className="h-4 w-4" />
                            Address
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <InputField
                                    label="Street"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    placeholder="123 Main St"
                                    required={!isEdit}
                                />
                            </div>
                            <InputField
                                label="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="New York"
                                required={!isEdit}
                            />
                            <InputField
                                label="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="NY"
                                required={!isEdit}
                            />
                            <InputField
                                label="Postal Code"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="10001"
                            />
                        </div>
                    </section>

                    {/* ── Map ────────────────────────────────────────────── */}
                    <section>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                            <Map className="h-4 w-4" />
                            Location
                        </h3>
                        <MapPicker
                            value={coords}
                            onChange={setCoords}
                        />
                        {coords && (
                            <p className="mt-1 text-xs text-gray-400">
                                Lat: {coords.latitude.toFixed(6)}, Lng:{" "}
                                {coords.longitude.toFixed(6)}
                            </p>
                        )}
                    </section>

                    {/* ── Parent Hub ─────────────────────────────────────── */}
                    {canHaveParent && (
                        <section>
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                                <Network className="h-4 w-4" />
                                Parent Hub
                            </h3>
                            <EntityPicker<IBranchResponse>
                                label="Select Parent Hub"
                                value={parentHubId}
                                onChange={(id, item) => {
                                    setParentHubId(id);
                                    if (item) setParentHubMap((prev) => ({ ...prev, [item._id]: item }));
                                }}
                                fetchData={async () => {
                                    const nodes = await fetchParentNodes();
                                    const map: Record<string, IBranchResponse> = {};
                                    nodes.forEach((n) => { map[n._id] = n; });
                                    setParentHubMap(map);
                                    return nodes;
                                }}
                                getLabel={(n) => n.name}
                                getSubLabel={(n) =>
                                    n.branchType === "regional_main_hub"
                                        ? "Regional Hub"
                                        : "Local Branch"
                                }
                                getId={(n) => n._id}
                            />
                        </section>
                    )}

                    {/* ── Served Branches ────────────────────────────────── */}
                    {canServeBranches && (
                        <section>
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                                <GitBranch className="h-4 w-4" />
                                Served Branches
                            </h3>
                            <MultiEntityPicker<IBranchResponse>
                                label="Select Branches"
                                value={servedBranches.map((b) => b._id)}
                                onChange={(_ids, items) => setServedBranches(items)}
                                fetchData={fetchServableBranches}
                                getLabel={(b) => b.name}
                                getSubLabel={(b) => b.address?.city ?? ""}
                                getId={(b) => b._id}
                                onSearchChange={setBranchSearch}
                            />
                        </section>
                    )}

                    {/* ── Operating Hours ────────────────────────────────── */}
                    <section>
                        <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Operating Hours
                        </h3>
                        <div className="space-y-2">
                            {DAYS.map((day) => (
                                <div
                                    key={day}
                                    className="flex items-center gap-3"
                                >
                                    <span className="w-24 shrink-0 text-sm capitalize text-gray-700">
                                        {day}
                                    </span>
                                    <InputField
                                        label=""
                                        placeholder="Open"
                                        type="time"
                                        value={operatingHours[day]?.open ?? "08:00"}
                                        onChange={(v) => updateHour(day, "open", v.target.value)}
                                    />
                                    <span className="text-gray-400">–</span>
                                    <InputField
                                        placeholder="Close"
                                        label=""
                                        type="time"
                                        value={operatingHours[day]?.close ?? "17:00"}
                                        onChange={(v) => updateHour(day, "close", v.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background-surface px-6 py-4">


                    <ActionBtn
                        onClick={onClose}
                        label={"Cancel"}
                        type={"button"}
                        variant={"slate"}
                        size={"action"}


                    />
                    <ActionBtn
                        onClick={handleSubmit}
                        label={isEdit ? "Save Changes" : "Create Branch"}
                        type={"button"}
                        variant={"amber"}
                        size={"action"}
                    />
                </div>
            </div>
        </div>
    );
};

export default BranchModal;