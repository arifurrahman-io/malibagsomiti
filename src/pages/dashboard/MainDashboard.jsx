import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ShieldCheck,
  History as HistoryIcon,
  PlusCircle,
  ArrowRight,
  PieChart,
  Activity,
  Layers,
  ArrowUpCircle,
  Zap,
  RefreshCw,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useFetch } from "../../hooks/useFetch";
import CollectionChart from "../../components/charts/CollectionChart";
import { formatCurrency, formatDate } from "../../utils/formatters";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";

const MainDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  /**
   * 1. PARALLEL DATA FETCHING
   * Fetches global finance summary and bank accounts to provide real-time liquidity.
   */
  const endpoint = isAdmin ? "/finance/summary" : "/finance/member-summary";
  const { data: financeData, loading: financeLoading } = useFetch(endpoint);
  const { data: bankData, loading: bankLoading } = useFetch("/bank-accounts");

  /**
   * 2. DATA NORMALIZATION & TREASURY LOGIC
   */
  const stats = useMemo(() => {
    const rawFinance = financeData?.data || financeData || {};
    const accounts = bankData?.data || bankData || [];

    // Admins see sum of all banks | Members see their individual ledger balance
    const totalBankLiquidity = Array.isArray(accounts)
      ? accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0)
      : 0;

    const motherAccount = Array.isArray(accounts)
      ? accounts.find((acc) => acc.isMotherAccount)
      : null;

    return {
      totalMembers: rawFinance.totalMembers || 0,
      totalSharesCount: rawFinance.totalSharesCount || 0, // 🔥 Updated from backend aggregation
      totalCollection: isAdmin
        ? totalBankLiquidity
        : rawFinance.bankBalance || 0,
      totalInvestments: rawFinance.totalInvestments || 0,
      collectionTrend: rawFinance.collectionTrend || [],
      recentTransactions: rawFinance.recentTransactions || [],
      motherAccount,
      memberSince: user?.joiningDate ? formatDate(user.joiningDate) : "N/A",
    };
  }, [financeData, bankData, isAdmin, user]);

  if (financeLoading || bankLoading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* --- DYNAMIC WELCOME HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-slate-200">
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
                className={`${isAdmin ? "text-blue-500" : "text-amber-500"}`}
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
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-xs font-bold uppercase tracking-wider shadow-md active:scale-95">
                <PlusCircle size={16} /> Direct Entry
              </button>
            </Link>
          )}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
              {formatDate(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* --- FINANCIAL KPI GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity / Deposits Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
            <Wallet size={20} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
            {isAdmin ? "Society Net Liquidity" : "Your Total Deposits"}
          </p>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {formatCurrency(stats.totalCollection)}
          </h2>
        </div>

        {/* --- DYNAMIC SHARES CARD --- */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-100">
          <div
            className={`p-2.5 rounded-xl w-fit mb-4 ${
              isAdmin
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            <Layers size={20} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
            {isAdmin ? "Total Society Shares" : "Allocated Share Units"}
          </p>
          <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
            {isAdmin
              ? `${stats.totalSharesCount} Units`
              : `${user?.shares || 0} Shares`}
          </h2>
          {isAdmin && (
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
              Aggregate Liability:{" "}
              {formatCurrency(stats.totalSharesCount * 1000)}
            </p>
          )}
        </div>

        {/* Active Projects Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4">
            <Activity size={20} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
            Active Projects
          </p>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {formatCurrency(stats.totalInvestments)}
          </h2>
        </div>

        {/* Primary Treasury / Mother Account Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4">
            <Landmark size={20} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
            {isAdmin ? "Primary Treasury" : "Verified Account Status"}
          </p>
          <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
            {isAdmin
              ? stats.motherAccount?.bankName || "No Mother Account"
              : "Verified"}
          </h2>
          {isAdmin && stats.motherAccount && (
            <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1">
              Active Sync: {formatCurrency(stats.motherAccount.currentBalance)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* --- REVENUE CHART --- */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-500" />
                Revenue Growth Analysis
              </h3>
            </div>
            {!stats.motherAccount && isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-[9px] font-bold text-rose-600 animate-pulse">
                <ShieldAlert size={12} /> CONFIG ERROR: NO MOTHER ACCOUNT
              </div>
            )}
          </div>

          <div className="p-6 flex-1 min-h-[350px]">
            <CollectionChart data={stats.collectionTrend} />
          </div>

          <div className="px-6 py-4 bg-slate-900 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <RefreshCw size={12} className="text-blue-400 animate-spin" />
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">
                Treasury Synchronization: Online
              </span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">
              Malibag Shomiti Registry {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* --- RECENT ACTIVITY LEDGER --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <HistoryIcon size={14} className="text-blue-500" /> Recent
              Registry
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
                    <p className="text-[8px] font-bold text-slate-300 uppercase truncate max-w-[60px]">
                      {t.subcategory || "General"}
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
                  No Registry Entries
                </p>
              </div>
            )}
          </div>

          {/* TOTAL FOOTER BAR */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400">
                Total Net Fund
              </p>
              <p className="text-base font-black text-slate-900">
                {formatCurrency(stats.totalCollection)}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-[8px] font-black px-2 py-1 rounded-md uppercase ${
                  stats.motherAccount
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {stats.motherAccount ? "Sync Active" : "Sync Error"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
