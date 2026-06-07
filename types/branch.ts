import { ICommune, ILocation, IWilaya } from "./common";
import { IBaseFilter } from "./paginate";


export enum NodeType {
    LocalBranch = "local_branch",
    RegionalMainHub = "regional_main_hub"
}

export interface IBranchResponse extends ILocation {
    id: string;
    name: string;
    code: string;
    branchType: NodeType;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode?: string;
    };
    phone: string;
    email: string;
    status: string;
    capacityLimit?: number;
    currentLoad: number;
    parentHubId?: string | null;
    servesBranches?: string[];
    companyId: string;
    createdAt: string;
    updatedAt: string | null;
}


export interface ICreateBranchPayload {
    name: string;
    code: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode?: string;
    };
    location: {
        type: 'Point';
        coordinates: [number, number];
    };
    phone: string;
    email: string;
    branchType?: NodeType;
    parentHubId?: string;
    servesBranches?: string[];
    capacityLimit?: number;
    operatingHours?: Record<string, { open: string; close: string; }>;
}

export interface IUpdateBranchPayload {
    name?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
    };
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    phone?: string;
    email?: string;
    branchType?: NodeType;
    parentHubId?: string | null;
    servesBranches?: string[];
    capacityLimit?: number;
    operatingHours?: Record<string, { open: string; close: string; }>;
}

export interface IBranchFilter extends IBaseFilter {
    branchType?: NodeType;
    search?: string;
    parentHubId?: string;
    status?: string;
}

export interface IBranchDetails {
    id: string;
    name: string;
    type: NodeType;
    wilayaId: string;
    wilayaName: string;
    communeId: string;
    communeName: string;
    longitude: number;
    latitude: number;
    companyId: string;
    companyName: string;
    parentNodeId: string | null;
    parentNodeName: string | null;
    coverages: ICoverageCommune[];
    childNodes: IChildNode[];
    managerId: string | null;
    managerName: string | null;
    vehiclesCount: number;
    staffCount: number;
    driverShiftsCount: number;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface ICoverageCommune {
    wilayaId: string;
    communeId: string;
    wilayaName: string;
    communeName: string;
}

export interface IChildNode {
    id: string;
    name: string;
    type: NodeType;
}
