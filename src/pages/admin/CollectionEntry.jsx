import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  AlertCircle,
  CreditCard,
  UserCheck,
  RotateCcw,
  CalendarDays,
  X,
  AlertTriangle,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { postDeposit } from "../../services/financeService";
import { BRANCHES } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";
import Button from "../../components/ui/Button";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import api from "../../services/api"; // Assuming your axios instance is here

const CollectionEntry = () => {
  const startYear = 2023;
  const currentYear = new Date().getFullYear();

  const availableYears = useMemo(() => {
    const years = [];
    for (let y = startYear; y <= currentYear; y++) {
      years.push(y);
    }
    return years.reverse();
  }, [currentYear]);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null);

  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // Track who has already paid
  const [paidMemberIds, setPaidMemberIds] = useState([]);

  const months = [
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

  const { data, loading, error, refetch } = useFetch(
    `/members?branch=${selectedBranch}`
  );

  // Fetch Payment Status for the selected month/year
  useEffect(() => {
    const checkPayments = async () => {
      try {
        const res = await api.get(`/finance/check-payments`, {
          params: {
            month: selectedMonth,
            year: selectedYear,
            branch: selectedBranch,
          },
        });
        setPaidMemberIds(res.data.data || []);
      } catch (err) {
        console.error("Failed to check payment status", err);
      }
    };
    checkPayments();
  }, [selectedMonth, selectedYear, selectedBranch]);

  const membersArray = useMemo(() => {
    const rawData = Array.isArray(data) ? data : data?.data;
    return Array.isArray(rawData) ? rawData : [];
  }, [data]);

  // Auto-select members who haven't paid yet
  useEffect(() => {
    if (membersArray.length > 0) {
      const eligibleIds = membersArray
        .filter((m) => m.status === "active" && !paidMemberIds.includes(m._id))
        .map((m) => m._id);
      setSelectedMembers(eligibleIds);
    }
  }, [membersArray, paidMemberIds]);

  const handleToggleMember = (id) => {
    if (paidMemberIds.includes(id)) return; // Prevent selection of paid members
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const eligibleIds = membersArray
      .filter((m) => !paidMemberIds.includes(m._id))
      .map((m) => m._id);
    setSelectedMembers(
      selectedMembers.length === eligibleIds.length ? [] : eligibleIds
    );
  };

  const executeBulkDeposit = async () => {
    setIsConfirmOpen(false);
    setIsProcessing(true);
    try {
      await postDeposit(
        selectedMembers,
        `Monthly Collection: ${months[selectedMonth]} ${selectedYear} (${selectedBranch})`,
        { month: selectedMonth, year: selectedYear }
      );

      setStatus({
        type: "success",
        message: `Processed ${selectedMembers.length} deposits for ${months[selectedMonth]} ${selectedYear}!`,
      });
      setSelectedMembers([]);
      refetch(); // Refresh member data
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to process deposits.",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const totalBatchAmount = selectedMembers.reduce((sum, id) => {
    const m = membersArray.find((member) => member._id === id);
    return sum + (m ? m.shares * 1000 : 0);
  }, 0);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Dynamic Header Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Monthly Collection Entry
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Capture subscriptions for {months[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Select Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold cursor-pointer"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Branch Filter
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold cursor-pointer"
            >
              {BRANCHES.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Feedback */}
      {(status || error) && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
            status?.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {status?.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-bold">{status?.message || error}</span>
        </div>
      )}

      {/* Member Selection Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <button
            onClick={handleSelectAll}
            className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
          >
            {selectedMembers.length > 0 ? "Deselect All" : "Select All Unpaid"}
          </button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {selectedMembers.length} Members Ready to Pay
          </span>
        </div>

        <div className="divide-y divide-gray-50 max-h-[450px] overflow-y-auto">
          {membersArray.length > 0 ? (
            membersArray.map((member) => {
              const isPaid = paidMemberIds.includes(member._id);
              return (
                <div
                  key={member._id}
                  onClick={() => !isPaid && handleToggleMember(member._id)}
                  className={`flex items-center justify-between p-4 transition-all ${
                    isPaid
                      ? "opacity-50 cursor-not-allowed bg-gray-50/50"
                      : selectedMembers.includes(member._id)
                      ? "bg-blue-50/40 cursor-pointer"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isPaid
                          ? "bg-green-500 border-green-500"
                          : selectedMembers.includes(member._id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle size={12} className="text-white" />
                      ) : (
                        selectedMembers.includes(member._id) && (
                          <UserCheck size={12} className="text-white" />
                        )
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">
                        {member.bankAccount
                          ? `A/C: ${member.bankAccount}`
                          : "No Bank Account"}
                      </p>
                      <p className="font-bold text-gray-900 leading-none mb-1">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        Shares: {member.shares} •{" "}
                        {isPaid ? (
                          <span className="text-green-600 font-black">
                            ALREADY DEPOSITED
                          </span>
                        ) : (
                          `NID: ${member.nid}`
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">
                      {formatCurrency(member.shares * 1000)}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-black">
                      Monthly Fee
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center flex flex-col items-center opacity-40">
              <RotateCcw
                className="text-gray-300 mb-2 animate-spin-slow"
                size={40}
              />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                No members in branch
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Batch Total
            </p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">
              {formatCurrency(totalBatchAmount)}
            </p>
          </div>
          <Button
            disabled={isProcessing || selectedMembers.length === 0}
            onClick={() => setIsConfirmOpen(true)}
            className="w-full sm:w-auto px-16 py-4 rounded-2xl text-lg font-black shadow-2xl shadow-blue-200 active:scale-95 transition-all"
          >
            {isProcessing
              ? "Processing..."
              : `Confirm ${months[selectedMonth]} Deposits`}
          </Button>
        </div>
      </div>

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 text-center space-y-4">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                Are you sure?
              </h2>
              <div className="bg-gray-50 p-4 rounded-2xl text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">
                    Total Members:
                  </span>
                  <span className="text-gray-900 font-black">
                    {selectedMembers.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Period:</span>
                  <span className="text-gray-900 font-black">
                    {months[selectedMonth]}, {selectedYear}
                  </span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2 border-gray-200">
                  <span className="text-gray-900 font-black">
                    Total Amount:
                  </span>
                  <span className="text-blue-600 font-black">
                    {formatCurrency(totalBatchAmount)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium">
                This action will record deposits for all selected members and
                send them email notifications.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkDeposit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Yes, Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionEntry;
