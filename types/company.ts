import { Role } from "@/lib/roles";
import { IUser, IUserSummary } from "./user";

export type CompanyBusinessType = "solo" | "company";

export type CompanyStatus = "active" | "inactive" | "suspended" | "pending";

export interface IHeadquarters {
  street: string;
  city: string;
  state: string;
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