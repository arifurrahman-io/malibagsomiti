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
  TrendingDown,
  PieChart,
  Activity,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useFetch } from "../../hooks/useFetch";
import CollectionChart from "../../components/charts/CollectionChart";
import { formatCurrency, formatDate } from "../../utils/formatters";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";

const MainDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  // 1. Dynamic Endpoint Selection
  const endpoint = isAdmin ? "/finance/summary" : "/finance/member-summary"; // Consistent with updated financeController

  const { data, loading } = useFetch(endpoint);

  // 2. Data Normalization for Admin vs Member
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* --- Dynamic Welcome Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Hello, {user?.name}
            </h1>
            {isAdmin && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-full border border-blue-200">
                <ShieldCheck size={12} /> {user.role}
              </span>
            )}
          </div>
          <p className="text-gray-500 font-medium">
            {isAdmin
              ? "Society-wide financial overview and member activity."
              : "Here's your personal savings and investment summary."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin/collections">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-sm font-bold active:scale-95">
                <PlusCircle size={18} /> New Collection
              </button>
            </Link>
          )}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Calendar size={18} className="text-blue-600" />
            <span className="text-sm font-bold text-gray-700">
              {formatDate(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* --- Interactive Summary Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            {isAdmin ? <Users size={24} /> : <TrendingUp size={24} />}
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              {isAdmin ? "Total Members" : "Current Shares"}
            </p>
            <h2 className="text-2xl font-black text-gray-900 mt-1">
              {isAdmin ? stats.totalMembers : `${user?.shares || 0} Units`}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Wallet size={24} />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Society Fund
            </p>
            <h2 className="text-2xl font-black text-gray-900 mt-1">
              {formatCurrency(stats.totalCollection)}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Active Investments
            </p>
            <h2 className="text-2xl font-black text-gray-900 mt-1">
              {formatCurrency(stats.totalInvestments)}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl w-fit group-hover:scale-110 transition-transform">
            <PieChart size={24} />
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Annual Target
            </p>
            <h2 className="text-2xl font-black text-gray-900 mt-1">
              {formatCurrency((user?.shares || 1) * 1000 * 12)}
            </h2>
          </div>
        </div>
      </div>

      {/* --- Dynamic Chart & Feed Section --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* --- Enhanced Dynamic Chart Section --- */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[550px]">
          <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
            <div>
              <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-1">
                Collection Growth Analytics
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                Real-time financial scaling & trajectory
              </p>
            </div>

            {/* Dynamic Indicator Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
              <TrendingUp size={14} className="text-green-600" />
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                +
                {stats.collectionTrend?.length > 1
                  ? (
                      ((stats.collectionTrend[stats.collectionTrend.length - 1]
                        .total -
                        stats.collectionTrend[0].total) /
                        stats.collectionTrend[0].total) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                % Growth
              </span>
            </div>
          </div>

          {/* Chart Container with increased padding and height */}
          <div className="p-8 flex-1 w-full h-full min-h-[300px]">
            <CollectionChart
              data={
                stats.collectionTrend?.length > 0
                  ? stats.collectionTrend
                  : [
                      { name: "Oct", total: 45000 },
                      { name: "Nov", total: 52000 },
                      { name: "Dec", total: stats.totalCollection || 0 },
                    ]
              }
            />
          </div>

          {/* Dynamic Footer Info */}
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Live System Feed
              </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Next Sync:{" "}
              {new Date(Date.now() + 3600000).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Recent Activity Mini-Feed */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest flex items-center gap-2">
              <HistoryIcon size={18} className="text-blue-600" /> Recent
              Activity
            </h3>
            <Link
              to={isAdmin ? "/admin/members" : "/member/history"}
              className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              View All{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="space-y-6 flex-1">
            {stats.recentTransactions?.length > 0 ? (
              stats.recentTransactions.slice(0, 6).map((t, idx) => {
                // Correct direction logic
                const isExpense = t.type === "expense";
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between group/item"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl transition-colors ${
                          isExpense
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {isExpense ? (
                          <ArrowDownRight size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 line-clamp-1 uppercase tracking-tight">
                          {t.remarks ||
                            (isExpense ? "General Expense" : "Monthly Deposit")}
                        </p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          {formatDate(t.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-black ${
                          isExpense ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isExpense ? "-" : "+"}
                        {formatCurrency(t.amount)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        {t.category?.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                <HistoryIcon size={40} className="mb-2 text-gray-300" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                  No activity found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
