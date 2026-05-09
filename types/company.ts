import { IUser, IUserSummary } from "./user";

export type CompanyBusinessType = "solo" | "company";

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

export interface ICompanyLogo {
  public_id: string;
  url: string;
}

export interface ICompany {
  _id: string;
  name: string;
  businessType: CompanyBusinessType;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  logo?: ICompanyLogo;
  headquarters?: IHeadquarters;
  status: "active" | "inactive" | "suspended";
  userId: string | IUserSummary;
  createdAt: string;
  updatedAt: string;
}



export interface IManager {
  _id: string;
  userId: string;
  role?: string;
}


export interface ICompanyResponse {
  success: boolean;
  message: string;
  data: {
    company: ICompany;       
    user: IUser;      
    manager: IManager | null;
  };
}

export interface ICreateCompanyInput {
  name: string;
  businessType: CompanyBusinessType;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  logo?: ICompanyLogo;
  headquarters?: IHeadquarters;
}