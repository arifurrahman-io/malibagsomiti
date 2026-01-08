import React, { useState, useMemo, useEffect } from "react";
import {
  Landmark,
  ArrowDownCircle,
  ArrowUpCircle,
  Tag,
  Layers,
  FileText,
  RefreshCw,
  ShieldCheck,
  CalendarDays,
  Clock,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import api from "../../services/api";
import toast from "react-hot-toast";

const FinancialEntry = () => {
  const { data: config, loading: configLoading } = useFetch(
    "/finance/categories"
  );
  const { data: banks, loading: banksLoading } = useFetch("/bank-accounts");

  // State to toggle between Date-selection and Month/Year focus
  const [entryMode, setEntryMode] = useState("general"); // 'general' or 'period'

  const [formData, setFormData] = useState({
    type: "deposit",
    category: "",
    subcategory: "",
    amount: "",
    remarks: "",
    bankAccount: "",
    date: new Date().toISOString().split("T")[0],
    month: "",
    year: new Date().getFullYear().toString(),
  });

  const motherAccount = useMemo(() => {
    const rawBanks = banks?.data || banks || [];
    return rawBanks.find((acc) => acc.isMotherAccount);
  }, [banks]);

  useEffect(() => {
    if (motherAccount) {
      setFormData((prev) => ({ ...prev, bankAccount: motherAccount._id }));
    }
  }, [motherAccount]);

  const categoriesArray = useMemo(() => {
    if (Array.isArray(config)) return config;
    if (config && Array.isArray(config.data)) return config.data;
    return [];
  }, [config]);

  const filteredCats = useMemo(
    () =>
      categoriesArray.filter(
        (c) => c.type === formData.type && c.isActive !== false
      ),
    [categoriesArray, formData.type]
  );

  const filteredSubs = useMemo(
    () =>
      filteredCats.find((c) => c.name === formData.category)?.subcategories ||
      [],
    [filteredCats, formData.category]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bankAccount) {
      return toast.error(
        "No Mother Account found. Please designate one in Bank Management."
      );
    }

    // Validation based on mode
    if (entryMode === "period" && (!formData.month || !formData.year)) {
      return toast.error("Month and Year are mandatory for Period Entries.");
    }

    const loadingToast = toast.loading("Syncing with Mother Account...");
    try {
      // Clean payload: if general mode, remove month/year to prevent duplicate index issues
      const payload = { ...formData };
      if (entryMode === "general") {
        delete payload.month;
        delete payload.year;
      }

      await api.post("/finance/transaction", payload);

      toast.success("Ledger Synchronized Successfully", { id: loadingToast });
      setFormData({
        ...formData,
        amount: "",
        remarks: "",
        category: "",
        subcategory: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Transaction Rejected", {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* --- Header --- */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Direct Ledger Entry
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Post manual transactions to the society treasury.
            </p>
          </div>
          {(configLoading || banksLoading) && (
            <RefreshCw size={18} className="text-blue-500 animate-spin" />
          )}
        </div>

        {/* --- Mother Account Status --- */}
        <div
          className={`px-8 py-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${
            motherAccount
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            {motherAccount
              ? `Connected: ${motherAccount.bankName}`
              : "No Mother Account Selected"}
          </div>
          {motherAccount && (
            <span>
              Balance: ৳{motherAccount.currentBalance.toLocaleString()}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* --- Entry Mode Switcher --- */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Entry Focus
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEntryMode("general")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                  entryMode === "general"
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                <CalendarDays size={14} /> Daily Date
              </button>
              <button
                type="button"
                onClick={() => setEntryMode("period")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                  entryMode === "period"
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                <Clock size={14} /> Month / Year
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* --- Type Switcher (Deposit/Expense) --- */}
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

          {/* --- Dynamic Inputs based on Mode --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
            {entryMode === "general" ? (
              <div className="col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 transition-all"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Report Month
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                  >
                    <option value="">Select Month</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Report Year
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* --- Category Selection --- */}
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
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 disabled:bg-gray-50 outline-none"
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xl">
                ৳
              </span>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-3xl font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
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
              rows="2"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all"
              placeholder="Provide a brief explanation for this record..."
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </div>

          <button
            disabled={!motherAccount}
            className={`w-full py-4 rounded-xl font-bold text-sm shadow-md transition-all uppercase tracking-widest ${
              !motherAccount
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-black active:scale-[0.98]"
            }`}
          >
            Authorize & Post Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinancialEntry;
