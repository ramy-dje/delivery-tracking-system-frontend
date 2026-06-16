export interface ICreateTransporter {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  currentVehicleId?: string;
}

export interface ITransporterResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isOnline?: boolean;
  currentVehicleId?: string;
}
