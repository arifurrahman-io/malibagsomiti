import React, { useMemo } from "react";
import {
  Download,
  History,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  CreditCard,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { downloadFile } from "../../utils/pdfDownload";
import api from "../../services/api";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const MemberHistory = () => {
  const user = useAuthStore((state) => state.user);

  /**
   * 🛠️ LOGIC FIX:
   * Uses user.id (normalized from backend) to fetch transaction history.
   * Path matches backend: router.get("/history/:id", protect, getMemberHistory);
   */
  const { data, loading, error, refetch } = useFetch(
    user?.id ? `/finance/history/${user.id}` : null
  );

  /**
   * 📊 DATA NORMALIZATION:
   * Handles both { success: true, data: [...] } and direct array returns.
   */
  const transactions = useMemo(() => {
    const raw = data?.data || data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const stats = useMemo(() => {
    const totalSavings = transactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    return {
      totalSavings,
      recordCount: transactions.length,
      // FIX: Changed from user?.createdAt to user?.joiningDate
      activeSince: user?.joiningDate ? formatDate(user.joiningDate) : "N/A",
    };
  }, [transactions, user]);

  const handleDownloadPDF = async () => {
    if (!user?.id) return toast.error("User session not found.");

    const loadingToast = toast.loading("Generating personal statement...");
    try {
      // FIX: Use user.id to match the authenticated user ID
      const response = await api.get(`/finance/statement/${user.id}`, {
        responseType: "blob",
      });
      downloadFile(response, `Statement_${user.name.replace(/\s+/g, "_")}.pdf`);
      toast.success("Statement exported", { id: loadingToast });
    } catch (err) {
      toast.error("Generation failed. Contact society admin.", {
        id: loadingToast,
      });
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* --- Minimalist Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Personal Transaction History
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">
            Verified registry of your contributions and savings.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white border border-slate-200 rounded-lg"
          >
            <RefreshCw size={16} />
          </button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-xs font-bold uppercase tracking-widest px-4 h-10"
          >
            <Download size={16} /> Export PDF
          </Button>
        </div>
      </div>

      {/* --- Error Fallback --- */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
          <AlertCircle size={18} />
          <span>Error loading ledger: {error}</span>
        </div>
      )}

      {/* --- KPI Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Consolidated Savings",
            val: formatCurrency(stats.totalSavings),
            icon: TrendingUp,
            color: "emerald",
          },
          {
            label: "Deposit Records",
            val: `${stats.recordCount} Entries`,
            icon: History,
            color: "blue",
          },
          {
            label: "Membership Active",
            val: stats.activeSince,
            icon: Calendar,
            color: "slate",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm"
          >
            <div
              className={`p-3 bg-${item.color}-50 text-${item.color}-600 rounded-lg border border-${item.color}-100`}
            >
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                {item.label}
              </p>
              <p className="text-lg font-bold text-slate-900 leading-none">
                {item.val}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- Transaction Table --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Detail & Category
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Method
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                  Value (৳)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 bg-emerald-50 text-emerald-600 rounded">
                          <ArrowUpRight size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-tight">
                            {t.remarks || "Society Contribution Entry"}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase tracking-wider border border-slate-200">
                            {t.category?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {t.category === "monthly_deposit"
                            ? "Payroll Sync"
                            : "Manual Post"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-600">
                        +{formatCurrency(t.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <History className="text-slate-300 mb-4" size={48} />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] italic">
                        No financial activity found in this account
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="mt-4 text-[10px] font-black text-blue-600 uppercase border-b border-blue-600 pb-0.5"
                      >
                        Force Refresh Sync
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberHistory;
