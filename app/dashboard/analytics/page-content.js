"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Download, TrendingUp, Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "@/components/dashboard/stat-card";
import ChartCard from "@/components/dashboard/chart-card";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/shared/loading-skeleton";

const PIE_COLORS = ["var(--stamp)", "#1E40AF", "var(--verified)", "#EC4899", "var(--seal)", "var(--muted)"];

const dateRanges = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?range=${range}`, {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch analytics:", err);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    fetchAnalytics();
    return () => controller.abort();
  }, [range]);

  const totalViews = data
    ? data.resumeViews.reduce((sum, v) => sum + v.views, 0)
    : 0;

  const templateUsageData = data
    ? data.templateUsage.map((t, i) => ({
        ...t,
        fill: PIE_COLORS[i % PIE_COLORS.length],
      }))
    : [];

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <PageHeader
            title="Analytics"
            description="Track your resume performance and usage metrics."
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} hover>
              <CardContent className="flex items-center gap-4 p-5">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className={i === 3 ? "lg:col-span-2" : undefined}>
              <CardHeader className="pb-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-1 h-3 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Analytics"
          description="Track your resume performance and usage metrics."
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={totalViews}
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="Downloads"
          value={data?.downloads ?? 0}
          icon={Download}
          color="green"
        />
        <StatCard
          title="Avg ATS Score"
          value={data?.avgAtsScore ?? 0}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="AI Requests"
          value={data?.aiRequestCount ?? 0}
          icon={Sparkles}
          color="orange"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-2">
        {dateRanges.map((dr) => (
          <Button
            key={dr.value}
            variant={range === dr.value ? "default" : "outline"}
            size="sm"
            onClick={() => setRange(dr.value)}
          >
            {dr.label}
          </Button>
        ))}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid gap-6 lg:grid-cols-2"
      >
        <ChartCard title="Resume Views" description="Views over time">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.resumeViews ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "var(--muted)" }}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "var(--muted)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Downloads" description="PDF downloads over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "var(--muted)" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "var(--muted)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="downloads"
                stroke="var(--verified)"
                strokeWidth={2}
                dot={{ fill: "var(--verified)" }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-center text-sm text-muted pb-2">
            Download tracking coming soon
          </div>
        </ChartCard>

        <ChartCard
          title="ATS Score Trend"
          description="Your ATS score improvements"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.atsScoreTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "var(--muted)" }}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis
                domain={[0, 100]}
                className="text-xs"
                tick={{ fill: "var(--muted)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--stamp)"
                strokeWidth={2}
                dot={{ fill: "var(--stamp)" }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-center text-sm text-muted pb-2">
            Avg ATS Score: {data?.avgAtsScore ?? 0}
          </div>
        </ChartCard>

        <ChartCard
          title="Template Usage"
          description="Most used templates"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={templateUsageData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {templateUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="AI Usage"
          description="AI requests by type"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.aiUsageByType ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="type"
                className="text-xs"
                tick={{ fill: "var(--muted)" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "var(--muted)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="count" fill="var(--seal)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>
    </motion.div>
  );
}
