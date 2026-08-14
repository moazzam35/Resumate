"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  Eye,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { ScaledResume } from "./scaled-resume";
import { sampleResumeFor } from "@/lib/templates/normalize";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks";
import { cn } from "@/lib/utils";
import { isPremiumUser } from "@/lib/templates/access";
import { useAuthStore } from "@/store";

/* ============================================================
   Motion easing — calm, natural
   ============================================================ */
const EASE = [0.22, 1, 0.36, 1];

const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_4px_14px_-8px_rgba(15,23,42,0.12)]";
const CARD_HOVER_SHADOW =
  "shadow-[0_2px_6px_rgba(15,23,42,0.06),0_20px_40px_-20px_rgba(15,23,42,0.25)]";

/* ============================================================
   Free / Pro badge — small, tonal, calm
   ============================================================ */
function FreeProBadge({ isPremium }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur-sm",
        isPremium
          ? "bg-violet-600/10 text-violet-700 dark:text-violet-300"
          : "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"
      )}
    >
      {isPremium && <Sparkles className="h-3 w-3" />}
      {isPremium ? "Pro" : "Free"}
    </span>
  );
}

/* ============================================================
   Favorite button — quiet ghost
   ============================================================ */
function FavoriteButton({ isFavorite, onToggle }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      data-fav-btn
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border bg-paper/95 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40",
        isFavorite ? "border-flag/25 text-flag" : "border-border text-ink-soft hover:text-ink"
      )}
    >
      <Heart className={cn("h-3.5 w-3.5 transition-colors", isFavorite && "fill-flag")} />
    </button>
  );
}

/* ============================================================
   ATS score — small circular progress, single accent stroke
   ============================================================ */
function AtsRing({ score, accent }) {
  const progress = useMotionValue(0);
  useEffect(() => {
    const controls = animate(progress, score, { duration: 0.7, ease: EASE });
    return () => controls.stop();
  }, [progress, score]);

  const size = 46;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dashOffset = useTransform(progress, (v) => C * (1 - Math.min(100, Math.max(0, v)) / 100));
  const text = useTransform(progress, (v) => String(Math.round(v)));

  return (
    <div
      className="relative h-[46px] w-[46px] shrink-0"
      role="img"
      aria-label={`ATS score ${score} out of 100`}
      title={`ATS score ${score}/100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} strokeOpacity={0.5} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <motion.span className="text-[12px] font-semibold text-ink">{text}</motion.span>
        <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-wider text-muted">ATS</span>
      </div>
    </div>
  );
}

/* ============================================================
   Loading skeleton card
   ============================================================ */
export function TemplateCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-paper shadow-sm">
      <div className="relative aspect-[3/3.55] w-full overflow-hidden bg-paper-alt">
        <div className="absolute inset-x-5 top-5 bottom-5 flex items-start justify-center rounded-[2px] bg-paper shadow-[0_8px_24px_-10px_rgba(15,23,42,0.2)] ring-1 ring-black/[0.04]">
          <div className="mt-4 h-[85%] w-4/5 rounded-[2px] bg-border/50" />
        </div>
      </div>
      <div className="space-y-3 p-4 pt-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-[46px] w-[46px] rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-9 w-full rounded-[8px]" />
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Template card — clean, balanced, timeless
   ============================================================ */
export const TemplateCard = memo(function TemplateCard({
  template,
  onPreview,
  isFavorite,
  onToggleFavorite,
  index = 0,
}) {
  const [hovered, setHovered] = useState(false);
  const [previewMounted, setPreviewMounted] = useState(false);

  const premium = isPremiumUser(useAuthStore((s) => s.user));

  const sample = useMemo(() => sampleResumeFor(template), [template]);
  const [usedRecently] = useLocalStorage("used-templates", []);
  const recentlyUsed = usedRecently.includes(template.id);
  const accent = template.design?.color || "#2563eb";

  useEffect(() => {
    const t = setTimeout(() => setPreviewMounted(true), 350);
    return () => clearTimeout(t);
  }, []);

  const handlePreview = useCallback(() => onPreview?.(template), [onPreview, template]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: EASE, delay: (index % 12) * 0.03 }}
    >
      <motion.div
        role="group"
        aria-label={`${template.name} template`}
        data-tilt
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ y: hovered ? -4 : 0, scale: hovered ? 1.01 : 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-paper transition-shadow duration-300",
          hovered ? CARD_HOVER_SHADOW : CARD_SHADOW
        )}
      >
        {/* ============ RESUME PREVIEW ============ */}
        <div className="relative aspect-[3/3.55] w-full overflow-hidden bg-paper-alt">
          <div
            className="absolute inset-x-3 top-3 bottom-3 cursor-zoom-in"
            onClick={handlePreview}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePreview();
              }
            }}
            aria-label={`Preview the ${template.name} template`}
          >
            {/* paper */}
            <div data-paper className="relative flex h-full w-full items-start justify-center px-2 pt-3">
              <div className="relative w-full overflow-hidden rounded-[2px] bg-white shadow-[0_8px_24px_-10px_rgba(15,23,42,0.3)] ring-1 ring-black/[0.05]">
                <ScaledResume template={template.id} data={sample} design={template.design} />

                {/* paper fade-in while mounting */}
                <AnimatePresence>
                  {!previewMounted && (
                    <motion.div
                      className="absolute inset-0 z-10 bg-white"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* badges */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-2.5">
              {!premium && <FreeProBadge isPremium={template.isPremium} />}
              <div className="pointer-events-auto">
                <FavoriteButton isFavorite={isFavorite} onToggle={() => onToggleFavorite?.(template)} />
              </div>
            </div>
          </div>
        </div>

        {/* ============ INFO ============ */}
        <div className="flex flex-1 flex-col p-4 pt-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[15px] font-semibold text-ink">{template.name}</h3>
                {recentlyUsed && (
                  <Star className="h-3.5 w-3.5 shrink-0 fill-seal text-seal" aria-label="Recently used" />
                )}
              </div>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                {template.category}
              </p>
            </div>
            <AtsRing score={template.atsScore} accent={accent} />
          </div>

          <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{template.tagline}</p>

          <div className="mt-auto space-y-3 pt-3">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              leftIcon={Eye}
              onClick={handlePreview}
            >
              View resume / CV
            </Button>
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-verified" />
                ATS-friendly
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
                <TrendingUp className="h-3.5 w-3.5 text-stamp" />
                {template.popularity}% popular
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

export default TemplateCard;
