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
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrency, formatDate } from "../../utils/formatters";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import Button from "../../components/ui/Button";

const MemberProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch detailed profile including financial summary
  const { data, loading, error } = useFetch(`/members/profile/${id}`);

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-bold">{error}</div>
    );

  const member = data || {};
  const stats = member.financialSummary || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Navigation & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Profile</h1>
          <p className="text-gray-500 text-sm">
            Detailed overview of teacher's society account.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mt-2 ${
                member.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {member.status}
            </span>

            <div className="mt-8 space-y-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm">{member.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-gray-400" />
                <span className="text-sm">{member.branch} Branch</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm font-medium">
                  Joined: {formatDate(member.joiningDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financials & Identity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Share Value
                </p>
                <p className="text-xl font-black text-gray-900">
                  {formatCurrency(stats.shareValue)}
                </p>
                <p className="text-[10px] text-gray-500 font-bold">
                  {member.shares} Units Held
                </p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Total Savings
                </p>
                <p className="text-xl font-black text-gray-900">
                  {formatCurrency(stats.totalDeposits)}
                </p>
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Shield size={18} className="text-blue-600" /> Identification &
                Banking
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                  National ID (NID)
                </label>
                <p className="text-gray-900 font-semibold flex items-center gap-2 mt-1">
                  <CreditCard size={16} className="text-gray-400" />{" "}
                  {member.nid}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                  Bank Account
                </label>
                <p className="text-gray-900 font-semibold flex items-center gap-2 mt-1">
                  <Landmark size={16} className="text-gray-400" />{" "}
                  {member.bankAccount || "Not Provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Feed Snippet */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {stats.recentTransactions?.length > 0 ? (
                stats.recentTransactions.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {t.remarks || "Monthly Deposit"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold">
                        {formatDate(t.date)}
                      </p>
                    </div>
                    <p className="text-sm font-black text-blue-600">
                      +{formatCurrency(t.amount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  No recent transactions found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileView;
