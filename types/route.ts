export type RouteStatus = "pending" | "in_transit" | "completed" | "cancelled";

export interface IRouteStop {
  branchId: string;
  branchName?: string;
  order: number;
  arrivedAt?: string;
}

export interface IRoute {
  id: string;
  status: RouteStatus;
  originBranchId?: string;
  originBranchName?: string;
  stops: IRouteStop[];
  transporterId?: string;
  transporterName?: string;
  packageCount?: number;
  createdAt: string;
  updatedAt?: string;
}
