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
    communeId: string;
}

export interface IUpdateBranchPayload {
    name?: string;
    type?: number;
    wilayaId?: string;
    wilaya?: string;
    ParentNodeId?: string;
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