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
  TrendingUp,
  TrendingDown,
  Info,
  CalendarDays,
  ShieldCheck,
  Users,
  CreditCard,
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

  // Fetch all transactions
  const { data, loading, refetch } = useFetch("/finance/all-transactions");

  const transactions = useMemo(() => {
    const list = data?.data || [];
    return list.filter((t) => {
      const tDate = new Date(t.date).getTime();
      const start = new Date(dateRange.startDate).getTime();
      const end = new Date(dateRange.endDate).setHours(23, 59, 59, 999);
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
    if (!window.confirm("Permanent delete? Fund balance will be recalculated."))
      return;
    try {
      await api.delete(`/finance/transaction/${id}`);
      toast.success("Ledger entry removed");
      refetch();
    } catch (err) {
      toast.error("Process failed");
    }
  };

  /**
   * 🖨️ UPDATED PROFESSIONAL PRINT ENGINE
   * Now includes Member Name and A/C for official auditing
   */
  const handlePrintStatement = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Society Financial Statement</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo-section h1 { margin: 0; font-size: 24px; font-weight: 800; color: #2563eb; }
            .logo-section p { margin: 5px 0 0; font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; background: #f8fafc; color: #475569; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
            .inflow { color: #16a34a; font-weight: 700; }
            .outflow { color: #dc2626; font-weight: 700; }
            .footer { margin-top: 80px; display: flex; justify-content: space-between; font-weight: 800; font-size: 10px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section"><h1>Malibag Somiti</h1><p>Official Audit Statement</p></div>
            <div style="text-align: right; font-size: 11px; color: #64748b; font-weight: 600;">
              Period: ${formatDate(dateRange.startDate)} - ${formatDate(
      dateRange.endDate
    )}
            </div>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>Entry Detail / Member</th><th>Reference A/C</th><th>Category</th><th style="text-align:right">Transaction</th></tr>
            </thead>
            <tbody>
              ${transactions
                .map(
                  (t) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString("en-GB")}</td>
                  <td>
                    <div style="font-weight: 800; font-size: 11px;">${
                      t.user?.name || "Society Internal"
                    }</div>
                    <div style="font-size: 9px; color: #64748b;">${
                      t.remarks || "Standard Entry"
                    }</div>
                  </td>
                  <td style="font-family: monospace; color: #2563eb;">${
                    t.user?.bankAccount || "N/A"
                  }</td>
                  <td style="text-transform: capitalize;">${t.category.replace(
                    "_",
                    " "
                  )}</td>
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
          }</span><span>AUTHORIZED SIGNATORY STAMP</span></div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* --- DYNAMIC HEADER CARD --- */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <ShieldCheck size={180} className="text-blue-600" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-200">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none mb-2">
                Audit Registry
              </h1>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Info size={14} className="text-blue-500" /> Verified Financial
                Ledger
              </p>
            </div>
          </div>

          <Button
            onClick={handlePrintStatement}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest"
          >
            <Printer size={18} /> Export Statement
          </Button>
        </div>

        <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center gap-6 no-print">
          <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-[0.2em]">
            <Filter size={16} /> Filter Range
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <input
              type="date"
              className="px-6 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
            <input
              type="date"
              className="px-6 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* --- KPI STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPICard
          title="Gross Inflows"
          amount={stats.inflows}
          icon={<TrendingUp />}
          variant="green"
          trend="Total Collections"
        />
        <KPICard
          title="Gross Outflows"
          amount={stats.outflows}
          icon={<TrendingDown />}
          variant="red"
          trend="Society Expenses"
        />
        <KPICard
          title="Fiscal Net"
          amount={stats.net}
          icon={<Landmark />}
          variant="blue"
          trend="Current Retention"
        />
      </div>

      {/* --- MAIN LEDGER --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Transaction & Remarks
                </th>
                <th className="px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Member & Bank A/C
                </th>
                <th className="px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Classification
                </th>
                <th className="px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Value
                </th>
                {isSuperAdmin && (
                  <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Admin
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((t, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-blue-50/30 transition-all group"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div
                        className={`p-3 rounded-2xl ${
                          t.type === "expense"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {t.type === "expense" ? (
                          <ArrowDownRight size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-base font-black text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                          {t.remarks || "Society Transaction"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          Ref: {formatDate(t.date)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 🚀 MEMBER NAME & BANK A/C COLUMN */}
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 tracking-tight leading-none mb-1.5">
                        {t.user?.name || "Internal Entry"}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-fit border border-blue-100/50">
                        <CreditCard size={10} />
                        {t.user?.bankAccount ? (
                          t.user.bankAccount
                        ) : (
                          <span className="text-red-400 italic">
                            No A/C Linked
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                      {t.category.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-6 text-lg font-black text-right tracking-tighter ${
                      t.type === "expense" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {t.type === "expense" ? "-" : "+"}{" "}
                    {formatCurrency(t.amount)}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-10 py-6 text-center">
                      <button
                        onClick={() => handleDeleteTrx(t._id)}
                        className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, amount, icon, variant, trend }) => {
  const styles = {
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
    },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
  };
  const s = styles[variant];
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 group hover:-translate-y-1 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 ${s.bg} ${s.text} rounded-[1.2rem] shadow-sm`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
      </div>
      <div>
        <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">
          {title}
        </p>
        <h2
          className={`text-3xl font-black ${s.text} tracking-tighter leading-none mb-3`}
        >
          {formatCurrency(amount)}
        </h2>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
          {trend}
        </p>
      </div>
    </div>
  );
};

export default Reports;
