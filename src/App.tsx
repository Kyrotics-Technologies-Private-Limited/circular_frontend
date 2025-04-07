// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { FileProvider } from "./contexts/FileContext";
import { ShareProvider } from "./contexts/ShareContext"; // Add ShareProvider import
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import FileManager from "./pages/FileManager";
import SharedDirectory from "./components/shared/SharedDirectory"; // Import the SharedDirectory component
import TranslationPage from "./pages/TranslationPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import AuthGuard from "./components/auth/AuthGuard";
import RoleGuard from "./components/auth/RoleGuard";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
// import AdminOrganizations from "./pages/admin/AdminOrganizations";
import UserManagement from "./pages/admin/UserManagement";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect";
import ManageRequests from "./pages/superAdmin/ManageRequest";
import ManageOrganizations from "./pages/superAdmin/ManageOrganizations";
import ManageUsers from "./pages/superAdmin/ManageUsers";
import SignupRequestDetails from "./pages/superAdmin/SignupRequestDetails";
import { ToastContainer } from "react-toastify";
import StatusGuard from "./components/auth/StatusGuard";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import RejectedPage from "./pages/RejectedPage";
import OrganizationSettings from "./pages/admin/OrganizationSettings";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
      

          {/* Protected routes for all authenticated users */}
          <Route element={<AuthGuard />}>

          {/* Status-specific routes */}
          <Route element={<StatusGuard requiredStatus="pending" />}>
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
            </Route>
            
            <Route element={<StatusGuard requiredStatus="rejected" />}>
              <Route path="/rejected" element={<RejectedPage />} />
            </Route>

            {/* Routes for approved users only */}
            <Route element={<StatusGuard requiredStatus="approved" />}>

            {/* Default redirect based on role */}
            <Route
              path="/"
              element={
                <RoleBasedRedirect
                  userRedirect="/dashboard"
                  adminRedirect="/admin/dashboard"
                  superAdminRedirect="/admin/dashboard"
                />
              }
            />

            <Route
              element={
                <OrganizationProvider>
                  <FileProvider>
                    <ShareProvider> {/* Wrap with ShareProvider */}
                      <MainLayout />
                    </ShareProvider>
                  </FileProvider>
                </OrganizationProvider>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/files" element={<FileManager />} />
              {/* Add Shared Directory route */}
              <Route path="/shared" element={<SharedDirectory />} />
              <Route
                path="/translation/:fileId"
                element={<TranslationPage />}
              />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Routes visible only to admins and super admins */}
            <Route
              element={<RoleGuard allowedRoles={["admin", "super_admin"]} />}
            >
              <Route
                element={
                  <OrganizationProvider>
                    <FileProvider>
                      <ShareProvider> {/* Wrap with ShareProvider */}
                        <AdminLayout />
                      </ShareProvider>
                    </FileProvider>
                  </OrganizationProvider>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="/admin/user-management"
                  element={<UserManagement />}
                />
                <Route path="/admin/organization-settings" element={<OrganizationSettings />} />
                <Route path="/admin/files" element={<FileManager />} />
                {/* Add Shared Directory route for admins */}
                <Route path="/admin/shared" element={<SharedDirectory />} />
                <Route path="/admin/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Routes visible only to super admins */}
            <Route element={<RoleGuard allowedRoles={["super_admin"]} />}>
              <Route
                element={
                  <OrganizationProvider>
                    <FileProvider>
                      <ShareProvider> {/* Wrap with ShareProvider */}
                        <AdminLayout />
                      </ShareProvider>
                    </FileProvider>
                  </OrganizationProvider>
                }
              >
                <Route
                  path="/super-admin/organizations"
                  element={<ManageOrganizations />}
                />
                <Route path="/super-admin/users" element={<ManageUsers />} />
                <Route path="/super-admin/requests" element={<ManageRequests />} />
                <Route path="/super-admin/request/:id" element={<SignupRequestDetails />} />
              </Route>
            </Route>

            {/* Only show Organizations page to super admins */}
            <Route element={<RoleGuard allowedRoles={["super_admin"]} />}>
              <Route
                path="/organizations"
                element={
                  <OrganizationProvider>
                    <ShareProvider> {/* Wrap with ShareProvider */}
                      <MainLayout>
                        <Organizations />
                      </MainLayout>
                    </ShareProvider>
                  </OrganizationProvider>
                }
              />
            </Route>
            </Route>
          </Route>

          {/* Fallback routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      <ToastContainer position="top-center" autoClose={5000} />
      </Router>
    </AuthProvider>
  );
};

export default App;