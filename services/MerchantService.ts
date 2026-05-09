import api from "@/lib/api"
import { IMerchant, IMerchantDetails, IMerchantFilter, IRegisterMerchant } from "@/types/merchant"


export const createMerchant = async (data: IRegisterMerchant): Promise<IMerchant> => {
    const res = await api.post("/merchants", data)
    return res.data;
}

export const getMerchant = async (id: string): Promise<IMerchantDetails> => {
    const res = await api.get(`/merchants/${id}`)
    return res.data;
}
export const listMerchants = async (filter: IMerchantFilter): Promise<IMerchantDetails> => {
    const res = await api.get("/merchants", { params: filter })
    return res.data;
}