"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, Users, FileText, DollarSign } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading-skeleton";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const CHART_COLORS = ["var(--stamp)", "var(--verified)", "var(--seal)", "#EC4899", "#06B6D4", "var(--muted)"];

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState("12m");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchStats() {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/admin/stats?range=${dateRange}`, {
          headers,
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch analytics:", err);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchStats();
    return () => controller.abort();
  }, [dateRange]);

  const userGrowthData = stats?.userGrowth?.map((d) => ({ label: d.month || d.date, users: d.count })) ?? [];
  const resumeCreationsData = stats?.resumeCreation ?? [];
  const aiUsageData = stats?.aiUsage?.map((d) => ({ date: d.date, requests: d.count })) ?? [];
  const revenueData = stats?.revenueByMonth?.map((d) => ({ label: d.month || d.date, revenue: d.revenue })) ?? [];
  const templateUsageData = stats?.templateUsage?.map((d) => ({ name: d.name, value: d.count })) ?? [];

  const escapeCsv = (value) => {
    const s = String(value ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const toCsv = (headers, rows) =>
    [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");

  const handleExport = () => {
    const sections = [];

    if (userGrowthData.length) {
      sections.push("User Growth");
      sections.push(toCsv(["Period", "New Users"], userGrowthData.map((d) => [d.label, d.users])));
      sections.push("");
    }

    if (resumeCreationsData.length) {
      sections.push("Resume Creations (daily)");
      sections.push(toCsv(["Date", "Resumes"], resumeCreationsData.map((d) => [d.date, d.count])));
      sections.push("");
    }

    if (aiUsageData.length) {
      sections.push("AI Usage (daily)");
      sections.push(toCsv(["Date", "AI Requests"], aiUsageData.map((d) => [d.date, d.requests])));
      sections.push("");
    }

    if (revenueData.length) {
      sections.push("Revenue");
      sections.push(toCsv(["Period", "Revenue (USD)"], revenueData.map((d) => [d.label, d.revenue])));
      sections.push("");
    }

    if (templateUsageData.length) {
      sections.push("Template Distribution");
      sections.push(toCsv(["Template", "Resumes"], templateUsageData.map((d) => [d.name, d.value])));
      sections.push("");
    }

    if (stats?.topSkills?.length) {
      sections.push("Top Skills");
      sections.push(toCsv(["Skill", "Count"], stats.topSkills.map((d) => [d.name, d.count])));
      sections.push("");
    }

    const blob = new Blob([sections.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `platform-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Comprehensive platform analytics and insights."
      >
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" leftIcon={Download} onClick={handleExport}>
            Export
          </Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6"
        >
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="heading-display flex items-center gap-2">
                      <Users className="h-5 w-5 text-stamp" />
                      User Growth
                    </CardTitle>
                    <CardDescription>Total user growth over time</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" className="text-xs" tick={{ fill: "var(--muted)" }} />
                      <YAxis className="text-xs" tick={{ fill: "var(--muted)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="var(--stamp)" strokeWidth={2.5} dot={{ fill: "var(--stamp)", strokeWidth: 2 }} name="Total Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="heading-display flex items-center gap-2">
                      <FileText className="h-5 w-5 text-stamp" />
                      Resume Creations
                    </CardTitle>
                    <CardDescription>Daily resume creation activity</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resumeCreationsData}>
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
                      <Bar dataKey="count" fill="var(--seal)" radius={[4, 4, 0, 0]} name="Resumes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="heading-display flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-stamp" />
                      AI Usage
                    </CardTitle>
                    <CardDescription>Daily AI request volume</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                      <Area type="monotone" dataKey="requests" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.1} strokeWidth={2} name="AI Requests" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="heading-display flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-verified" />
                      Est. Revenue
                    </CardTitle>
                    <CardDescription>Estimated from active premium subscriptions (no payment provider wired up)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" className="text-xs" tick={{ fill: "var(--muted)" }} />
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

            <Card>
              <CardHeader>
                <CardTitle className="heading-display">Template Distribution</CardTitle>
                <CardDescription>Usage share across templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={templateUsageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {templateUsageData.map((entry, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
