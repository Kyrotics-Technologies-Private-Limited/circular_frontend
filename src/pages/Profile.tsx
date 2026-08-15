// src/pages/Profile.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser, updateUserProfile } from "../services/auth.service";
import { useOrganization } from "../contexts/OrganizationContext";
import {
  User,
  Mail,
  Building,
  Key,
  Pencil,
  LogOut,
  AlertCircle,
  CheckCircle,
  Image,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Profile: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser?.name || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { currentOrganization } = useOrganization();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setName(currentUser?.name || "");
    setPhotoURL(currentUser?.photoURL || "");
    setEditing(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const updateData: { name?: string; photoURL?: string } = {};

      if (name !== currentUser?.name) {
        updateData.name = name;
      }

      if (photoURL !== currentUser?.photoURL) {
        updateData.photoURL = photoURL;
      }

      if (Object.keys(updateData).length > 0) {
        await updateUserProfile(updateData);

        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            ...updateData,
          });
        }

        setSuccessMessage("Profile updated successfully");

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }

      setEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err: any) {
      console.error("Error logging out:", err);
      setError(err.message || "Failed to log out");
    }
  };

  const detailRowClass =
    "px-6 py-4 flex items-center hover:bg-muted/40 transition-colors";

  return (
    <div className="w-full space-y-6">
      {/* Cover banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary/70 py-8 px-6 sm:px-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-6">
          <div className="flex-shrink-0">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser?.name || "User"}
                className="h-24 w-24 rounded-full object-cover border-4 border-white/80 shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-xl font-bold text-primary border-4 border-white/80 shadow-lg">
                {currentUser?.name ? getInitials(currentUser.name) : "U"}
              </div>
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {currentUser?.name || "Welcome"}
            </h1>
            <p className="text-primary-foreground/80 mt-1">
              {currentUser?.email}
            </p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/15 text-white backdrop-blur-sm">
                <Building className="h-3.5 w-3.5 mr-1.5" />
                {currentOrganization?.name || "Personal Account"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-green-50 p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {successMessage}
              </h3>
            </div>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="flex-row justify-between items-center border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              Account Information
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Personal details and account settings
            </p>
          </div>
          {!editing && (
            <Button onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardHeader>

        {editing ? (
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={currentUser?.email || ""}
                    className="pl-9 bg-muted/50"
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Email address cannot be changed.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="photoURL"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Profile Photo URL
                </label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    name="photoURL"
                    id="photoURL"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="pl-9"
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter a URL for your profile picture.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <dl>
              <div className={detailRowClass}>
                <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                  <User className="mr-3 h-4 w-4 text-primary" />
                  Display name
                </dt>
                <dd className="w-2/3 text-sm text-foreground font-medium">
                  {currentUser?.name || "Not set"}
                </dd>
              </div>

              <div className={`${detailRowClass} border-t border-border`}>
                <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                  <Mail className="mr-3 h-4 w-4 text-primary" />
                  Email address
                </dt>
                <dd className="w-2/3 text-sm text-foreground font-medium">
                  {currentUser?.email}
                </dd>
              </div>

              <div className={`${detailRowClass} border-t border-border`}>
                <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                  <Key className="mr-3 h-4 w-4 text-primary" />
                  Account ID
                </dt>
                <dd className="w-2/3 text-sm text-foreground font-mono bg-muted/50 p-1 rounded">
                  {currentUser?.uid}
                </dd>
              </div>

              <div className={`${detailRowClass} border-t border-border`}>
                <dt className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                  <Building className="mr-3 h-4 w-4 text-primary" />
                  Organization
                </dt>
                <dd className="w-2/3 text-sm text-foreground font-medium">
                  {currentOrganization?.name || "Personal Account"}
                </dd>
              </div>
            </dl>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
