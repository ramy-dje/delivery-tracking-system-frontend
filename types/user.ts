import { Role } from "@/lib/roles";


export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  companyId?: string;
  logisticsNodeId?: string;
  phoneNumber?: string;
  isActive?: boolean;
}


export interface IUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}