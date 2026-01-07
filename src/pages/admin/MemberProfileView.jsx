import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Shield,
  ArrowLeft,
  Landmark,
  TrendingUp,
  Activity,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrency, formatDate } from "../../utils/formatters";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";

const MemberProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch detailed profile including financial summary
  const { data, loading, error } = useFetch(`/members/profile/${id}`);

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-bold border border-red-100 rounded-xl bg-red-50/50">
        {error}
      </div>
    );

  const member = data || {};
  const stats = member.financialSummary || {};

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Navigation & Header [cite: 2025-10-11] */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Member Profile
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Administrative overview for {member.name}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Information Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-inner">
              <User size={36} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{member.name}</h2>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  member.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    member.status === "active"
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />
                {member.status}
              </span>
            </div>

            <div className="mt-8 space-y-4 text-left border-t border-slate-50 pt-6">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Email Address
                  </p>
                  <p className="text-sm text-slate-700 font-medium truncate">
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Phone Number
                  </p>
                  <p className="text-sm text-slate-700 font-medium">
                    {member.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Assigned Branch
                  </p>
                  <p className="text-sm text-slate-700 font-medium">
                    {member.branch}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Joining Date
                  </p>
                  <p className="text-sm text-slate-700 font-medium">
                    {formatDate(member.joiningDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financials & Identity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Grid [cite: 2025-10-11] */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Share Value
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(stats.shareValue)}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold">
                  {member.shares} Units Held
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Total Savings
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(stats.totalDeposits)}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Consolidated Registry
                </p>
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Shield size={16} className="text-slate-400" /> Identity &
                Banking
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  National ID (NID)
                </label>
                <p className="text-slate-900 font-bold flex items-center gap-2 mt-1.5 text-sm">
                  <CreditCard size={14} className="text-slate-400" />{" "}
                  {member.nid}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Linked Bank Account
                </label>
                <p className="text-slate-900 font-bold flex items-center gap-2 mt-1.5 text-sm">
                  <Landmark size={14} className="text-slate-400" />{" "}
                  {member.bankAccount || "Not Configured"}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Feed Snippet */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <Activity size={16} className="text-slate-400" /> Recent Ledger
                Activity
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Last 5 Entries
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {stats.recentTransactions?.length > 0 ? (
                stats.recentTransactions.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center px-6 py-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Activity size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 leading-tight">
                          {t.remarks || "Monthly Share Deposit"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                          {formatDate(t.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        +{formatCurrency(t.amount)}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        Verified Credit
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">
                    No transaction history found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileView;
