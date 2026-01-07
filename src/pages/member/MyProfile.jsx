import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  ShieldCheck,
  Landmark,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useFetch } from "../../hooks/useFetch";
import { formatCurrency, formatDate } from "../../utils/formatters";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";

const MyProfile = () => {
  const user = useAuthStore((state) => state.user);

  /**
   * 🚀 SECURE DATA FETCHING
   * Uses the specific profile endpoint for the logged-in member.
   */
  const { data, loading, error, refetch } = useFetch(
    user?.id ? `/members/profile/${user.id}` : null
  );

  // Normalizing response structure
  const member = data?.data || data;
  const stats = member?.financialSummary || {};

  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="p-10 text-center text-rose-500 font-bold bg-rose-50 rounded-xl border border-rose-100 flex flex-col items-center gap-4">
        <p>System was unable to synchronize your registry profile.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200"
        >
          <RefreshCw size={14} /> Retry Sync
        </button>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* --- HEADER SECTION --- */}
      <div className="border-b border-slate-100 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Personal Identity
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Verified membership credentials and society registry details.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded border border-slate-100">
          <ShieldCheck size={12} className="text-emerald-500" /> Registry
          Verified
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- LEFT COLUMN: IDENTITY AVATAR --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm h-full flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 shadow-inner relative">
              <User size={48} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                <ShieldCheck size={12} />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {member?.name}
            </h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-2 bg-blue-50 px-3 py-1 rounded">
              UID: {member?._id?.slice(-8).toUpperCase()}
            </p>

            <div className="mt-8 space-y-2 w-full">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">
                <span>Account Status</span>
                <span className="text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2 pt-1">
                <span>Member Role</span>
                <span className="text-slate-900">{member?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: FINANCIALS & REGISTRY --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* QUICK FINANCIAL STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-5 shadow-sm">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1.5">
                  Net Contribution
                </p>
                <p className="text-xl font-bold text-slate-900 leading-none">
                  {formatCurrency(stats.totalDeposits || 0)}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-5 shadow-sm">
              <div className="p-3.5 bg-slate-900 text-white rounded-lg">
                <Landmark size={24} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1.5">
                  Share Units
                </p>
                <p className="text-xl font-bold text-slate-900 leading-none">
                  {member?.shares || 0} Units Held
                </p>
              </div>
            </div>
          </div>

          {/* DETAILED REGISTRY DATA */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Validated Information
              </h3>
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Mail size={12} className="text-slate-300" /> Primary Email
                </label>
                <p className="text-sm font-semibold text-slate-700">
                  {member?.email || "N/A"}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Phone size={12} className="text-slate-300" /> Contact Number
                </label>
                <p className="text-sm font-semibold text-slate-700">
                  {member?.phone || "N/A"}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <CreditCard size={12} className="text-slate-300" /> National
                  ID (NID)
                </label>
                <p className="text-sm font-semibold text-slate-700">
                  {member?.nid || "N/A"}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <MapPin size={12} className="text-slate-300" /> Assigned
                  Branch
                </label>
                <p className="text-sm font-semibold text-slate-700">
                  {member?.branch || "N/A"} Branch
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Landmark size={12} className="text-slate-300" /> Bank A/C
                  Reference
                </label>
                <p className="text-sm font-semibold text-slate-700">
                  {member?.bankAccount || "Not Provided"}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar size={12} className="text-slate-300" /> Registration
                  Date
                </label>
                <p className="text-sm font-semibold text-slate-700">
                  {formatDate(member?.joiningDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
