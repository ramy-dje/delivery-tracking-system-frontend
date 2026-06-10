// Roles matching DeliveryDz.Domain.Enums.UserRole
export const ROLES = {
  CLIENT: "client",
  MERCHANT: "freelancer",
  DRIVER: "deliverer",
  TRUCK_DRIVER: "transporter",
  SUPERVISOR: "supervisor",
  ADMIN: "admin",
  MANAGER: "manager",
  SORTER: "loader",
  RECEPTIONIST: "cachier",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy: higher number = more permissions
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.ADMIN]: 200,
  [ROLES.MANAGER]: 160,
  [ROLES.SUPERVISOR]: 140,
  [ROLES.SORTER]: 80,
  [ROLES.RECEPTIONIST]: 80,
  [ROLES.MERCHANT]: 50,
  [ROLES.CLIENT]: 30,
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
    ROLES.MERCHANT,
    ROLES.MANAGER,
    ROLES.RECEPTIONIST,
    ROLES.SORTER,
  ],
  "/dashboard/overview": [
    ROLES.ADMIN,
    ROLES.MANAGER,
  ],
  "/dashboard/analytics": [
    ROLES.ADMIN,
    ROLES.MANAGER,
  ],
  "/dashboard/operations": [
    ROLES.MANAGER,
    ROLES.SORTER,
    ROLES.RECEPTIONIST,
  ],
  "/dashboard/management": [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MANAGER],
  "/dashboard/staffs": [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MANAGER],
  "/login": [],
  "/register": [],
  "/": [],
};