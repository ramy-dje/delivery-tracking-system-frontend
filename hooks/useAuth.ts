import userStore from "@/stores/userStore";
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
  return userStore.getState().user?.companyId;
}

export const getNodeId = () => {
  return userStore.getState().user?.logisticsNodeId;
}

export const setAccessToken = (access_token: string) => {
  userStore.getState().setAccessToken(access_token);
};

export const setProfile = (user: IUser) => {
  userStore.getState().setProfile(user);
};

export const login = (user: IUser, access_token: string) => {
  userStore.getState().login(user, access_token);
};

export const logout = () => {
  userStore.getState().logout();
};
