"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/store";

const DEFAULT_PREFS = { email: true, marketing: false, updates: true };

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

export default function SettingsPage() {
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [notifications, setNotifications] = useState(DEFAULT_PREFS);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = getToken();
    fetch("/api/user/preferences", {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.preferences) setNotifications(data.preferences);
      })
      .catch(() => {});
  }, []);

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const token = getToken();
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(notifications),
      });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.preferences);
        showToast({ message: "Settings saved", type: "success" });
      } else {
        throw new Error(json.error || "Failed to save settings");
      }
    } catch (err) {
      showToast({ message: err.message || "Failed to save settings", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast({ message: "New passwords do not match", type: "error" });
      return;
    }
    if (!passwords.currentPassword || !passwords.newPassword) {
      showToast({ message: "Please fill in all password fields", type: "error" });
      return;
    }
    setIsChangingPassword(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(passwords),
      });
      const json = await res.json();
      if (json.success) {
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showToast({ message: "Password changed successfully", type: "success" });
      } else {
        showToast({ message: json.message || "Failed to change password", type: "error" });
      }
    } catch {
      showToast({ message: "Failed to change password", type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast({ message: "Please enter your password to confirm deletion", type: "error" });
      return;
    }
    setIsDeleting(true);
    try {
      const token = getToken();
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete account");
      }
      localStorage.removeItem("token");
      showToast({ message: "Account deleted. Sorry to see you go.", type: "success" });
      setShowDeleteDialog(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      showToast({ message: err.message || "Failed to delete account", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-6"
    >
      <Card className="rounded-md border-border bg-surface/50 transition-all hover:border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          <CardDescription className="text-xs">
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md bg-surface/50 p-3 transition-all hover:bg-surface">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted">
                Receive email notifications about your account
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, email: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between rounded-md bg-surface/50 p-3 transition-all hover:bg-surface">
            <div>
              <p className="text-sm font-medium">Marketing Emails</p>
              <p className="text-xs text-muted">
                Receive tips, product updates, and inspiration
              </p>
            </div>
            <Switch
              checked={notifications.marketing}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, marketing: checked }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between rounded-md bg-surface/50 p-3 transition-all hover:bg-surface">
            <div>
              <p className="text-sm font-medium">Product Updates</p>
              <p className="text-xs text-muted">
                Get notified about new features and improvements
              </p>
            </div>
            <Switch
              checked={notifications.updates}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, updates: checked }))
              }
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveNotifications}
              disabled={isSaving}
              loading={isSaving}
              leftIcon={Save}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-border bg-surface/50 transition-all hover:border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Security</CardTitle>
          <CardDescription className="text-xs">
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs" htmlFor="currentPassword">Current Password</Label>
            <Input
              className="rounded-md"
              id="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs" htmlFor="newPassword">New Password</Label>
            <Input
              className="rounded-md"
              id="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs" htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              className="rounded-md"
              id="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              loading={isChangingPassword}
              leftIcon={Shield}
            >
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md border-destructive/20 bg-surface/50 transition-all hover:border-destructive/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-xs">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
            leftIcon={Trash2}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeletePassword(""); }}>
        <DialogContent className="rounded-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-xs">
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs" htmlFor="deletePassword">Enter your password to confirm</Label>
            <Input
              className="rounded-md"
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Current password"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              loading={isDeleting}
              leftIcon={Trash2}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
