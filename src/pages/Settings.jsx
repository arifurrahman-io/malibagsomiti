import React, { useState } from "react";
import { User, Lock, ShieldCheck, Mail, Phone } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Button from "../components/ui/Button";
import api from "../services/api";
import toast from "react-hot-toast";

const Settings = () => {
  const { user } = useAuthStore(); // Removed logout and setUser as they aren't needed here
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Securing account...");
    try {
      await api.put("/auth/update-password", passwordData);
      toast.success("Credentials updated", { id: loadingToast });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update security", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Page Header [cite: 25-10-11] */}
      <div className="border-b border-slate-100 pb-6 text-center">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Account Configuration
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Review your profile and manage security protocols.
        </p>
      </div>

      <div className="space-y-6">
        {/* --- PERSONAL IDENTITY (READ-ONLY) --- */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User size={18} className="text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Personal Identity
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase">
              Read Only
            </span>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} /> Full Legal Name
              </label>
              <p className="text-sm font-bold text-slate-900">
                {user?.name || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Phone size={12} /> Contact Number
              </label>
              <p className="text-sm font-bold text-slate-900">
                {user?.phone || "N/A"}
              </p>
            </div>
            <div className="md:col-span-2 space-y-1 pt-2 border-t border-slate-50">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} /> Registry Email Address
              </label>
              <p className="text-sm font-bold text-slate-700">
                {user?.email || "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* --- ACCESS SECURITY (EDITABLE) --- */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Lock size={18} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Access Security
            </h2>
          </div>

          <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Current Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 transition-all"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Repeat new password"
                />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-50">
              <Button
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Processing..." : "Update Security Credentials"}
              </Button>
            </div>
          </form>
        </section>

        {/* --- SECURITY STATUS --- */}
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
          <ShieldCheck size={20} className="text-emerald-600" />
          <div>
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Account Protection Active
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              Your account is secured with standard encryption and verified
              credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
