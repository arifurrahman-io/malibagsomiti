import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Printer,
  Edit3,
  ChevronRight,
  UserPlus,
  Trash2,
  CreditCard,
  UserCheck,
  UserMinus,
  Filter,
  Users,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuthStore } from "../../store/useAuthStore";
import { BRANCHES } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";
import AddMemberModal from "../../components/modals/AddMemberModal";
import DashboardSkeleton from "../../components/skeleton/DashboardSkeleton";
import api from "../../services/api";
import toast from "react-hot-toast";

const MemberList = () => {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === "super-admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: rawData, loading, refetch } = useFetch("/members");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "Teacher123!",
    phone: "",
    nid: "",
    bankAccount: "",
    branch: BRANCHES[0],
    shares: 1,
    joiningDate: new Date().toISOString().split("T")[0],
  });

  const filteredMembers = useMemo(() => {
    const members = Array.isArray(rawData) ? rawData : rawData?.data || [];
    return members.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        m.nid?.includes(debouncedSearch);
      const matchesBranch = !selectedBranch || m.branch === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [rawData, debouncedSearch, selectedBranch]);

  // FIX: Professional Print Handler
  const handlePrint = () => {
    window.print();
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingId(member._id);
      setFormData({
        ...member,
        joiningDate: member.joiningDate?.split("T")[0] || "",
        password: "",
        phone: member.phone || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        password: "Teacher123!",
        phone: "",
        nid: "",
        bankAccount: "",
        branch: BRANCHES[0],
        shares: 1,
        joiningDate: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = { ...formData };
      submissionData.shares = parseInt(submissionData.shares) || 1;
      if (editingId) {
        if (!submissionData.password) delete submissionData.password;
        await api.put(`/members/${editingId}`, submissionData);
      } else {
        await api.post("/members", submissionData);
      }
      toast.success(editingId ? "Profile updated" : "Member registered");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent deletion cannot be undone. Proceed?"))
      return;
    try {
      await api.delete(`/members/${id}`);
      toast.success("Member removed");
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 text-white">
              <Users size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Member Directory
            </h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">
            Displaying{" "}
            <span className="text-blue-600 font-bold">
              {filteredMembers.length}
            </span>{" "}
            active society members
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all text-sm font-black text-gray-700 shadow-sm active:scale-95"
          >
            <Printer size={18} className="text-blue-600" />
            Print Report
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/30 font-black text-sm hover:bg-blue-700 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            Add Member
          </button>
        </div>
      </div>

      {/* Filter Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="md:col-span-2 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by Name, NID, or Phone..."
            className="w-full pl-12 pr-4 py-4 bg-white border-0 ring-1 ring-gray-200 rounded-[20px] focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            className="w-full pl-11 pr-4 py-4 bg-white border-0 ring-1 ring-gray-200 rounded-[20px] outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm font-bold text-gray-700 appearance-none"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-[20px] p-4 flex items-center justify-between">
          <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
            Active Shares
          </span>
          <span className="text-xl font-black text-blue-700">
            {filteredMembers.reduce((acc, m) => acc + (m.shares || 0), 0)}
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden print:shadow-none print:border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Member Information
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Branch
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">
                  Shares
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Ledger Balance
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right no-print">
                  Management
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((m) => (
                <tr
                  key={m._id}
                  className="hover:bg-blue-50/30 transition-all group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          m.status === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        {m.status === "active" ? (
                          <UserCheck size={22} />
                        ) : (
                          <UserMinus size={22} />
                        )}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-base flex items-center gap-2">
                          {m.name}
                          {m.status === "active" && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex flex-col space-y-0.5 mt-1">
                          <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                            📞 {m.phone}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                            <CreditCard size={12} /> ID: {m.nid}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      {m.branch}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-200">
                      {m.shares || 1}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-gray-900 text-lg tracking-tight">
                    {formatCurrency(m.totalDeposited || 0)}
                  </td>
                  <td className="px-8 py-5 text-right no-print">
                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleOpenModal(m)}
                        className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                        title="Edit Profile"
                      >
                        <Edit3 size={18} />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                          title="Delete Member"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <Link
                        to={`/admin/members/${m._id}`}
                        className="p-3 text-gray-400 hover:text-blue-600 transition-all"
                        title="View Full Profile"
                      >
                        <ChevronRight size={22} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        isEditing={!!editingId}
      />
    </div>
  );
};

export default MemberList;
