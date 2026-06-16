export type AvailabilityStatus = 'available' | 'on_route' | 'off_duty' | 'on_break' | 'maintenance';
export type VerificationStatus = 'pending' | 'in_review' | 'verified' | 'rejected';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; 
}

export interface IDelivererDocuments {
  contractImage?: string; 
  idCardImage?: string; 
  licenseImage?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  backgroundCheck?: string;
  insuranceImage?: string;
}

export interface IPerformance {
  averageDeliveryTime: number; 
  onTimeDeliveryRate: number;
  customerSatisfaction: number;
  totalDistanceCovered: number;
}

export interface IDelivererResponse {
  _id: string;
  id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    imageUrl?: string;
    role: string;
    status: string;
  };
  branchId: {
    _id: string;
    name: string;
    code: string;
    address: string;
    status: string;
  };
  companyId: {
    _id: string;
    name: string;
    businessType: string;
    status: string;
  };
  
  currentLocation?: ILocation;
  lastLocationUpdate?: string;

  currentVehicleId?: string;
  currentRouteId?: string;

  availabilityStatus: AvailabilityStatus;
  verificationStatus: VerificationStatus;
  documents?: IDelivererDocuments;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;

  rating: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  
  commission: number;
  totalEarnings: number;
  pendingBranchReturn: number;

  todayEarnings: number;
  todayDeliveriesCount: number;
  todayCollectedAmount: number;

  performance: IPerformance;

  isActive: boolean;
  isOnline: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
  
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

export interface ICreateDelivererPayload {
  email: string;
  phone: string;
  password?: string;
  firstName: string;
  lastName: string;
  documents?: IDelivererDocuments;
  currentVehicleId?: string;
}

export interface IUpdateDelivererPayload {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  documents?: IDelivererDocuments;
  availabilityStatus?: AvailabilityStatus;
  currentVehicleId?: string;
}
