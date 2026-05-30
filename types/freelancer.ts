export interface ICreateFreelancer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface IFreelancerResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
}
