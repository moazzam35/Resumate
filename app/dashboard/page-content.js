"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Sparkles,
  ArrowRight,
  LayoutTemplate,
  Clock,
  ScanSearch,
  Download,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store";
import { get } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { UsageCounter } from "@/components/features/billing/usage-counter";


const AnalyticsChart = dynamic(
  () => import("@/components/shared/analytics-chart"),
  { ssr: false, loading: () => <ChartLoadFallback /> }
);

function ChartLoadFallback() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card/70 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const isPremium = user?.subscription?.plan === "PRO" || user?.subscription?.plan === "ENTERPRISE";
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalDownloads: 0,
    atsAverage: 0,
    aiUsage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [resumesData, analyticsData] = await Promise.all([
          get("/resumes?limit=5"),
          get("/analytics").catch(() => null),
        ]);
        setResumes(resumesData.resumes || []);
        setAnalytics(analyticsData?.data || null);
        setStats({
          totalResumes: resumesData.pagination?.total || resumesData.resumes?.length || 0,
          totalDownloads: analyticsData?.data?.downloads || 0,
          atsAverage: analyticsData?.data?.avgAtsScore || 0,
          aiUsage: analyticsData?.data?.aiRequestCount || 0,
        });
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {!authLoading && !isPremium && (
        <motion.div variants={item}>
          <Card className="border-stamp/30 bg-gradient-to-r from-stamp/5 via-transparent to-transparent p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Unlock Pro — more resumes &amp; more AI</p>
                <p className="text-xs text-muted mt-0.5 max-w-md">
                  Upgrade to Pro for 10 resumes, 20 AI requests per month, and all executive templates.
                </p>
              </div>
            </div>
            <Link href="/dashboard/upgrade" className="shrink-0">
              <Button size="sm" rightIcon={ArrowRight}>
                View Plans
              </Button>
            </Link>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item}>
        <UsageCounter />
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl heading-display font-semibold text-ink">
            {greeting()}, {user?.name?.split(" ")[0] || "Professional"}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Your ATS resume studio performance and document analytics overview.
          </p>
        </div>

        <div className="w-full sm:w-auto sm:max-w-xs space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/ats-checker">
              <Button size="sm" variant="outline" leftIcon={ScanSearch} className="w-full justify-center">
                Scan ATS Score
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="sm" variant="primary" leftIcon={LayoutTemplate} className="w-full justify-center">
                Templates
              </Button>
            </Link>
          </div>

          <Link href="/resume/new" className="block">
            <Button size="sm" variant="primary" leftIcon={Plus} className="w-full justify-center">
              Create Resume
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card hover className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Total Resumes</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-alt text-ink">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
                {isLoading ? <Skeleton className="h-7 w-16" /> : stats.totalResumes}
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hover className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">PDF Downloads</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-alt text-ink">
                <Download className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
                {isLoading ? <Skeleton className="h-7 w-16" /> : stats.totalDownloads}
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hover className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Average ATS Score</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-alt text-ink">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
                {isLoading ? <Skeleton className="h-7 w-16" /> : `${stats.atsAverage}%`}
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card hover className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">AI Requests</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-alt text-ink">
                <Sparkles className="h-4 w-4 text-stamp" />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
                {isLoading ? <Skeleton className="h-7 w-16" /> : stats.aiUsage}
              </span>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <AnalyticsChart analytics={analytics} isLoading={isLoading} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>Recent Resumes</CardTitle>
                  <CardDescription className="mt-0.5">
                    Your active drafts and published resume versions
                  </CardDescription>
                </div>
                <Link href="/dashboard/resumes">
                  <Button variant="ghost" size="sm" rightIcon={ArrowRight}>
                    View all
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md border border-border bg-paper p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-lg" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-40" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-border rounded-md p-6 space-y-3">
                    <p className="text-xs font-semibold text-ink">No resumes created yet</p>
                    <p className="text-xs text-muted">Start building your ATS-optimized resume now.</p>
                    <Link href="/resume/new">
                      <Button size="sm" variant="primary">Create Resume</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((resume) => (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between rounded-md border border-border bg-paper p-3 transition-colors hover:border-border-strong hover:bg-paper-alt/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper-alt text-ink">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <Link href={`/resume/${resume.id}`} className="text-xs font-semibold text-ink hover:underline">
                              {resume.title}
                            </Link>
                            <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              Updated {formatRelativeTime(resume.updatedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant={resume.status === "COMPLETED" ? "success" : "default"} dot>
                            {resume.status || "DRAFT"}
                          </Badge>
                          <Link href={`/resume/${resume.id}`}>
                            <Button variant="ghost" size="icon-sm" leftIcon={Eye} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
