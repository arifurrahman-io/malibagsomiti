import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ShieldCheck,
  History as HistoryIcon,
  PlusCircle,
  ArrowRight,
  Activity,
  Layers,
  Zap,
  RefreshCw,
  Landmark,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useFetch } from "../../hooks/useFetch";
import CollectionChart from "../../components/charts/CollectionChart";
import { formatCurrency, formatDate } from "../../utils/formatters";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";

const MainDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  // Data Fetching
  const { data: globalData, loading: globalLoading } =
    useFetch("/finance/summary");
  const { data: personalData, loading: personalLoading } = useFetch(
    "/finance/member-summary"
  );
  const { data: bankData, loading: bankLoading } = useFetch("/bank-accounts");
  const { data: projectsData, loading: projectsLoading } = useFetch(
    "/finance/investments"
  );

  // Sliding States
  const [projectIndex, setProjectIndex] = useState(0);
  const [bankIndex, setBankIndex] = useState(0);

  const stats = useMemo(() => {
    const rawGlobal = globalData?.data || globalData || {};
    const rawPersonal = personalData?.data || personalData || {};
    const accounts = Array.isArray(bankData?.data || bankData)
      ? bankData?.data || bankData
      : [];
    const projects = Array.isArray(projectsData?.data || projectsData)
      ? projectsData?.data || projectsData
      : [];

    const totalBankLiquidity = accounts.reduce(
      (sum, acc) => sum + (acc.currentBalance || 0),
      0
    );

    return {
      totalMembers: rawGlobal.totalMembers || 0,
      totalSharesCount: rawGlobal.totalSharesCount || 0,
      totalCollection: totalBankLiquidity,
      totalInvestments: rawGlobal.totalInvestments || 0,
      collectionTrend: rawGlobal.collectionTrend || [],
      recentTransactions: isAdmin
        ? rawGlobal.recentTransactions || []
        : rawPersonal.recentTransactions || [],
      allAccounts: accounts,
      allProjects: projects,
    };
  }, [globalData, personalData, bankData, projectsData, isAdmin]);

  // Logic: Automatic Sliding
  useEffect(() => {
    if (stats.allProjects.length > 1) {
      const timer = setInterval(() => {
        setProjectIndex((prev) => (prev + 1) % stats.allProjects.length);
      }, 4000); // Slide every 4 seconds
      return () => clearInterval(timer);
    }
  }, [stats.allProjects.length]);

  useEffect(() => {
    if (stats.allAccounts.length > 1) {
      const timer = setInterval(() => {
        setBankIndex((prev) => (prev + 1) % stats.allAccounts.length);
      }, 5000); // Slide every 5 seconds
      return () => clearInterval(timer);
    }
  }, [stats.allAccounts.length]);

  if (
    globalLoading ||
    (personalLoading && !isAdmin) ||
    bankLoading ||
    projectsLoading
  )
    return <DashboardSkeleton />;

  const activeProject = stats.allProjects[projectIndex];
  const activeBank = stats.allAccounts[bankIndex];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.name?.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-sm">
              <ShieldCheck size={12} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded border border-slate-200 tracking-widest">
                {user?.role?.replace("-", " ")}
              </span>
            </div>
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-2 mt-1">
              <Zap
                size={10}
                className={isAdmin ? "text-blue-500" : "text-amber-500"}
              />
              {isAdmin
                ? "Central Governance Active"
                : `Member ID: ${user?.phone || "N/A"}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin/finance-entry">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-xs font-bold uppercase tracking-wider shadow-md">
                <PlusCircle size={16} /> Direct Entry
              </button>
            </Link>
          )}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 font-bold text-[11px] text-slate-600">
            <Calendar size={16} className="text-slate-400" />{" "}
            {formatDate(new Date())}
          </div>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Society Liquidity - Emerald Mesh Style (Unchanged) */}
        <div className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] transition-all duration-500">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-colors duration-500" />
          <div className="relative z-10">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl w-fit mb-5 shadow-lg shadow-emerald-200">
              <Wallet size={24} />
            </div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1">
              Net Liquidity
            </p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(stats.totalCollection)}
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-600 uppercase">
                Live Treasury
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Society Shares - Blue Gradient Style (Unchanged) */}
        <div className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] transition-all duration-500">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-500" />
          <div className="relative z-10">
            <div className="p-3 bg-blue-600 text-white rounded-2xl w-fit mb-5 shadow-lg shadow-blue-200">
              <Layers size={24} />
            </div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1">
              Society Shares
            </p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalSharesCount}{" "}
              <span className="text-sm font-bold text-slate-400">Units</span>
            </h2>
            <p className="mt-3 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
              Your Holding: {user?.shares || 0} Units
            </p>
          </div>
        </div>

        {/* Card 3: Active Projects - NOW Amber High-Detail Style (Formerly Card 4 Design) */}
        <div className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)] transition-all duration-500">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-60" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-100">
                <Activity size={24} />
              </div>
              {stats.allProjects.length > 1 && (
                <div className="flex gap-1 mt-2">
                  {stats.allProjects.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === projectIndex
                          ? "w-4 bg-amber-500"
                          : "w-1.5 bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {activeProject ? (
              <div
                key={activeProject._id}
                className="animate-in fade-in slide-in-from-right duration-700"
              >
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">
                  Active Investment
                </p>
                <h2 className="text-base font-black text-slate-900 truncate uppercase mb-3">
                  {activeProject.projectName}
                </h2>
                <div className="flex justify-between items-end border-t border-slate-50 pt-3">
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg font-black uppercase">
                    Project Capital
                  </span>
                  <span className="text-lg font-black text-amber-600 tracking-tight">
                    {formatCurrency(activeProject.amount)}
                  </span>
                </div>
              </div>
            ) : (
              <h2 className="text-lg font-black text-slate-300 italic">
                No Active Projects
              </h2>
            )}
          </div>
        </div>

        {/* Card 4: Bank Accounts - NOW Dark Indigo Bento Style (Formerly Card 3 Design) */}
        <div className="group relative overflow-hidden bg-slate-900 p-6 rounded-[2rem] shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-5">
              <div className="p-3 bg-white/10 backdrop-blur-md text-indigo-300 rounded-2xl border border-white/10 shadow-xl">
                <Landmark size={24} />
              </div>
              <div className="flex gap-1.5 mt-2">
                {stats.allAccounts.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === bankIndex
                        ? "w-4 bg-indigo-400"
                        : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-indigo-200/60 font-black uppercase tracking-[0.15em] mb-1">
              Bank Accounts
            </p>
            {activeBank ? (
              <div
                key={activeBank._id}
                className="animate-in fade-in slide-in-from-right duration-700"
              >
                <h2 className="text-sm font-black text-white truncate uppercase mb-1">
                  {activeBank.bankName}
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={12} className="text-indigo-400/50" />
                  <span className="text-[10px] font-bold text-indigo-200/40 tracking-tighter">
                    {activeBank.accountNumber.replace(/\d(?=\d{4})/g, "*")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-black text-white tracking-tighter">
                    {formatCurrency(activeBank.currentBalance)}
                  </p>
                  <span className="text-[8px] font-black bg-white/10 text-indigo-300 px-2 py-0.5 rounded-full uppercase">
                    {activeBank.accountType}
                  </span>
                </div>
              </div>
            ) : (
              <h2 className="text-xl font-black text-white/20 italic">
                No Accounts
              </h2>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REVENUE CHART */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} className="text-blue-500" /> Society Growth
              Analysis
            </h3>
          </div>
          <div className="p-6 min-h-[350px]">
            <CollectionChart data={stats.collectionTrend} />
          </div>
          <div className="px-6 py-4 bg-slate-900 flex justify-between items-center text-white rounded-b-2xl">
            <div className="flex items-center gap-2">
              <RefreshCw size={12} className="text-blue-400 animate-spin" />
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">
                Synchronization: Online
              </span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">
              Malibag Registry 2026
            </p>
          </div>
        </div>

        {/* RECENT REGISTRY */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <HistoryIcon size={14} className="text-blue-500" />{" "}
              {isAdmin ? "Recent Registry" : "Your Personal Registry"}
            </h3>
            <Link
              to={isAdmin ? "/admin/reports" : "/member/history"}
              className="text-[9px] font-bold uppercase text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              View All{" "}
              <ArrowRight
                size={10}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>

          <div className="divide-y divide-slate-50 flex-1 overflow-y-auto max-h-[450px] custom-scrollbar">
            {stats.recentTransactions?.length > 0 ? (
              stats.recentTransactions.map((t, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        t.type === "expense"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {t.type === "expense" ? (
                        <ArrowDownRight size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[140px]">
                        {t.remarks || t.category?.replace(/_/g, " ")}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                        {t.date ? formatDate(t.date) : `${t.month} ${t.year}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-black ${
                        t.type === "expense"
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {t.type === "expense" ? "-" : "+"}
                      {formatCurrency(t.amount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-40">
                <HistoryIcon
                  size={32}
                  className="mx-auto mb-2 text-slate-300"
                />
                <p className="text-[10px] font-bold uppercase">
                  No Personal Entries
                </p>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <p className="text-[9px] font-bold uppercase text-slate-400">
              Total Society fund
            </p>
            <p className="text-base font-black text-slate-900">
              {formatCurrency(stats.totalCollection)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
