import { z } from 'zod'

// Common schemas
export const idSchema = z.string().min(1, 'ID is required')
export const emailSchema = z.string().email('Invalid email address')
export const phoneSchema = z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number')
export const dateSchema = z.string().or(z.date())
export const statusSchema = z.enum(['active', 'inactive', 'pending', 'suspended'])

// Admin schemas
export const adminRoleSchema = z.enum(['super_admin', 'admin', 'staff'])
export const adminStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended'])

export const adminSchema = z.object({
  id: idSchema.optional(),
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  role: adminRoleSchema,
  status: adminStatusSchema,
  imageUrl: z.string().optional(),
})

export type Admin = z.infer<typeof adminSchema>

// Company schemas
export const companyTypeSchema = z.enum(['solo', 'small_business', 'ecommerce', 'enterprise'])

export const companySchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(1, 'Company name is required'),
  businessType: companyTypeSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  status: statusSchema,
  imageUrl: z.string().optional(),
})

export type Company = z.infer<typeof companySchema>

// Branch schemas
export const daySchema = z.enum([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])

export const operatingHourSchema = z.object({
  day: daySchema,
  isOpen: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
})

export const branchSchema = z.object({
  id: idSchema.optional(),
  companyId: idSchema,
  name: z.string().min(1, 'Branch name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  maxCapacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  operatingHours: z.array(operatingHourSchema).optional(),
  status: statusSchema,
})

export type Branch = z.infer<typeof branchSchema>
export type OperatingHour = z.infer<typeof operatingHourSchema>

// Client schemas
export const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  isDefault: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const clientSchema = z.object({
  id: idSchema.optional(),
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  addresses: z.array(addressSchema).optional(),
  status: statusSchema,
  imageUrl: z.string().optional(),
})

export type Client = z.infer<typeof clientSchema>
export type Address = z.infer<typeof addressSchema>

// Manager schemas
export const managerPermissionSchema = z.object({
  resource: z.string(),
  canCreate: z.boolean().optional(),
  canRead: z.boolean().optional(),
  canUpdate: z.boolean().optional(),
  canDelete: z.boolean().optional(),
})

export const managerSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  companyId: idSchema,
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  permissions: z.array(managerPermissionSchema).optional(),
  status: statusSchema,
  lastLogin: dateSchema.optional(),
})

export type Manager = z.infer<typeof managerSchema>
export type ManagerPermission = z.infer<typeof managerPermissionSchema>

// Freelancer schemas
export const freelancerTypeSchema = z.enum(['individual', 'small_business', 'ecommerce', 'other'])

export const freelancerStatisticsSchema = z.object({
  totalDeliveries: z.number().default(0),
  successfulDeliveries: z.number().default(0),
  rating: z.number().min(0).max(5).default(0),
  avgDeliveryTime: z.number().default(0),
})

export const freelancerSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  companyId: idSchema,
  businessName: z.string().optional(),
  businessType: freelancerTypeSchema,
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  status: statusSchema,
  statistics: freelancerStatisticsSchema.optional(),
  defaultOriginBranchId: idSchema.optional(),
  preferredDeliveryType: z.enum(['home', 'branch_pickup']).optional(),
  lastActiveAt: dateSchema.optional(),
})

export type Freelancer = z.infer<typeof freelancerSchema>
export type FreelancerStatistics = z.infer<typeof freelancerStatisticsSchema>

// Deliverer schemas
export const delivererStatusSchema = z.enum(['active', 'on_leave', 'suspended', 'inactive'])

export const vehicleSchema = z.object({
  type: z.string().optional(),
  registrationNumber: z.string().optional(),
  capacity: z.number().optional(),
  lastServiceDate: dateSchema.optional(),
})

export const delivererSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  companyId: idSchema,
  branchId: idSchema,
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  vehicle: vehicleSchema.optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: dateSchema.optional(),
  status: delivererStatusSchema.optional(),
  performance: z.object({
    totalDeliveries: z.number().default(0),
    successfulDeliveries: z.number().default(0),
    rating: z.number().min(0).max(5).default(0),
  }).optional(),
})

export type Deliverer = z.infer<typeof delivererSchema>
export type Vehicle = z.infer<typeof vehicleSchema>

