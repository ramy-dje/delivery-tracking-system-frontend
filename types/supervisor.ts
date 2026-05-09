
export interface IWorkSchedule {
  monday?: { start: string; end: string; active: boolean };
  tuesday?: { start: string; end: string; active: boolean };
  wednesday?: { start: string; end: string; active: boolean };
  thursday?: { start: string; end: string; active: boolean };
  friday?: { start: string; end: string; active: boolean };
  saturday?: { start: string; end: string; active: boolean };
  sunday?: { start: string; end: string; active: boolean };
}

export interface ICreateSupervisor {
  branchId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  permissions?: string[];
  workSchedule?: IWorkSchedule;
}

export interface ISupervisorResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      username?: string;
      imageUrl?: string;
    };
    companyId: {
      _id: string;
      name: string;
      businessType: string;
      status: string;
    };
    branchId: {
      _id: string;
      name: string;
      code: string;
      address?: string;
      status: string;
    };
    permissions: string[];
    workSchedule?: IWorkSchedule;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}