import { Role, ROLES } from "@/lib/roles";
import { IRegisterRequest } from "./auth";
import { IBaseFilter } from "./paginate";
import { IUser } from "./user";
import { IVehicleResponse } from "./vehicle";


export interface IDriverResponse extends IUser {
    logisticNodeId: string
}
export interface IDriverDetails {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: Role;
    isActive: boolean;
    ownedVehicles: IVehicleResponse[];
    assignedVehicle: IVehicleResponse | null;
    licenses: IDriverLicense[];
    shifts: IDriverShift[];
    createdAt: Date;
    activeShift?: IDriverShift | null;
}

export interface IDriverFilter extends IBaseFilter {
    search?: string;
    isOnDuty?: boolean;
}

export type DriverRole =
    | typeof ROLES.DRIVER
    | typeof ROLES.TRUCK_DRIVER;


export interface IDriverRegister extends IRegisterRequest {
    role: DriverRole;
    phoneNumber: string;
    logisticNodeId: string
}


export interface IDriverLicense {
    id: string;
    type: string;
    issuedDate: Date;
    expirationDate: Date;
}

export interface IDriverShift {
    id: string;
    startTime: Date;
    endTime?: Date;
}





