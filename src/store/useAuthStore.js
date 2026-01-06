import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Action: Login
      setAuth: (userData, token) =>
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        }),

      // Action: Update Profile (Useful for dynamic UI updates)
      updateUser: (updatedData) =>
        set((state) => ({
          user: { ...state.user, ...updatedData },
        })),

      // Action: Logout
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage"); // Explicit cleanup
      },
    }),
    {
      name: "auth-storage", // Key name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
