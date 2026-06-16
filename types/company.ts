import { Role } from "@/lib/roles";
import { IUser, IUserSummary } from "./user";

export type CompanyBusinessType = "solo" | "company";

export type CompanyStatus = "active" | "inactive" | "suspended" | "pending";

export interface IHeadquarters {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface ICompany {
  _id: string;
  name: string;
  businessType: CompanyBusinessType;
  userId: string | IUserSummary;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  logo?: string;
  headquarters?: IHeadquarters;
  status: CompanyStatus;

  createdAt: string;
  updatedAt: string;

  // Virtuals
  isSolo: boolean;
  isActive: boolean;
  formattedAddress?: string;
}

export interface ICompanyResponse {
  success: boolean;
  message: string;
  user: IUser;
  associated: null;
  Role: Role;
  accessToken: string;
}

export interface IMyCompanyFilter {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: CompanyStatus;
}

export interface ICreateCompanyInput {
  name: string;
  businessType: CompanyBusinessType;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  logo?: string;
  headquarters?: IHeadquarters;
}

export interface IUpdateCompanyInput {
  name?: string;
  businessType?: CompanyBusinessType;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  logo?: string;
  headquarters?: IHeadquarters;
}

export type ManagerAccessLevel = "full" | "limited" | "view_only";

export type ManagerPermission =
  | "can_manage_users"
  | "can_manage_branches"
  | "can_view_financials"
  | "can_manage_settings"
  | "can_manage_subscription"
  | "can_view_all_branches"
  | "can_export_data"
  | "can_manage_vehicles"
  | "can_manage_deliverers"
  | "can_manage_supervisors"
  | "can_manage_cashiers"
  | "can_manage_loaders"
  | "can_view_analytics"
  | "can_manage_reports";

export interface IBranchAccessDTO {
  allBranches: boolean;
  specificBranches: string[]; // frontend-safe (ObjectId → string)
  count: number;
}

export interface IManagerCapabilities {
  canManageUsers: boolean;
  canManageBranches: boolean;
  canViewFinancials: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canManageVehicles: boolean;
  canManageDeliverers: boolean;
  canManageReports: boolean;
}

export interface IMyCompanyManager {
  accessLevel: ManagerAccessLevel;
  permissions: ManagerPermission[];

  branchAccess: IBranchAccessDTO;

  isActive: boolean;

  hasFullAccess: boolean;
  hasLimitedAccess: boolean;
  hasViewOnlyAccess: boolean;

  capabilities: IManagerCapabilities;
}

export interface IMyCompanySummary {
  role: ManagerAccessLevel;
  totalPermissions: number;
  accessibleBranchCount: number;
}

export interface IMyCompanyResponse {
  success: boolean;

  data: {
    company: ICompany;

    manager: IMyCompanyManager;

    user: IUser | IUserSummary;

    summary: IMyCompanySummary;
  };
}