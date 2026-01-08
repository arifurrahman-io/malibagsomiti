import React, { useState, useMemo } from "react";
import {
  Plus,
  Briefcase,
  Calendar,
  Activity,
  Landmark,
  X,
  PlusCircle,
  MinusCircle,
  Edit3,
  Trash2,
  FileText,
  UploadCloud,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  RefreshCw,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useAuthStore } from "../../store/useAuthStore";
import { formatCurrency, formatDate } from "../../utils/formatters";
import Button from "../../components/ui/Button";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import api from "../../services/api";
import toast from "react-hot-toast";

const Investments = () => {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "super-admin";
  const FILE_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const STATIC_URL = FILE_BASE_URL.replace("/api", "");

  // UI State Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectHistory, setProjectHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Data Fetching
  const {
    data: projectData,
    loading: projectsLoading,
    refetch: refetchProjects,
  } = useFetch("/finance/investments");
  const { data: summaryData, loading: summaryLoading } =
    useFetch("/finance/summary");

  const [formData, setFormData] = useState({
    projectName: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
    legalDocs: null,
  });

  const [profitData, setProfitData] = useState({
    amount: "",
    type: "deposit",
    month: new Date().toLocaleString("default", { month: "long" }), // Align with string-based logic
    year: new Date().getFullYear(),
    remarks: "",
  });

  const projects = useMemo(() => projectData?.data || [], [projectData]);
  const stats = summaryData?.data || {};

  // Handlers
  const fetchProjectHistory = async (project) => {
    setSelectedProject(project);
    setHistoryLoading(true);
    setIsHistoryModalOpen(true);
    try {
      const { data } = await api.get(
        `/finance/investment/${project._id}/history`
      );
      setProjectHistory(data.data);
    } catch (err) {
      toast.error("Could not load transaction history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setIsEditing(true);
    setFormData({
      projectName: project.projectName,
      amount: project.amount,
      date: project.date.split("T")[0],
      remarks: project.remarks || "",
      legalDocs: project.legalDocs,
    });
    setIsModalOpen(true);
  };

  const handlePrintReport = async (project) => {
    try {
      const { data } = await api.get(
        `/finance/investment/${project._id}/report`
      );
      const { project: p, transactions, summary } = data.data;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Statement - ${p.name}</title>
            <style>
              body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
              .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
              .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
              .label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
              .val { font-size: 14px; font-weight: 600; color: #1e293b; }
              table { width: 100%; border-collapse: collapse; margin-top: 30px; }
              th { text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; color: #64748b; }
              td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f8fafc; }
              .summary { margin-top: 30px; display: flex; gap: 20px; }
              .card { flex: 1; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2 style="margin:0; letter-spacing: -0.5px;">Investment Statement</h2>
              <div class="grid" style="margin-top:20px;">
                <div><div class="label">Project</div><div class="val">${
                  p.name
                }</div></div>
                <div><div class="label">Capital</div><div class="val">৳${p.capital.toLocaleString()}</div></div>
              </div>
            </div>
            <table>
              <thead><tr><th>Date</th><th>Remarks</th><th>Type</th><th style="text-align:right">Amount</th></tr></thead>
              <tbody>
                ${transactions
                  .map(
                    (t) => `
                  <tr>
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                    <td>${t.remarks}</td>
                    <td>${t.type.toUpperCase()}</td>
                    <td style="text-align:right; font-weight:600; color: ${
                      t.type === "deposit" ? "#16a34a" : "#dc2626"
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
            <div class="summary">
              <div class="card"><div class="label">Net Yield</div><div class="val" style="font-size:18px;">৳${p.netYield.toLocaleString()}</div></div>
              <div class="card"><div class="label">Performance (ROI)</div><div class="val" style="font-size:18px;">${
                p.roi
              }</div></div>
            </div>
            <script>window.print(); window.onafterprint = function() { window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      toast.error("Failed to generate report");
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dataToSend = new FormData();
    dataToSend.append("projectName", formData.projectName);
    dataToSend.append("amount", formData.amount);
    dataToSend.append("date", formData.date);
    dataToSend.append("remarks", formData.remarks);

    if (formData.legalDocs instanceof File) {
      dataToSend.append("legalDocs", formData.legalDocs);
    }

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (isEditing) {
        await api.put(
          `/finance/investment/${selectedProject._id}`,
          dataToSend,
          config
        );
        toast.success("Project updated");
      } else {
        await api.post("/finance/investment", dataToSend, config);
        toast.success("Project initiated");
      }
      closeMainModal();
      refetchProjects();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/finance/investment/${selectedProject._id}`);
      toast.success("Project removed");
      setIsDeleteModalOpen(false);
      refetchProjects();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfitSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(
        `/finance/investment/${selectedProject._id}/profit`,
        profitData
      );
      toast.success("Ledger updated");
      setIsProfitModalOpen(false);
      refetchProjects();
    } catch (err) {
      toast.error("Entry failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeMainModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedProject(null);
    setFormData({
      projectName: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      remarks: "",
      legalDocs: null,
    });
  };

  if (projectsLoading || summaryLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Investment Portfolio
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage society assets and compliance documents.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-lg h-11 text-sm font-semibold"
        >
          <Plus size={16} className="mr-2" /> New Project
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Active Capital",
            val: formatCurrency(stats.totalInvestments || 0),
            icon: Briefcase,
            color: "blue",
          },
          {
            label: "Asset Count",
            val: `${projects.length} Projects`,
            icon: Activity,
            color: "emerald",
          },
          {
            label: "Compliance",
            val: "Verified",
            icon: FileText,
            color: "slate",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4"
          >
            <div
              className={`p-3 bg-${item.color}-50 text-${item.color}-600 rounded-lg`}
            >
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-lg font-bold text-slate-900">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col h-full"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    project.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-slate-50 text-slate-600 border border-slate-100"
                  }`}
                >
                  {project.status || "Active"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchProjectHistory(project)}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                    title="View Ledger"
                  >
                    <History size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsProfitModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    + PROFIT/LOSS
                  </button>
                  {isSuperAdmin && (
                    <div className="flex items-center ml-2 border-l border-slate-100 pl-2">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handlePrintReport(project)}
                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {project.projectName}
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-1">
                {project.remarks || "No additional details provided."}
              </p>

              <div className="flex items-center gap-3 mb-6">
                {project.legalDocs ? (
                  <a
                    href={`${STATIC_URL}/${project.legalDocs}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[11px] text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors"
                  >
                    <FileText size={14} /> View Documents
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded border border-slate-100">
                    No Docs Attached
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Project Capital
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    {formatCurrency(project.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Net Yield
                  </p>
                  <p
                    className={`text-base font-bold ${
                      project.totalProfit >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {project.totalProfit >= 0 ? "+" : ""}
                    {formatCurrency(project.totalProfit || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Launched: {formatDate(project.date)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                UID: {project._id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/30">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? "Modify Project" : "New Investment"}
              </h2>
              <button
                onClick={closeMainModal}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleAddOrUpdate}
              className="p-8 space-y-5 max-h-[75vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Project Name
                  </label>
                  <input
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-colors"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Capital Amount
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-colors"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Launch Date
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-colors"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Legal Documents
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="docs"
                      className="hidden"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          legalDocs: e.target.files[0],
                        })
                      }
                    />
                    <label
                      htmlFor="docs"
                      className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-lg cursor-pointer text-slate-400 text-xs font-semibold hover:border-blue-400 transition-colors"
                    >
                      <UploadCloud size={18} className="text-blue-500" />
                      {formData.legalDocs instanceof File
                        ? formData.legalDocs.name
                        : "Attach PDF/Image"}
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Remarks
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-colors"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeMainModal}
                  className="flex-1 py-3 text-sm font-bold border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isSubmitting
                    ? "Processing..."
                    : isEditing
                    ? "Save Changes"
                    : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Ledger Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Project Ledger
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase">
                  {selectedProject?.projectName}
                </p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="animate-spin text-blue-500" size={24} />
                </div>
              ) : projectHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                  No entries found
                </div>
              ) : (
                projectHistory.map((trx, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded ${
                          trx.category === "investment_profit"
                            ? "bg-emerald-50 text-emerald-600"
                            : trx.type === "expense"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {trx.type === "deposit" ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {trx.remarks}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">
                          {formatDate(trx.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs font-bold ${
                          trx.type === "deposit"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {trx.type === "deposit" ? "+" : "-"}
                        {formatCurrency(trx.amount)}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">
                        {trx.category.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Delete Project?
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-8 leading-relaxed">
              This action permanently removes all documents and financial
              history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg text-xs shadow-md shadow-red-200 hover:bg-red-700 transition-colors"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profit/Expense Entry Modal */}
      {isProfitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/30">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Financial Entry
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                {selectedProject?.projectName}
              </p>
            </div>
            <form onSubmit={handleProfitSubmit} className="p-8 space-y-6">
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setProfitData({ ...profitData, type: "deposit" })
                  }
                  className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${
                    profitData.type === "deposit"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  PROFIT
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProfitData({ ...profitData, type: "expense" })
                  }
                  className={`flex-1 py-2 rounded-md text-[10px] font-bold transition-all ${
                    profitData.type === "expense"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  EXPENSE
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Transaction Amount
                </label>
                <input
                  required
                  type="number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-colors"
                  value={profitData.amount}
                  onChange={(e) =>
                    setProfitData({ ...profitData, amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit Remarks
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none"
                  rows={3}
                  placeholder="Description..."
                  value={profitData.remarks}
                  onChange={(e) =>
                    setProfitData({ ...profitData, remarks: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProfitModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold border-slate-200 text-slate-500"
                >
                  Cancel
                </Button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className={`flex-1 py-3 font-bold rounded-lg text-xs text-white transition-colors ${
                    profitData.type === "deposit"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isSubmitting ? "Syncing..." : "Confirm Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;
