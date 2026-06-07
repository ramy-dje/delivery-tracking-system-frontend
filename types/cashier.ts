import { IUser } from "./user";

export interface ICashier {
    _id: string;
    userId: IUser;
    companyId: any;
    assignedBranchId: any;
    counterNumber?: number;
    employeeCode: string;
    status: "active" | "inactive" | "suspended";
    createdAt: string;
    updatedAt: string;
}

export interface ICreateCashierBody {
    email: string;
    phone: string;
    password?: string;
    firstName: string;
    lastName: string;
    counterNumber?: number;
    employeeCode: string;
}

export interface IUpdateCashierBody {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    counterNumber?: number;
    employeeCode?: string;
}
