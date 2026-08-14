"use client";

import Link from "next/link";
import { FileText, Sparkles, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLAN_LABEL = { FREE: "Free", PRO: "Pro", ENTERPRISE: "Enterprise" };

function pct(used, total) {
  if (!Number.isFinite(total) || total <= 0) return 100;
  return Math.min(100, Math.round((used / total) * 100));
}

/**
 * Shows the current plan's resume + AI credit counters.
 * - Free: counters with an Upgrade prompt (only shown at a limit).
 * - Pro: counters, no upgrade prompt.
 * - Enterprise: renders nothing.
 */
export function UsageCounter({ className, showUpgrade = true }) {
  const {
    plan,
    isFree,
    isPro,
    isEnterprise,
    resumeCount,
    resumeLimit,
    aiCreditsUsed,
    aiCreditsTotal,
    atResumeLimit,
    atAiLimit,
  } = useSubscription();

  if (isEnterprise) return null;
  if (!isFree && !isPro) return null;

  const showResume = Number.isFinite(resumeLimit);
  const showAi = Number.isFinite(aiCreditsTotal);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-paper-alt/60 p-3 space-y-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
          Plan usage
        </span>
        <Badge variant={isFree ? "outline" : "pro"}>{PLAN_LABEL[plan]}</Badge>
      </div>

      {showResume && (
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 text-muted">
              <FileText className="h-3 w-3" />
              Resumes
            </span>
            <span className="tabular-nums text-ink font-medium">
              {resumeCount} / {resumeLimit}
            </span>
          </div>
          <Progress
            value={pct(resumeCount, resumeLimit)}
            className={cn(atResumeLimit && "opacity-80")}
          />
          {isFree && atResumeLimit && showUpgrade && (
            <Link
              href="/dashboard/upgrade"
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-stamp hover:underline"
            >
              <TrendingUp className="h-3 w-3" />
              Upgrade to create more
            </Link>
          )}
        </div>
      )}

      {showAi && (
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="flex items-center gap-1 text-muted">
              <Sparkles className="h-3 w-3" />
              AI credits
            </span>
            <span className="tabular-nums text-ink font-medium">
              {aiCreditsUsed} / {aiCreditsTotal}
            </span>
          </div>
          <Progress
            value={pct(aiCreditsUsed, aiCreditsTotal)}
            className={cn(atAiLimit && "opacity-80")}
          />
          {isFree && atAiLimit && showUpgrade && (
            <Link
              href="/dashboard/upgrade"
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-stamp hover:underline"
            >
              <TrendingUp className="h-3 w-3" />
              Upgrade for more AI
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
