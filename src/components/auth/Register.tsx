// src/components/auth/Register.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Languages,
  FolderOpen,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

const Register: React.FC = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [accountType, setAccountType] = useState<"individual" | "organization">("individual");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !email || !password || !phoneNumber || !state || !country) {
      setError("Please fill out all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    if (accountType === "organization" && !organizationName) {
      setError("Please fill out all organization details");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const userData = {
        email,
        name: displayName,
        password,
        phoneNumber,
        state,
        country,
        accountType,
        ...(accountType === "organization" && { organizationName }),
      };

      const user = await registerUser(userData);
      setRegistrationSuccess(true);

      if (accountType !== "organization") {
        setCurrentUser(user);
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6">
        <div className="max-w-md w-full bg-card border border-border shadow-xl rounded-2xl p-8 animate-scale-in">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">Registration Successful!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {accountType === "organization"
                ? "Your organization account has been registered. Your account is pending approval. You will receive an email once your account is approved."
                : "Your account has been created successfully. Redirecting to dashboard..."}
            </p>
            <div className="mt-6">
              <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputIcon = (Icon: React.ElementType) => ({
    className: "pl-10 h-11",
    icon: <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />,
  });

  return (
    <div className="min-h-screen flex bg-background">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-primary to-primary/80 text-primary-foreground flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />

        <Link to="/" className="flex items-center gap-3 relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur border border-white/20">
            <Languages className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">Bhasantar</p>
            <p className="text-sm text-primary-foreground/70">Translate &amp; Share</p>
          </div>
        </Link>

        <div className="relative space-y-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance">
            One account. Every language, every document.
          </h1>
          <ul className="space-y-4">
            {[
              { icon: Languages, text: "Translate documents into 30+ languages with ease" },
              { icon: FolderOpen, text: "Organize files with a familiar folder structure" },
              { icon: ShieldCheck, text: "Share securely with teams and organizations" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-primary-foreground/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Bhasantar. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Languages className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Bhasantar and start translating today.
          </p>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          <Tabs
            defaultValue={accountType}
            onValueChange={(val) => setAccountType(val as "individual" | "organization")}
            className="mt-6"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
            </TabsList>
          </Tabs>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative">
                {inputIcon(User).icon}
                <Input
                  id="display-name"
                  name="displayName"
                  type="text"
                  required
                  className={inputIcon(User).className}
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <div className="relative">
                {inputIcon(Mail).icon}
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputIcon(Mail).className}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-foreground mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                {inputIcon(Phone).icon}
                <Input
                  id="phone-number"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={inputIcon(Phone).className}
                  placeholder="+91 96757 44567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-foreground mb-1.5">
                  State
                </label>
                <div className="relative">
                  {inputIcon(MapPin).icon}
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    required
                    className={inputIcon(MapPin).className}
                    placeholder="West Bengal"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-foreground mb-1.5">
                  Country
                </label>
                <div className="relative">
                  {inputIcon(MapPin).icon}
                  <Input
                    id="country"
                    name="country"
                    type="text"
                    required
                    className={inputIcon(MapPin).className}
                    placeholder="India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {accountType === "organization" && (
              <div className="animate-fade-in">
                <label htmlFor="organization-name" className="block text-sm font-medium text-foreground mb-1.5">
                  Organization Name
                </label>
                <div className="relative">
                  {inputIcon(Building2).icon}
                  <Input
                    id="organization-name"
                    name="organizationName"
                    type="text"
                    required
                    className={inputIcon(Building2).className}
                    placeholder="Acme Inc."
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  {inputIcon(Lock).icon}
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="pl-10 pr-10 h-11"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  {inputIcon(Lock).icon}
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="pl-10 pr-10 h-11"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full h-11 text-base">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
