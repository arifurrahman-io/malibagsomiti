import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  UserCheck,
  RotateCcw,
  CalendarDays,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Users,
  Layers,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { postDeposit } from "../../services/financeService";
import { BRANCHES } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";
import Button from "../../components/ui/Button";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import api from "../../services/api";
import toast from "react-hot-toast";

const MONTH_NAMES = [
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
];

const CollectionEntry = () => {
  const startYear = 2023;
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = [];
    for (let y = startYear; y <= currentYear; y++) years.push(y);
    return years.reverse();
  }, [currentYear]);

  // UI State: String-based months for DB consistency
  const [selectedYear, setSelectedYear] = useState(Number(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(
    MONTH_NAMES[new Date().getMonth()]
  );
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [paidMemberIds, setPaidMemberIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data, loading, refetch } = useFetch(
    `/members?branch=${selectedBranch}`
  );

  const checkPayments = useCallback(async () => {
    try {
      const res = await api.get("/finance/check-payments", {
        params: {
          month: selectedMonth,
          year: selectedYear,
          branch: selectedBranch,
        },
      });
      setPaidMemberIds(res.data?.data || []);
    } catch (err) {
      console.error("Payment sync failed:", err);
    }
  }, [selectedMonth, selectedYear, selectedBranch]);

  useEffect(() => {
    checkPayments();
  }, [checkPayments]);

  const membersArray = useMemo(() => {
    const raw = Array.isArray(data) ? data : data?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  useEffect(() => {
    const eligible = membersArray
      .filter((m) => m.status === "active" && !paidMemberIds.includes(m._id))
      .map((m) => m._id);
    setSelectedMembers(eligible);
  }, [membersArray, paidMemberIds]);

  const handleToggleMember = (id) => {
    if (paidMemberIds.includes(id)) return;
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const eligible = membersArray
      .filter((m) => m.status === "active" && !paidMemberIds.includes(m._id))
      .map((m) => m._id);
    setSelectedMembers(
      selectedMembers.length === eligible.length ? [] : eligible
    );
  };

  const executeBulkDeposit = async () => {
    setIsConfirmOpen(false);
    setIsProcessing(true);
    const loadingToast = toast.loading(
      `Synchronizing ${selectedMonth} Ledger...`
    );

    try {
      await postDeposit(
        selectedMembers,
        `Monthly Collection: ${selectedMonth} ${selectedYear} (${selectedBranch})`,
        { month: selectedMonth, year: selectedYear }
      );

      toast.success(`${selectedMonth} deposits recorded.`, {
        id: loadingToast,
      });
      setSelectedMembers([]);
      await Promise.all([refetch(), checkPayments()]);
    } catch (err) {
      toast.error("Connectivity failure. Verify server status.", {
        id: loadingToast,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalBatchAmount = selectedMembers.reduce((sum, id) => {
    const m = membersArray.find((x) => x._id === id);
    return sum + (m ? m.shares * 1000 : 0);
  }, 0);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Bulk Collection Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Verify and process monthly member contributions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Audit Verification Active
          </span>
        </div>
      </div>

      {/* --- CONTROLS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Financial Period",
            icon: Clock,
            val: selectedMonth,
            setter: setSelectedMonth,
            options: MONTH_NAMES,
          },
          {
            label: "Fiscal Year",
            icon: Layers,
            val: selectedYear,
            setter: setSelectedYear,
            options: availableYears,
          },
          {
            label: "Target Branch",
            icon: Users,
            val: selectedBranch,
            setter: setSelectedBranch,
            options: BRANCHES,
          },
        ].map((ctrl, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200 space-y-2"
          >
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              <ctrl.icon size={12} /> {ctrl.label}
            </label>
            <select
              value={ctrl.val}
              onChange={(e) => {
                ctrl.setter(i === 1 ? Number(e.target.value) : e.target.value);
                if (i === 0) setSelectedMembers([]);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              {ctrl.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* --- SELECTION INTERFACE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100">
          <button
            onClick={handleSelectAll}
            className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-white border border-blue-100 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all active:scale-95"
          >
            {selectedMembers.length ? "Reset Selection" : "Select All Unpaid"}
          </button>
          <div className="flex items-center gap-2">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                selectedMembers.length
                  ? "bg-blue-500 animate-pulse"
                  : "bg-slate-300"
              }`}
            />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {selectedMembers.length} Members Ready
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto custom-scrollbar">
          {membersArray.length > 0 ? (
            membersArray.map((m) => {
              const isPaid = paidMemberIds.includes(m._id);
              const isSelected = selectedMembers.includes(m._id);
              return (
                <div
                  key={m._id}
                  onClick={() => !isPaid && handleToggleMember(m._id)}
                  className={`flex justify-between items-center px-8 py-5 transition-all group ${
                    isPaid
                      ? "bg-slate-50/50 opacity-60 cursor-not-allowed"
                      : "hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isPaid
                          ? "bg-emerald-500 border-emerald-500"
                          : isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {(isPaid || isSelected) && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-md leading-tight">
                        {m.name}
                      </h3>
                      <p className="text-[13px] font-semibold text-slate-400 uppercase mt-0.5 tracking-tighter">
                        {isPaid ? "Paid" : m.bankAccount || "Standard Savings"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        isSelected ? "text-blue-600" : "text-slate-900"
                      }`}
                    >
                      {formatCurrency(m.shares * 1000)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {m.shares} Shares
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <RotateCcw
                className="text-slate-200 mb-3 animate-spin-slow"
                size={40}
              />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                No Active Member Data
              </p>
            </div>
          )}
        </div>

        {/* --- FOOTER ACTION --- [cite: 2025-10-11] */}
        <div className="p-8 bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-[16px] font-bold text-slate-100 uppercase tracking-[0.2em] mb-1">
              Total
            </p>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {formatCurrency(totalBatchAmount)}
            </h2>
          </div>
          <Button
            disabled={!selectedMembers.length || isProcessing}
            onClick={() => setIsConfirmOpen(true)}
            className="w-full sm:w-auto px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? (
              <RotateCcw className="animate-spin" size={18} />
            ) : (
              <>
                Post {selectedMembers.length} Transactions{" "}
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl p-10 max-w-md w-full animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-900 mb-2">
              Finalize Ledger?
            </h2>
            <p className="text-center text-slate-500 text-sm mb-8">
              Authorizing collection for{" "}
              <b>
                {selectedMonth} {selectedYear}
              </b>{" "}
              across selected branch members.
            </p>

            <div className="bg-slate-50 p-5 rounded-lg mb-8 border border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Net Inflow
              </span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(totalBatchAmount)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkDeposit}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionEntry;
