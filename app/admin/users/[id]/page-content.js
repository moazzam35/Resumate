"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, UserX, UserCheck, Mail, Lock,
  Ban, CheckCircle, Calendar, Clock, FileText,
  BrainCircuit, Activity, RefreshCcw, RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { getPlanLimits } from "@/lib/usage-client";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

function planLimitsFor(plan) {
  return getPlanLimits(plan?.toUpperCase() || "FREE");
}

function pct(used, total) {
  if (!Number.isFinite(total) || total <= 0) return 100;
  return Math.min(100, Math.round((used / total) * 100));
}

function getPlanBadgeVariant(plan) {
  switch (plan?.toLowerCase()) {
    case "enterprise": return "default";
    case "pro": return "pro";
    default: return "outline";
  }
}

const statCards = [
  { key: "resumes", label: "Resumes", icon: FileText, color: "text-stamp" },
  { key: "aiHistories", label: "AI Actions", icon: BrainCircuit, color: "text-verified" },
  { key: "coverLetters", label: "Cover Letters", icon: FileText, color: "text-flag" },
  { key: "sessions", label: "Sessions", icon: Activity, color: "text-ink" },
];

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showPlanConfirm, setShowPlanConfirm] = useState(false);
  const [showRenewConfirm, setShowRenewConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [pendingPlan, setPendingPlan] = useState("");
  const [pendingEndDate, setPendingEndDate] = useState("");
  const [message, setMessage] = useState("");

  const fetchUser = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const executeAction = async (action, extra = {}) => {
    setActionLoading(true);
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}/account`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Account ${action.replace(/_/g, " ")} successful`);
        fetchUser();
      } else {
        setMessage(json.message || "Action failed");
      }
    } finally {
      setActionLoading(false);
      setShowSuspendConfirm(false);
    }
  };

  const updateSubscription = async () => {
    if (!pendingPlan) return;
    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const body = { plan: pendingPlan };
      if (pendingEndDate) body.endDate = pendingEndDate;
      const res = await fetch(`/api/admin/users/${id}/subscription`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("Subscription updated");
        fetchUser();
      }
    } finally {
      setActionLoading(false);
      setShowPlanConfirm(false);
    }
  };

  const renewSubscription = async () => {
    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}/subscription`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ renew: true }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("Subscription renewed and AI credits reset");
        fetchUser();
      } else {
        setMessage(json.message || "Renew failed");
      }
    } finally {
      setActionLoading(false);
      setShowRenewConfirm(false);
    }
  };

  const resetCredits = async () => {
    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}/subscription`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ resetCredits: true }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("AI credits reset");
        fetchUser();
      } else {
        setMessage(json.message || "Reset failed");
      }
    } finally {
      setActionLoading(false);
      setShowResetConfirm(false);
    }
  };

  const deleteUser = async () => {
    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push("/admin/users");
      }
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">User not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader title={user.name} description={`User ID: ${user.id}`}>
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")} leftIcon={ArrowLeft}>
          Back
        </Button>
      </PageHeader>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-3 rounded-lg text-sm border",
            message.includes("successful") || message.includes("updated") || message.includes("renewed") || message.includes("reset")
              ? "bg-verified/10 border-verified/20 text-verified"
              : "bg-flag/10 border-flag/20 text-flag"
          )}
        >
          {message}
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted">{user.email}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">{user.role}</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Provider</span>
                <span className="font-medium capitalize">{user.provider}</span>
              </div>
              {user.location && (
                <div className="flex justify-between">
                  <span className="text-muted">Location</span>
                  <span className="font-medium">{user.location}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex justify-between">
                  <span className="text-muted">Phone</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Verified</span>
                <span className={cn("font-medium", user.emailVerified ? "text-verified" : "text-muted")}>
                  {user.emailVerified ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Suspended</span>
                <span className={cn("font-medium", user.suspended ? "text-flag" : "text-verified")}>
                  {user.suspended ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Login Disabled</span>
                <span className={cn("font-medium", user.disableLogin ? "text-flag" : "text-verified")}>
                  {user.disableLogin ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.subscription ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Plan</span>
                  <Badge variant={getPlanBadgeVariant(user.subscription.plan)} className="text-[10px]">
                    {user.subscription.plan}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Status</span>
                  <span className={cn("font-medium", user.subscription.isActive ? "text-verified" : "text-muted")}>
                    {user.subscription.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Start Date</span>
                  <span className="font-medium text-xs">
                    {user.subscription.startDate ? new Date(user.subscription.startDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">End Date</span>
                  <span className="font-medium text-xs">
                    {user.subscription.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : "No expiry"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Renewal Date</span>
                  <span className="font-medium text-xs">
                    {user.subscription.renewalDate ? new Date(user.subscription.renewalDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                {user.subscription.stripeId && (
                  <div className="flex justify-between">
                    <span className="text-muted">Stripe ID</span>
                    <span className="font-medium text-xs font-mono">{user.subscription.stripeId}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 space-y-3">
                  {(() => {
                    const limits = planLimitsFor(user.subscription.plan);
                    const aiUsed = user.subscription.aiCreditsUsed ?? 0;
                    const aiTotal = limits.ai;
                    const aiAtLimit = Number.isFinite(aiTotal) && aiUsed >= aiTotal;
                    const resumeCount = user._count?.resumes ?? 0;
                    const resumeTotal = limits.resumes;
                    return (
                      <>
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-muted">Resumes created</span>
                            <span className="font-medium tabular-nums">
                              {resumeCount} / {Number.isFinite(resumeTotal) ? resumeTotal : "∞"}
                            </span>
                          </div>
                          <Progress value={pct(resumeCount, resumeTotal)} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-muted">AI credits used</span>
                            <span className={cn("font-medium tabular-nums", aiAtLimit && "text-flag")}>
                              {aiUsed} / {Number.isFinite(aiTotal) ? aiTotal : "∞"}
                            </span>
                          </div>
                          <Progress value={pct(aiUsed, aiTotal)} className="h-1.5" />
                          <p className="text-[10px] text-muted mt-1">
                            Resets {user.subscription.aiCreditResetAt ? new Date(user.subscription.aiCreditResetAt).toLocaleDateString() : "monthly"}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="pt-3 flex flex-wrap gap-2">
                  <Select value="" onValueChange={(v) => { setPendingPlan(v); setShowPlanConfirm(true); }}>
                    <SelectTrigger className="w-full h-8 text-[11px]">
                      <SelectValue placeholder="Change plan..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline" size="sm" className="text-[11px] h-8 flex-1"
                    onClick={() => setShowRenewConfirm(true)}
                    loading={actionLoading}
                    leftIcon={RefreshCcw}
                  >
                    Renew
                  </Button>
                  <Button
                    variant="outline" size="sm" className="text-[11px] h-8 flex-1"
                    onClick={() => setShowResetConfirm(true)}
                    loading={actionLoading}
                    leftIcon={RotateCcw}
                  >
                    Reset AI Credits
                  </Button>
                  <Button
                    variant="outline" size="sm" className="text-[11px] h-8 w-full"
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      await fetch(`/api/admin/users/${id}/subscription`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setMessage("Subscription cancelled");
                      fetchUser();
                    }}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted mb-3">No subscription</p>
                <Select value="" onValueChange={(v) => { setPendingPlan(v); setShowPlanConfirm(true); }}>
                  <SelectTrigger className="w-full h-8 text-[11px]">
                    <SelectValue placeholder="Create plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Account Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!user.suspended ? (
              <Button
                variant="outline" size="sm" className="w-full justify-start text-[11px] h-8"
                onClick={() => setShowSuspendConfirm(true)}
                disabled={isAdmin}
                leftIcon={Ban}
              >
                Suspend Account
              </Button>
            ) : (
              <Button
                variant="outline" size="sm" className="w-full justify-start text-[11px] h-8"
                onClick={() => executeAction("reactivate")}
                loading={actionLoading}
                leftIcon={UserCheck}
              >
                Reactivate Account
              </Button>
            )}
            <Button
              variant="outline" size="sm" className="w-full justify-start text-[11px] h-8"
              onClick={() => executeAction("verify_email")}
              loading={actionLoading}
              disabled={!!user.emailVerified}
              leftIcon={Mail}
            >
              Verify Email Manually
            </Button>
            {!user.disableLogin ? (
              <Button
                variant="outline" size="sm" className="w-full justify-start text-[11px] h-8"
                onClick={() => executeAction("disable_login")}
                loading={actionLoading}
                leftIcon={Lock}
              >
                Disable Login
              </Button>
            ) : (
              <Button
                variant="outline" size="sm" className="w-full justify-start text-[11px] h-8"
                onClick={() => executeAction("enable_login")}
                loading={actionLoading}
                leftIcon={CheckCircle}
              >
                Enable Login
              </Button>
            )}
            <Button
              variant="outline" size="sm" className="w-full justify-start text-[11px] h-8"
              onClick={() => executeAction("force_password_reset")}
              loading={actionLoading}
              leftIcon={Lock}
            >
              Force Password Reset
            </Button>
            <Button
              variant="danger" size="sm" className="w-full justify-start text-[11px] h-8"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isAdmin}
              leftIcon={UserX}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.key}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-muted", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user._count?.[stat.key] ?? 0}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Login History</CardTitle>
            <CardDescription>Recent login activity</CardDescription>
          </CardHeader>
          <CardContent>
            {user.loginHistory?.length > 0 ? (
              <div className="space-y-3">
                {user.loginHistory.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start justify-between text-sm">
                    <div>
                      <p className="font-medium text-xs">
                        {log.ipAddress || "Unknown IP"}
                      </p>
                      <p className="text-[10px] text-muted font-mono truncate max-w-[200px]">
                        {log.userAgent?.slice(0, 60) || "Unknown device"}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted whitespace-nowrap">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">No login history recorded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
            <CardDescription>Account timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-xs">Account Created</p>
                  <p className="text-[10px] text-muted">{new Date(user.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {user.emailVerified && (
                <div className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-verified mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Email Verified</p>
                    <p className="text-[10px] text-muted">{new Date(user.emailVerified).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {user.lastLoginAt && (
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="h-4 w-4 text-stamp mt-0.5" />
                  <div>
                    <p className="font-medium text-xs">Last Login</p>
                    <p className="text-[10px] text-muted">{new Date(user.lastLoginAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm">
                <Activity className="h-4 w-4 text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-xs">Last Updated</p>
                  <p className="text-[10px] text-muted">{new Date(user.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{user.name}</strong>? This will permanently remove all associated data including resumes, cover letters, and history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={deleteUser} loading={actionLoading}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuspendConfirm} onOpenChange={setShowSuspendConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend <strong>{user.name}</strong>? They will not be able to log in until the account is reactivated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => executeAction("suspend")} loading={actionLoading}>Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlanConfirm} onOpenChange={setShowPlanConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>
              Change {user.name}&apos;s subscription to <strong>{pendingPlan}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted">Plan</label>
              <p className="text-sm font-semibold">{pendingPlan}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Expiration Date (optional)</label>
              <Input
                type="date"
                value={pendingEndDate}
                onChange={(e) => setPendingEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanConfirm(false)}>Cancel</Button>
            <Button onClick={updateSubscription} loading={actionLoading}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenewConfirm} onOpenChange={setShowRenewConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
            <DialogDescription>
              Renew <strong>{user.name}</strong>&apos;s subscription? This sets the renewal date to one month
              from now, reactivates the subscription, and resets their monthly AI credits.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenewConfirm(false)}>Cancel</Button>
            <Button onClick={renewSubscription} loading={actionLoading}>Renew</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset AI Credits</DialogTitle>
            <DialogDescription>
              Reset <strong>{user.name}</strong>&apos;s monthly AI credit usage to 0? The next reset window
              will begin on the first day of next month.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
            <Button onClick={resetCredits} loading={actionLoading}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
