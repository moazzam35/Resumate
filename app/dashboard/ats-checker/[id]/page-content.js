"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Award,
  Gauge,
  RotateCcw,
  RefreshCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function ScoreRing({ score }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * score));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [score]);

  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const toneColor =
    score >= 80 ? "var(--color-verified)" : score >= 60 ? "var(--color-seal)" : "var(--color-flag)";

  return (
    <div className="relative h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-muted)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={toneColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="heading-display text-5xl font-semibold tracking-tight">{current}</span>
        <span className="mt-1 text-xs font-medium text-muted">ATS Score</span>
      </div>
    </div>
  );
}

function ComponentBar({ label, value, tone = "stamp", note }) {
  const tones = {
    stamp: "bg-stamp",
    verified: "bg-verified",
    seal: "bg-seal",
    flag: "bg-flag",
  };
  const barTone = tones[tone] || "bg-stamp";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm text-ink-soft">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-ink">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barTone}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {note && <p className="mt-1.5 text-xs leading-relaxed text-muted">{note}</p>}
    </div>
  );
}

function KeywordGroup({ title, items, variant, icon: Icon, emptyText, dashed = false }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted" />}
        <span className="text-sm font-semibold text-ink">{title}</span>
        <Badge variant={variant} className="ml-auto rounded-sm">
          {items.length}
        </Badge>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((k) => (
            <Badge
              key={k}
              variant={variant}
              className="rounded-md px-2.5 py-1 text-xs font-medium normal-case"
            >
              {k}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">{emptyText}</p>
      )}
      {dashed && <div className="mt-3 border-t border-dashed border-border" />}
    </div>
  );
}