// Supervisor schemas
export const supervisorPermissionSchema = z.enum(['manage_deliverers', 'view_reports', 'approve_routes', 'manage_schedule'])

export const workScheduleDaySchema = z.object({
  isWorkDay: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
})

export const supervisorSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  companyId: idSchema,
  branchId: idSchema,
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  permissions: z.array(supervisorPermissionSchema).optional(),
  workSchedule: z.record(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']), workScheduleDaySchema).optional(),
  performance: z.object({
    teamSize: z.number().default(0),
    avgTeamRating: z.number().min(0).max(5).default(0),
    tasksCompleted: z.number().default(0),
  }).optional(),
  status: statusSchema,
  isActive: z.boolean().default(true),
})

export type Supervisor = z.infer<typeof supervisorSchema>
export type SupervisorPermission = z.infer<typeof supervisorPermissionSchema>
export type WorkScheduleDay = z.infer<typeof workScheduleDaySchema>

// Transporter schemas
export const availabilityStatusSchema = z.enum(['available', 'busy', 'on_break', 'offline'])
export const verificationStatusSchema = z.enum(['unverified', 'pending', 'verified', 'rejected'])

export const transporterStatisticsSchema = z.object({
  rating: z.number().min(0).max(5).default(0),
  totalTrips: z.number().default(0),
  completedTrips: z.number().default(0),
  cancelledTrips: z.number().default(0),
  totalDistance: z.number().default(0),
  averageDeliveryTime: z.number().default(0),
  completionRate: z.number().min(0).max(100).default(0),
})

export const transporterSchema = z.object({
  id: idSchema.optional(),
  userId: idSchema,
  companyId: idSchema,
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  currentBranchId: idSchema.optional(),
  currentVehicleId: idSchema.optional(),
  currentRouteId: idSchema.optional(),
  availabilityStatus: availabilityStatusSchema,
  verificationStatus: verificationStatusSchema,
  verificationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  statistics: transporterStatisticsSchema.optional(),
  status: statusSchema,
  isSuspended: z.boolean().default(false),
  suspensionReason: z.string().optional(),
  lastActiveAt: dateSchema.optional(),
})

export type Transporter = z.infer<typeof transporterSchema>
export type AvailabilityStatus = z.infer<typeof availabilityStatusSchema>
export type VerificationStatus = z.infer<typeof verificationStatusSchema>
export type TransporterStatistics = z.infer<typeof transporterStatisticsSchema>

// Vehicle schemas (expanded)
export const vehicleTypeSchema = z.enum(['bike', 'car', 'van', 'truck', 'bus'])
export const vehicleStatusSchema = z.enum(['available', 'in_use', 'maintenance', 'inactive'])

export const vehicleDocumentsSchema = z.object({
  registrationExpiry: dateSchema.optional(),
  insuranceExpiry: dateSchema.optional(),
  pollutionExpiry: dateSchema.optional(),
  lastServiceDate: dateSchema.optional(),
})

export const vehicleDetailedSchema = z.object({
  id: idSchema.optional(),
  companyId: idSchema,
  type: vehicleTypeSchema,
  registrationNumber: z.string().min(1, 'Registration number is required'),
  brand: z.string().optional(),
  modelName: z.string().optional(),
  year: z.number().min(1990).max(new Date().getFullYear()).optional(),
  color: z.string().optional(),
  maxWeight: z.number().min(1, 'Max weight must be at least 1').default(0),
  maxVolume: z.number().min(1, 'Max volume must be at least 1').default(0),
  supportsFragile: z.boolean().default(false),
  documents: vehicleDocumentsSchema.optional(),
  currentBranchId: idSchema.optional(),
  assignedUserId: idSchema.optional(),
  status: vehicleStatusSchema,
  notes: z.string().optional(),
  isAvailable: z.boolean().default(true),
})

export type VehicleDetailed = z.infer<typeof vehicleDetailedSchema>
export type VehicleDocuments = z.infer<typeof vehicleDocumentsSchema>
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>
export type VehicleType = z.infer<typeof vehicleTypeSchema>

