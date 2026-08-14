"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, FileText, TrendingUp, RefreshCcw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PageHeader from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { cn, getInitials } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const FEATURE_COLORS = ["var(--stamp)", "var(--verified)", "var(--seal)", "#EC4899", "#06B6D4", "var(--flag)"];

function planBadgeVariant(plan) {
  switch (plan) {
    case "ENTERPRISE": return "default";
    case "PRO": return "pro";
    default: return "outline";
  }
}

function pct(used, total) {
  if (!Number.isFinite(total) || total <= 0) return 100;
  return Math.min(100, Math.round((used / total) * 100));
}

export default function AdminAIUsagePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageRows, setUsageRows] = useState([]);
  const [usageTotal, setUsageTotal] = useState(0);
  const [usageLoading, setUsageLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("/api/admin/stats", { headers });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch AI usage stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("/api/admin/usage?limit=100", { headers });
        const data = await res.json();
        if (data.success) {
          setUsageRows(data.data || []);
          setUsageTotal(data.pagination?.total ?? (data.data || []).length);
        }
      } catch (err) {
        console.error("Failed to fetch per-user usage:", err);
      } finally {
        setUsageLoading(false);
      }
    }
    fetchUsage();
  }, []);

  const renewUser = async (userId) => {
    setRenewingId(userId);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ renew: true }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUsageRows((prev) =>
            prev.map((u) =>
              u.userId === userId
                ? {
                    ...u,
                    aiCreditsUsed: 0,
                    aiResetDate: json.data?.aiCreditResetAt || null,
                    renewalDate: json.data?.renewalDate || null,
                  }
                : u
            )
          );
        }
      }
    } finally {
      setRenewingId(null);
    }
  };

  const aiUsageData = stats?.aiUsage?.map((d) => ({ date: d.date, requests: d.count })) ?? [];
  const topSkillsData = stats?.topSkills ?? [];
  const totalRequests = aiUsageData.reduce((sum, d) => sum + d.requests, 0);
  const avgDaily = aiUsageData.length > 0 ? Math.round(totalRequests / aiUsageData.length) : 0;
  const topSkill = topSkillsData.length > 0 ? topSkillsData[0].name : "N/A";

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Usage Analytics"
        description="Monitor AI feature usage and performance across the platform."
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: "Total Requests", value: () => totalRequests.toLocaleString(), icon: BrainCircuit, color: "text-stamp", bg: "bg-stamp/10" },
          { label: "Avg Daily", value: () => avgDaily.toLocaleString(), icon: TrendingUp, color: "text-verified", bg: "bg-verified/10" },
          { label: "Top Skill", value: () => topSkill, icon: Sparkles, color: "text-stamp", bg: "bg-stamp/10" },
          { label: "Days Tracked", value: () => aiUsageData.length, icon: FileText, color: "text-stamp", bg: "bg-stamp/10" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">{stat.label}</p>
                    <p className="text-2xl font-semibold">
                      {loading ? <Skeleton className="h-7 w-20" /> : stat.value()}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-md ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-2"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="heading-display">AI Usage Trend</CardTitle>
              <CardDescription>Daily AI request volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiUsageData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: "var(--muted)" }} />
                      <YAxis className="text-xs" tick={{ fill: "var(--muted)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="requests" stroke="var(--stamp)" fill="var(--stamp)" fillOpacity={0.1} strokeWidth={2} name="Requests" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="heading-display">Top Skills Used</CardTitle>
              <CardDescription>Most requested skills on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-4 h-[300px]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : topSkillsData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted">No skill data available</div>
              ) : (
                topSkillsData.map((skill, index) => {
                  const maxCount = topSkillsData[0]?.count ?? 1;
                  return (
                    <div key={skill.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span>{skill.name}</span>
                        <span className="text-muted">{skill.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(skill.count / maxCount) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: FEATURE_COLORS[index % FEATURE_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="heading-display">User-Level Usage</CardTitle>
              <CardDescription>
                Per-user resume creation, AI credits used, and next reset date.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {usageTotal.toLocaleString()} users
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Resumes</TableHead>
                  <TableHead>Cover Letters</TableHead>
                  <TableHead>AI Actions</TableHead>
                  <TableHead>AI Credits</TableHead>
                  <TableHead>Reset Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : usageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted">
                      No usage data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  usageRows.map((row) => {
                    const atLimit =
                      Number.isFinite(row.aiCreditsTotal) && row.aiCreditsUsed >= row.aiCreditsTotal;
                    return (
                      <TableRow key={row.userId} className="border-b">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs font-medium">
                                {getInitials(row.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{row.name}</p>
                              <p className="text-xs text-muted">{row.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={planBadgeVariant(row.plan)} className="text-[10px]">
                            {row.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm tabular-nums">{row.resumesCreated}</TableCell>
                        <TableCell className="font-medium text-sm tabular-nums">{row.coverLetters}</TableCell>
                        <TableCell className="font-medium text-sm tabular-nums">{row.aiActions}</TableCell>
                        <TableCell>
                          <div className="w-28">
                            <div className="flex items-center justify-between text-[10px] text-muted mb-0.5">
                              <span className={cn("font-medium tabular-nums", atLimit && "text-flag")}>
                                {row.aiCreditsUsed} / {Number.isFinite(row.aiCreditsTotal) ? row.aiCreditsTotal : "∞"}
                              </span>
                            </div>
                            <Progress value={pct(row.aiCreditsUsed, row.aiCreditsTotal)} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted whitespace-nowrap">
                          {row.aiResetDate
                            ? new Date(row.aiResetDate).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline" size="sm" className="h-8 text-[11px]"
                            onClick={() => renewUser(row.userId)}
                            loading={renewingId === row.userId}
                            disabled={renewingId !== null && renewingId !== row.userId}
                            leftIcon={RefreshCcw}
                          >
                            Renew
                          </Button>
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
    </div>
  );
}
