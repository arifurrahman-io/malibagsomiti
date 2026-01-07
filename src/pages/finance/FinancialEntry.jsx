import React, { useState, useMemo } from "react";
import {
  Landmark,
  ArrowDownCircle,
  ArrowUpCircle,
  Tag,
  Layers,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import api from "../../services/api";
import toast from "react-hot-toast";

const FinancialEntry = () => {
  const { data: config, loading } = useFetch("/finance/categories");

  const [formData, setFormData] = useState({
    type: "deposit",
    category: "",
    subcategory: "",
    amount: "",
    remarks: "",
    date: new Date().toISOString().split("T")[0],
  });

  /**
   * 🛠️ DATA NORMALIZATION
   * Ensures component works seamlessly whether API returns an array or an object.
   */
  const categoriesArray = useMemo(() => {
    if (Array.isArray(config)) return config;
    if (config && Array.isArray(config.data)) return config.data;
    return [];
  }, [config]);

  // Filter categories based on Type (Deposit vs Expense)
  const filteredCats = useMemo(
    () =>
      categoriesArray.filter(
        (c) => c.type === formData.type && c.isActive !== false
      ),
    [categoriesArray, formData.type]
  );

  // Filter subcategories based on selected Primary Category
  const filteredSubs = useMemo(
    () =>
      filteredCats.find((c) => c.name === formData.category)?.subcategories ||
      [],
    [filteredCats, formData.category]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing entry...");
    try {
      await api.post("/finance/transaction", formData);
      toast.success("Ledger Synchronized", { id: loadingToast });
      setFormData({
        ...formData,
        amount: "",
        remarks: "",
        category: "",
        subcategory: "",
      });
    } catch (err) {
      toast.error("Transaction Rejected", { id: loadingToast });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* --- Minimal Professional Header --- */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Direct Ledger Entry
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Record manual deposits and expenses for auditing.
            </p>
          </div>
          {loading && (
            <RefreshCw size={18} className="text-blue-500 animate-spin" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* --- Minimal Type Switcher --- */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  type: "deposit",
                  category: "",
                  subcategory: "",
                })
              }
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                formData.type === "deposit"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <ArrowUpCircle size={14} /> Deposit
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  type: "expense",
                  category: "",
                  subcategory: "",
                })
              }
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                formData.type === "expense"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <ArrowDownCircle size={14} /> Expense
            </button>
          </div>

          {/* --- Category Selection Grid --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Primary Category
              </label>
              <select
                required
                value={formData.category}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 transition-all"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    subcategory: "",
                  })
                }
              >
                <option value="">Select Category</option>
                {filteredCats.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Sub-Classification
              </label>
              <select
                required
                disabled={!formData.category}
                value={formData.subcategory}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 disabled:bg-gray-50 outline-none focus:border-blue-500 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
              >
                <option value="">Select Subcategory</option>
                {filteredSubs.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* --- Amount Input --- */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Monetary Value (৳)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                ৳
              </span>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-3xl font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
          </div>

          {/* --- Remarks --- */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Entry Remarks
            </label>
            <textarea
              rows="3"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all"
              placeholder="Provide a brief explanation for this record..."
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </div>

          {/* --- Action Button --- */}
          <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all uppercase tracking-widest">
            Authorize & Post to Ledger
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinancialEntry;
