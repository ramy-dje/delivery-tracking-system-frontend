import { IUser } from "./user";

export interface ILoader {
    _id: string;
    userId: IUser;
    companyId: any;
    assignedBranchId: any;
    employeeCode: string;
    status: "active" | "inactive" | "suspended";
    createdAt: string;
    updatedAt: string;
}

export interface ICreateLoaderBody {
    email: string;
    phone: string;
    password?: string;
    firstName: string;
    lastName: string;
}

export interface IUpdateLoaderBody {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    employeeCode?: string;
}
