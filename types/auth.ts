import { IBranchAddress } from "./branch";
import { IUser } from "./user";

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}

export interface IAuthResponseDto {
  accessToken: string;
  message?: string;
  user: IUser;
  associated?: IManager | null;
}

export interface IManager extends Document {
  userId: string;
  companyId?: string;

  accessLevel: string;
  permissions: string;

  branchAccess: IBranchAddress;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  hasFullAccess: boolean;
  hasLimitedAccess: boolean;
  hasViewOnlyAccess: boolean;
  accessibleBranches: string[];
}