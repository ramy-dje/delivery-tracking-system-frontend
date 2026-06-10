// types/supervisor.ts

export type WeekDay =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export type SupervisorPermission =
    | "can_manage_deliverers"
    | "can_manage_packages"
    | "can_manage_vehicles"
    | "can_manage_cashiers"
    | "can_manage_loaders"
    | "can_view_reports"
    | "can_approve_deliverers"
    | "can_modify_branch_settings"
    | "can_view_analytics"
    | "can_manage_schedules"
    | "can_assign_tasks"
    | "can_handle_complaints";

export interface IWorkScheduleDay {
    start: string;
    end: string;
    dayOff: boolean;
}

export interface IPerformance {
    packagesManaged: number;
    deliverersSupervised: number;
    cashiersSupervised: number;
    loadersSupervised: number;
    issuesResolved: number;
    averageResponseTime: number;
    rating?: number;
}

export interface IUserData {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username?: string;
    imageUrl?: string;
}

export interface IBranchData {
    _id: string;
    name: string;
    code?: string;
    address?: string;
    status?: string;
}

export interface ISupervisorResponse {
    _id: string;
    userId: string | IUserData;

    companyId: string;
    branchId: string | IBranchData;

    permissions: SupervisorPermission[];

    isActive: boolean;

    createdAt: string;
    updatedAt: string;
}

export interface ISupervisorDetail extends ISupervisorResponse {
    workSchedule: Record<WeekDay, IWorkScheduleDay>;

    performance: IPerformance;

    isCurrentlyWorking?: boolean;

    currentWorkHours?: {
        start: string;
        end: string;
    } | null;

    formattedSchedule?: Record<WeekDay, string>;
}

export interface ICreateSupervisorRequest {
    branchId: string;

    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;

    permissions?: SupervisorPermission[];

    workSchedule?: Partial<
        Record<WeekDay, IWorkScheduleDay>
    >;
}

export interface IUpdateSupervisorRequest {
    permissions?: SupervisorPermission[];

    workSchedule?: Partial<
        Record<WeekDay, IWorkScheduleDay>
    >;

    isActive?: boolean;

    userData?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    };
}

export interface IGetSupervisorsResponse {
    success: boolean;
    count: number;
    data: ISupervisorResponse[];
}

export interface ISingleSupervisorResponse {
    success: boolean;
    data: ISupervisorDetail;
}

export interface ICreateSupervisorResponse {
    success: boolean;
    message: string;
    data: ISupervisorDetail;
}

export interface IUpdateSupervisorResponse {
    success: boolean;
    message: string;
    data: ISupervisorDetail;
}

export interface IToggleSupervisorResponse {
    success: boolean;
    message: string;
    data: {
        supervisor: ISupervisorDetail;
        isActive: boolean;
    };
}