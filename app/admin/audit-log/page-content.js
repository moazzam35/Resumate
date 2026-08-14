"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, Shield, UserCheck, Ban, Mail, Trash2, Lock, CreditCard } from "lucide-react";
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
import PageHeader from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

const actionIcons = {
  CHANGE_PLAN: CreditCard,
  CHANGE_ROLE: Shield,
  SUSPEND_ACCOUNT: Ban,
  REACTIVATE_ACCOUNT: UserCheck,
  VERIFY_EMAIL: Mail,
  DISABLE_LOGIN: Lock,
  ENABLE_LOGIN: Lock,
  FORCE_PASSWORD_RESET: Lock,
  DELETE_USER: Trash2,
  UPDATE_SUBSCRIPTION: CreditCard,
  CANCEL_SUBSCRIPTION: CreditCard,
};

const actionColors = {
  CHANGE_PLAN: "text-stamp",
  CHANGE_ROLE: "text-stamp",
  SUSPEND_ACCOUNT: "text-flag",
  REACTIVATE_ACCOUNT: "text-verified",
  VERIFY_EMAIL: "text-verified",
  DISABLE_LOGIN: "text-flag",
  ENABLE_LOGIN: "text-verified",
  FORCE_PASSWORD_RESET: "text-flag",
  DELETE_USER: "text-flag",
  UPDATE_SUBSCRIPTION: "text-stamp",
  CANCEL_SUBSCRIPTION: "text-flag",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (actionFilter !== "all") params.set("action", actionFilter);

    try {
      const res = await fetch(`/api/admin/audit-log?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
        setPagination({
          page: json.pagination.page,
          totalPages: json.pagination.totalPages,
          total: json.pagination.total,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all admin actions performed on the platform."
      />

      <div className="flex items-center gap-2">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="CHANGE_PLAN">Change Plan</SelectItem>
            <SelectItem value="CHANGE_ROLE">Change Role</SelectItem>
            <SelectItem value="SUSPEND_ACCOUNT">Suspend Account</SelectItem>
            <SelectItem value="REACTIVATE_ACCOUNT">Reactivate Account</SelectItem>
            <SelectItem value="VERIFY_EMAIL">Verify Email</SelectItem>
            <SelectItem value="DISABLE_LOGIN">Disable Login</SelectItem>
            <SelectItem value="ENABLE_LOGIN">Enable Login</SelectItem>
            <SelectItem value="FORCE_PASSWORD_RESET">Force Password Reset</SelectItem>
            <SelectItem value="DELETE_USER">Delete User</SelectItem>
            <SelectItem value="CANCEL_SUBSCRIPTION">Cancel Subscription</SelectItem>
            <SelectItem value="SELF_UPGRADE">Self Upgrade</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => fetchLogs(1)}>
          Refresh
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-9 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const Icon = actionIcons[log.action] || History;
                    const color = actionColors[log.action] || "text-muted";
                    return (
                      <TableRow key={log.id} className="border-border/40">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-[9px]">
                                {getInitials(log.admin?.name || "Admin")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium">{log.admin?.name || "Unknown"}</p>
                              <p className="text-[10px] text-muted">{log.admin?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Icon className={cn("h-3.5 w-3.5", color)} />
                            <span className="text-xs font-medium">{log.action.replace(/_/g, " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium">{log.targetEmail || "N/A"}</p>
                            <p className="text-[10px] text-muted font-mono">
                              {log.targetUser ? `${log.targetUser.slice(0, 8)}...` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {log.details && typeof log.details === "object" && Object.entries(log.details).map(([key, val]) => (
                              <Badge key={key} variant="outline" className="text-[9px]">
                                {key}: {String(val)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted whitespace-nowrap">
                          {formatRelativeTime(log.createdAt)}
                          <p className="text-[10px]">{new Date(log.createdAt).toLocaleDateString()}</p>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline" size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
