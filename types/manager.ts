import { Role } from "@/lib/roles";
import { IRegisterRequest } from "./auth";

export interface IManagerResponse {
    id: string;
    email: string;
    fullName: string;
    role: string;
    logisticsNodeId?: string | null;
    phoneNumber?: string | null;
    isActive: boolean;
    logisticsNodeName?: string | null;
}

export interface IManagerDetail extends IManagerResponse {
    companyId?: string | null;
    nodeName?: string | null;
    nodeType?: string | null;
}

export interface ICreateManagerRequest extends IRegisterRequest {
    role: Role;
    logisticsNodeId: string | null;
}

export interface IAssignManagerRequest {
    logisticsNodeId: string;
    role?: Role;
}

export interface IManagerRoleChangeLog {
    id: string;
    companyId: string;
    targetUserId: string;
    targetUserEmail: string;
    previousRole: string;
    newRole: string;
    logisticsNodeId?: string | null;
    changedByUserId: string;
    changedByUserName: string;
    notes?: string | null;
    createdAt: string;
}