function SuggestionItem({ item, index, isOpen, onToggle }) {
  const config =
    item.priority === "critical"
      ? { badge: "danger", icon: XCircle, color: "bg-flag/10 text-flag" }
      : item.priority === "high"
        ? { badge: "warning", icon: AlertTriangle, color: "bg-seal/10 text-seal" }
        : item.priority === "medium"
          ? { badge: "primary", icon: AlertTriangle, color: "bg-stamp/10 text-stamp" }
          : { badge: "default", icon: CheckCircle2, color: "bg-paper-alt text-muted" };
  const Icon = config.icon;

  return (
    <div className="rounded-md border border-border transition-colors hover:bg-paper-alt/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={config.badge} className="rounded-sm">
              {item.priority}
            </Badge>
            {item.source === "ai" && <Badge variant="ai">AI</Badge>}
            {item.category && (
              <span className="text-xs font-medium text-ink-soft">{item.category}</span>
            )}
          </div>
          <p className="mt-1.5 text-sm font-medium text-ink leading-relaxed">{item.problem}</p>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center">
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border px-4 py-3">
              {item.reason && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted">Why it matters</p>
                  <p className="text-sm leading-relaxed text-muted">{item.reason}</p>
                </div>
              )}
              {item.example && (
                <div className="rounded-md border border-border bg-paper-alt/60 p-3">
                  <p className="mb-1 text-xs font-semibold text-muted">Example fix</p>
                  <p className="text-sm leading-relaxed text-ink-soft">{item.example}</p>
                </div>
              )}
              {item.expectedImprovement && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-verified" />
                  <span className="text-xs font-medium text-verified">
                    Expected: {item.expectedImprovement}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="rounded-md border-border">
        <CardContent className="flex flex-col items-center gap-8 py-8 lg:flex-row lg:items-center lg:justify-center">
          <Skeleton className="h-36 w-36 rounded-full" />
          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ATSResultPage({ id }) {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [openItems, setOpenItems] = useState(() => new Set());
  const [loadStatus, setLoadStatus] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    setLoadStatus(null);
    setResult(null);

    async function load() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/ats-score/${id}`, {
          method: "GET",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (cancelled) return;
        if (res.status === 404) {
          setLoadStatus(404);
          setLoadError("ATS analysis not found");
        } else if (!res.ok) {
          setLoadStatus(res.status);
          let message = "We couldn't load this ATS analysis.";
          try {
            const errData = await res.json();
            if (errData && (errData.message || errData.error)) {
              message = errData.message || errData.error;
            }
          } catch {
            // Non-JSON error body; keep the default message.
          }
          setLoadError(message);
        } else {
          const data = await res.json();
          if (cancelled) return;
          if (data.success) {
            setResult(data.data);
          } else {
            setLoadStatus(res.status);
            setLoadError(data.message || "We couldn't load this ATS analysis.");
          }
        }
      } catch {
        if (!cancelled) setLoadError("An error occurred while loading this result.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  const retry = () => setRetryCount((count) => count + 1);

  const toggleItem = useCallback((index) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  if (isLoading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <PageHeader title="ATS Result" description="Loading your ATS analysis…" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ResultSkeleton />
        </motion.div>
      </motion.div>
    );
  }

  if (loadError || !result) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <PageHeader title="ATS Result" description="Your ATS analysis result." />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="rounded-md border-border">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <AlertTriangle className="h-8 w-8 text-flag" />
              <p className="text-sm font-medium text-ink">
                {loadError || "This ATS result could not be found."}
              </p>
              <p className="text-xs text-muted">
                {loadStatus === 404
                  ? "This analysis doesn't exist. It may have been deleted."
                  : loadStatus === 401 || loadStatus === 403
                    ? "You don't have access to this analysis, or your session has expired."
                    : "An error occurred while loading this analysis. Please try again."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" onClick={retry}>
                  <RefreshCcw className="mr-1.5 h-4 w-4" /> Retry
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard/ats-checker")}>
                  <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to ATS Checker
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  const suggestions =
    result.suggestions?.map((s) =>
      typeof s === "string"
        ? { priority: "medium", problem: s, source: "engine" }
        : s
    ) || [];

  const sortedSuggestions = [...suggestions].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  );

  const keywordGroups = result.keywords || {
    matched: [],
    missing: result.missingKeywords || [],
    recommended: [],
    bonus: [],
  };

  const breakdown = result.components
    ? [
        { key: "jobMatch", label: "Job Match", tone: "verified" },
        { key: "skills", label: "Skills Match", tone: "verified" },
        { key: "experience", label: "Experience Quality", tone: "stamp" },
        { key: "projects", label: "Projects", tone: "stamp" },
        { key: "formatting", label: "Formatting & Structure", tone: "stamp" },
        { key: "education", label: "Education", tone: "stamp" },
        { key: "grammar", label: "Grammar & Readability", tone: "stamp" },
        { key: "achievements", label: "Quantified Achievements", tone: "verified" },
      ]
    : [];

  const breakdownWeights = result.weights || {};
  const hasWeightData = Object.keys(breakdownWeights).length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted hover:text-ink"
          onClick={() => router.push("/dashboard/ats-checker")}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to ATS Checker
        </Button>
        {result.createdAt && (
          <span className="text-xs text-muted">
            Analyzed {new Date(result.createdAt).toLocaleString()}
          </span>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <PageHeader
          title="ATS Analysis"
          description="Your resume compatibility score and detailed breakdown."
        />
      </motion.div>

      {/* Top score dashboard */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-md border-border">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
              <div className="flex flex-col items-center gap-4">
                <ScoreRing score={result.score} />
                <div className="flex flex-col items-center gap-1.5">
                  <Badge
                    variant={
                      result.verdict?.pass
                        ? "success"
                        : result.verdict?.tone === "warning"
                          ? "warning"
                          : "danger"
                    }
                    className="rounded-md px-3 py-1 text-xs"
                  >
                    {result.verdict?.label || "No Verdict"}
                  </Badge>
                  <span className="text-xs text-muted">
                    {result.verdict?.pass
                      ? "This resume is ATS-friendly for the target role."
                      : "Keep optimizing to pass ATS screening."}
                  </span>
                </div>
              </div>

              <div className="w-full min-w-0 flex-1">
                <p className="max-w-2xl text-sm leading-relaxed text-muted">
                  {result.overallFeedback}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-md border border-border bg-paper-alt/30 p-3.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Keyword Match
                    </p>
                    <p className="heading-display text-xl font-semibold text-ink">
                      {result.matchPercentage != null ? `${result.matchPercentage}%` : "—"}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-paper-alt/30 p-3.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Strength
                    </p>
                    <p className="heading-display text-xl font-semibold text-ink">
                      {result.strength || "—"}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-paper-alt/30 p-3.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Critical Issues
                    </p>
                    <p className="heading-display text-xl font-semibold text-ink">
                      {result.issues?.critical ?? 0}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-paper-alt/30 p-3.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Words
                    </p>
                    <p className="heading-display text-xl font-semibold text-ink">
                      {result.metrics?.wordCount?.toLocaleString() ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Priority improvements + AI suggestions */}
          <Card className="rounded-md border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stamp/10">
                  <Sparkles className="h-4 w-4 text-stamp" />
                </div>
                Priority Improvements
                <Badge variant="primary" className="ml-1 rounded-sm">
                  {sortedSuggestions.length}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted">
                Expand each item to see why it matters, a concrete example fix, and the expected ATS impact.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedSuggestions.length > 0 ? (
                sortedSuggestions.map((item, index) => (
                  <SuggestionItem
                    key={index}
                    item={item}
                    index={index}
                    isOpen={openItems.has(index)}
                    onToggle={() => toggleItem(index)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted">
                  No suggestions — your resume looks well-optimized.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recruiter tips */}
          {result.recruiterTips?.length > 0 && (
            <Card className="rounded-md border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stamp/10">
                    <Lightbulb className="h-4 w-4 text-stamp" />
                  </div>
                  Recruiter Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {result.recruiterTips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-md border border-border bg-paper-alt/30 px-4 py-2.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                    <p className="text-sm leading-relaxed text-ink-soft">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Missing keywords */}
          <Card className="rounded-md border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-seal/10">
                  <XCircle className="h-4 w-4 text-seal" />
                </div>
                Missing Keywords
                <Badge variant="warning" className="ml-1 rounded-sm">
                  {keywordGroups.missing.length}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted">
                Keywords from the job description that are absent from your resume.
              </p>
            </CardHeader>
            <CardContent>
              {keywordGroups.missing.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywordGroups.missing.map((kw) => (
                    <Badge
                      key={kw}
                      variant="warning"
                      className="rounded-md px-3 py-1 text-xs font-medium normal-case"
                    >
                      {kw}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No missing keywords detected.</p>
              )}
            </CardContent>
          </Card>

          {/* Weak sections */}
          {result.weakSections?.length > 0 && (
            <Card className="rounded-md border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-flag/10">
                    <AlertTriangle className="h-4 w-4 text-flag" />
                  </div>
                  Weak Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {result.weakSections.map((section, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-seal/20 bg-seal/5 px-4 py-2.5 text-sm leading-relaxed text-muted"
                  >
                    {section}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Keyword analysis */}
          <Card className="rounded-md border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stamp/10">
                  <Gauge className="h-4 w-4 text-stamp" />
                </div>
                Keyword Analysis
              </CardTitle>
              <p className="text-xs text-muted">
                {keywordGroups.matched.length} of{" "}
                {keywordGroups.matched.length + keywordGroups.missing.length} job keywords found
                {result.matchPercentage != null ? ` (${result.matchPercentage}% match)` : ""}.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <KeywordGroup
                title="Matched"
                items={keywordGroups.matched}
                variant="success"
                icon={CheckCircle2}
                emptyText="No keywords matched yet."
              />
              <KeywordGroup
                title="Missing"
                items={keywordGroups.missing}
                variant="warning"
                icon={XCircle}
                emptyText="No missing keywords."
              />
              <KeywordGroup
                title="Recommended to Add"
                items={keywordGroups.recommended}
                variant="primary"
                icon={Sparkles}
                emptyText="No recommended additions."
              />
              <KeywordGroup
                title="Bonus Signals"
                items={keywordGroups.bonus}
                variant="ai"
                icon={TrendingUp}
                emptyText="No bonus signals."
              />
            </CardContent>
          </Card>

          {/* ATS breakdown */}
          <Card className="rounded-md border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-verified/10">
                  <Award className="h-4 w-4 text-verified" />
                </div>
                ATS Breakdown
              </CardTitle>
              <p className="text-xs text-muted">
                How each factor contributes to your overall score.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {breakdown.map((b) => (
                <ComponentBar
                  key={b.key}
                  label={b.label}
                  value={result.components[b.key] || 0}
                  tone={b.tone}
                  note={result.explanations?.[b.key]}
                />
              ))}
              {hasWeightData && (
                <p className="border-t border-border pt-3 text-xs text-muted">
                  Weights:{" "}
                  {breakdown
                    .filter((b) => breakdownWeights[b.key])
                    .map((b) => `${b.label} ${Math.round(breakdownWeights[b.key] * 100)}%`)
                    .join(" · ")}
                </p>
              )}
              {result.modifiers?.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="mb-1.5 text-xs font-semibold text-ink-soft">
                    Score Adjustments
                  </p>
                  {result.modifiers.map((m, i) => (
                    <p key={i} className="text-xs leading-relaxed text-muted">
                      {m.desc} <span className="font-medium text-ink-soft">{m.amount}</span>
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <Card className="rounded-md border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-verified/10">
                    <CheckCircle2 className="h-4 w-4 text-verified" />
                  </div>
                  What&apos;s Working
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {result.strengths.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-md border border-verified/20 bg-verified/5 px-4 py-2.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                    <p className="text-sm leading-relaxed text-ink-soft">{s}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-3 py-2 sm:flex-row">
        <Button
          size="lg"
          variant="outline"
          leftIcon={RefreshCcw}
          onClick={() => router.push("/dashboard/ats-checker")}
        >
          Improve Resume
        </Button>
        <Button
          size="lg"
          leftIcon={RotateCcw}
          onClick={() => router.push("/dashboard/ats-checker")}
        >
          Re-check ATS
        </Button>
      </motion.div>
    </motion.div>
  );
}
