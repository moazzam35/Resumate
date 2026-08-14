"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanSearch,
  Sparkles,
  Loader2,
  Target,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/store";
import { post } from "@/lib/api";

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

function ComponentBar({ label, value, tone = "stamp" }) {
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
    </div>
  );
}

function KeywordGroup({ title, items, variant, icon: Icon, emptyText }) {
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
            <Badge key={k} variant={variant} className="rounded-md px-2.5 py-1 text-xs font-medium normal-case">
              {k}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">{emptyText}</p>
      )}
    </div>
  );
}

function SuggestionItem({ item, isOpen, onToggle }) {
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
            {item.category && <span className="text-xs font-medium text-ink-soft">{item.category}</span>}
          </div>
          <p className="mt-1.5 text-sm font-medium text-ink leading-relaxed">{item.problem}</p>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center">
          {isOpen ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
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
                  <span className="text-xs font-medium text-verified">Expected: {item.expectedImprovement}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col items-center gap-8 py-4 sm:flex-row sm:items-center">
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
      </div>
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
    </motion.div>
  );
}

export function AtsScoreStep({ resume, resumeId, onGenerateTool, onChecked }) {
  const showToast = useUIStore((s) => s.showToast);
  const [jobDescription, setJobDescription] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [openItems, setOpenItems] = useState(() => new Set());

  const toggleItem = useCallback((index) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const handleCheck = useCallback(async () => {
    if (!resumeId || isChecking) return;
    setIsChecking(true);
    setError(null);
    try {
      const res = await post("/ats-score", {
        resumeId,
        jobDescription: jobDescription.trim() || undefined,
      });
      const data = res?.data;
      if (!data) throw new Error(res?.message || "No analysis returned");
      setResult(data);
      setOpenItems(new Set());
      if (onChecked) onChecked(data).catch(() => {});
      showToast({ message: `ATS Score: ${data.score}/100`, type: "success" });
    } catch (err) {
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }, [resumeId, isChecking, jobDescription, onChecked, showToast]);

  const suggestions = (result?.suggestions || []).map((s) =>
    typeof s === "string" ? { priority: "medium", problem: s, source: "engine" } : s
  );
  const sortedSuggestions = [...suggestions].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  );
  const criticalIssues = suggestions.filter((s) => s.priority === "critical").length;

  const keywordGroups = result?.keywords || {
    matched: [],
    missing: result?.missingKeywords || [],
    recommended: [],
    bonus: [],
  };

  const breakdown = result?.components
    ? [
        { key: "jobMatch", label: "Job Match", tone: "verified" },
        { key: "skills", label: "Skills Match", tone: "verified" },
        { key: "experience", label: "Experience Quality", tone: "stamp" },
        { key: "projects", label: "Projects", tone: "stamp" },
        { key: "formatting", label: "Formatting & Structure", tone: "stamp" },
        { key: "education", label: "Education", tone: "stamp" },
        { key: "grammar", label: "Grammar & Readability", tone: "stamp" },
        { key: "achievements", label: "Quantified Achievements", tone: "verified" },
      ].filter((c) => result.components[c.key] != null)
    : [];

  const strengths = Array.isArray(result?.strengths) ? result.strengths : [];
  const recruiterTips = Array.isArray(result?.recruiterTips) ? result.recruiterTips : [];

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-transparent md:border md:bg-card">
        <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-stamp" /> ATS Score
            </CardTitle>
            <CardDescription>
              Check how well your resume passes applicant tracking systems
            </CardDescription>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={Sparkles}
              className="flex-1 sm:flex-initial"
              onClick={() => onGenerateTool?.("ATS_KEYWORDS")}
            >
              AI Optimize
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 sm:flex-initial"
              leftIcon={result ? RefreshCcw : ScanSearch}
              onClick={handleCheck}
              loading={isChecking}
            >
              {result ? "Re-run Check" : "Run ATS Check"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0 md:px-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted" />
              <span className="text-sm font-semibold text-ink">Job Description</span>
              <Badge variant="outline" className="rounded-sm">
                Optional
              </Badge>
            </div>
            <Textarea
              aria-label="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description to score keyword match against a specific role. Leave empty for a general ATS check."
              className="min-h-[96px] resize-none rounded-md border-border transition-all focus:border-stamp/50 focus:ring-stamp/20"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-flag/30 bg-flag/5 p-4 text-sm text-flag">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isChecking && !result && <ResultsSkeleton />}

      {result && !isChecking && (
        <div className="space-y-6">
          {/* Score summary */}
          <div className="rounded-md border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-10">
              <div className="flex flex-col items-center gap-3">
                <ScoreRing score={result.score} />
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
              </div>
              <div className="w-full min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-muted">
                  {result.overallFeedback}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-md border border-border bg-paper-alt/30 p-3.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Keyword Match</p>
                    <p className="heading-display text-xl font-semibold text-ink">
                      {result.matchPercentage != null ? `${result.matchPercentage}%` : "—"}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-paper-alt/30 p-3.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Strength</p>
                    <p className="heading-display text-xl font-semibold text-ink">{result.strength || "—"}</p>
                  </div>
                  <div className="rounded-md border border-border bg-paper-alt/30 p-3.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Critical Issues</p>
                    <p className="heading-display text-xl font-semibold text-ink">{criticalIssues}</p>
                  </div>
                  <div className="rounded-md border border-border bg-paper-alt/30 p-3.5">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Words</p>
                    <p className="heading-display text-xl font-semibold text-ink">
                      {result.metrics?.wordCount?.toLocaleString() ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Keyword match */}
            <div className="space-y-6">
              <div className="rounded-md border border-border bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-ink">Keyword Match</h3>
                <div className="space-y-5">
                  <KeywordGroup
                    title="Matched"
                    items={keywordGroups.matched || []}
                    variant="success"
                    icon={CheckCircle2}
                    emptyText="No matched keywords yet"
                  />
                  <KeywordGroup
                    title="Missing"
                    items={keywordGroups.missing || []}
                    variant="danger"
                    icon={XCircle}
                    emptyText="No missing keywords — great!"
                  />
                  <KeywordGroup
                    title="Recommended"
                    items={keywordGroups.recommended || []}
                    variant="primary"
                    icon={Lightbulb}
                    emptyText="No recommendations"
                  />
                  <KeywordGroup
                    title="Bonus"
                    items={keywordGroups.bonus || []}
                    variant="ai"
                    icon={Sparkles}
                    emptyText="No bonus keywords"
                  />
                </div>
              </div>

              {breakdown.length > 0 && (
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">Section Breakdown</h3>
                  <div className="space-y-4">
                    {breakdown.map((c) => (
                      <ComponentBar
                        key={c.key}
                        label={c.label}
                        value={result.components[c.key]}
                        tone={c.tone}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions & tips */}
            <div className="space-y-6">
              {sortedSuggestions.length > 0 && (
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="mb-4 text-sm font-semibold text-ink">
                    Improvements
                    <span className="ml-2 text-xs font-normal text-muted">{sortedSuggestions.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {sortedSuggestions.map((s, index) => (
                      <SuggestionItem
                        key={index}
                        item={s}
                        isOpen={openItems.has(index)}
                        onToggle={() => toggleItem(index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {strengths.length > 0 && (
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="mb-3 text-sm font-semibold text-ink">Strengths</h3>
                  <ul className="space-y-2">
                    {strengths.map((s, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recruiterTips.length > 0 && (
                <div className="rounded-md border border-border bg-card p-5">
                  <h3 className="mb-3 text-sm font-semibold text-ink">Recruiter Tips</h3>
                  <ul className="space-y-2">
                    {recruiterTips.map((t, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-seal" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-paper-alt/30 p-4">
            <p className="text-sm text-muted">
              Want personalized fixes applied straight to your resume?
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={Sparkles}
              onClick={() => onGenerateTool?.("ATS_KEYWORDS")}
            >
              Open AI Assistant
            </Button>
          </div>
        </div>
      )}

      {!result && !isChecking && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <ShieldCheck className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">No ATS check yet</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
            Run a check to see how your resume scores across formatting, keywords,
            and content. Your latest score appears in the header badge.
          </p>
        </div>
      )}

      {isChecking && result && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating score…
        </div>
      )}
    </div>
  );
}
