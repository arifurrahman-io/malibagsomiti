import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to finish loading from localStorage
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // If it's already hydrated, set true immediately
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => unsub();
  }, []);

  // Show nothing or a loading spinner while hydrating to prevent early redirect
  if (!isHydrated) return null;

  // If there is no token after hydration, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
