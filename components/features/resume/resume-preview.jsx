"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, FileText, ZoomIn, ZoomOut, Maximize, ArrowLeft, ArrowRight } from "lucide-react";
import { useResumeStore } from "@/store";
import { useMediaQuery } from "@/hooks";
import { MultiPageResume } from "@/components/features/templates/multi-page-resume";
import { normalizeResume } from "@/lib/templates/normalize";
import { TEMPLATES } from "@/lib/templates/registry";
import { FONTS, PAGE_SIZES, resolveDesign } from "@/lib/templates/design";
import { put } from "@/lib/api";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 50;
const MAX_ZOOM = 250;

export function ResumePreview({ resume: resumeProp, resumeId, onPageCountChange, designOpen: designOpenProp, onToggleDesign }) {
  const currentResume = useResumeStore((s) => s.currentResume);
  const setCurrentResume = useResumeStore((s) => s.setCurrentResume);
  const resume = resumeProp || currentResume;
  const [designOpenInternal, setDesignOpenInternal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [viewZoom, setViewZoom] = useState("fit");
  const [fitPct, setFitPct] = useState(45);
  const [pageSide, setPageSide] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const saveTimer = useRef(null);
  const areaRef = useRef(null);
  const viewerRef = useRef(null);
  const pinchRef = useRef(null);

  const isZoomed = typeof viewZoom === "number";

  const data = useMemo(() => normalizeResume(resume), [resume]);
  const resolvedDesign = useMemo(
    () => (resume ? resolveDesign(resume.template, resume.design, resume.colorTheme) : null),
    [resume]
  );
  const template = TEMPLATES.find((t) => t.id === resume?.template);

  // Measure the fit-to-width scale so pinch gestures start from a sane baseline.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const measure = () => {
      const cs = window.getComputedStyle(el);
      const contentW = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const page = PAGE_SIZES[resolvedDesign?.pageSize || "letter"] || PAGE_SIZES.letter;
      if (contentW > 0) setFitPct(Math.round((contentW / page.width) * 100));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [resolvedDesign]);

  // Never point at a back page that no longer exists after content changes.
  useEffect(() => {
    if (pageCount > 0 && pageSide > pageCount - 1) setPageSide(0);
  }, [pageCount, pageSide]);

  // Pinch-to-zoom on touch devices (non-passive move listener so we can
  // prevent the browser's default pinch behaviour inside the viewer).
  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !isZoomed) return;
    const onStart = (e) => {
      if (e.touches.length === 2) {
        const [t1, t2] = e.touches;
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        pinchRef.current = {
          dist,
          zoom: typeof viewZoom === "number" ? viewZoom : fitPct,
        };
      }
    };
    const onMove = (e) => {
      const st = pinchRef.current;
      if (!st || e.touches.length !== 2) return;
      e.preventDefault();
      const [t1, t2] = e.touches;
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (dist > 0) {
        const next = Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, st.zoom * (dist / st.dist))));
        setViewZoom(next);
      }
    };
    const onEnd = () => {
      pinchRef.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [isZoomed, viewZoom, fitPct]);

  // Clear any pending autosave timer on unmount so a leaked timeout can't
  // fire a stale request (and can't call setState on an unmounted component).
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewZoom((z) => (typeof z === "number" ? Math.max(MIN_ZOOM, z - 25) : Math.max(MIN_ZOOM, fitPct - 25)));
  }, [fitPct]);

  const handleZoomIn = useCallback(() => {
    setViewZoom((z) => (typeof z === "number" ? Math.min(MAX_ZOOM, z + 25) : 100));
  }, []);

  const designOpen = designOpenProp ?? designOpenInternal;
  const handleToggleDesign = () => {
    if (onToggleDesign) {
      onToggleDesign(!designOpen);
    } else {
      setDesignOpenInternal(!designOpen);
    }
  };

  const handlePageCount = (count) => {
    setPageCount(count);
    onPageCountChange?.(count);
  };

  const persistDesign = (patch) => {
    if (!resume || !resumeId) return;
    const nextDesign = { ...(resume.design || {}), ...patch };
    const payload = { design: nextDesign };
    if (patch.color) payload.colorTheme = patch.color;
    setCurrentResume({ ...resume, design: nextDesign, ...(payload.colorTheme ? { colorTheme: payload.colorTheme } : {}) });
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await put(`/resumes/${resumeId}`, payload);
      } catch {
        // silent — autosave
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No resume data to preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-border bg-paper text-stamp">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              {template?.name || "Modern"} template
            </p>
            <p className="text-xs text-muted-foreground">
              {saving ? "Saving design…" : "Live preview with your data — switch templates anytime."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleDesign}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-[8px] border px-3.5 text-[13px] font-medium transition-colors",
            designOpen ? "border-stamp bg-stamp/5 text-stamp" : "border-border text-ink-soft hover:text-ink"
          )}
        >
          <Palette className="h-3.5 w-3.5" />
          Customize
        </button>
      </div>

      <AnimatePresence>
        {designOpen && resolvedDesign && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-paper p-4">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Color</p>
                  <div className="flex items-center gap-2">
                    {(template?.swatches || ["#2563eb"]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => persistDesign({ color: c })}
                        className={cn(
                          "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                          (resolvedDesign.color || "").toLowerCase() === c.toLowerCase()
                            ? "border-ink ring-2 ring-ink/20"
                            : "border-border"
                        )}
                        style={{ background: c }}
                        aria-label={c}
                      />
                    ))}
                    <label className="flex h-7 items-center gap-1 rounded-full border border-dashed border-border px-2 text-[10px] text-muted-foreground">
                      Custom
                      <input
                        type="color"
                        value={resolvedDesign.color}
                        onChange={(e) => persistDesign({ color: e.target.value })}
                        className="h-4 w-4 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Font</p>
                  <div className="flex gap-2">
                    {Object.entries(FONTS).map(([key, f]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => persistDesign({ font: key })}
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                          resolvedDesign.font === key ? "border-stamp bg-stamp/5 text-ink" : "border-border text-ink-soft"
                        )}
                        style={{ fontFamily: f.family }}
                        title={f.label}
                      >
                        Aa
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Spacing</p>
                  <div className="flex gap-2">
                    {["compact", "comfortable", "spacious"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => persistDesign({ spacing: s })}
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 text-[11px] capitalize transition-colors",
                          resolvedDesign.spacing === s ? "border-stamp bg-stamp/5 text-ink" : "border-border text-ink-soft"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Page</p>
                  <div className="flex gap-2">
                    {["letter", "a4"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => persistDesign({ pageSize: s })}
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 text-[11px] uppercase transition-colors",
                          resolvedDesign.pageSize === s ? "border-stamp bg-stamp/5 text-ink" : "border-border text-ink-soft"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-verified" />
                  Saved automatically
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE ZOOM TOOLBAR — Fit Width / 100% / + / − */}
      <div className="flex flex-wrap items-center gap-2 md:hidden">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-paper p-1">
          <button
            type="button"
            onClick={() => setViewZoom("fit")}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors",
              !isZoomed ? "bg-stamp text-paper" : "text-ink-soft hover:text-ink"
            )}
          >
            <Maximize className="h-3.5 w-3.5" />
            Fit width
          </button>
          <button
            type="button"
            onClick={() => setViewZoom(100)}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold tabular-nums transition-colors",
              viewZoom === 100 ? "bg-stamp text-paper" : "text-ink-soft hover:text-ink"
            )}
          >
            100%
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-xl border border-border bg-paper p-1">
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-ink"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-11 text-center text-xs font-mono tabular-nums text-muted-foreground">
            {isZoomed ? `${viewZoom}%` : "Fit"}
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-ink"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <motion.div
        ref={areaRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="preview-sheet relative overflow-x-auto rounded-2xl border border-border-strong shadow-md p-4 sm:p-6"
      >
        <div className={cn("mx-auto", isZoomed ? "max-w-none" : "max-w-[680px]")}>
          {isZoomed ? (
            <div ref={viewerRef} className="h-[62dvh] min-h-[420px]">
              <MultiPageResume
                template={resume.template}
                data={data}
                design={resume.design}
                colorTheme={resume.colorTheme}
                onPageCount={handlePageCount}
                zoom={viewZoom}
                className={cn("rounded-sm", isZoomed && "h-full")}
              />
            </div>
          ) : isDesktop ? (
            <MultiPageResume
              template={resume.template}
              data={data}
              design={resume.design}
              colorTheme={resume.colorTheme}
              onPageCount={handlePageCount}
              className="rounded-sm"
            />
          ) : (
            /* MOBILE — one page at a time, full width, no empty gap */
            <>
              <MultiPageResume
                template={resume.template}
                data={data}
                design={resume.design}
                colorTheme={resume.colorTheme}
                onPageCount={handlePageCount}
                pageIndex={Math.min(pageSide, Math.max(0, pageCount - 1))}
                className="rounded-sm"
              />

              {pageCount > 1 && (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPageSide((s) => Math.max(0, s - 1))}
                    disabled={pageSide <= 0}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-paper px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-paper-alt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </button>
                  <span className="min-w-[64px] text-center text-[12px] font-medium tabular-nums text-muted-foreground">
                    {pageSide + 1} / {pageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPageSide((s) => Math.min(pageCount - 1, s + 1))}
                    disabled={pageSide >= pageCount - 1}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-paper px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-paper-alt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mt-3 flex items-center justify-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
              <FileText className="h-3.5 w-3.5" />
              <motion.span
                key={pageCount}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center tabular-nums"
              >
                {pageCount} {pageCount === 1 ? "page" : "pages"}
              </motion.span>
            </span>
            {isZoomed && (
              <span className="hidden text-[10px] text-muted-foreground sm:inline">
                Pinch to zoom · drag to pan
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
