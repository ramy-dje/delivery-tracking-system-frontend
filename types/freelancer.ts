export interface ICreateFreelancer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface IFreelancerResponse {
  _id: string;

  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    status: string;
    imageUrl: {
      public_id: string | null;
      url: string | null;
    };
  };

  companyId: {
    _id: string;
    name?: string;
    email?: string;
    status?: string;
    businessType?: string;
  };

  defaultOriginBranchId?: {
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

  businessType: string;
  status: string;
  preferredDeliveryType: string;

  statistics: {
    totalPackagesSent: number;
    packagesInTransit: number;
    packagesDelivered: number;
    packagesFailed: number;
    packagesCancelled: number;
  };

  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IFreelancerFilter {
  search?: string;
  companyId?: string;
  status?: string;
  businessType?: string;
  pageNumber?: number;
  pageSize?: number;
}