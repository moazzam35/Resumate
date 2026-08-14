"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Crown,
  FileText,
  DollarSign,
  BrainCircuit,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";


const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch("/api/admin", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([adminRes, statsRes]) => {
        if (adminRes.success) setData(adminRes.data);
        if (statsRes.success) setStats(statsRes.data);
      })
      .catch((error) => {
        console.error("Failed to load admin dashboard:", error);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Overview of your platform's key metrics and activity." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Overview of your platform's key metrics and activity." />
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Failed to load dashboard data. Please refresh the page to try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const kpiCards = [
    {
      label: "Total Users",
      value: (data.totalUsers ?? 0).toLocaleString(),
      icon: Users,
      trend: `+${data.newUsersToday ?? 0}`,
      trendLabel: "today",
      color: "text-stamp",
      bg: "bg-stamp/10",
    },
    {
      label: "Active Users",
      value: (data.activeUsers ?? 0).toLocaleString(),
      icon: UserCheck,
      trend: null,
      trendLabel: "logged in / joined last 30 days",
      color: "text-verified",
      bg: "bg-verified/10",
    },
    {
      label: "Premium Users",
      value: (data.premiumUsers ?? 0).toLocaleString(),
      icon: Crown,
      trend: null,
      trendLabel: "active subscriptions",
      color: "text-stamp",
      bg: "bg-stamp/10",
    },
    {
      label: "Total Resumes",
      value: (data.totalResumes ?? 0).toLocaleString(),
      icon: FileText,
      trend: `+${data.resumesCreatedToday ?? 0}`,
      trendLabel: "today",
      color: "text-stamp",
      bg: "bg-stamp/10",
    },
    {
      label: "Est. Revenue",
      value: `$${(data.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      trend: null,
      trendLabel: "est. from active subscriptions",
      color: "text-verified",
      bg: "bg-verified/10",
    },
    {
      label: "AI Requests",
      value: (data.aiRequestsTotal ?? 0).toLocaleString(),
      icon: BrainCircuit,
      trend: `+${data.aiRequestsThisMonth ?? 0}`,
      trendLabel: "this month",
      color: "text-stamp",
      bg: "bg-stamp/10",
    },
    {
      label: "Conversion Rate",
      value: `${data.conversionRate ?? 0}%`,
      icon: TrendingUp,
      trend: null,
      trendLabel: "premium / total users",
      color: "text-flag",
      bg: "bg-flag/10",
    },
  ];

  const userGrowth = (stats?.userGrowth ?? []).map((d) => ({ month: d.month, users: d.count }));
  const resumeCreations = (stats?.resumeCreation ?? []).map((d) => ({ date: d.date, count: d.count }));
  const aiUsage = (stats?.aiUsage ?? []).map((d) => ({ date: d.date, requests: d.count }));
  const revenueByMonth = (stats?.revenueByMonth ?? []).map((d) => ({ month: d.month, revenue: d.revenue }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your platform's key metrics and activity."
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.label} variants={item}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted">{kpi.label}</p>
                    <p className="text-2xl font-semibold">{kpi.value}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {kpi.trend != null ? (
                        <>
                          {String(kpi.trend).startsWith("-") ? (
                            <ArrowDownRight className="h-3 w-3 text-flag" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 text-verified" />
                          )}
                          <span
                            className={String(kpi.trend).startsWith("-") ? "text-flag" : "text-verified"}
                          >
                            {kpi.trend}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                      <span className="text-muted">{kpi.trendLabel}</span>
                    </div>
                  </div>
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-md", kpi.bg)}>
                    <kpi.icon className={cn("h-6 w-6", kpi.color)} />
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
              <CardTitle className="heading-display">User Growth</CardTitle>
              <CardDescription>Total users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--muted)" }} />
                    <YAxis className="text-xs" tick={{ fill: "var(--muted)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="var(--stamp)" strokeWidth={2} dot={false} name="Total Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="heading-display">Resume Creations</CardTitle>
              <CardDescription>Daily resume creation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resumeCreations}>
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
                    <Bar dataKey="count" fill="var(--stamp)" radius={[4, 4, 0, 0]} name="Resumes Created" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="heading-display">AI Usage Trend</CardTitle>
              <CardDescription>Daily AI request volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aiUsage}>
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
                    <Area type="monotone" dataKey="requests" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.1} strokeWidth={2} name="AI Requests" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="heading-display">Est. Revenue</CardTitle>
              <CardDescription>Estimated from active premium subscriptions (no payment provider wired up)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--muted)" }} />
                    <YAxis className="text-xs" tick={{ fill: "var(--muted)" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="var(--verified)" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="heading-display">Recent Users</CardTitle>
            <CardDescription>Latest registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.recentUsers ?? []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted text-sm">
                      {formatRelativeTime(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
