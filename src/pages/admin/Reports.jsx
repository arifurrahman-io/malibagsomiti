import React, { useState, useMemo } from "react";
import {
  FileText,
  Calendar as CalendarIcon,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Landmark,
  Layers,
  Trash2,
  Edit3,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrency, formatDate } from "../../utils/formatters";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import toast from "react-hot-toast";

const Reports = () => {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "super-admin";

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Fetch all transactions including Investment disbursements
  const { data, loading, refetch } = useFetch("/finance/all-transactions");

  const transactions = useMemo(() => {
    const list = data?.data || [];
    return list.filter((t) => {
      const tDate = new Date(t.date).getTime();
      const start = new Date(dateRange.startDate).getTime();
      const end = new Date(dateRange.endDate).getTime();
      return tDate >= start && tDate <= end;
    });
  }, [data, dateRange]);

  const stats = useMemo(() => {
    const inflows = transactions
      .filter((t) => t.type === "deposit")
      .reduce((acc, t) => acc + t.amount, 0);
    const outflows = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    return { inflows, outflows, net: inflows - outflows };
  }, [transactions]);

  const handleDeleteTrx = async (id) => {
    if (!window.confirm("Permanent delete? This will restore fund balance."))
      return;
    try {
      await api.delete(`/finance/transaction/${id}`);
      toast.success("Transaction removed");
      refetch();
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const handlePrintStatement = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Society Statement</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b; font-size: 11px; }
            .header { border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 900; text-transform: uppercase; font-size: 8px; }
            td { padding: 10px; border: 1px solid #f1f5f9; }
            .inflow { color: #16a34a; font-weight: 700; }
            .outflow { color: #dc2626; font-weight: 700; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-weight: 900; font-size: 9px; border-top: 1px solid #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Comprehensive Society Statement</h1>
            <p>Period: ${formatDate(dateRange.startDate)} - ${formatDate(
      dateRange.endDate
    )}</p>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>Description</th><th>Bank A/C</th><th>Category</th><th style="text-align:right">Amount</th></tr>
            </thead>
            <tbody>
              ${transactions
                .map(
                  (t) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td><b>${t.remarks || t.user?.name}</b></td>
                  <td style="font-family: monospace;">${
                    t.user?.bankAccount || "N/A"
                  }</td>
                  <td>${t.category.toUpperCase().replace("_", " ")}</td>
                  <td style="text-align:right" class="${
                    t.type === "deposit" ? "inflow" : "outflow"
                  }">
                    ${
                      t.type === "deposit" ? "+" : "-"
                    } ৳${t.amount.toLocaleString()}
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer"><span>PREPARED BY: ${
            user.name
          }</span><span>AUTHORIZED SIGNATORY</span></div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">
            Audit Statement
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Complete record of collections, investments, and expenses.
          </p>
        </div>
        <Button
          onClick={handlePrintStatement}
          className="w-full md:w-auto flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
        >
          <Printer size={18} /> Print Statement
        </Button>
      </div>

      {/* Responsive Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          icon={<Landmark />}
          label="Inflows"
          val={stats.inflows}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={<Layers />}
          label="Outflows"
          val={stats.outflows}
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatCard
          icon={<FileText />}
          label="Net Balance"
          val={stats.net}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Responsive Filter */}
      <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 no-print">
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-blue-600" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">
            Date Range
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
          <input
            type="date"
            className="flex-1 md:flex-none px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
          />
          <span className="text-gray-300 font-bold hidden md:block">to</span>
          <input
            type="date"
            className="flex-1 md:flex-none px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
          />
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-50">
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Description
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Bank A/C
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Category
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                Amount
              </th>
              {isSuperAdmin && (
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Manage
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((t, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        t.type === "expense"
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {t.type === "expense" ? (
                        <ArrowDownRight size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 line-clamp-1">
                        {t.remarks || t.user?.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold">
                        {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 font-mono text-xs text-gray-500 font-bold">
                  {t.user?.bankAccount || (
                    <span className="text-red-300 italic">No A/C</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <span className="bg-gray-100 px-3 py-1 rounded-full font-bold text-[10px] text-gray-500 uppercase">
                    {t.category.replace("_", " ")}
                  </span>
                </td>
                <td
                  className={`px-6 py-5 text-sm font-black text-right ${
                    t.type === "expense" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {t.type === "expense" ? "-" : "+"} {formatCurrency(t.amount)}
                </td>
                {isSuperAdmin && (
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDeleteTrx(t._id)}
                        className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, val, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
    <div className={`p-4 ${bg} ${color} rounded-2xl`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">
        {label}
      </p>
      <p className={`text-2xl font-black ${color} leading-tight`}>
        {formatCurrency(val)}
      </p>
    </div>
  </div>
);

export default Reports;
