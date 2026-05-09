import { IRegisterRequest } from "./auth";
import { IUser } from "./user";
import { Role } from "@/lib/roles";

export interface IStaffResponse extends IUser {
    logisticNodeId: string
}

export interface IStaffRegister extends IRegisterRequest {
    role: Role;
    phoneNumber: string;
    logisticNodeId: string
}
