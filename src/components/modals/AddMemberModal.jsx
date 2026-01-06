import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Hash,
  Landmark,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { BRANCHES } from "../../utils/constants";
import Button from "../../components/ui/Button";

const AddMemberModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isSubmitting,
  isEditing,
}) => {
  if (!isOpen) return null;

  // Helper to handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "shares" ? parseInt(value) || 1 : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {isEditing ? "Update Profile" : "New Member Registration"}
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {isEditing
                ? "Modify existing teacher records"
                : "Add a new teacher to the society"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={onSubmit}
          className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                <User size={14} className="text-blue-600" /> Full Name
              </label>
              <input
                name="name"
                required
                placeholder="Teacher's Name"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                <Mail size={14} className="text-blue-600" /> Email Address
              </label>
              <input
                name="email"
                required
                type="email"
                placeholder="teacher@school.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone Number (CRITICAL FIX FOR VALIDATION ERROR) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                <Phone size={14} className="text-blue-600" /> Phone Number
              </label>
              <input
                name="phone"
                required
                type="tel"
                placeholder="017XXXXXXXX"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* NID Number */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-blue-600" /> NID Number
              </label>
              <input
                name="nid"
                required
                placeholder="National ID Number"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.nid}
                onChange={handleChange}
              />
            </div>

            {/* Password (Register Mode Only) */}
            {!isEditing && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                  <Hash size={14} className="text-blue-600" /> Initial Password
                </label>
                <input
                  name="password"
                  required
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Branch / Shift */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                <Landmark size={14} className="text-blue-600" /> Branch / Shift
              </label>
              <select
                name="branch"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                value={formData.branch}
                onChange={handleChange}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Bank Account */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                <Landmark size={14} className="text-blue-600" /> Bank Account
              </label>
              <input
                name="bankAccount"
                placeholder="Optional Bank Account No"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.bankAccount}
                onChange={handleChange}
              />
            </div>

            {/* Shares */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                <Hash size={14} className="text-blue-600" /> Total Shares
              </label>
              <input
                name="shares"
                type="number"
                min="1"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.shares}
                onChange={handleChange}
              />
            </div>

            {/* Joining Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-black text-gray-700 uppercase tracking-widest">
                <Calendar size={14} className="text-blue-600" /> Joining Date
              </label>
              <input
                name="joiningDate"
                type="date"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-8 flex justify-end gap-3 sticky bottom-0 bg-white/80 backdrop-blur-md">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              type="submit"
              className="px-10 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 rounded-xl font-black transition-all active:scale-95"
            >
              {isSubmitting
                ? "Processing..."
                : isEditing
                ? "Save Changes"
                : "Register Teacher"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
