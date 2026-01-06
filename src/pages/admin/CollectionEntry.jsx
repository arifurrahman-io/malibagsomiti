import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle,
  UserCheck,
  RotateCcw,
  CalendarDays,
  AlertTriangle,
  Info,
  ShieldCheck,
  ChevronRight,
  Users,
  Layers,
  CheckCircle2,
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

  // UI State: Using Strings for month names to ensure total sync with DB
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

  /**
   * REFRESH STATUS: Real-time payment verification
   */
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

  // Auto-selection logic for unpaid active members
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

  /**
   * TRANSACTION EXECUTION: String-based month transmission
   */
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
        {
          month: selectedMonth,
          year: selectedYear,
        }
      );

      toast.success(`${selectedMonth} deposits successfully recorded.`, {
        id: loadingToast,
      });
      setSelectedMembers([]);
      await Promise.all([refetch(), checkPayments()]);
    } catch (err) {
      toast.error("Process failed: Please verify server connectivity.", {
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* --- HEADER & CONTROLS --- */}
      <div className="relative overflow-hidden bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-500/5">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Layers size={200} className="text-blue-600" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[1.5rem] shadow-xl shadow-blue-200">
              <CalendarDays size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                Collection Management
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-green-500" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Live Ledger: {selectedMonth} {selectedYear}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100/50">
            <ShieldCheck size={18} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              Automated Verification Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 pt-10 border-t border-gray-50">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">
              <Clock size={12} /> Financial Period
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedMembers([]);
              }}
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer hover:bg-white"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">
              <Layers size={12} /> Fiscal Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer hover:bg-white"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase ml-1 tracking-widest">
              <Users size={12} /> Branch Target
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl font-bold text-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer hover:bg-white"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --- MEMBER SELECTION INTERFACE --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
        <div className="p-8 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
          <button
            onClick={handleSelectAll}
            className="group flex items-center gap-3 px-8 py-3 bg-white text-[11px] font-black text-blue-600 border border-blue-100 rounded-xl uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            {selectedMembers.length ? "Reset Selection" : "Collect All Unpaid"}
            <ChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          <div className="flex items-center gap-4 px-6 py-2 bg-white rounded-full border border-gray-100">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                selectedMembers.length
                  ? "bg-blue-500 animate-pulse"
                  : "bg-gray-300"
              }`}
            />
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
              {selectedMembers.length} Members Ready for Inflow
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
          {membersArray.length > 0 ? (
            membersArray.map((m) => {
              const isPaid = paidMemberIds.includes(m._id);
              const isSelected = selectedMembers.includes(m._id);

              return (
                <div
                  key={m._id}
                  onClick={() => !isPaid && handleToggleMember(m._id)}
                  className={`flex justify-between items-center px-10 py-7 transition-all group relative ${
                    isPaid
                      ? "opacity-40 grayscale-[0.5] bg-gray-50/50 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-50/30 cursor-pointer"
                      : "hover:bg-gray-50/80 cursor-pointer"
                  }`}
                >
                  {isSelected && !isPaid && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-full my-2" />
                  )}

                  <div className="flex items-center gap-8">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${
                        isPaid
                          ? "bg-green-500 border-green-500 shadow-lg shadow-green-100 scale-110"
                          : isSelected
                          ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-200"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 size={18} className="text-white" />
                      ) : (
                        isSelected && (
                          <UserCheck size={18} className="text-white" />
                        )
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight text-lg leading-none mb-2">
                        {m.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md ${
                            isPaid
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isPaid ? "Verified" : "Pending"}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {isPaid
                            ? `Cycle Complete`
                            : m.bankAccount || "Standard Account"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-2xl font-black tracking-tighter transition-all ${
                        isSelected ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(m.shares * 1000)}
                    </p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {m.shares} Units Shared
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-32 text-center flex flex-col items-center">
              <div className="p-6 bg-gray-50 rounded-full mb-6">
                <RotateCcw
                  className="animate-spin-slow text-gray-300"
                  size={56}
                />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">
                No Branch Data Found
              </p>
            </div>
          )}
        </div>

        {/* --- DYNAMIC ACTION FOOTER --- */}
        <div className="p-10 md:p-14 bg-gray-900 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="text-center lg:text-left">
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-3">
              Total Batch Contribution
            </p>
            <h2 className="text-6xl font-black text-white tracking-tighter flex items-center gap-4">
              {formatCurrency(totalBatchAmount)}
              <span className="text-sm text-blue-500 font-bold tracking-widest uppercase bg-blue-500/10 px-4 py-1 rounded-full border border-blue-500/20">
                Inflow
              </span>
            </h2>
          </div>

          <Button
            disabled={!selectedMembers.length || isProcessing}
            onClick={() => setIsConfirmOpen(true)}
            className="w-full lg:w-auto px-20 py-7 bg-blue-600 text-white rounded-[2rem] text-xl font-black shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            {isProcessing ? (
              <RotateCcw className="animate-spin" />
            ) : (
              <>
                Confirm {selectedMembers.length} Deposits
                <ArrowRight size={24} />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* --- CONFIRMATION SYSTEM --- */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[4rem] shadow-2xl p-12 md:p-16 max-w-xl w-full animate-in zoom-in-95 duration-300">
            <div className="w-28 h-28 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 rotate-12 shadow-inner">
              <AlertTriangle size={56} />
            </div>

            <h2 className="text-4xl font-black text-center text-gray-900 tracking-tighter mb-4">
              Confirm Ledger?
            </h2>
            <p className="text-center text-gray-500 font-medium mb-10 max-w-xs mx-auto text-sm leading-relaxed">
              You are about to finalize a batch contribution for the{" "}
              <span className="text-blue-600 font-black">Malibag-A-Day</span>{" "}
              branch.
            </p>

            <div className="bg-gray-50/80 p-8 rounded-[2.5rem] space-y-6 mb-12 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
                  Active Cycle
                </span>
                <span className="text-gray-900 font-black text-lg">
                  {selectedMonth}, {selectedYear}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200/50 pt-6">
                <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
                  Net Batch Inflow
                </span>
                <span className="text-3xl text-blue-600 font-black tracking-tighter leading-none">
                  {formatCurrency(totalBatchAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-5 bg-white border-2 border-gray-100 text-gray-400 font-black rounded-3xl hover:bg-gray-50 hover:text-gray-600 transition-all uppercase text-xs tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkDeposit}
                className="flex-1 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
              >
                Finalize Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionEntry;

/**
 * NEXT STEP:
 * Would you like me to implement the auto-email generation logic that triggers
 * immediately after this "Finalize Ledger" button is clicked?
 */
