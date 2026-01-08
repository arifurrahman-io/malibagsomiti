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
  Settings2,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  User,
  Building2, // Added for Bank Management icon
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * 🚀 NAVIGATION CONFIGURATION
   * Centrally managed routes for all user roles.
   */
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
      name: "Bulk Collection",
      path: "/admin/collections",
      icon: CreditCard,
      roles: ["admin", "super-admin"],
    },
    {
      name: "Direct Entry",
      path: "/admin/finance-entry",
      icon: PlusCircle,
      roles: ["admin", "super-admin"],
    },
    {
      name: "Society Banks",
      path: "/admin/banks",
      icon: Building2, // Use Building2 icon for bank management
      roles: ["admin", "super-admin"],
    },
    {
      name: "Investments",
      path: "/admin/investments",
      icon: Wallet,
      roles: ["admin", "super-admin"],
    },
    {
      name: "Ledger Reports",
      path: "/admin/reports",
      icon: PieChart,
      roles: ["admin", "super-admin"],
    },
    {
      name: "Category Manager",
      path: "/admin/categories",
      icon: Settings2,
      roles: ["admin", "super-admin"],
    },
    {
      name: "My Profile",
      path: "/member/profile",
      icon: User,
      roles: ["member"],
    },
    {
      name: "My History",
      path: "/member/history",
      icon: PieChart,
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

  const NavLink = ({ item, mobile = false }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive
            ? "bg-slate-900 text-white shadow-md"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          <item.icon
            size={18}
            className={
              isActive
                ? "text-white"
                : "text-slate-400 group-hover:text-slate-900"
            }
          />
          <span className="text-sm font-semibold tracking-tight">
            {item.name}
          </span>
        </div>
        {isActive && <ChevronRight size={14} className="opacity-50" />}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-100">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 z-50">
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                Malibag <span className="text-blue-600">S.</span>
              </h1>
              <span className="text-[8px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">
                Registry System
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">
            Main Menu
          </p>
          {filteredMenu.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-between px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group font-semibold text-sm"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {/* --- Mobile Sidebar Overlay --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- Mobile Sidebar --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <h1 className="text-lg font-bold text-slate-900">Malibag Society</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="px-4 space-y-1">
          {filteredMenu.map((item) => (
            <NavLink key={item.path} item={item} mobile={true} />
          ))}
        </nav>
      </aside>

      {/* --- Main Viewport --- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
          <button
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block border-r border-slate-200 pr-4">
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {user?.role?.replace("-", " ")}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
