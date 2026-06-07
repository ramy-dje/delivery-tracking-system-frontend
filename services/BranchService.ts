import api from "@/lib/api";
import { getCompanyId } from "@/hooks/useAuth";
import { IBranchDetails, IBranchFilter, IBranchResponse, ICreateBranchPayload, IUpdateBranchPayload } from "@/types/branch";
import { IPaginatedResponse } from "@/types/paginate";

const baseForCompany = (companyId: string) => `/companies/${companyId}/branches`;


export const listBranches = async (params?: IBranchFilter): Promise<IPaginatedResponse<IBranchResponse>> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.get(baseForCompany(companyId), { params });
    return res.data;
};

export const getDeletedBranches = async (): Promise<IBranchResponse[]> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.get(`${baseForCompany(companyId)}/deleted`);
    return res.data;
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
    const res = await api.put(`${baseForCompany(companyId)}/${id}`, payload);
    return res.data;
};

export const deleteBranch = async (id: string): Promise<boolean> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.delete(`${baseForCompany(companyId)}/${id}`);
    return res.status === 204;
};

export const restoreBranch = async (id: string): Promise<boolean> => {
    const companyId = getCompanyId();
    if (!companyId) throw new Error("No company id");
    const res = await api.put(`${baseForCompany(companyId)}/${id}/restore`);
    return res.status === 204;
};