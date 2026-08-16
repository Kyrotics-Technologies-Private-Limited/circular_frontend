// src/components/auth/ForgotPassword.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../services/auth.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Languages, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);

      let errorMessage = err.message || "Failed to send reset email";
      if (errorMessage.includes("auth/user-not-found")) {
        errorMessage = "No account found with that email address.";
      } else if (errorMessage.includes("auth/invalid-email")) {
        errorMessage = "Please enter a valid email address.";
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
            {sent ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-foreground tracking-tight">
                  Check your email
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  If an account exists for <span className="font-medium text-foreground">{email}</span>,
                  we've sent a link to reset your password.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="w-full h-11 mt-6 text-base"
                >
                  <Link to="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to sign in
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  Forgot your password?
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter your email and we'll send you a link to reset it.
                </p>

                {error && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-fade-in">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-destructive">{error}</p>
                  </div>
                )}

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
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

                  <Button type="submit" disabled={loading} size="lg" className="w-full h-11 text-base">
                    {loading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    <ArrowLeft className="inline h-4 w-4 mr-1 -mt-0.5" />
                    Back to sign in
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bhasantar. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
