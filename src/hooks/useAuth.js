import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { user, token, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin" || user?.role === "super-admin";
  const isSuperAdmin = user?.role === "super-admin";

  return { user, token, isAdmin, isSuperAdmin, handleLogout };
};
