import React from "react";
import { Download, History, TrendingUp, Calendar } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { downloadFile } from "../../utils/pdfDownload";
import api from "../../services/api";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import Button from "../../components/ui/Button";

const MemberHistory = () => {
  const user = useAuthStore((state) => state.user);

  // 1. Fetch personal transactions for the logged-in user
  const {
    data: transactions,
    loading,
    error,
  } = useFetch(`/finance/history/${user._id}`);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/finance/statement/${user._id}`, {
        responseType: "blob",
      });
      downloadFile(response, `Statement_${user.name.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      alert("Could not generate PDF. Please try again later.");
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* --- Personal Summary Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Financial History
          </h1>
          <p className="text-gray-500 text-sm">
            Review your deposits and society contributions.
          </p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download size={18} /> Download Statement
        </Button>
      </div>

      {/* --- Quick Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">
              Total Savings
            </p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(
                transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
              )}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">
              Total Deposits
            </p>
            <p className="text-xl font-bold text-gray-900">
              {transactions?.length || 0} Records
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">
              Active Since
            </p>
            <p className="text-xl font-bold text-gray-900">
              {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* --- Transaction Table --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions?.length > 0 ? (
                transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {t.remarks || "Monthly Deposit"}
                      </p>
                      <p className="text-[10px] text-blue-500 font-bold uppercase">
                        {t.category}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        Auto-Debit
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(t.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No transactions found in your history.
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
