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
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Member Directory
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage{" "}
            <span className="font-bold text-slate-700">
              {filteredMembers.length}
            </span>{" "}
            active society members and their profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-xs font-bold text-slate-600 active:scale-95"
          >
            <Printer size={16} /> Print Directory
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            <UserPlus size={16} /> Add New Member
          </button>
        </div>
      </div>

      {/* Filter Stats Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 no-print">
        <div className="lg:col-span-2 relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by Name, NID, or Phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-400 focus:ring-0 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-400 transition-all text-sm font-bold text-slate-700 appearance-none"
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Shares
          </span>
          <span className="text-base font-bold text-slate-900">
            {filteredMembers.reduce((acc, m) => acc + (m.shares || 0), 0)}
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Profile Information
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Branch
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Shares
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                  Total Contributed
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right no-print">
                  Management
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((m) => (
                <tr
                  key={m._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          m.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {m.status === "active" ? (
                          <UserCheck size={18} />
                        ) : (
                          <UserMinus size={18} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {m.name}
                          {m.status === "active" && (
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] font-medium text-slate-500">
                            📞 {m.phone}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 uppercase">
                            NID: {m.nid}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded uppercase tracking-wider">
                      {m.branch}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-slate-700">
                      {m.shares || 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(m.totalDeposited || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleOpenModal(m)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <Link
                        to={`/admin/members/${m._id}`}
                        className="p-2 text-slate-400 hover:text-slate-900 transition-all"
                        title="View Details"
                      >
                        <ChevronRight size={18} />
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
