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
   * 1. DYNAMIC ENDPOINT SELECTION
   * Admins fetch global statistics, while members fetch their personal summary.
   */
  const endpoint = isAdmin ? "/finance/summary" : "/finance/member-summary";
  const { data, loading, error } = useFetch(endpoint);

  /**
   * 2. DATA NORMALIZATION
   * Normalizes the response to ensure members see their personal 'bankBalance'
   * and 'recentTransactions' linked specifically to their account.
   */
  const stats = useMemo(() => {
    const rawData = data?.data || data || {};
    return {
      totalMembers: rawData.totalMembers || 0,
      // For Admins: Global Society Fund | For Members: Personal Bank Balance
      totalCollection: isAdmin
        ? rawData.totalCollection || 0
        : rawData.bankBalance || 0,
      totalInvestments: rawData.totalInvestments || 0,
      collectionTrend: rawData.collectionTrend || [],
      // For Members, the backend already filters this array to only include their data
      recentTransactions: rawData.recentTransactions || [],
      memberSince: user?.joiningDate ? formatDate(user.joiningDate) : "N/A",
    };
  }, [data, isAdmin, user]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* --- MINIMAL WELCOME HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white">
              <ShieldCheck size={12} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome, {user?.name}
              </h1>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded border border-slate-200 tracking-widest">
                {user?.role}
              </span>
            </div>
            <p className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-2 mt-1">
              <Zap size={10} className="text-amber-500" />
              {isAdmin
                ? "Governance Hub Active"
                : `Member Since: ${stats.memberSince}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin/collections">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-wider active:scale-95 shadow-sm">
                <PlusCircle size={16} /> New Collection
              </button>
            </Link>
          )}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-600 uppercase">
              {formatDate(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* --- FINANCIAL KPI GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: isAdmin ? "Active Society Members" : "Allocated Share Units",
            value: isAdmin ? stats.totalMembers : `${user?.shares || 0} Shares`,
            icon: isAdmin ? <Users size={20} /> : <Layers size={20} />,
            color: "slate",
          },
          {
            label: isAdmin ? "Available Society Fund" : "Your Total Deposits",
            value: formatCurrency(stats.totalCollection),
            icon: <Wallet size={20} />,
            color: "emerald",
          },
          {
            label: "Active Projects",
            value: formatCurrency(stats.totalInvestments),
            icon: <Activity size={20} />,
            color: "blue",
          },
          {
            label: "Projected Annual Yield",
            value: formatCurrency((user?.shares || 1) * 1000 * 12),
            icon: <PieChart size={20} />,
            color: "amber",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div
              className={`p-2.5 bg-${item.color}-50 text-${item.color}-600 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}
            >
              {item.icon}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              {item.label}
            </p>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* --- ANALYTICS & ACTIVITY HUB --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* --- REVENUE CHART SECTION --- */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-500" />
                {isAdmin
                  ? "Global Revenue Trajectory"
                  : "Personal Savings Growth"}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">
                Fiscal Period {new Date().getFullYear()}
              </p>
            </div>
            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
              Status:{" "}
              {stats.collectionTrend?.length > 1 ? "Increasing" : "Stable"}
            </div>
          </div>

          <div className="p-6 flex-1 min-h-[350px]">
            <CollectionChart
              data={
                stats.collectionTrend?.length > 0
                  ? stats.collectionTrend
                  : [
                      { name: "Prev", total: 0 },
                      { name: "Current", total: stats.totalCollection || 0 },
                    ]
              }
            />
          </div>

          <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <RefreshCw size={12} className="text-blue-500 animate-spin" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Ledger Synchronization Active
              </span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Malibag Shomiti Registry
            </p>
          </div>
        </div>

        {/* --- RECENT ACTIVITY LEDGER --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <HistoryIcon size={14} className="text-blue-500" /> Recent
              Activity
            </h3>
            <Link
              to={isAdmin ? "/admin/reports" : "/member/history"}
              className="text-[9px] font-bold uppercase text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
            >
              View Full Ledger
              <ArrowRight
                size={10}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>

          <div className="divide-y divide-slate-50 flex-1 overflow-y-auto max-h-[450px]">
            {stats.recentTransactions?.length > 0 ? (
              stats.recentTransactions.slice(0, 8).map((t, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
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
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                        {t.remarks ||
                          (t.type === "deposit"
                            ? "Monthly Deposit"
                            : "Service Expense")}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">
                        {t.month} {t.year}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${
                        t.type === "expense"
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {t.type === "expense" ? "-" : "+"}{" "}
                      {formatCurrency(t.amount)}
                    </p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                      {t.category?.replace(/_/g, " ")}
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
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  No Recent Activity Found
                </p>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-900 rounded-b-xl text-white flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                {isAdmin
                  ? "Total Society Liquidity"
                  : "Verified Personal Balance"}
              </p>
              <p className="text-base font-bold tracking-tight">
                {formatCurrency(stats.totalCollection)}
              </p>
            </div>
            <ArrowUpCircle
              size={24}
              className={`text-emerald-500 opacity-60`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
