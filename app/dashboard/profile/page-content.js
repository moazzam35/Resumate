"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save, User, Mail, Phone, MapPin, Globe, ExternalLink, ShieldCheck, Lock, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore, useUIStore } from "@/store";
import { profileSchema, passwordChangeSchema } from "@/validators";
import { getInitials } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      phone: "",
      location: "",
      github: "",
      linkedin: "",
      portfolio: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordChangeSchema),
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch("/api/auth/profile", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (json.success) {
          const d = json.data;
          reset({
            name: d.name || "",
            email: d.email || "",
            bio: d.bio || "",
            phone: d.phone || "",
            location: d.location || "",
            github: d.github || "",
            linkedin: d.linkedin || "",
            portfolio: d.portfolio || "",
          });
          setUser(json.data);
        }
      } catch {
        showToast({ message: "Failed to load profile", type: "error" });
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [reset, setUser, showToast]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast({ message: "Invalid file type. Please use JPG, PNG, or WebP.", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ message: "File too large. Maximum size is 5MB.", type: "error" });
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setAvatarRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let avatarUrl = user?.avatar || null;

      if (avatarRemoved) {
        avatarUrl = null;
      } else if (avatarFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", avatarFile);

        let uploadRes;
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
        } catch (fetchErr) {
          setIsUploading(false);
          throw new Error("Network error while uploading avatar. Please check your connection and try again.");
        }

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          setIsUploading(false);
          throw new Error(errData.message || errData.error || "Avatar upload failed. Please try a different image.");
        }

        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.data?.url || uploadData.url || null;
        if (!avatarUrl) {
          setIsUploading(false);
          throw new Error("Upload succeeded but no image URL was returned. Please try again.");
        }
        setIsUploading(false);
      }

      const profilePayload = {
        ...data,
        avatar: avatarUrl,
      };

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(profilePayload),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.data);
        showToast({ message: "Profile updated successfully", type: "success" });
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarRemoved(false);
      } else {
        showToast({ message: json.message || "Failed to update profile", type: "error" });
      }
    } catch (error) {
      showToast({ message: error.message || "Failed to update profile", type: "error" });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsChangingPassword(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        resetPassword();
        showToast({ message: "Password changed successfully", type: "success" });
      } else {
        showToast({ message: json.error || json.message || "Failed to change password", type: "error" });
      }
    } catch (error) {
      showToast({ message: error.message || "Failed to change password", type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-4xl space-y-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-56" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-4 space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="flex justify-end pt-4 border-t border-border/60">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl space-y-6"
    >
      {/* AVATAR HEADER CARD */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Avatar preview" />
              ) : user?.avatar ? (
                <AvatarImage src={user.avatar} alt="Avatar" />
              ) : null}
              <AvatarFallback className="bg-stamp text-paper text-lg font-semibold">
                {user ? getInitials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg heading-display font-semibold text-ink">{user?.name || "Professional User"}</h2>
              <p className="text-xs text-muted">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {["PRO", "ENTERPRISE"].includes(user?.subscription?.plan) && (
                  <Badge variant="pro" dot>
                    {user.subscription.plan === "ENTERPRISE" ? "Enterprise" : "Pro"} Member
                  </Badge>
                )}
                {user?.emailVerified && (
                  <Badge variant="success" dot>
                    Verified Account
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} leftIcon={Upload}>
              Change Avatar
            </Button>
            {avatarPreview && (
              <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} className="text-destructive hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        {avatarPreview && !isUploading && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted">
            <div className="h-2 w-2 rounded-full bg-verified" />
            New avatar selected — click "Save Profile" to apply
          </div>
        )}
        {isUploading && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-3 w-3 animate-spin" />
            Uploading avatar…
          </div>
        )}
      </Card>

      {/* FORM CARD */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Public & Resume Profile Details</CardTitle>
          <CardDescription>
            These credentials pre-fill into your new resume documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="Moazzam"
                leftIcon={User}
                {...register("name")}
                error={errors.name?.message}
              />
              <Input
                label="Work Email"
                type="email"
                placeholder="moazzam@example.com"
                leftIcon={Mail}
                {...register("email")}
                error={errors.email?.message}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Phone Number"
                placeholder="030000000000"
                leftIcon={Phone}
                {...register("phone")}
              />
              <Input
                label="Location"
                placeholder="Bahawalnagar"
                leftIcon={MapPin}
                {...register("location")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="GitHub URL"
                placeholder="https://github.com/moazzam"
                leftIcon={ExternalLink}
                {...register("github")}
                error={errors.github?.message}
              />
              <Input
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/moazzam"
                leftIcon={ExternalLink}
                {...register("linkedin")}
                error={errors.linkedin?.message}
              />
              <Input
                label="Portfolio Website"
                placeholder="https://moazzam.dev"
                leftIcon={Globe}
                {...register("portfolio")}
                error={errors.portfolio?.message}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border/60">
              <Button type="submit" loading={isLoading || isUploading} variant="primary" leftIcon={Save}>
                {isUploading ? "Uploading…" : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* PASSWORD CARD */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Security</CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                leftIcon={Lock}
                {...registerPassword("currentPassword")}
                error={passwordErrors.currentPassword?.message}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                leftIcon={ShieldCheck}
                {...registerPassword("newPassword")}
                error={passwordErrors.newPassword?.message}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                leftIcon={ShieldCheck}
                {...registerPassword("confirmPassword")}
                error={passwordErrors.confirmPassword?.message}
              />
              <div className="flex items-end justify-end">
                <Button type="submit" loading={isChangingPassword} variant="primary" leftIcon={Save}>
                  Update Password
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
