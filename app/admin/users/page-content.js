"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye, Trash2,
  ArrowUpDown, Search, RefreshCcw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
import PageHeader from "@/components/shared/page-header";
import SearchBar from "@/components/shared/search-bar";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { Progress } from "@/components/ui/progress";
import { getPlanLimits } from "@/lib/usage-client";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getPlanBadgeVariant(plan) {
  switch (plan?.toLowerCase()) {
    case "enterprise": return "default";
    case "pro": return "pro";
    default: return "outline";
  }
}

function getRoleBadgeVariant(role) {
  switch (role) {
    case "ADMIN": return "danger";
    case "MODERATOR": return "primary";
    case "CLIENT": return "default";
    default: return "outline";
  }
}

function aiLimitFor(user) {
  const limits = getPlanLimits(user?.subscription?.plan?.toUpperCase() || "FREE");
  return limits.ai;
}

function pct(used, total) {
  if (!Number.isFinite(total) || total <= 0) return 100;
  return Math.min(100, Math.round((used / total) * 100));
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkPlan, setBulkPlan] = useState("");
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [renewUser, setRenewUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    clearTimeout(searchTimeout);
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    setSearchTimeout(t);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pagination.limit),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (planFilter !== "all") params.set("plan", planFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (verifiedFilter !== "all") params.set("verified", verifiedFilter);
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (sortBy) params.set("sort", sortBy);

    try {
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setPagination((p) => ({
          ...p,
          page: json.pagination.page,
          totalPages: json.pagination.totalPages,
          total: json.pagination.total,
        }));
      } else {
        setError(json.error || "Failed to fetch users");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, planFilter, statusFilter, verifiedFilter, roleFilter, sortBy, pagination.limit]);

  useEffect(() => {
    fetchUsers(1);
    setSelected(new Set());
    setSelectAll(false);
  }, [fetchUsers]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(users.map((u) => u.id)));
      setSelectAll(true);
    }
  };

  const handleSelectOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
    setSelectAll(next.size === users.length);
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    setActionLoading(true);
    const token = localStorage.getItem("token");
    const body = { action: bulkAction, userIds: Array.from(selected) };
    if ((bulkAction === "upgrade" || bulkAction === "downgrade") && bulkPlan) {
      body.plan = bulkPlan;
    }
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setSelected(new Set());
        setSelectAll(false);
        fetchUsers(pagination.page);
      }
    } finally {
      setActionLoading(false);
      setShowBulkConfirm(false);
      setBulkAction("");
      setBulkPlan("");
    }
  };

  const handleDeleteUser = async (id) => {
    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchUsers(pagination.page);
      }
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const renewSubscription = async () => {
    if (!renewUser) return;
    setActionLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${renewUser.id}/subscription`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ renew: true }),
      });
      const json = await res.json();
      if (json.success) {
        fetchUsers(pagination.page);
      }
    } finally {
      setActionLoading(false);
      setRenewUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="View, search, filter, and manage all registered users."
      >
        <Button variant="outline" size="sm" onClick={() => fetchUsers(1)}>
          Refresh
        </Button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-3"
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
          className="w-full sm:w-72"
        />
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Verified" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="lastLogin">Last Login</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-flag/10 border border-flag/20"
        >
          <span className="text-xs font-medium text-flag flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-xs text-muted hover:text-foreground">Dismiss</button>
        </motion.div>
      )}

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-stamp/10 border border-stamp/20"
        >
          <span className="text-xs font-medium text-stamp">
            {selected.size} user{selected.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[140px] h-8 text-[11px]">
                <SelectValue placeholder="Bulk action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upgrade">Upgrade</SelectItem>
                <SelectItem value="downgrade">Downgrade</SelectItem>
                <SelectItem value="suspend">Suspend</SelectItem>
                <SelectItem value="verify">Verify Email</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
            {(bulkAction === "upgrade" || bulkAction === "downgrade") && (
              <Select value={bulkPlan} onValueChange={setBulkPlan}>
                <SelectTrigger className="w-[120px] h-8 text-[11px]">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              variant="default"
              size="sm"
              className="h-8 text-[11px]"
              disabled={!bulkAction || actionLoading || (bulkAction !== "suspend" && bulkAction !== "verify" && bulkAction !== "delete" && !bulkPlan)}
              onClick={() => setShowBulkConfirm(true)}
            >
              {actionLoading ? "Processing..." : "Apply"}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 ml-auto" onClick={() => { setSelected(new Set()); setSelectAll(false); }}>
            Clear
          </Button>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selectAll && users.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-border"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Resumes</TableHead>
                    <TableHead>AI Credits</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-9 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center text-muted">
                        No users found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <motion.tr
                        key={user.id}
                        variants={item}
                        className={cn(
                          "border-b transition-colors hover:bg-muted/50 cursor-pointer",
                          selected.has(user.id) && "bg-stamp/5"
                        )}
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(user.id)}
                            onChange={() => handleSelectOne(user.id)}
                            className="rounded border-border"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs font-medium">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted">{user.email}</p>
                              <p className="text-[10px] font-mono text-muted/60">ID: {user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px]">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPlanBadgeVariant(user.subscription?.plan)} className="text-[10px]">
                            {user.subscription?.plan?.toLowerCase() || "free"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "inline-block w-1.5 h-1.5 rounded-full",
                              user.suspended ? "bg-flag" : "bg-verified"
                            )} />
                            <span className="text-[11px] font-medium">
                              {user.suspended ? "Suspended" : "Active"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <span className="text-[11px] text-verified font-medium">Verified</span>
                          ) : (
                            <span className="text-[11px] text-muted">Unverified</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{user._count?.resumes ?? 0}</TableCell>
                        <TableCell>
                          {(() => {
                            const total = aiLimitFor(user);
                            const used = user.subscription?.aiCreditsUsed ?? 0;
                            const atLimit = Number.isFinite(total) && used >= total;
                            return (
                              <div className="w-24">
                                <div className="flex items-center justify-between text-[10px] text-muted mb-0.5">
                                  <span className={cn("font-medium tabular-nums", atLimit && "text-flag")}>
                                    {used} / {Number.isFinite(total) ? total : "∞"}
                                  </span>
                                </div>
                                <Progress value={pct(used, total)} className={cn("h-1.5", atLimit && "opacity-80")} />
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-xs text-muted">
                          {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                        </TableCell>
                        <TableCell className="text-xs text-muted">
                          {formatRelativeTime(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="icon-sm"
                              title="Renew subscription (reset credits)"
                              onClick={() => setRenewUser(user)}
                              leftIcon={RefreshCcw}
                            />
                            <Button
                              variant="ghost" size="icon-sm"
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                              leftIcon={Eye}
                            />
                            <Button
                              variant="ghost" size="icon-sm"
                              className="hover:text-destructive"
                              onClick={() => setShowDeleteConfirm(user)}
                              leftIcon={Trash2}
                            />
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showBulkConfirm && (
        <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Bulk Action</DialogTitle>
              <DialogDescription>
                {bulkAction === "delete"
                  ? `Are you sure you want to delete ${selected.size} user(s)? This action cannot be undone.`
                  : `Apply "${bulkAction}" to ${selected.size} user(s)?`}
                {bulkPlan && ` Plan: ${bulkPlan.toUpperCase()}`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkConfirm(false)}>Cancel</Button>
              <Button variant={bulkAction === "delete" ? "danger" : "default"} onClick={executeBulkAction} loading={actionLoading}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showDeleteConfirm && (
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong> ({showDeleteConfirm.email})? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDeleteUser(showDeleteConfirm.id)} loading={actionLoading}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {renewUser && (
        <Dialog open={!!renewUser} onOpenChange={() => setRenewUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renew Subscription</DialogTitle>
              <DialogDescription>
                Renew <strong>{renewUser.name}</strong> ({renewUser.email})? This sets the renewal date
                to one month from now, reactivates the subscription, and resets their monthly AI credits.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenewUser(null)}>Cancel</Button>
              <Button onClick={renewSubscription} loading={actionLoading}>
                Renew
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
