import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation Menu Logic based on User Role
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["member", "admin", "super-admin"],
    },
    {
      name: "Member List",
      path: "/admin/members",
      icon: Users,
      roles: ["admin", "super-admin"],
    },
    {
      name: "Collections",
      path: "/admin/collections",
      icon: CreditCard,
      roles: ["admin", "super-admin"],
    },
    {
      name: "Investments",
      path: "/admin/investments",
      icon: Wallet,
      roles: ["admin", "super-admin"],
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: PieChart,
      roles: ["admin", "super-admin"],
    },
    {
      name: "My History",
      path: "/member/history",
      icon: PieChart, // Shared icon but path is unique to members
      roles: ["member"],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      roles: ["member", "admin", "super-admin"],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavLink = ({ item, mobile = false }) => (
    <Link
      to={item.path}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        location.pathname === item.path
          ? "bg-blue-50 text-blue-600 shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <item.icon size={20} />
      <span className="font-medium">{item.name}</span>
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* --- Sidebar (Desktop) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">
            Malibag Society
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredMenu.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
          >
            <LogOut
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- Mobile Sidebar Overlay --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- Mobile Sidebar --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <h1 className="text-xl font-bold text-blue-600">Malibag Society</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-500"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="px-4 space-y-1">
          {filteredMenu.map((item) => (
            <NavLink key={item.path} item={item} mobile={true} />
          ))}
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-30">
          <button
            className="md:hidden p-2 -ml-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 font-medium capitalize">
                {user?.role?.replace("-", " ")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