// Route schemas
export const stopActionSchema = z.enum(['pickup', 'delivery', 'return'])
export const stopStatusSchema = z.enum(['pending', 'completed', 'failed', 'skipped'])
export const routeTypeSchema = z.enum(['scheduled', 'ad_hoc', 'recurring'])
export const routeStatusSchema = z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'paused'])

export const routeStopSchema = z.object({
  id: idSchema.optional(),
  packageIds: z.array(idSchema).optional(),
  order: z.number().min(0),
  action: stopActionSchema,
  address: z.string().optional(),
  branchId: idSchema.optional(),
  clientId: idSchema.optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  expectedArrival: dateSchema.optional(),
  actualArrival: dateSchema.optional(),
  expectedDeparture: dateSchema.optional(),
  actualDeparture: dateSchema.optional(),
  status: stopStatusSchema,
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: phoneSchema.optional(),
  stopDuration: z.number().default(0),
  completedPackages: z.array(idSchema).optional(),
  failedPackages: z.array(idSchema).optional(),
  skippedPackages: z.array(idSchema).optional(),
})

export const routeSchema = z.object({
  id: idSchema.optional(),
  routeNumber: z.string().min(1, 'Route number is required'),
  companyId: idSchema,
  name: z.string().min(1, 'Route name is required'),
  type: routeTypeSchema,
  originBranchId: idSchema.optional(),
  destinationBranchId: idSchema.optional(),
  assignedVehicleId: idSchema.optional(),
  assignedTransporterId: idSchema.optional(),
  assignedDelivererId: idSchema.optional(),
  stops: z.array(routeStopSchema).optional(),
  distance: z.number().default(0),
  estimatedTime: z.number().default(0),
  actualTime: z.number().optional(),
  status: routeStatusSchema,
  currentStopIndex: z.number().default(0),
  completedStops: z.number().default(0),
  failedStops: z.number().default(0),
  onTimePerformance: z.number().min(0).max(100).default(0),
  scheduledStart: dateSchema,
  actualStart: dateSchema.optional(),
  scheduledEnd: dateSchema,
  actualEnd: dateSchema.optional(),
  cancellationReason: z.string().optional(),
  completionNotes: z.string().optional(),
  totalPackages: z.number().default(0),
  completedPackages: z.number().default(0),
})

export type Route = z.infer<typeof routeSchema>
export type RouteStop = z.infer<typeof routeStopSchema>
export type RouteType = z.infer<typeof routeTypeSchema>
export type RouteStatus = z.infer<typeof routeStatusSchema>
export type StopAction = z.infer<typeof stopActionSchema>
export type StopStatus = z.infer<typeof stopStatusSchema>

// Package schemas
export const senderTypeSchema = z.enum(['individual', 'business', 'merchant'])
export const packageTypeSchema = z.enum(['document', 'parcel', 'letter', 'fragile', 'hazmat'])
export const packageStatusSchema = z.enum([
  'pending',
  'picked_up',
  'in_transit',
  'at_branch',
  'out_for_delivery',
  'delivered',
  'failed_delivery',
  'returned',
  'cancelled',
])
export const deliveryTypeSchema = z.enum(['home_delivery', 'branch_pickup', 'office_delivery'])
export const paymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded'])
export const paymentMethodSchema = z.enum(['cash', 'card', 'bank_transfer', 'wallet', 'other'])
export const deliveryPrioritySchema = z.enum(['standard', 'express', 'same_day'])

export const dimensionsSchema = z.object({
  length: z.number().min(1, 'Length must be at least 1').optional(),
  width: z.number().min(1, 'Width must be at least 1').optional(),
  height: z.number().min(1, 'Height must be at least 1').optional(),
})

export const locationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.array(z.number()).length(2),
})

export const destinationSchema = z.object({
  name: z.string().min(1, 'Destination name is required'),
  email: emailSchema.optional(),
  phone: phoneSchema,
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  location: locationSchema.optional(),
})

export const issueSchema = z.object({
  id: idSchema.optional(),
  type: z.string(),
  description: z.string(),
  reportedAt: dateSchema.optional(),
  resolvedAt: dateSchema.optional(),
  status: z.enum(['open', 'in_progress', 'resolved']),
})

