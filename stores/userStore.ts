import { IManager } from "@/types/auth";
import { ISupervisorResponse } from "@/types/supervisor";
import { IUser } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";



interface IUserStore {
  user: IUser | null;
  associated: IManager | ISupervisorResponse | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: IUser, access_token: string, associated?: IManager | ISupervisorResponse | null) => void;
  setProfile: (user: IUser | null) => void;
  logout: () => void;
  setAccessToken: (access_token: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const userStore = create<IUserStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      associated: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: (user, accessToken, associated?) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
          associated: associated || null,
        });
      },

      setProfile: (user) => {
        set({ user });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          associated: null,
          isAuthenticated: false,
        });
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        associated: state.associated,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default userStore;
