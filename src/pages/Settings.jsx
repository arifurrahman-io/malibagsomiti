import React, { useState } from "react";
import {
  User,
  Lock,
  ShieldAlert,
  Camera,
  Save,
  Trash2,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import Button from "../components/ui/Button";
import api from "../services/api";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, logout, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.put("/auth/update-profile", profileData);
      setUser(data.data); // Update global store
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsSubmitting(true);
    try {
      await api.put("/auth/update-password", passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Manage your digital identity and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Personal Information
              </h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <input
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <input
                  disabled
                  className="w-full px-5 py-3.5 bg-gray-100 border border-gray-100 rounded-2xl font-bold text-gray-400 cursor-not-allowed"
                  value={profileData.email}
                />
              </div>
              <Button
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Save size={18} /> {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </section>

          {/* Security Section */}
          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Security & Password
              </h2>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                variant="outline"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5"
              >
                Update Password
              </Button>
            </form>
          </section>
        </div>

        {/* Right Column: Actions & Info */}
        <div className="space-y-8">
          {/* Status Card */}
          <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-200">
            <h3 className="text-lg font-black mb-2 uppercase tracking-tighter">
              System Access
            </h3>
            <p className="text-sm text-blue-100 font-medium mb-6">
              You are logged in as a <strong>{user?.role}</strong> with full
              administrative privileges.
            </p>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl">
              <ShieldAlert size={20} className="text-blue-200" />
              <div className="text-[10px] font-black uppercase tracking-widest">
                Two-Factor Active
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100">
            <h3 className="text-red-600 text-sm font-black uppercase tracking-widest mb-4">
              Danger Zone
            </h3>
            <div className="space-y-4">
              <Button
                onClick={() => logout()}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut size={18} /> Sign Out
              </Button>
              <Button
                variant="danger"
                className="w-full flex items-center justify-center gap-2 py-4"
              >
                <Trash2 size={18} /> Deactivate Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
