"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart,
  Download,
  CheckCircle,
  Plus,
  Users,
  FileText,
  BrainCircuit,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const REPORT_TYPES = [
  { value: "user-activity", label: "User Activity", icon: Users, description: "User registration, engagement, and retention metrics" },
  { value: "resume-analytics", label: "Resume Analytics", icon: FileText, description: "Resume creation, completion rates, and template usage" },
  { value: "ai-usage", label: "AI Usage", icon: BrainCircuit, description: "AI feature usage, request volumes, and success rates" },
  { value: "revenue", label: "Revenue", icon: DollarSign, description: "Estimated revenue from active premium subscriptions" },
];

const typeConfig = {
  "user-activity": { icon: Users, color: "text-stamp", bg: "bg-stamp/10" },
  "resume-analytics": { icon: FileText, color: "text-stamp", bg: "bg-stamp/10" },
  "ai-usage": { icon: BrainCircuit, color: "text-stamp", bg: "bg-stamp/10" },
  revenue: { icon: DollarSign, color: "text-verified", bg: "bg-verified/10" },
};

function escapeCsv(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers, rows) {
  return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
}

/**
 * Build a real CSV report from the live admin analytics endpoints.
 * Revenue figures are labeled as estimates because the platform has no
 * payment provider wired up yet.
 */
function buildReportCsv(type, stats, admin) {
  const sections = [];

  if (type === "user-activity") {
    sections.push("User Activity Report");
    sections.push("");
    sections.push("Summary");
    sections.push(toCsv(["Metric", "Value"], [
      ["Total users", admin.totalUsers ?? 0],
      ["Active users (last 30 days)", admin.activeUsers ?? 0],
      ["Premium users", admin.premiumUsers ?? 0],
      ["New users today", admin.newUsersToday ?? 0],
      ["Conversion rate (%)", admin.conversionRate ?? 0],
    ]));
    sections.push("");
    sections.push("User Growth (per month)");
    sections.push(toCsv(["Month", "New Users"], (stats.userGrowth ?? []).map((d) => [d.month, d.count])));
  } else if (type === "resume-analytics") {
    sections.push("Resume Analytics Report");
    sections.push("");
    sections.push("Summary");
    sections.push(toCsv(["Metric", "Value"], [
      ["Total resumes", admin.totalResumes ?? 0],
      ["Resumes created today", admin.resumesCreatedToday ?? 0],
      ["Resumes created this month", admin.resumesCreatedThisMonth ?? 0],
      ["Total cover letters", admin.totalCoverLetters ?? 0],
    ]));
    sections.push("");
    sections.push("Resume Creation (daily)");
    sections.push(toCsv(["Date", "Resumes"], (stats.resumeCreation ?? []).map((d) => [d.date, d.count])));
    sections.push("");
    sections.push("Template Distribution");
    sections.push(toCsv(["Template", "Resumes"], (stats.templateUsage ?? []).map((d) => [d.name, d.count])));
  } else if (type === "ai-usage") {
    sections.push("AI Usage Report");
    sections.push("");
    sections.push("Summary");
    sections.push(toCsv(["Metric", "Value"], [
      ["Total AI requests", admin.aiRequestsTotal ?? 0],
      ["AI requests this month", admin.aiRequestsThisMonth ?? 0],
    ]));
    sections.push("");
    sections.push("AI Requests (daily)");
    sections.push(toCsv(["Date", "Requests"], (stats.aiUsage ?? []).map((d) => [d.date, d.count])));
    sections.push("");
    sections.push("Top Skills");
    sections.push(toCsv(["Skill", "Count"], (stats.topSkills ?? []).map((d) => [d.name, d.count])));
  } else if (type === "revenue") {
    sections.push("Revenue Report (estimated — no payment provider wired up)");
    sections.push("");
    sections.push("Summary");
    sections.push(toCsv(["Metric", "Value"], [
      ["Estimated revenue (active subscriptions)", `$${(admin.totalRevenue ?? 0).toLocaleString()}`],
    ]));
    sections.push("");
    sections.push("Estimated Revenue by Month");
    sections.push(toCsv(["Month", "Revenue (USD)"], (stats.revenueByMonth ?? []).map((d) => [d.month, d.revenue])));
  }

  return sections.join("\n");
}

function formatRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function AdminReportsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);

  const generateReport = async () => {
    if (!reportType || generating) return;
    setGenerating(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [statsRes, adminRes] = await Promise.all([
        fetch("/api/admin/stats?range=12m", { headers }),
        fetch("/api/admin", { headers }),
      ]);
      const [statsJson, adminJson] = await Promise.all([statsRes.json(), adminRes.json()]);
      const stats = statsJson.success ? statsJson.data : {};
      const admin = adminJson.success ? adminJson.data : {};

      const type = REPORT_TYPES.find((t) => t.value === reportType);
      const csv = buildReportCsv(reportType, stats, admin);
      const sizeBytes = new Blob([csv]).size;
      const report = {
        id: `rpt_${Date.now()}`,
        name: `${type.label} Report — ${new Date().toLocaleDateString()}`,
        type: reportType,
        status: "completed",
        generatedAt: new Date().toISOString(),
        csv,
        size:
          sizeBytes > 1024 * 1024
            ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
            : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`,
      };
      setReports((prev) => [report, ...prev]);
      setDialogOpen(false);
      setReportType("");
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (report) => {
    const blob = new Blob([report.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.type}-report-${new Date(report.generatedAt).toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download real platform reports as CSV."
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button leftIcon={Plus}>
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="heading-display">Generate New Report</DialogTitle>
              <DialogDescription>
                Select a report type to generate a CSV export of real platform data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {reportType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg border p-3 text-sm text-muted"
                >
                  {REPORT_TYPES.find((t) => t.value === reportType)?.description}
                </motion.div>
              )}
              <Button onClick={generateReport} disabled={!reportType || generating} loading={generating} className="w-full">
                {generating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {REPORT_TYPES.map((type) => {
          const count = reports.filter((r) => r.type === type.value).length;
          const config = typeConfig[type.value];
          return (
            <motion.div key={type.value} variants={item}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">{type.label}</p>
                      <p className="text-2xl font-semibold">{count}</p>
                    </div>
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-md", config.bg)}>
                      <config.icon className={cn("h-6 w-6", config.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold">Generated Reports</h3>
        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted py-8">
                <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">No Reports Yet</p>
                <p className="text-sm">
                  Click &quot;Generate Report&quot; to export real user analytics, resume statistics,
                  AI usage, and revenue data as a downloadable CSV.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => {
            const type = typeConfig[report.type];
            const timeAgo = formatRelativeTime(report.generatedAt);
            return (
              <motion.div key={report.id} variants={item}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-md", type.bg)}>
                          <type.icon className={cn("h-6 w-6", type.color)} />
                        </div>
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                            <span>{timeAgo}</span>
                            {report.size && <span>{report.size}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                        <Button
                          variant="outline" size="sm" leftIcon={Download}
                          onClick={() => downloadReport(report)}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
