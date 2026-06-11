export interface ICreateTransporter {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface ITransporterResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isOnline?: boolean;
}
