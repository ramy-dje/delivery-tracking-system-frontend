import userStore from "@/stores/userStore";
import { IManager } from "@/types/auth";
import { ICashier } from "@/types/cashier";
import { ISupervisorResponse } from "@/types/supervisor";
import { IUser } from "@/types/user";

export const useAuth = () => userStore();

export const getUser = () => {
  return userStore.getState().user;
};

export const getUserRole = () => {
  return userStore.getState().user?.role;
}

export const getAccessToken = () => {
  return userStore.getState().accessToken;
};

export const isAuthenticated = () => {
  return userStore.getState().isAuthenticated;
}

export const getCompanyId = () => {
  return userStore.getState().associated?.companyId;
}

interface HasBranchId {
  branchId?: string | { _id: string };
}

interface HasAssignedBranchId {
  assignedBranchId?: string | { _id: string };
}

export const getBranchId = (): string | undefined => {
  const associated = userStore.getState().associated;

  if (!associated) return undefined;

  const branch =
    (associated as HasBranchId).branchId ??
    (associated as HasAssignedBranchId).assignedBranchId;

  return typeof branch === "string"
    ? branch
    : branch?._id;
};

export const getNodeId = () => {
  return userStore.getState().user?.logisticsNodeId;
}

export const setAccessToken = (access_token: string) => {
  userStore.getState().setAccessToken(access_token);
};

export const setProfile = (user: IUser) => {
  userStore.getState().setProfile(user);
};

export const login = (user: IUser, access_token: string, associated?: IManager | ISupervisorResponse | ICashier | null) => {
  userStore.getState().login(user, access_token, associated);
};

export const logout = () => {
  userStore.getState().logout();
};
