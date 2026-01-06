import React, { useState, useMemo } from "react";
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
   * 1. STRICTOR ENDPOINT SELECTION
   * Routes to the correct summary based on user privileges.
   */
  const endpoint = isAdmin ? "/finance/summary" : "/finance/member-summary";
  const { data, loading } = useFetch(endpoint);

  /**
   * 2. PROFESSIONAL DATA NORMALIZATION
   * Handles string-based month names and dynamic financial stats.
   */
  const stats = useMemo(() => {
    const rawData = data?.data || data || {};
    return {
      totalMembers: rawData.totalMembers || 0,
      totalCollection: rawData.totalCollection || rawData.bankBalance || 0,
      totalInvestments: rawData.totalInvestments || 0,
      collectionTrend: rawData.collectionTrend || [],
      recentTransactions: rawData.recentTransactions || [],
    };
  }, [data]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* --- PREMIUM WELCOME HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <span className="text-3xl font-black uppercase">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center text-white">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                {user?.name}
              </h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-lg border border-blue-100 tracking-widest">
                {user.role}
              </span>
            </div>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Zap size={12} className="text-amber-500" />
              {isAdmin
                ? "Financial Governance Active"
                : "Member Ledger Overview"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin/collections">
              <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all text-sm font-black uppercase tracking-widest active:scale-95">
                <PlusCircle size={20} /> New Collection
              </button>
            </Link>
          )}
          <div className="hidden sm:flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Calendar size={20} className="text-blue-600" />
            <span className="text-sm font-black text-gray-700 uppercase tracking-tighter">
              {formatDate(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* --- FINANCIAL KPI GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: isAdmin ? "Total Members" : "Active Units",
            value: isAdmin ? stats.totalMembers : `${user?.shares || 0} Shares`,
            icon: isAdmin ? <Users size={24} /> : <Layers size={24} />,
            color: "blue",
          },
          {
            label: "Society Fund",
            value: formatCurrency(stats.totalCollection),
            icon: <Wallet size={24} />,
            color: "green",
          },
          {
            label: "Active Projects",
            value: formatCurrency(stats.totalInvestments),
            icon: <Activity size={24} />,
            color: "purple",
          },
          {
            label: "Projected Yield",
            value: formatCurrency((user?.shares || 1) * 1000 * 12),
            icon: <PieChart size={24} />,
            color: "orange",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:-translate-y-1 transition-all group"
          >
            <div
              className={`p-4 bg-${item.color}-50 text-${item.color}-600 rounded-2xl w-fit group-hover:scale-110 transition-transform`}
            >
              {item.icon}
            </div>
            <div className="mt-6">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">
                {item.label}
              </p>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                {item.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* --- ANALYTICS & ACTIVITY HUB --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* --- DYNAMIC CHART SECTION --- */}
        <div className="xl:col-span-2 bg-white rounded-[3rem] shadow-xl shadow-gray-200/20 border border-gray-100 overflow-hidden flex flex-col min-h-[580px]">
          <div className="p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-50/20">
            <div>
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.3em] mb-2 flex items-center gap-2">
                <Activity size={16} className="text-blue-600" /> Revenue
                Trajectory
              </h3>
              <p className="text-[11px] text-gray-400 font-bold uppercase">
                Real-time collection scaling for {new Date().getFullYear()}
              </p>
            </div>

            <div className="flex items-center gap-3 px-5 py-2.5 bg-green-50 rounded-2xl border border-green-100">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-[11px] font-black text-green-700 uppercase tracking-widest">
                {stats.collectionTrend?.length > 1
                  ? (
                      ((stats.collectionTrend[stats.collectionTrend.length - 1]
                        .total -
                        stats.collectionTrend[0].total) /
                        stats.collectionTrend[0].total) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                % Dynamic Growth
              </span>
            </div>
          </div>

          <div className="p-10 flex-1">
            <CollectionChart
              data={
                stats.collectionTrend?.length > 0
                  ? stats.collectionTrend
                  : [
                      { name: "Jan", total: 0 },
                      { name: "Feb", total: stats.totalCollection || 0 },
                    ]
              }
            />
          </div>

          <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Live Sync Engine Active
              </span>
            </div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl">
              Next Ledger Update:{" "}
              {new Date(Date.now() + 3600000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* --- RECENT ACTIVITY HUB --- */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-[0.3em] flex items-center gap-3">
              <HistoryIcon size={20} className="text-blue-600" /> History
            </h3>
            <Link
              to={isAdmin ? "/admin/all-transactions" : "/member/history"}
              className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-2 group"
            >
              Audit Trail{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="space-y-8 flex-1">
            {stats.recentTransactions?.length > 0 ? (
              stats.recentTransactions.slice(0, 6).map((t, idx) => {
                const isExpense = t.type === "expense";
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between group/item"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={`p-4 rounded-[1.2rem] transition-all shadow-sm ${
                          isExpense
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {isExpense ? (
                          <ArrowDownRight size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 uppercase tracking-tighter mb-0.5">
                          {t.remarks?.substring(0, 20) ||
                            (isExpense ? "Expense" : "Collection")}
                          ...
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                          {t.month} {t.year}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-black tracking-tighter ${
                          isExpense ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                        {formatCurrency(t.amount)}
                      </p>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                        {t.category?.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <HistoryIcon size={48} className="mb-4 text-gray-200" />
                <p className="text-xs font-black uppercase tracking-[0.4em]">
                  No Live Activity
                </p>
              </div>
            )}
          </div>

          <div className="mt-10 p-6 bg-blue-600 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-blue-500/30">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Verified Balance
              </p>
              <p className="text-xl font-black tracking-tighter">
                {formatCurrency(stats.totalCollection)}
              </p>
            </div>
            <ArrowUpCircle size={32} className="opacity-40" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
