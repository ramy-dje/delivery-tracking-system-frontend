import { Role } from "@/lib/roles";


export interface IUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  companyId?: string;
  logisticsNodeId?: string;
  phoneNumber?: string;
  isActive?: boolean;

}

export interface IUserSummary {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}