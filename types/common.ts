

export interface ILocation {
    latitude: number,
    longitude: number
}

export interface IWilaya extends ILocation {
    id: string,
    nameAr: string,
    nameFr: string,
    code: number,
}


export interface ICommune extends ILocation {
    id: string,
    nameAr: string,
    nameFr: string,
    wilayaId: string,
}