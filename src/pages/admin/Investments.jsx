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
    month: new Date().getMonth(),
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
      legalDocs: project.legalDocs, // Keep existing path for UI display if needed
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
          <title>Financial Statement - ${p.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 4px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
            .meta-grid { display: grid; grid-template-cols: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
            .meta-item { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .meta-item span { color: #0f172a; display: block; font-size: 16px; margin-top: 4px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { background: #f8fafc; text-align: left; padding: 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; color: #475569; }
            td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            
            .inflow { color: #16a34a; font-weight: 700; }
            .outflow { color: #dc2626; font-weight: 700; }
            
            .summary-section { margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px; display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; }
            .summary-card { padding: 20px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; }
            .summary-card h4 { margin: 0; font-size: 10px; color: #64748b; text-transform: uppercase; }
            .summary-card p { margin: 8px 0 0; font-size: 20px; font-weight: 900; }
            
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Financial Statement</h1>
            <div class="meta-grid">
              <div class="meta-item">Project Name <span>${p.name}</span></div>
              <div class="meta-item">Initial Investment <span>৳${p.capital.toLocaleString()}</span></div>
              <div class="meta-item">Statement Date <span>${new Date().toLocaleDateString()}</span></div>
              <div class="meta-item">Project Status <span>${p.status.toUpperCase()}</span></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th style="text-align: right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${new Date(p.date).toLocaleDateString()}</td>
                <td>Initial Project Capital Disbursement</td>
                <td>INVESTMENT</td>
                <td style="text-align: right" class="outflow">- ৳${p.capital.toLocaleString()}</td>
              </tr>
              ${transactions
                .map(
                  (t) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.remarks}</td>
                  <td>${t.type.toUpperCase()}</td>
                  <td style="text-align: right" class="${
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

          <div class="summary-section">
            <div class="summary-card">
              <h4>Total Inflow (Profit)</h4>
              <p class="inflow">৳${summary.totalInflow.toLocaleString()}</p>
            </div>
            <div class="summary-card">
              <h4>Total Outflow (Exp/Inv)</h4>
              <p class="outflow">৳${summary.totalOutflow.toLocaleString()}</p>
            </div>
            <div class="summary-card" style="background: #2563eb; color: white; border: none;">
              <h4 style="color: #bfdbfe;">Net Yield</h4>
              <p style="font-size: 24px;">৳${p.netYield.toLocaleString()}</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
        </body>
      </html>
    `);
      printWindow.document.close();
    } catch (err) {
      toast.error("Failed to generate printable statement");
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
        toast.success("Project updated successfully!");
      } else {
        await api.post("/finance/investment", dataToSend, config);
        toast.success("New project initiated!");
      }
      closeMainModal();
      refetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/finance/investment/${selectedProject._id}`);
      toast.success("Project deleted forever.");
      setIsDeleteModalOpen(false);
      refetchProjects();
    } catch (err) {
      toast.error("Failed to delete project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfitSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // profitData must contain { amount, type, remarks, month, year }
      await api.post(
        `/finance/investment/${selectedProject._id}/profit`,
        profitData
      );
      toast.success("Record updated!");
      setIsProfitModalOpen(false);
      refetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Entry failed");
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Investment Portfolio
          </h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">
            Dynamic asset tracking and legal document storage.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 shadow-xl shadow-blue-100/50"
        >
          <Plus size={18} /> New Project
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Briefcase size={28} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Active Capital
            </p>
            <p className="text-2xl font-black text-gray-900 leading-tight">
              {formatCurrency(stats.totalInvestments || 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Growth Trend
            </p>
            <p className="text-2xl font-black text-gray-900 leading-tight">
              +{projects.length} Projects
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Compliance
            </p>
            <p className="text-2xl font-black text-gray-900 leading-tight">
              Verified
            </p>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm group hover:border-blue-200 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/30"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    project.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {project.status || "Active"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchProjectHistory(project)}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors bg-gray-50 rounded-lg"
                  >
                    <History size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsProfitModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100"
                  >
                    <PlusCircle size={14} /> PROFIT/EXPENSE
                  </button>
                  {isSuperAdmin && (
                    <div className="flex gap-1.5 border-l pl-3 border-gray-100">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-lg"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handlePrintReport(project)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors bg-gray-50 rounded-lg"
                        title="Download Printable Report"
                      >
                        <FileText size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {project.projectName}
              </h3>
              <div className="flex items-center gap-4 mb-6">
                {project.legalDocs ? (
                  <a
                    href={`${STATIC_URL}/${project.legalDocs}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-600 font-bold border border-blue-600 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <FileText size={14} /> View Docs <ExternalLink size={12} />
                  </a>
                ) : (
                  <div className="text-xs text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                    No Docs Attached
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Capital
                  </p>
                  <p className="text-xl font-black text-gray-900">
                    {formatCurrency(project.amount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Net Yield
                  </p>
                  <p
                    className={`text-xl font-black ${
                      project.totalProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {/* Remove the hardcoded '+' and let formatCurrency handle the value */}
                    {project.totalProfit >= 0 ? "+" : ""}
                    {formatCurrency(project.totalProfit || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-8 py-5 bg-gray-50/80 flex items-center justify-between border-t border-gray-50">
              <div className="text-xs text-gray-500 font-black uppercase tracking-tighter">
                Launched: {formatDate(project.date)}
              </div>
              <div className="text-xs text-gray-500 font-black uppercase tracking-tighter">
                ID: {project._id.slice(-6).toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in">
            <div className="flex items-center justify-between p-10 border-b">
              <div>
                <h2 className="text-3xl font-black text-gray-900">
                  {isEditing ? "Edit Project" : "Initiate Project"}
                </h2>
                <p className="text-sm text-gray-500">
                  Document capital and legal details.
                </p>
              </div>
              <button
                onClick={closeMainModal}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleAddOrUpdate}
              className="p-10 space-y-8 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Project Name
                  </label>
                  <input
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                    value={formData.projectName}
                    onChange={(e) =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Capital Amount
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Date
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Legal Docs
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
                      className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer text-gray-500 text-sm font-bold"
                    >
                      <UploadCloud size={20} className="text-blue-600" />{" "}
                      {formData.legalDocs instanceof File
                        ? formData.legalDocs.name
                        : "Attach New PDF/Image"}
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Remarks
                </label>
                <textarea
                  rows={4}
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm font-medium"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                />
              </div>
              <div className="pt-6 flex gap-5 sticky bottom-0 bg-white">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeMainModal}
                  className="flex-1 py-4 font-black"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 py-4 font-black shadow-2xl shadow-blue-500/20"
                >
                  {isSubmitting
                    ? "Processing..."
                    : isEditing
                    ? "Update Project"
                    : "Finalize Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Ledger Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Investment Ledger
                </h2>
                <p className="text-xs text-gray-500 font-bold uppercase">
                  {selectedProject?.projectName}
                </p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : projectHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">
                  No transactions recorded for this project yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {projectHistory.map((trx, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/30"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-xl ${
                            trx.category === "investment_profit"
                              ? "bg-green-100 text-green-600"
                              : trx.type === "expense"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {trx.category === "investment_profit" ? (
                            <ArrowUpRight size={18} />
                          ) : trx.type === "expense" ? (
                            <ArrowDownRight size={18} />
                          ) : (
                            <Coins size={18} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {trx.remarks}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">
                            {formatDate(trx.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-black ${
                            trx.type === "deposit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {trx.type === "deposit" ? "+" : "-"}
                          {formatCurrency(trx.amount)}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {trx.category.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Delete Project?
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                This action permanently removes all documents and financial
                history. This cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200"
                >
                  {isSubmitting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profit Entry Modal */}
      {isProfitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in">
            <div className="p-10 border-b bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">
                Financial Entry
              </h2>
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">
                {selectedProject?.projectName}
              </p>
            </div>
            <form onSubmit={handleProfitSubmit} className="p-10 space-y-8">
              <div className="flex p-2 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() =>
                    setProfitData({ ...profitData, type: "deposit" })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all ${
                    profitData.type === "deposit"
                      ? "bg-white text-green-600 shadow-xl"
                      : "text-gray-500"
                  }`}
                >
                  <PlusCircle size={16} /> PROFIT
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProfitData({ ...profitData, type: "expense" })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all ${
                    profitData.type === "expense"
                      ? "bg-white text-red-600 shadow-xl"
                      : "text-gray-500"
                  }`}
                >
                  <MinusCircle size={16} /> EXPENSE
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Amount
                </label>
                <input
                  required
                  type="number"
                  className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl font-black text-2xl text-blue-600 outline-none"
                  value={profitData.amount}
                  onChange={(e) =>
                    setProfitData({ ...profitData, amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Remarks
                </label>
                <textarea
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium outline-none"
                  placeholder="Description..."
                  value={profitData.remarks}
                  onChange={(e) =>
                    setProfitData({ ...profitData, remarks: e.target.value })
                  }
                />
              </div>
              <div className="pt-4 flex gap-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProfitModalOpen(false)}
                  className="flex-1 py-4 font-black"
                >
                  Cancel
                </Button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className={`flex-1 py-4 font-black rounded-2xl shadow-lg transition-colors ${
                    profitData.type === "deposit"
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                      : "bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Confirm"}
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
