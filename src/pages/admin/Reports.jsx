import React, { useState, useMemo } from "react";
import {
  FileText,
  Calendar as CalendarIcon,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Trash2,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  RefreshCw,
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

  // Fetch all transactions including newly integrated subcategories
  const { data, loading, refetch } = useFetch("/finance/all-transactions");

  const transactions = useMemo(() => {
    const raw = Array.isArray(data) ? data : data?.data;
    const list = Array.isArray(raw) ? raw : [];

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
    if (
      !window.confirm("Permanent delete? Ledger balance will be recalculated.")
    )
      return;
    try {
      await api.delete(`/finance/transaction/${id}`);
      toast.success("Entry removed");
      refetch();
    } catch (err) {
      toast.error("Process failed");
    }
  };

  const handlePrintStatement = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Audit Statement</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 10px; background: #f8fafc; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
            td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
            .inflow { color: #16a34a; font-weight: 700; }
            .outflow { color: #dc2626; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <div><h1>Malibag Society Registry</h1><p style="font-size:10px; color:#64748b;">Financial Audit Statement</p></div>
            <div style="text-align:right; font-size:10px;">Range: ${
              dateRange.startDate
            } to ${dateRange.endDate}</div>
          </div>
          <table>
            <thead><tr><th>Date</th><th>Description</th><th>Subcategory</th><th>Type</th><th style="text-align:right">Value</th></tr></thead>
            <tbody>
              ${transactions
                .map(
                  (t) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString("en-GB")}</td>
                  <td>${t.user?.name || "Society Internal"}<br/><small>${
                    t.remarks || "-"
                  }</small></td>
                  <td>${t.subcategory || t.category}</td>
                  <td>${t.type.toUpperCase()}</td>
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
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* --- Minimal Header --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Audit Registry
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Verified historical ledger for fiscal tracking.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 no-print">
            <input
              type="date"
              className="bg-transparent px-3 py-1.5 text-xs font-bold text-slate-600 outline-none"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
            <div className="w-px h-4 bg-slate-200 self-center mx-1" />
            <input
              type="date"
              className="bg-transparent px-3 py-1.5 text-xs font-bold text-slate-600 outline-none"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
          <button
            onClick={handlePrintStatement}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-all active:scale-95"
          >
            <Printer size={16} /> Export Audit
          </button>
        </div>
      </div>

      {/* --- KPI Summary Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Gross Inflows",
            val: stats.inflows,
            icon: TrendingUp,
            color: "emerald",
          },
          {
            label: "Gross Outflows",
            val: stats.outflows,
            icon: TrendingDown,
            color: "rose",
          },
          {
            label: "Fiscal Net",
            val: stats.net,
            icon: RefreshCw,
            color: "blue",
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {kpi.label}
              </p>
              <p className={`text-xl font-bold text-slate-900`}>
                {formatCurrency(kpi.val)}
              </p>
            </div>
            <div
              className={`p-3 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-lg`}
            >
              <kpi.icon size={20} />
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
                  Transaction Details
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Member / Origin
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Classification
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                  Amount
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center no-print">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((t, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 p-1.5 rounded ${
                          t.type === "deposit"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {t.type === "deposit" ? (
                          <ArrowUpRight size={14} />
                        ) : (
                          <ArrowDownRight size={14} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 line-clamp-1">
                          {t.remarks || "Society Record"}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">
                          {formatDate(t.date)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">
                        {t.user?.name || "Society Internal"}
                      </p>
                      {t.user?.bankAccount && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                          <CreditCard size={10} /> {t.user.bankAccount}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase tracking-wider border border-slate-200">
                        {t.category.replace("_", " ")}
                      </span>
                      {t.subcategory && (
                        <p className="text-[10px] font-medium text-slate-400 pl-1">
                          → {t.subcategory}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p
                      className={`text-sm font-bold ${
                        t.type === "deposit"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {t.type === "deposit" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </p>
                  </td>
                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-center no-print">
                      <button
                        onClick={() => handleDeleteTrx(t._id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
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

export default Reports;
