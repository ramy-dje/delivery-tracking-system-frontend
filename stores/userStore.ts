import { IUser } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";



interface IUserStore {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: IUser, access_token: string) => void;
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
      isAuthenticated: false,
      hasHydrated: false,

      login: (user, accessToken) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      setProfile: (user) => {
        set({ user });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
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
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default userStore;
