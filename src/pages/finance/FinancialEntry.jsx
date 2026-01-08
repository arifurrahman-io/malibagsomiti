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
  const { data: investmentData, loading: investmentsLoading } = useFetch(
    "/finance/investments"
  );

  const [entryMode, setEntryMode] = useState("general");
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

  const filteredSubs = useMemo(() => {
    const isInvestmentCategory = formData.category
      .toLowerCase()
      .includes("investment");
    if (isInvestmentCategory) {
      const projects = investmentData?.data || investmentData || [];
      return projects.map((p) => p.projectName);
    }
    return (
      filteredCats.find((c) => c.name === formData.category)?.subcategories ||
      []
    );
  }, [filteredCats, formData.category, investmentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bankAccount) return toast.error("No Mother Account found.");
    if (entryMode === "period" && (!formData.month || !formData.year)) {
      return toast.error("Month and Year are mandatory for Period Entries.");
    }

    const loadingToast = toast.loading("Syncing with Mother Account...");
    try {
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
    <div className="max-w-xl mx-auto py-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* --- Compact Header --- */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Direct Ledger Entry
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Mother Account Sync Active
            </p>
          </div>
          {(configLoading || banksLoading || investmentsLoading) && (
            <RefreshCw size={16} className="text-blue-500 animate-spin" />
          )}
        </div>

        {/* --- Compact Mother Account Status --- */}
        <div
          className={`px-6 py-2 flex items-center justify-between text-[9px] font-black uppercase tracking-widest ${
            motherAccount
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} />
            {motherAccount
              ? `Connected: ${motherAccount.bankName}`
              : "No Mother Account"}
          </div>
          {motherAccount && (
            <span>
              Balance: ৳{motherAccount.currentBalance.toLocaleString()}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* --- Row 1: Mode & Type --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Focus Mode
              </label>
              <div className="flex p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setEntryMode("general")}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-black transition-all ${
                    entryMode === "general"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  DAILY
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode("period")}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-black transition-all ${
                    entryMode === "period"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  PERIOD
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Flow Type
              </label>
              <div className="flex p-1 bg-gray-100 rounded-lg">
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
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-black transition-all ${
                    formData.type === "deposit"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  DEPOSIT
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
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-black transition-all ${
                    formData.type === "expense"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  EXPENSE
                </button>
              </div>
            </div>
          </div>

          {/* --- Row 2: Date / Period Inputs --- */}
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-1">
            {entryMode === "general" ? (
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-pretty">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-500 transition-all"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Month
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none"
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* --- Row 3: Categories --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-pretty">
                Category
              </label>
              <select
                required
                value={formData.category}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 transition-all"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    subcategory: "",
                  })
                }
              >
                <option value="">Select</option>
                {filteredCats.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 truncate">
                {formData.category.toLowerCase().includes("investment")
                  ? "Project"
                  : "Sub-Category"}
              </label>
              <select
                required
                disabled={!formData.category}
                value={formData.subcategory}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold disabled:bg-gray-50 outline-none focus:border-blue-500 transition-all"
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
              >
                <option value="">Select</option>
                {filteredSubs.map((s, index) => (
                  <option key={index} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* --- Row 4: Amount --- */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-pretty">
              Amount (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg">
                ৳
              </span>
              <input
                required
                type="number"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-2xl font-black text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Remarks
            </label>
            <input
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-blue-500 transition-all"
              placeholder="Optional details..."
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
            />
          </div>

          <button
            disabled={!motherAccount}
            className={`w-full py-3 rounded-lg font-black text-xs shadow-md transition-all uppercase tracking-[0.2em] ${
              !motherAccount
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-black active:scale-[0.98]"
            }`}
          >
            Post Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinancialEntry;
