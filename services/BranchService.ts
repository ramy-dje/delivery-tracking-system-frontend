import api from "@/lib/api";
import { getCompanyId } from "@/hooks/useAuth";
import {
    IBranchDetails,
    IBranchResponse,
    ICreateBranchPayload,
    IUpdateBranchPayload,
} from "@/types/branch";

const base = (companyId: string) => `manager/companies/${companyId}/branches`;

// ── List branches (plain array, no pagination) ───────────────────────────────
// Query params the backend accepts: status, city, search
export interface IBranchFilter {
    status?: string;
    city?: string;
    search?: string;
    pageNumber?: number;
    pageSize?: number;
}

export const listBranches = async (
    params?: IBranchFilter,
): Promise<{ data: IBranchResponse[]; pagination: any }> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.get(base(companyId), { params });
    // Backend returns { success, count, data: [...] }
    return res.data;
};

// ── Get single branch ────────────────────────────────────────────────────────
export const getBranch = async (branchId: string): Promise<IBranchDetails> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.get(`${base(companyId)}/${branchId}`);
    return res.data.data;
};

// ── Create branch ────────────────────────────────────────────────────────────
export const createBranch = async (
    payload: ICreateBranchPayload,
): Promise<IBranchResponse> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.post(base(companyId), payload);
    return res.data.data;
};

// ── Update branch (PATCH, not PUT) ───────────────────────────────────────────
export const updateBranch = async (
    branchId: string,
    payload: IUpdateBranchPayload,
): Promise<IBranchResponse> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.patch(`${base(companyId)}/${branchId}`, payload);
    return res.data.data;
};

// ── Toggle block/activate branch ─────────────────────────────────────────────
export const toggleBlockBranch = async (
    branchId: string,
): Promise<{ branch: IBranchResponse; newStatus: string }> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.patch(
        `${base(companyId)}/${branchId}/toggle-block`,
    );
    return res.data.data;
};

// ── Get branch supervisor ────────────────────────────────────────────────────
export const getBranchSupervisor = async (branchId: string): Promise<unknown> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.get(`${base(companyId)}/${branchId}/supervisor`);
    return res.data.data;
};