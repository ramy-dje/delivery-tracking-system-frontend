import { ICommune, ILocation, IWilaya } from "./common";
import { IBaseFilter } from "./paginate";


export enum NodeType {
    Branch = "Branch",
    Hub = "Hub",
    MainHub = "MainHub"
}

export const NodeTypeToNumber: Record<NodeType, number> = {
    [NodeType.Branch]: 0,
    [NodeType.Hub]: 1,
    [NodeType.MainHub]: 2,
};

export interface IBranchResponse extends ILocation {
    id: string;
    name: string;
    code: string;
    type: NodeType;
    wilayaId: string;
    wilaya: IWilaya;
    commune: ICommune;
    parentNodeId: string | null;
    companyId: string;
    communeId: string,
    createdAt: string;
    isDeleted: boolean,
    deletedAt: string | null,

}


export interface ICreateBranchPayload extends ILocation {
    name: string;
    type: number;
    wilayaId: string;
    parentNodeId?: string;
    communeId: string;
    coverageCommuneIds: string[];
}

export interface IUpdateBranchPayload {
    name?: string;
    type?: number;
    wilayaId?: string;
    wilaya?: string;
    parentNodeId?: string;
    longitude?: number;
    latitude?: number;
}

export interface IBranchFilter extends IBaseFilter {
    wilayaId?: string;
    communeId?: string;
    type?: number;
    search?: string;
    parentNodeId?: string;
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
