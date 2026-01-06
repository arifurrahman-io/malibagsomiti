import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Printer,
  Edit3,
  ChevronRight,
  UserPlus,
  Trash2,
  Landmark,
  CreditCard,
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

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingId(member._id);
      setFormData({
        ...member,
        joiningDate: member.joiningDate?.split("T")[0] || "",
        password: "",
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
    try {
      const submissionData = { ...formData };
      if (editingId && !submissionData.password) delete submissionData.password;

      if (editingId) await api.put(`/members/${editingId}`, submissionData);
      else await api.post("/members", submissionData);

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
      toast.error("Deletion failed");
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Member Directory
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Manage teacher profiles and financial assets.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors text-sm font-bold text-gray-600">
            <Printer size={18} /> Print
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 font-bold text-sm"
          >
            <UserPlus size={18} /> Add Member
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative md:col-span-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or NID..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          <option value="">All Branches / Shifts</option>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Member & Identity
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Branch/Shift
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                  Shares
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                  Deposited
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((m) => (
                <tr
                  key={m._id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 leading-tight">
                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">
                        {m.bankAccount
                          ? `A/C: ${m.bankAccount}`
                          : "No Bank Account"}
                      </div>
                      {m.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1 flex items-center gap-1">
                      <CreditCard size={10} /> NID: {m.nid}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-700">
                      {m.branch}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black">
                      {m.shares || 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-gray-900">
                    {formatCurrency(m.totalDeposited || 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(m)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit3 size={16} />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <Link
                        to={`/admin/members/${m._id}`}
                        className="p-2 text-gray-400 hover:text-gray-900"
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
