import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * 🔐 AUTHENTICATION STORE
 * Manages user identity, tokens, and real-time profile synchronization.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /**
       * @desc Initial authentication after login
       */
      setAuth: (userData, token) =>
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        }),

      /**
       * @desc 🔥 FIX: Updates user profile and fixes "Contact missing"
       * This ensures fields like 'phone' from the DB are merged into the local state.
       */
      updateUser: (updatedData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedData } : updatedData,
        })),

      /**
       * @desc Alias for updateUser to support Settings.jsx handleSubmit calls
       */
      setUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        })),

      /**
       * @desc Complete session termination and storage cleanup
       */
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data to prevent stale state issues
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
