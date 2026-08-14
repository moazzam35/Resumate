"use client";

import { motion } from "framer-motion";
import { Check, Download, Eye, PencilLine, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/**
 * Polished completion state shown after the user finishes their resume.
 * Consistent with the Resumate design (seal check, paper/ink/stamp tokens).
 */
export function ResumeCompleted({
  resume,
  isExporting = false,
  isComplete = false,
  hasUnsavedChanges = false,
  missingSections = [],
  onPreview,
  onExport,
  onEdit,
}) {
  if (!resume) return null;

  const title = resume.title || "My Resume";
  const exportDisabled = !isComplete;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="overflow-hidden rounded-3xl border border-border-strong bg-card shadow-md"
    >
      {/* ===== COMPLETED HERO ===== */}
      <motion.div
        variants={item}
        className="relative overflow-hidden border-b border-border bg-card px-5 pb-8 pt-10 text-center sm:px-8"
      >
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-stamp/5"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-seal/10"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
            <svg
              className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite]"
              viewBox="0 0 96 96"
              aria-hidden="true"
            >
              <circle
                cx="48"
                cy="48"
                r="44"
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
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-seal to-seal/85 text-paper shadow-md"
            >
              <Check className="h-8 w-8" strokeWidth={3} aria-hidden="true" />
            </motion.div>
          </div>

          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-verified">
            Resume completed
          </p>
          <h1 className="heading-display mt-2 text-2xl font-bold text-ink sm:text-3xl">
            Your resume is ready.
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Everything is saved. Preview it below, download your PDF, or jump
            back in to keep refining.
          </p>
        </div>
      </motion.div>

      <div className="space-y-4 p-5 sm:p-8">
        {/* ===== PRIMARY ACTIONS ===== */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <Button
            variant="secondary"
            size="lg"
            className="h-12 w-full sm:h-12"
            leftIcon={Eye}
            onClick={onPreview}
          >
            Preview Resume
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="gradient"
                  size="lg"
                  className="h-12 w-full sm:h-12"
                  leftIcon={Download}
                  disabled={exportDisabled || isExporting}
                  loading={isExporting}
                  onClick={onExport}
                >
                  Download PDF
                </Button>
              </TooltipTrigger>
              {exportDisabled && !isComplete && (
                <TooltipContent>
                  <p>Complete all required sections to download your PDF</p>
                  {missingSections.length > 0 && (
                    <p className="mt-1 text-xs text-paper/70">
                      Missing: {missingSections.join(", ")}
                    </p>
                  )}
                </TooltipContent>
              )}
              {exportDisabled && isComplete && hasUnsavedChanges && (
                <TooltipContent>
                  <p>Save your latest changes before downloading</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="secondary"
            size="lg"
            className="h-12 w-full sm:h-12"
            leftIcon={PencilLine}
            onClick={onEdit}
          >
            Edit Resume
          </Button>
        </motion.div>

        {/* ===== INCOMPLETE NOTE ===== */}
        {!isComplete && (
          <motion.div
            variants={item}
            className="flex items-start gap-2 rounded-xl border border-flag/25 bg-flag/5 px-3.5 py-3 text-[11px] leading-relaxed text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold">Almost there</p>
              <p className="mt-0.5">
                {missingSections.length > 0
                  ? `Missing: ${missingSections.join(", ")}`
                  : "Complete all required sections to download your PDF"}
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== STATUS ===== */}
        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-center gap-2 pt-1"
        >
          <Badge variant="success" dot>
            Completed
          </Badge>
          <span className="max-w-[260px] truncate text-[11px] font-medium text-muted-foreground">
            {title} · ready to download
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
