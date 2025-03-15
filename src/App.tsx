// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
import AuthGuard from "./components/auth/AuthGuard";
import MainLayout from "./components/layout/MainLayout";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<AuthGuard />}>
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
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/files" element={<FileManager />} />
              <Route
                path="/translation/:fileId"
                element={<TranslationPage />}
              />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
