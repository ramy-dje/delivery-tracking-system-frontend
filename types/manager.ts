import { Role } from "@/lib/roles";
import { IRegisterRequest } from "./auth";

export type ManagerAccessLevel = "full" | "limited" | "view_only";

export type ManagerPermission =
    | 'can_manage_users'
    | 'can_manage_branches'
    | 'can_view_financials'
    | 'can_manage_settings'
    | 'can_manage_subscription'
    | 'can_view_all_branches'
    | 'can_export_data'
    | 'can_manage_vehicles'
    | 'can_manage_deliverers'
    | 'can_manage_supervisors'
    | 'can_view_analytics'
    | 'can_manage_reports';

export interface IBranchAccess {
    allBranches: boolean;
    specificBranches: string[];
}

export interface IManagerResponse {
    id: string; // Used for listing (usually user id or manager id, depending on backend response)
    managerId?: string;
    email: string;
    fullName: string;
    phone?: string | null;
    role: string;
    accessLevel: ManagerAccessLevel;
    permissions: ManagerPermission[];
    branchAccess: IBranchAccess;
    isActive: boolean;
}

export interface IManagerDetail extends IManagerResponse {
    companyId?: string | null;
}

export interface ICreateManagerRequest extends IRegisterRequest {
    accessLevel: ManagerAccessLevel;
    permissions?: ManagerPermission[];
    branchAccess?: IBranchAccess;
}

export interface IAssignManagerRequest {
    accessLevel?: ManagerAccessLevel;
    permissions?: ManagerPermission[];
    branchAccess?: IBranchAccess;
    isActive?: boolean;
}

export interface IManagerRoleChangeLog {
    id: string;
    companyId: string;
    targetUserId: string;
    targetUserEmail: string;
    previousRole: string;
    newRole: string;
    changedByUserId: string;
    changedByUserName: string;
    notes?: string | null;
    createdAt: string;
}