export const returnInfoSchema = z.object({
  isReturn: z.boolean().default(false),
  originalPackageId: idSchema.optional(),
  returnReason: z.string().optional(),
  returnInitiatedDate: dateSchema.optional(),
  returnDeliveryDate: dateSchema.optional(),
  returnBranchId: idSchema.optional(),
})

export const trackingEventSchema = z.object({
  id: idSchema.optional(),
  status: packageStatusSchema,
  location: locationSchema.optional(),
  branchId: idSchema.optional(),
  timestamp: dateSchema,
  handledBy: idSchema.optional(),
  notes: z.string().optional(),
})

export const packageSchema = z.object({
  id: idSchema.optional(),
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  companyId: idSchema,
  senderId: idSchema,
  senderType: senderTypeSchema,
  clientId: idSchema.optional(),
  weight: z.number().min(0.1, 'Weight must be at least 0.1'),
  volume: z.number().min(0.1, 'Volume must be at least 0.1').optional(),
  dimensions: dimensionsSchema.optional(),
  isFragile: z.boolean().default(false),
  type: packageTypeSchema,
  description: z.string().optional(),
  declaredValue: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
  originBranchId: idSchema,
  currentBranchId: idSchema.optional(),
  destinationBranchId: idSchema.optional(),
  destination: destinationSchema,
  status: packageStatusSchema,
  deliveryType: deliveryTypeSchema,
  deliveryPriority: deliveryPrioritySchema,
  totalPrice: z.number().min(0),
  paymentStatus: paymentStatusSchema,
  paymentMethod: paymentMethodSchema.optional(),
  paidAt: dateSchema.optional(),
  assignedTransporterId: idSchema.optional(),
  assignedDelivererId: idSchema.optional(),
  assignedVehicleId: idSchema.optional(),
  currentRouteId: idSchema.optional(),
  attemptCount: z.number().min(0).default(0),
  lastAttemptDate: dateSchema.optional(),
  nextAttemptDate: dateSchema.optional(),
  maxAttempts: z.number().min(1).default(3),
  issues: z.array(issueSchema).optional(),
  returnInfo: returnInfoSchema.optional(),
  trackingHistory: z.array(trackingEventSchema).optional(),
  createdAt: dateSchema,
  estimatedDeliveryTime: dateSchema.optional(),
  deliveredAt: dateSchema.optional(),
  updatedAt: dateSchema,
  isDelivered: z.boolean().default(false),
  isInTransit: z.boolean().default(false),
  isAtBranch: z.boolean().default(false),
  needsAttention: z.boolean().default(false),
  deliveryProgress: z.number().min(0).max(100).default(0),
  estimatedTimeRemaining: z.number().optional(),
  isOverdue: z.boolean().default(false),
  canBeDelivered: z.boolean().default(true),
})

export type Package = z.infer<typeof packageSchema>
export type Dimensions = z.infer<typeof dimensionsSchema>
export type Location = z.infer<typeof locationSchema>
export type Destination = z.infer<typeof destinationSchema>
export type Issue = z.infer<typeof issueSchema>
export type ReturnInfo = z.infer<typeof returnInfoSchema>
export type TrackingEvent = z.infer<typeof trackingEventSchema>
export type SenderType = z.infer<typeof senderTypeSchema>
export type PackageType = z.infer<typeof packageTypeSchema>
export type PackageStatus = z.infer<typeof packageStatusSchema>
export type DeliveryType = z.infer<typeof deliveryTypeSchema>
export type PaymentStatus = z.infer<typeof paymentStatusSchema>
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

// Package History schemas
export const handlerRoleSchema = z.enum(['admin', 'manager', 'supervisor', 'deliverer', 'transporter', 'system'])

export const packageHistorySchema = z.object({
  id: idSchema.optional(),
  packageId: idSchema,
  status: packageStatusSchema,
  location: locationSchema.optional(),
  branchId: idSchema.optional(),
  handledBy: idSchema.optional(),
  handlerName: z.string().optional(),
  handlerRole: handlerRoleSchema.optional(),
  notes: z.string().optional(),
  timestamp: dateSchema,
  formattedLocation: z.string().optional(),
  readableStatus: z.string().optional(),
  timeAgo: z.string().optional(),
})

export type PackageHistory = z.infer<typeof packageHistorySchema>
export type HandlerRole = z.infer<typeof handlerRoleSchema>
