// src/components/auth/Login.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Languages, AlertCircle, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const user = await loginUser(email, password);
      setCurrentUser(user);

      if (user.role === "super_admin" || user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      let errorMessage = err.message || "Failed to log in";
      if (errorMessage.includes("auth/invalid-credential") || errorMessage.includes("auth/wrong-password") || errorMessage.includes("auth/user-not-found")) {
        errorMessage = "Invalid email or password. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Languages className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold tracking-tight text-foreground">Bhasantar</p>
            <p className="text-sm text-muted-foreground">Translate &amp; Share</p>
          </div>
        </Link>

        <Card className="shadow-card">
          <CardContent className="p-7 sm:p-10">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to access your documents and translations.
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-fade-in">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 h-11"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pl-10 pr-10 h-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full h-11 text-base">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bhasantar. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
