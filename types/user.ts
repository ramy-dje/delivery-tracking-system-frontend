import { Role } from "@/lib/roles";


export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl?: {
    public_id: string;
    url: string;
  };
  email: string;
  role: Role;
  companyId?: string;
  branchId?: string;
  logisticsNodeId?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface IUpdateUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: {
    public_id: string;
    url: string;
  };
  phoneNumber?: string;
  password?: string;
  newPassword?: string;
}

export interface IUpdateUserResponse {
  success: boolean;
  message: string;
  isEmailChange: boolean;
  user: IUser;
}


export interface IUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}