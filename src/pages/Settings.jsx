import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  ShieldCheck,
  Mail,
  Phone,
  Edit3,
  Save,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Button from "../components/ui/Button";
import api from "../services/api";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);

  // Profile Form State (to fix the N/A issue)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync profile data when user store updates
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating registry profile...");
    try {
      const response = await api.put("/auth/update-profile", profileData);
      setUser(response.data.data || response.data); // Update global store
      toast.success("Profile synchronized", { id: loadingToast });
      setIsProfileEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      toast.error(err.response?.data?.message || "Security update failed", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-6 text-center">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Account Configuration
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Manage your society identity and security protocols.
        </p>
      </div>

      <div className="space-y-6">
        {/* --- PERSONAL IDENTITY --- */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User size={18} className="text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                Personal Identity
              </h2>
            </div>
            <button
              onClick={() => setIsProfileEditing(!isProfileEditing)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                isProfileEditing
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isProfileEditing ? <RefreshCw size={12} /> : <Edit3 size={12} />}
              {isProfileEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <form onSubmit={handleProfileUpdate} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  Full Legal Name
                </label>
                {isProfileEditing ? (
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-900 bg-slate-50/50 p-2.5 rounded-xl border border-transparent">
                    {user?.name || "N/A"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  Contact Number
                </label>
                {isProfileEditing ? (
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                ) : (
                  <p
                    className={`text-sm font-bold p-2.5 rounded-xl border border-transparent ${
                      user?.phone
                        ? "text-slate-900 bg-slate-50/50"
                        : "text-rose-500 bg-rose-50"
                    }`}
                  >
                    {user?.phone || "Contact missing (Action Required)"}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  Registry Email Address
                </label>
                <p className="text-sm font-bold text-slate-500 bg-slate-100/50 p-3 rounded-xl border border-dashed border-slate-200">
                  {user?.email || "N/A"}
                </p>
                <p className="text-[9px] text-slate-400 italic ml-1">
                  * Email is fixed to registry ID and cannot be changed.
                </p>
              </div>
            </div>

            {isProfileEditing && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                  <Save size={14} />{" "}
                  {isSubmitting ? "Saving..." : "Save Identity Updates"}
                </Button>
              </div>
            )}
          </form>
        </section>

        {/* --- ACCESS SECURITY --- */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Lock size={18} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
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
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-all"
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
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-all"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-blue-500 transition-all"
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
            <div className="pt-2">
              <Button
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Processing..." : "Update Security Credentials"}
              </Button>
            </div>
          </form>
        </section>

        {/* --- PROTECTION STATUS --- */}
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <ShieldCheck size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
              Account Protection Active
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Your society data is secured with AES-256 encryption. Last login
              verified on {new Date().toLocaleDateString()}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
