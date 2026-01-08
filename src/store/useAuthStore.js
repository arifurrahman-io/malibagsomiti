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
       * Ensure userData includes 'joiningDate' from the backend response.
       */
      setAuth: (userData, token) =>
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        }),

      /**
       * @desc Updates user profile
       * 🔥 IMPROVEMENT: Deep merge to ensure fields like 'joiningDate' aren't
       * accidentally dropped if the update API response is partial.
       */
      updateUser: (updatedData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedData } : updatedData,
        })),

      /**
       * @desc Explicitly sets the user object.
       * Used during profile refreshes to ensure the frontend state perfectly
       * matches the database record (image_834ccf.png).
       */
      setUser: (userData) =>
        set((state) => ({
          user: userData ? { ...state.user, ...userData } : null,
        })),

      /**
       * @desc Complete session termination and storage cleanup
       */
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Standard Zustand persist handles removal, but explicit is safer for audit trails
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Partialize ensures 'joiningDate' is saved to local storage for persistence
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
