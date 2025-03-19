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
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import FileManager from "./pages/FileManager";
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
                    <MainLayout />
                  </FileProvider>
                </OrganizationProvider>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/files" element={<FileManager />} />
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
                    {" "}
                    {/* Add OrganizationProvider here */}
                    <FileProvider>
                      <AdminLayout />
                    </FileProvider>
                  </OrganizationProvider>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route
                  path="/admin/user-management"
                  element={<UserManagement />}
                />
                <Route path="/admin/files" element={<FileManager />} />
                <Route path="/admin/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Routes visible only to super admins */}
            <Route element={<RoleGuard allowedRoles={["super_admin"]} />}>
              <Route
                element={
                  <OrganizationProvider>
                    {" "}
                    {/* Add OrganizationProvider here */}
                    <FileProvider>
                      <AdminLayout />
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
                    <MainLayout>
                      <Organizations />
                    </MainLayout>
                  </OrganizationProvider>
                }
              />
            </Route>
          </Route>

          {/* Fallback routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
