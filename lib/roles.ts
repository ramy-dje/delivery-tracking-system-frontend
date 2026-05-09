// Roles matching DeliveryDz.Domain.Enums.UserRole
export const ROLES = {
  USER: "User",
  OWNER: "Owner",
  MERCHANT: "Merchant",
  LEAD_DRIVER: "LeadDriver",
  DRIVER: "Driver",
  TRUCK_DRIVER: "TruckDriver",
  ADMIN: "Admin",
  MANAGER: "Manager",
  SORTER: "Sorter",
  RECEPTIONIST: "Receptionist",
  INVENTORY_AUDITOR: "InventoryAuditor",
  SHIFT_SUPERVISOR: "ShiftSupervisor",
  SECURITY_OFFICER: "SecurityOfficer",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy: higher number = more permissions
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.ADMIN]: 200,
  [ROLES.OWNER]: 180,
  [ROLES.MANAGER]: 160,
  [ROLES.SHIFT_SUPERVISOR]: 140,
  [ROLES.SECURITY_OFFICER]: 130,
  [ROLES.INVENTORY_AUDITOR]: 120,
  [ROLES.SORTER]: 80,
  [ROLES.RECEPTIONIST]: 80,
  [ROLES.MERCHANT]: 50,
  [ROLES.USER]: 30,
  [ROLES.LEAD_DRIVER]: 40,
  [ROLES.DRIVER]: 20,
  [ROLES.TRUCK_DRIVER]: 20,
};

// Helper: Check if user has required role (or higher)
export const hasRole = (userRole: Role, requiredRole: Role): boolean => {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
};

// Helper: Check if user has ANY of the allowed roles
export const hasAnyRole = (userRole: Role, allowedRoles: Role[]): boolean => {
  return allowedRoles.includes(userRole);
};

// Routes and which roles can access them. Drivers and TruckDriver are intentionally omitted from dashboard routes (mobile app).
export const ROLE_ROUTES: Record<string, Role[]> = {
  "/dashboard": [
    ROLES.ADMIN,
    ROLES.OWNER,
    ROLES.MERCHANT,
    ROLES.MANAGER,
    ROLES.SHIFT_SUPERVISOR,
    ROLES.INVENTORY_AUDITOR,
    ROLES.SECURITY_OFFICER,
    ROLES.RECEPTIONIST,
    ROLES.SORTER,
  ],
  "/dashboard/overview": [
    ROLES.ADMIN,
    ROLES.OWNER,
    ROLES.MANAGER,
  ],
  "/dashboard/operations": [
    ROLES.MANAGER,
    ROLES.SORTER,
    ROLES.RECEPTIONIST,
    ROLES.INVENTORY_AUDITOR,
  ],
  "/dashboard/management": [ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER],
  "/dashboard/staffs": [ROLES.ADMIN, ROLES.OWNER, ROLES.MANAGER],
  "/login": [],
  "/register": [],
  "/": [],
};