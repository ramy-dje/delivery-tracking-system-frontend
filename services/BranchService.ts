import api from "@/lib/api";
import { getCompanyId } from "@/hooks/useAuth";
import { IBranchDetails, IBranchFilter, IBranchResponse, ICreateBranchPayload, IUpdateBranchPayload } from "@/types/branch";
import { IPaginatedResponse } from "@/types/paginate";

const baseForCompany = (companyId: string) => `/manager/companies/${companyId}/branches`;


export const listBranches = async (params?: IBranchFilter): Promise<IPaginatedResponse<IBranchResponse>> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    // Add status=active by default unless overridden
    const finalParams = { status: 'active', ...params };
    const res = await api.get(baseForCompany(companyId), { params: finalParams });
    
    // Adapt backend response { data: [] } to IPaginatedResponse
    if (res.data.data) {
        return {
            items: res.data.data,
            totalCount: res.data.count || res.data.data.length,
            pageNumber: 1,
            pageSize: res.data.data.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
        };
    }
    return res.data;
};

export const getDeletedBranches = async (): Promise<IBranchResponse[]> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.get(baseForCompany(companyId), { params: { status: 'inactive' } });
    return res.data.data || [];
};

export const getBranch = async (id: string): Promise<IBranchDetails> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.get(`${baseForCompany(companyId)}/${id}`);
    return res.data;
};

export const createBranch = async (payload: ICreateBranchPayload): Promise<IBranchResponse> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.post(baseForCompany(companyId), payload);
    return res.data;
};

export const updateBranch = async (id: string, payload: IUpdateBranchPayload): Promise<IBranchResponse> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.patch(`${baseForCompany(companyId)}/${id}`, payload);
    return res.data;
};

export const deleteBranch = async (id: string): Promise<boolean> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.patch(`${baseForCompany(companyId)}/${id}/toggle-block`);
    return res.status === 200;
};

export const restoreBranch = async (id: string): Promise<boolean> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.patch(`${baseForCompany(companyId)}/${id}/toggle-block`);
    return res.status === 200;
};