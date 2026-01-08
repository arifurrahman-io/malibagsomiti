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
  Building2,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

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
      icon: Building2,
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
            ? "bg-slate-900 text-white shadow-lg scale-[1.02]"
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
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 z-50 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white shadow-lg">
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

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">
            Main Menu
          </p>
          {filteredMenu.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-semibold text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* --- Mobile Menu Overlay --- */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* --- Mobile Sidebar --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <ShieldCheck size={18} />
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Malibag Society
            </h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredMenu.map((item) => (
            <NavLink key={item.path} item={item} mobile={true} />
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-4 w-full bg-red-50 text-red-600 rounded-xl font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-40">
          <button
            className="lg:hidden p-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Page Title or Breadcrumb could go here */}
          <div className="hidden md:block">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Malibag Management / {location.pathname.split("/").pop()}
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden xs:block border-r border-slate-100 pr-3">
              <p className="text-sm font-bold text-slate-900 leading-none truncate max-w-[120px]">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mt-1">
                {user?.role?.replace("-", " ")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-slate-200 ring-4 ring-slate-50">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar relative">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
