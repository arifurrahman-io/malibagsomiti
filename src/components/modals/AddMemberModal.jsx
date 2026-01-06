import React from "react";
import { X } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Update Member Profile" : "Register New Member"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                Full Name
              </label>
              <input
                required
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                Email Address
              </label>
              <input
                required
                type="email"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            {!isEditing && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">
                  Password
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                Branch / Shift
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                NID Number
              </label>
              <input
                required
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nid}
                onChange={(e) =>
                  setFormData({ ...formData, nid: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                Bank Account
              </label>
              <input
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bankAccount}
                onChange={(e) =>
                  setFormData({ ...formData, bankAccount: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                Number of Shares
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.shares}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shares: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">
                Joining Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData({ ...formData, joiningDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              type="submit"
              className="px-10 shadow-lg shadow-blue-100"
            >
              {isSubmitting
                ? "Processing..."
                : isEditing
                ? "Update Profile"
                : "Register Member"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
