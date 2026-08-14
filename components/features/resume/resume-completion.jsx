"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import {
  Download,
  Check,
  CheckCircle2,
  FileText,
  Clock,
  LayoutTemplate,
  Palette,
  PencilLine,
  ShieldCheck,
  FileHeart,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { getTemplate } from "@/lib/templates/registry";
import { formatRelativeTime, cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const statStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

function ProgressRing({ value, size = 64, stroke = 6 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useMotionValue(0);
  const dashOffset = useTransform(
    progress,
    (v) => circumference * (1 - Math.min(100, Math.max(0, v)) / 100)
  );
  const label = useTransform(progress, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    const controls = animate(progress, value, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [progress, value]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--verified)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span className="text-[13px] font-bold tabular-nums text-ink">
          {label}
        </motion.span>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, sub }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="rounded-xl border border-border bg-paper px-3 py-3 transition-colors hover:border-stamp/30 hover:shadow-md"
    >
      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-soft">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-1.5 truncate text-sm font-bold text-ink" title={value}>
        {value}
      </p>
      {sub && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

function NextStepRow({ icon: Icon, label, sub, onClick, last = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-paper-alt",
        !last && "border-b border-border"
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-paper text-stamp">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-ink">{label}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{sub}</span>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}

export function ResumeCompletion({
  resume,
  resumeId,
  pageCount = 1,
  completedCount = 0,
  totalSections = 0,
  hasUnsavedChanges = false,
  isSaving = false,
  isExporting = false,
  isComplete = false,
  missingSections = [],
  lastSaved = null,
  onFinish,
  onExport,
  onEdit,
  onPickTemplate,
  onCustomizeDesign,
  onAtsCheck,
}) {
  if (!resume) return null;

  const template = getTemplate(resume.template);
  const atsScore = resume.atsScore;
  const exportDisabled = !isComplete || hasUnsavedChanges;
  const pct = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
  const pagesLabel = pageCount === 1 ? "page" : "pages";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="overflow-hidden rounded-2xl border border-border-strong bg-card shadow-md lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto"
    >
      {/* ===== APPROVED DOCUMENT HERO ===== */}
      <motion.div
        variants={item}
        className="relative overflow-hidden border-b border-border bg-card px-5 pb-6 pt-7"
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-stamp/5"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-8 -bottom-10 h-24 w-24 rounded-full bg-seal/10"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
            <svg
              className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite]"
              viewBox="0 0 80 80"
              aria-hidden="true"
            >
              <circle
                cx="40"
                cy="40"
                r="37"
                fill="none"
                stroke="var(--seal)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>
            <motion.div
              initial={{ scale: 0, rotate: -24 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-seal to-seal/85 text-stamp shadow-md"
            >
              <Check className="h-7 w-7" strokeWidth={3} aria-hidden="true" />
            </motion.div>
          </div>

          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-seal">
            Document approved
          </p>
          <h3 className="heading-display mt-1.5 text-xl font-bold text-ink">Your resume is ready</h3>
          <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
            Review the live preview below, then finish your resume to unlock
            PDF export.
          </p>
        </div>
      </motion.div>

      <div className="space-y-5 p-5">
        {/* ===== COMPLETION STATUS ===== */}
        <motion.div variants={item} className="flex items-center gap-4 rounded-xl border border-border bg-paper p-4">
          <ProgressRing value={pct} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">
              {completedCount} of {totalSections} sections
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isComplete ? "bg-verified" : "bg-seal"
                )}
                aria-hidden="true"
              />
              {isComplete
                ? "Complete — ready to export"
                : `${missingSections.length} required ${missingSections.length === 1 ? "area" : "areas"} remaining`}
            </p>
          </div>
        </motion.div>

        {/* ===== INCOMPLETE WARNING ===== */}
        {!isComplete && missingSections.length > 0 && (
          <motion.div
            variants={item}
            className="flex items-start gap-2 rounded-xl border border-flag/25 bg-flag/5 px-3.5 py-3"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag" aria-hidden="true" />
            <div className="min-w-0 text-[11px] leading-relaxed text-destructive">
              <p className="font-semibold">Almost there</p>
              <p className="mt-0.5">Missing: {missingSections.join(", ")}</p>
            </div>
          </motion.div>
        )}

        {/* ===== STATS ===== */}
        <motion.div variants={statStagger} className="grid grid-cols-2 gap-2.5">
          <StatTile icon={LayoutTemplate} label="Template" value={template?.name || "Modern"} />
          <StatTile
            icon={FileText}
            label="Pages"
            value={`${pageCount}`}
            sub={pagesLabel}
          />
          <StatTile
            icon={Clock}
            label="Last saved"
            value={lastSaved ? formatRelativeTime(lastSaved) : "Not yet"}
            sub={lastSaved ? lastSaved.toLocaleString() : "Save your progress"}
          />
          <StatTile
            icon={ShieldCheck}
            label="ATS score"
            value={atsScore != null ? `${atsScore}%` : "—"}
            sub={atsScore != null ? (atsScore >= 80 ? "Strong match" : atsScore >= 60 ? "Room to grow" : "Needs work") : "Not scored yet"}
          />
        </motion.div>

        {/* ===== PRIMARY ACTIONS ===== */}
        <motion.div variants={item} className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="gradient"
                  size="lg"
                  className="btn-shine relative w-full overflow-hidden"
                  onClick={onExport}
                  disabled={exportDisabled || isExporting}
                  loading={isExporting}
                  leftIcon={Download}
                >
                  Download PDF
                </Button>
              </TooltipTrigger>
              {exportDisabled && !isComplete && (
                <TooltipContent>
                  <p>Complete all required sections to export your PDF</p>
                  {missingSections.length > 0 && (
                    <p className="mt-1 text-xs text-paper/70">
                      Missing: {missingSections.join(", ")}
                    </p>
                  )}
                </TooltipContent>
              )}
              {exportDisabled && isComplete && hasUnsavedChanges && (
                <TooltipContent>
                  <p>Save your latest changes before exporting</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onFinish}
            loading={isSaving}
            leftIcon={CheckCircle2}
          >
            Save &amp; Finish
          </Button>

          <div className="flex items-center justify-between px-1 pt-0.5">
            {hasUnsavedChanges ? (
              <Badge variant="warning" dot>
                Unsaved changes
              </Badge>
            ) : (
              <Badge variant="success" dot>
                All changes saved
              </Badge>
            )}
            <span className="text-[11px] font-medium text-muted-foreground">
              ATS-friendly output
            </span>
          </div>
        </motion.div>

        {/* ===== NEXT STEPS ===== */}
        <motion.div variants={item}>
          <p className="mb-2 px-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            Keep going
          </p>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <NextStepRow icon={PencilLine} label="Edit resume" sub="Refine any section" onClick={onEdit} />
            <NextStepRow icon={LayoutTemplate} label="Change template" sub="Try a different layout" onClick={onPickTemplate} />
            <NextStepRow icon={Palette} label="Customize design" sub="Colors, fonts, spacing" onClick={onCustomizeDesign} />
            <NextStepRow icon={ShieldCheck} label="Run ATS check" sub="Score against job keywords" onClick={onAtsCheck} />
            <Link
              href={`/cover-letter/new?resumeId=${resumeId}`}
              className="group flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-paper-alt"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-paper text-stamp">
                <FileHeart className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">Create cover letter</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  A tailored letter in minutes
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
