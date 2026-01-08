import React, { useState, useMemo } from "react";
import {
  Building2,
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  Search,
  Wallet,
  ShieldCheck,
  CreditCard,
  X,
  ArrowRightLeft,
  Star,
  ArrowUpRight,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import bankService from "../../services/bankService";
import { formatCurrency } from "../../utils/formatters";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const BankManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { data: response, loading, refetch } = useFetch("/bank-accounts");

  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountType: "Savings",
    accountHolderNames: [""],
    currentBalance: "",
  });

  const [transferData, setTransferData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    remarks: "",
  });

  // Data Normalization
  const accounts = useMemo(() => {
    const raw = response?.data || response;
    return Array.isArray(raw) ? raw : [];
  }, [response]);

  // Filtered Results based on Bank, A/C, or Holder Names
  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountNumber.includes(searchTerm) ||
      acc.accountHolderNames.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // --- Dynamic Name Handlers ---
  const handleNameChange = (index, value) => {
    const newNames = [...formData.accountHolderNames];
    newNames[index] = value;
    setFormData({ ...formData, accountHolderNames: newNames });
  };

  const addNameField = () =>
    setFormData({
      ...formData,
      accountHolderNames: [...formData.accountHolderNames, ""],
    });
  const removeNameField = (index) =>
    setFormData({
      ...formData,
      accountHolderNames: formData.accountHolderNames.filter(
        (_, i) => i !== index
      ),
    });

  // --- API Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.accountHolderNames.some((name) => !name.trim()))
      return toast.error("All account holder names must be filled");

    const loadingToast = toast.loading("Registering bank account...");
    try {
      await bankService.addBankAccount(formData);
      toast.success("Bank account added to society registry", {
        id: loadingToast,
      });
      setIsModalOpen(false);
      setFormData({
        bankName: "",
        accountNumber: "",
        accountType: "Savings",
        accountHolderNames: [""],
        currentBalance: "",
      });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add account", {
        id: loadingToast,
      });
    }
  };

  const handleSetMotherAccount = async (id) => {
    try {
      await bankService.updateBankAccount(id, { isMotherAccount: true });
      toast.success("Primary Mother Account updated");
      refetch();
    } catch (err) {
      toast.error("Failed to update Mother Account designation");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (transferData.fromAccountId === transferData.toAccountId) {
      return toast.error("Source and destination accounts cannot be the same");
    }

    const loadingToast = toast.loading("Executing internal transfer...");
    try {
      await bankService.transferBalance(transferData);
      toast.success("Transfer successful", { id: loadingToast });
      setIsTransferModalOpen(false);
      setTransferData({
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        remarks: "",
      });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed", {
        id: loadingToast,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this bank account?"))
      return;
    try {
      await bankService.deleteBankAccount(id);
      toast.success("Account removed successfully");
      refetch();
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-xl text-white shadow-lg">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Society Treasury
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider text-[10px]">
              Central Bank Registry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by bank, A/C or holder..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsTransferModalOpen(true)}
            variant="outline"
            className="border-slate-200 text-slate-700 flex items-center gap-2 hover:bg-slate-50"
          >
            <ArrowRightLeft size={16} />{" "}
            <span className="hidden sm:inline">Transfer</span>
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white rounded-xl px-5 py-2.5 flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <Plus size={18} />{" "}
            <span className="hidden sm:inline">Add Account</span>
          </Button>
        </div>
      </div>

      {/* --- ACCOUNTS TABLE --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Bank Details
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Type
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Account Holders
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                  Balance
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Designation
                </th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAccounts.map((acc) => (
                <tr
                  key={acc._id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          acc.isMotherAccount
                            ? "bg-blue-600 text-white shadow-blue-100 shadow-lg"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {acc.isMotherAccount ? (
                          <Star size={18} fill="currentColor" />
                        ) : (
                          <CreditCard size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          {acc.bankName}
                          {acc.isMotherAccount && (
                            <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">
                              Mother
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter mt-0.5">
                          {acc.accountNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500 uppercase">
                    {acc.accountType}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      {acc.accountHolderNames.map((name, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-slate-600"
                        >
                          <div className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-xs font-semibold">{name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-slate-900">
                    {formatCurrency(acc.currentBalance)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {!acc.isMotherAccount ? (
                      <button
                        onClick={() => handleSetMotherAccount(acc._id)}
                        className="text-[9px] font-bold text-slate-400 hover:text-blue-600 hover:border-blue-600 uppercase border border-slate-200 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        Set Mother
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-blue-600 text-[9px] font-black uppercase">
                        <ShieldCheck size={12} /> Auto-Sync
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleDelete(acc._id)}
                      className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER STATS */}
        <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 opacity-60">
            <ShieldCheck size={16} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Central Treasury Sync Active
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">
              Total Liquidity Aggregate
            </span>
            <span className="text-lg font-bold tracking-tight">
              {formatCurrency(
                filteredAccounts.reduce(
                  (sum, acc) => sum + acc.currentBalance,
                  0
                )
              )}
            </span>
          </div>
        </div>
      </div>

      {/* --- REGISTRATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Register New Treasury Bank
              </h3>
              <X
                className="cursor-pointer text-slate-400 hover:text-slate-900 transition-colors"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Account Category
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    value={formData.accountType}
                    onChange={(e) =>
                      setFormData({ ...formData, accountType: e.target.value })
                    }
                  >
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="FDR">FDR (Fixed Deposit)</option>
                    <option value="DPS">DPS Account</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                />
              </div>

              {/* Dynamic Joint Holders */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Account Holders
                  </label>
                  <button
                    type="button"
                    onClick={addNameField}
                    className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    <UserPlus size={12} /> Add Joint Holder
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {formData.accountHolderNames.map((name, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder={`Holder Name ${index + 1}`}
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                        value={name}
                        onChange={(e) =>
                          handleNameChange(index, e.target.value)
                        }
                      />
                      {formData.accountHolderNames.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeNameField(index)}
                          className="text-slate-300 hover:text-rose-500"
                        >
                          <UserMinus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Opening Balance (৳)
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600 outline-none"
                  value={formData.currentBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, currentBalance: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest mt-4"
              >
                Confirm Registration
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* --- TRANSFER MODAL --- */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsTransferModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft size={20} className="text-blue-600" /> Internal
                Balance Transfer
              </h3>
              <X
                className="cursor-pointer text-slate-400 hover:text-slate-900 transition-colors"
                onClick={() => setIsTransferModalOpen(false)}
              />
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Transfer From (Source)
                </label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={transferData.fromAccountId}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      fromAccountId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Source Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.bankName} — {acc.accountNumber} (
                      {formatCurrency(acc.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center py-1 opacity-40">
                <ArrowUpRight className="rotate-45" size={20} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                  Transfer To (Destination)
                </label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={transferData.toAccountId}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      toAccountId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Destination Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.bankName} — {acc.accountNumber} (
                      {formatCurrency(acc.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Transfer Amount (৳)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-600 outline-none"
                    value={transferData.amount}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                    Reference/Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="Internal movement"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    value={transferData.remarks}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        remarks: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs mt-4 shadow-lg shadow-blue-100"
              >
                Execute Transfer
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankManagement;
