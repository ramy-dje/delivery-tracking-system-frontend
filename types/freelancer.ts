export interface ICreateFreelancer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface IFreelancerResponse {
  businessType: string;
  companyId: string;
  createdAt: string;
  defaultOriginBranchId: {
    _id: string;
    name: string;
    code: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    status: string;
  };
  lastActiveAt: string;
  preferredDeliveryType: string;
  statistics: {
    totalPackagesSent: number;
    packagesInTransit: number;
    packagesDelivered: number;
    packagesFailed: number;
    packagesCancelled: number;
  };
  status: string;
  updatedAt: string;
  userId: {
    email: string;
    firstName: string;
    imageUrl: {
      public_id: string | null;
      url: string | null;
    };
    lastName: string;
    phone: string;
    role: string;
    status: string;
    _id: string;
  };
  _id: string;
  __v: number;
}