"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScaledResume, ResumePreviewSkeleton } from "./scaled-resume";
import { sampleResumeFor } from "@/lib/templates/normalize";
import { FONTS } from "@/lib/templates/design";
import { cn } from "@/lib/utils";
import { isPremiumUser } from "@/lib/templates/access";
import { useAuthStore } from "@/store";
import { useMediaQuery } from "@/hooks";
import { Heart, Sparkles, ArrowRight, FileText, Users, ThumbsUp, MousePointerClick, X } from "lucide-react";

/* ============================================================
   Template preview dialog.

   Desktop (md+): a clean large dialog. The live resume page is
   the dominant element on the left (~60%) — scaled to always show
   the full A4 page, centered on a subtle dot-grid sheet. Template
   details (name, category, description, stats, colors, typography)
   live in the right column (~40%) with a pinned "Use this template"
   CTA.

   Mobile (<md): a full-screen sheet with a safe-area-aware top bar
   (close, title, favorite), a large full-width resume, the template
   details below, and a sticky CTA that never leaves the screen.
   ============================================================ */

export function TemplatePreviewModal({ template, open, onOpenChange, onUse, isFavorite, onToggleFavorite }) {
  const [color, setColor] = useState(template?.design?.color || "#2563eb");
  const [font, setFont] = useState(template?.design?.font || "sans");
  const [darkMode, setDarkMode] = useState(Boolean(template?.design?.darkMode));
  const isMobile = useMediaQuery("(max-width: 767px)");

  const premium = isPremiumUser(useAuthStore((s) => s.user));

  useEffect(() => {
    if (!template) return;
    setColor(template.design?.color || "#2563eb");
    setFont(template.design?.font || "sans");
    setDarkMode(Boolean(template.design?.darkMode));
  }, [template]);

  const design = useMemo(() => {
    if (!template) return null;
    return { ...template.design, color, font, darkMode };
  }, [template, color, font, darkMode]);

  if (!template) return null;

  const sample = sampleResumeFor(template);
  const close = () => onOpenChange(false);
  const ctaLabel = template.isPremium && !premium ? "Unlock with Pro" : "Use this template";
  const ctaHint = template.isPremium
    ? "Includes full customization and PDF export."
    : "Free forever. No credit card required.";
  const favoritesEnabled = typeof onToggleFavorite === "function";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ overflow: "hidden" }}
        className={cn(
          // Mobile: full-screen sheet (allows the sheet itself to never scroll —
          // scrolling happens inside, so the sticky CTA stays reachable).
          "flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 overflow-hidden rounded-none border-border bg-paper p-0 pb-0",
          // sm+: centered modal, generous height so the page preview dominates.
          "sm:h-[min(92dvh,960px)] sm:max-h-[92dvh] sm:max-w-4xl sm:rounded-xl sm:p-0 sm:pb-0",
          "lg:max-w-[min(1200px,calc(100vw-3rem))]",
          "xl:max-w-[min(1280px,calc(100vw-4rem))]"
        )}
      >
        <DialogTitle className="sr-only">{template.name} preview</DialogTitle>
        <DialogDescription className="sr-only">
          Full-page preview of the {template.name} resume template.
        </DialogDescription>

        {/* ============ MOBILE HEADER (sheet top bar) ============ */}
        <header
          className="relative z-10 flex-none border-b border-border bg-paper md:hidden"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex h-14 items-center justify-between gap-2 px-2">
            <button
              type="button"
              onClick={close}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-alt hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-semibold text-ink">Template Preview</p>
              <p className="truncate text-[11px] text-muted-foreground">{template.category}</p>
            </div>

            {favoritesEnabled ? (
              <button
                type="button"
                onClick={() => onToggleFavorite(template)}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={isFavorite}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40"
              >
                <Heart className={cn("h-5 w-5 transition-colors", isFavorite ? "fill-flag text-flag" : "")} />
              </button>
            ) : (
              <span className="h-11 w-11 shrink-0" aria-hidden="true" />
            )}
          </div>
        </header>

        {/* ============ MAIN AREA ============ */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:flex-row md:overflow-hidden">
          {/* ---- LEFT: resume preview (the visual focus) ---- */}
          <section className="preview-sheet relative flex-none md:flex md:min-h-0 md:flex-1 md:flex-col">
            {/* Desktop close button */}
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-paper/90 text-ink-soft shadow-[0_2px_10px_-4px_rgba(15,23,42,0.35)] backdrop-blur transition-all hover:-translate-y-px hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/50 md:flex"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="md:flex md:min-h-0 md:flex-1 md:items-stretch">
              <div className="px-4 pb-8 pt-6 sm:px-6 md:min-h-0 md:flex-1 md:px-8 md:py-8 lg:px-10 lg:py-10">
                <ScaledResume
                  template={template}
                  data={sample}
                  design={design}
                  fit={!isMobile}
                  skeleton={<ResumePreviewSkeleton />}
                  className={cn(
                    // Mobile: full-width page (natural aspect) so it is as large
                    // as possible and the whole page is reachable by scrolling.
                    "mx-auto w-full max-w-[720px] rounded-sm shadow-2xl ring-1 ring-black/[0.05]",
                    // Desktop: scale to fit the preview pane — the full A4 page
                    // is always visible, centered, never cropped.
                    "md:h-full md:max-w-[880px]"
                  )}
                />
              </div>
            </div>
          </section>

          {/* ---- RIGHT: template information ---- */}
          <aside className="flex-none border-t border-border bg-paper md:flex md:min-h-0 md:w-[380px] md:shrink-0 md:flex-col md:border-l md:border-t-0 lg:w-[420px]">
            <div className="md:min-h-0 md:flex-1 md:overflow-y-auto">
              <div className="space-y-6 p-5 sm:p-6 lg:p-7">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {!premium &&
                          (template.isPremium ? (
                            <Badge variant="pro">
                              <Sparkles className="h-3 w-3" /> Pro template
                            </Badge>
                          ) : (
                            <Badge variant="success">Free template</Badge>
                          ))}
                      </div>
                      <h2 className="heading-display mt-2 text-2xl font-semibold leading-tight text-ink">{template.name}</h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">{template.category}</p>
                    </div>
                    {favoritesEnabled && (
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(template)}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        aria-pressed={isFavorite}
                        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-paper-alt text-ink-soft transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40 md:flex"
                      >
                        <Heart className={cn("h-[18px] w-[18px] transition-colors", isFavorite ? "fill-flag text-flag" : "")} />
                      </button>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-ink-soft">{template.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <Stat icon={FileText} label="Pages" value={`${template.pages} page${template.pages > 1 ? "s" : ""}`} />
                    <Stat icon={ThumbsUp} label="ATS score" value={`${template.atsScore}/100`} />
                    <Stat icon={Users} label="Popularity" value={`${template.popularity}%`} />
                    <Stat icon={MousePointerClick} label="Used by" value={`${Math.round(template.popularity * 1370).toLocaleString()} users`} />
                  </div>
                </div>

                <div className="space-y-6 border-t border-border/70 pt-6">
                  <div>
                    <span className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Colors</span>
                    <div className="flex flex-wrap gap-2.5">
                      {template.swatches.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={cn(
                            "h-11 w-11 rounded-full border-2 transition-transform hover:scale-110 md:h-9 md:w-9",
                            color === c ? "border-ink ring-2 ring-ink/20" : "border-border"
                          )}
                          style={{ background: c }}
                          aria-label={`Select color ${c}`}
                          aria-pressed={color === c}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Typography</span>
                    <div className="grid grid-cols-2 gap-2">
                      {template.fontOptions.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFont(f)}
                          className={cn(
                            "rounded-lg border px-3 py-3 text-left text-[13px] transition-colors md:py-2",
                            font === f
                              ? "border-stamp bg-stamp/5 text-ink"
                              : "border-border text-ink-soft hover:border-border-strong"
                          )}
                          style={{ fontFamily: FONTS[f]?.family }}
                          aria-pressed={font === f}
                        >
                          {FONTS[f]?.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {template.design?.darkMode !== undefined && (
                    <div>
                      <span className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Theme</span>
                      <div className="grid grid-cols-2 gap-2">
                        <ThemeButton active={!darkMode} onClick={() => setDarkMode(false)} label="Light" />
                        <ThemeButton active={darkMode} onClick={() => setDarkMode(true)} label="Dark" />
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="mb-2.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Best for</span>
                    <div className="flex flex-wrap gap-1.5">
                      {template.industries.map((ind) => (
                        <Badge key={ind} variant="outline">
                          {ind}
                        </Badge>
                      ))}
                      {template.jobTitles.slice(0, 3).map((jt) => (
                        <Badge key={jt} variant="default">
                          {jt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop CTA — pinned to the bottom of the info panel */}
            <div className="hidden flex-none flex-col gap-2.5 border-t border-border p-5 md:flex">
              <Button className="w-full" size="lg" leftIcon={ArrowRight} onClick={() => onUse?.(template)}>
                {ctaLabel}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{ctaHint}</p>
            </div>
          </aside>
        </div>

        {/* ============ MOBILE STICKY CTA ============ */}
        <footer className="flex-none border-t border-border bg-paper px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
          <Button className="w-full" size="lg" leftIcon={ArrowRight} onClick={() => onUse?.(template)}>
            {ctaLabel}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">{ctaHint}</p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-paper-alt p-3">
      <div className="flex items-center gap-1.5 text-ink-soft">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function ThemeButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-3 text-left text-[13px] transition-colors md:py-2",
        active ? "border-stamp bg-stamp/5 text-ink" : "border-border text-ink-soft hover:border-border-strong"
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
