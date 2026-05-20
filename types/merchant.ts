import { ILocation, IWilaya } from "./common";
import { ICompany, ICompanyResponse } from "./company";
import { IBaseFilter } from "./paginate";

export enum PaymentMethod {
    Cash = "Cash",
    Bank = "Bank",
    CCP = "CCP",
}

export interface IRegisterMerchant {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    businessName: string;
    storeLocation: ILocation;
    wilayaId: string;
    paymentMethod: PaymentMethod;
    RIB?: string;
    CCP?: string;
}

export interface IMerchant {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    businessName: string;
    storeLocation: ILocation;
    wilayaId: string;
    paymentMethod: PaymentMethod;
    RIB?: string;
    CCP?: string;
}

export interface IMerchantDetails {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    businessName: string;
    storeLocation: ILocation;
    wilaya: IWilaya;
    paymentMethod: PaymentMethod;
    RIB?: string;
    CCP?: string;
    company: ICompany;
    logisticsNodeId: string;
    logisticsNodeName: string;
}

export interface IMerchantFilter extends IBaseFilter {
    search?: string;
    email?: string;
    wilayaId?: string;
    logisticsNodeId?: string;
    companyId?: string;
}