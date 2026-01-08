import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts & Components
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardSkeleton from "./components/skeleton/DashboardSkeleton";
import MemberProfileView from "./pages/admin/MemberProfileView";
import MyProfile from "./pages/member/MyProfile";

// Lazy Loaded Pages (Optimized for Fast Load)
const Login = lazy(() => import("./pages/auth/Login"));
const MainDashboard = lazy(() => import("./pages/dashboard/MainDashboard"));
const MemberList = lazy(() => import("./pages/admin/MemberList"));
const CollectionEntry = lazy(() => import("./pages/admin/CollectionEntry"));
const MemberHistory = lazy(() => import("./pages/member/MemberHistory"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

// --- NEW DYNAMIC FINANCE PAGES ---
const FinancialEntry = lazy(() => import("./pages/finance/FinancialEntry"));
const CategoryCRUD = lazy(() => import("./pages/admin/CategoryManager"));

/**
 * 🏦 NEW: Bank Account Management Page
 * For managing society-level bank accounts and balances.
 */
const BankManagement = lazy(() => import("./pages/admin/BankManagement"));

// Placeholder components
const Investments = lazy(() => import("./pages/admin/Investments"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<Login />} />

        {/* --- Protected Dashboard Routes --- */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["member", "admin", "super-admin"]} />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<MainDashboard />} />

            {/* Admin & Super-Admin Only Sections */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["admin", "super-admin"]} />
              }
            >
              <Route path="/admin/members" element={<MemberList />} />
              <Route
                path="/admin/members/:id"
                element={<MemberProfileView />}
              />
              <Route path="/admin/collections" element={<CollectionEntry />} />

              {/* 🛠️ NEW: Category & Subcategory Management */}
              <Route path="/admin/categories" element={<CategoryCRUD />} />

              {/* 💸 NEW: Manual Ledger Entry (Deposits/Expenses) */}
              <Route path="/admin/finance-entry" element={<FinancialEntry />} />

              {/* 🏦 NEW: Society Bank Account Registry */}
              <Route path="/admin/banks" element={<BankManagement />} />

              <Route path="/admin/investments" element={<Investments />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>

            {/* Member Only Sections */}
            <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
              <Route path="/member/profile" element={<MyProfile />} />
              <Route path="/member/history" element={<MemberHistory />} />
            </Route>

            {/* Shared Settings Route */}
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* --- System Routes --- */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
