"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ResumeDocument } from "./template-renderer";
import { PAGE_SIZES, resolveDesign } from "@/lib/templates/design";
import { getTemplate } from "@/lib/templates/registry";
import { Skeleton } from "@/components/ui/skeleton";

function useContainerBox(ref) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setBox({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return box;
}

/**
 * Renders a live resume page scaled to fit its container.
 *
 * Default (fit = false) scales to container width and keeps the true page
 * aspect ratio — used for cards and thumbnails.
 *
 * fit = true scales to the smallest of width / height (never larger than the
 * page's natural size) and centers the page inside the container — used for
 * the full preview dialog so the whole page is always visible and readable.
 *
 * `skeleton` is rendered in place of the page while the container is being
 * measured, so the preview area never flashes empty.
 */
export function ScaledResume({
  template: templateOrId,
  data,
  design,
  colorTheme,
  className,
  style,
  fit = false,
  skeleton,
}) {
  const containerRef = useRef(null);
  const box = useContainerBox(containerRef);
  const template = getTemplate(templateOrId);
  const resolved = resolveDesign(template.id, design, colorTheme);
  const page = PAGE_SIZES[resolved.pageSize] || PAGE_SIZES.letter;

  const widthScale = box.width > 0 ? box.width / page.width : 0;
  const heightScale = box.height > 0 ? box.height / page.height : 0;
  const scale = fit
    ? Math.max(0, Math.min(widthScale, heightScale, 1))
    : widthScale;

  const fitted = fit && scale > 0;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={
        fit
          ? { minHeight: 0, ...style }
          : { aspectRatio: `${page.width} / ${page.height}`, ...style }
      }
    >
      {scale <= 0 && skeleton ? skeleton : null}
      {scale > 0 && (
        <div
          className="pointer-events-none absolute left-0 top-0 select-none"
          style={
            fitted
              ? {
                  left: "50%",
                  top: "50%",
                  width: page.width * scale,
                  height: page.height * scale,
                  transform: "translate(-50%, -50%)",
                }
              : undefined
          }
        >
          <ResumeDocument
            template={template}
            data={data}
            design={resolved}
            scale={scale}
            shadow={false}
          />
        </div>
      )}
    </div>
  );
}

export function ResumePreviewSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-sm bg-white p-[4%] shadow-[0_8px_24px_-10px_rgba(15,23,42,0.2)] ring-1 ring-black/[0.04]">
      <div className="flex w-full flex-col gap-[2.5%]">
        <div className="flex items-end justify-between gap-[6%]">
          <div className="flex w-2/5 flex-col gap-2">
            <Skeleton className="h-[14%] min-h-3 w-full" />
            <Skeleton className="h-[10%] min-h-2.5 w-3/5" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="mt-1 h-2.5 w-1/2" />
        <Skeleton className="mt-3 h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-3/4" />
        <div className="mt-4 h-px w-full bg-border/60" />
        <Skeleton className="mt-4 h-2.5 w-2/5" />
        <Skeleton className="mt-2 h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-5/6" />
        <div className="mt-4 h-px w-full bg-border/60" />
        <Skeleton className="mt-4 h-2.5 w-1/3" />
        <Skeleton className="mt-2 h-2 w-11/12" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-2/3" />
      </div>
    </div>
  );
}

export function MiniTemplateCard({ template, data, design, colorTheme, className, scale }) {
  const page = PAGE_SIZES[design?.pageSize || "letter"] || PAGE_SIZES.letter;
  return (
    <div
      className={cn("relative overflow-hidden rounded-sm bg-white", className)}
      style={{ aspectRatio: `${page.width} / ${page.height}` }}
    >
      <div className="absolute left-0 top-0">
        <ResumeDocument template={template} data={data} design={design} colorTheme={colorTheme} scale={scale} shadow={false} />
      </div>
    </div>
  );
}
