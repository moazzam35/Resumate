"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { resolveDesign } from "@/lib/templates/design";
import { getTemplate } from "@/lib/templates/registry";
import {
  ResumeDocument,
  buildTokens,
  SectionHeading,
  ClassicHeader,
  ModernHeader,
  HeroHeader,
  EditorialHeader,
  CreativeHeader,
  SkillCloud,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertItem,
  LanguageItem,
  AchievementItem,
  ReferenceItem,
  DEFAULT_SECTIONS,
} from "./template-renderer";

function useContainerWidth(ref) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

const HEADERS = {
  classic: ClassicHeader,
  modern: ModernHeader,
  hero: HeroHeader,
  editorial: EditorialHeader,
  creative: CreativeHeader,
};

const FULL_WIDTH_HEADER = new Set(["hero", "creative"]);

const ITEM_GAPS = {
  summary: 12,
  experience: 12,
  education: 10,
  skills: 10,
  projects: 10,
  certificates: 8,
  languages: 6,
  achievements: 8,
  references: 8,
};

function paginate(units, heights, limit) {
  const pages = [];
  let cur = [];
  let curH = 0;
  const flush = () => {
    if (cur.length) {
      pages.push(cur);
      cur = [];
      curH = 0;
    }
  };

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    const h = heights[i];

    if (u.kind === "header") {
      cur.push(u.id);
      curH = h;
      continue;
    }

    if (u.kind === "title") {
      let j = i + 1;
      let itemsTotal = 0;
      while (j < units.length && units[j].kind === "item") {
        itemsTotal += heights[j];
        j++;
      }
      const secTotal = h + itemsTotal;

      if (cur.length && curH + secTotal <= limit) {
        cur.push(u.id);
        curH += h;
        for (let k = i + 1; k < j; k++) {
          cur.push(units[k].id);
          curH += heights[k];
        }
        i = j - 1;
        continue;
      }

      if (secTotal <= limit) {
        flush();
        cur.push(u.id);
        curH = h;
        for (let k = i + 1; k < j; k++) {
          cur.push(units[k].id);
          curH += heights[k];
        }
        i = j - 1;
        continue;
      }

      const firstItemH = i + 1 < units.length ? heights[i + 1] : 0;
      if (!(cur.length && curH + h + firstItemH <= limit)) flush();
      cur.push(u.id);
      curH += h;
      for (let k = i + 1; k < j; k++) {
        if (curH + heights[k] > limit) flush();
        cur.push(units[k].id);
        curH += heights[k];
      }
      i = j - 1;
      continue;
    }

    if (curH + h > limit) flush();
    cur.push(u.id);
    curH += h;
  }

  flush();
  return pages.length ? pages : [[]];
}

export function MultiPageResume({
  template: templateOrId,
  data,
  design,
  colorTheme,
  sectionOrder,
  shadow = true,
  pageGap = 14,
  onPageCount,
  zoom = null,
  pageIndex = null,
  className,
  style,
}) {
  const containerRef = useRef(null);
  const measurerRef = useRef(null);
  const width = useContainerWidth(containerRef);
  const [layout, setLayout] = useState(null);
  const [fontsTick, setFontsTick] = useState(0);

  const template = getTemplate(templateOrId);
  const resolvedDesign = useMemo(
    () => resolveDesign(template.id, design, colorTheme),
    [template, design, colorTheme]
  );
  const tokens = buildTokens(template, resolvedDesign);
  const { page, margin, paper, ink, fontFamily, body, muted, hairline } = tokens;

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    document.fonts.ready.then(() => setFontsTick((t) => t + 1));
  }, []);

  const ordered = useMemo(() => {
    const order =
      Array.isArray(sectionOrder) && sectionOrder.length
        ? DEFAULT_SECTIONS.filter((s) => sectionOrder.includes(s.key))
        : DEFAULT_SECTIONS;
    return order.filter((s) => s.has(data));
  }, [data, sectionOrder]);

  const SectionTitle = useMemo(
    () => ({ children }) => <SectionHeading text={children} design={resolvedDesign} tokens={tokens} />,
    [resolvedDesign, tokens]
  );

  const flow = useMemo(() => {
    const units = [];
    const Header = HEADERS[template.archetype];
    if (Header) {
      units.push({
        id: "header",
        kind: "header",
        gap: tokens.gap,
        render: () => <Header data={data} tokens={tokens} />,
      });
    }
    const sectionBlocks = {
      summary: () => <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{data.summary}</p>,
      experience: () =>
        (data.experience || []).map((e) => <ExperienceItem key={e.id || e.position} e={e} tokens={tokens} />),
      education: () =>
        (data.education || []).map((e) => <EducationItem key={e.id || e.institution} e={e} tokens={tokens} />),
      skills: () => <SkillCloud skills={data.skills} tokens={tokens} variant="chips" />,
      projects: () =>
        (data.projects || []).map((pr) => <ProjectItem key={pr.id || pr.name} pr={pr} tokens={tokens} />),
      certificates: () =>
        (data.certificates || []).map((c) => <CertItem key={c.id} c={c} tokens={tokens} />),
      languages: () =>
        (data.languages || []).map((l) => <LanguageItem key={l.id || l.name} l={l} tokens={tokens} />),
      achievements: () =>
        (data.achievements || []).map((a) => <AchievementItem key={a.id || a.title} a={a} tokens={tokens} />),
      references: () =>
        (data.references || []).map((r) => <ReferenceItem key={r.id || r.name} r={r} tokens={tokens} />),
    };

    for (const sec of ordered) {
      units.push({
        id: `t-${sec.key}`,
        kind: "title",
        section: sec.key,
        gap: tokens.gap,
        render: () => <SectionTitle>{sec.title}</SectionTitle>,
      });
      const content = sectionBlocks[sec.key]();
      const list = Array.isArray(content) ? content : [content];
      const gap = ITEM_GAPS[sec.key] ?? 10;
      list.forEach((el, i) => {
        units.push({
          id: `i-${sec.key}-${i}`,
          kind: "item",
          section: sec.key,
          index: i,
          gap,
          render: () => el,
        });
      });
    }
    return units;
  }, [data, ordered, template, tokens, SectionTitle]);

  const isMultiColumn = template.archetype === "sidebar" || template.archetype === "split";

  useLayoutEffect(() => {
    if (isMultiColumn) return;
    const el = measurerRef.current;
    if (!el || !el.children.length) return;
    let heights;
    if (FULL_WIDTH_HEADER.has(template.archetype) && el.children.length > 1) {
      heights = [el.children[0].offsetHeight, ...Array.from(el.children[1].children).map((c) => c.offsetHeight)];
    } else {
      heights = Array.from(el.children[0].children).map((c) => c.offsetHeight);
    }
    heights = heights.map((h) => Math.round(h));
    const pages = paginate(flow, heights, page.height);
    const sig = JSON.stringify(pages.map((p) => p.join("|")));
    setLayout((prev) => (prev && prev.sig === sig ? prev : { sig, pages, pageCount: pages.length }));
  });

  useLayoutEffect(() => {
    if (isMultiColumn || !layout) return;
    onPageCount?.(layout.pageCount);
  }, [layout, isMultiColumn, onPageCount]);

  const scale = width > 0 ? width / page.width : 0;
  const isZoomed = typeof zoom === "number" && zoom > 0;
  const contentScale = isZoomed ? zoom / 100 : scale;
  const pageCount = layout ? layout.pageCount : 1;
  const stackHeight = pageIndex == null ? pageCount * page.height + (pageCount - 1) * pageGap : page.height;

  const byId = useMemo(() => new Map(flow.map((u) => [u.id, u])), [flow]);
  const mainPad =
    template.archetype === "editorial"
      ? margin + 8
      : FULL_WIDTH_HEADER.has(template.archetype)
        ? `0 ${margin}px ${margin}px`
        : margin;

  const renderPage = (ids) => {
    const known = ids.filter((id) => byId.has(id));
    const headerId = known.find((id) => byId.get(id)?.kind === "header");
    const mainIds = known.filter((id) => (byId.get(id)?.kind) !== "header");
    const headerUnit = headerId ? byId.get(headerId) : null;
    const mainNodes = mainIds.map((id) => {
      const u = byId.get(id);
      return (
        <div key={id} style={{ paddingBottom: u.gap }}>
          {u.render()}
        </div>
      );
    });

    if (headerUnit && FULL_WIDTH_HEADER.has(template.archetype)) {
      return (
        <>
          <div style={{ paddingBottom: headerUnit.gap }}>{headerUnit.render()}</div>
          <div style={{ padding: mainPad }}>{mainNodes}</div>
        </>
      );
    }
    return (
      <div style={{ padding: mainPad }}>
        {headerUnit && <div style={{ paddingBottom: headerUnit.gap }}>{headerUnit.render()}</div>}
        {mainNodes}
      </div>
    );
  };

  const pageStyle = {
    width: page.width,
    height: page.height,
    background: paper,
    color: ink,
    fontFamily,
    fontSize: body,
    lineHeight: tokens.lineHeight,
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
    contentVisibility: "auto",
    containIntrinsicSize: `${page.width}px ${page.height}px`,
    boxShadow: shadow ? "0 24px 48px -16px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.08)" : "none",
  };

  const renderStack = () => (
    <div
      style={{
        width: page.width,
        height: stackHeight,
        transform: `scale(${contentScale})`,
        transformOrigin: "top left",
        display: "flex",
        flexDirection: "column",
        gap: pageGap,
      }}
    >
      {(layout?.pages ?? []).map((ids, pi) => {
        if (pageIndex != null && pi !== pageIndex) return null;
        return (
        <div key={pi} style={{ ...pageStyle }}>
          {renderPage(ids)}
          {(layout?.pages?.length ?? 0) > 1 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: Math.round(margin * 0.32),
                textAlign: "center",
                fontFamily,
                fontSize: Math.max(8, Math.round(body * 0.6)),
                color: muted,
                letterSpacing: "0.05em",
                lineHeight: 1,
              }}
            >
              <div
                style={{
                  height: 1,
                  width: "24%",
                  margin: "0 auto 5px",
                  background: hairline,
                }}
              />
              <span>
                {[data.personal?.name, `Page ${pi + 1} of ${layout.pages.length}`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          )}
        </div>
        );
      })}
    </div>
  );

  if (isMultiColumn) {
    return (
      <div ref={containerRef} className={cn("relative w-full", className)} style={style}>
        {scale > 0 && (
          <div className="absolute left-0 top-0 pointer-events-none select-none" style={{ width: page.width * scale }}>
            <ResumeDocument template={template} data={data} design={resolvedDesign} scale={scale} shadow={false} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)} style={style}>
      <div
        ref={measurerRef}
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: -20000,
          width: page.width,
          background: paper,
          color: ink,
          fontFamily,
          fontSize: body,
          lineHeight: tokens.lineHeight,
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        {renderPage(flow.map((u) => u.id))}
      </div>

      {isZoomed ? (
        contentScale > 0 && layout && (
          <div
            className="overflow-auto overscroll-contain"
            style={{
              width: "100%",
              maxHeight: "100%",
              touchAction: "pan-x pan-y",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              style={{
                width: page.width * contentScale,
                height: stackHeight * contentScale,
                position: "relative",
              }}
            >
              {renderStack()}
            </div>
          </div>
        )
      ) : (
        contentScale > 0 &&
        layout && (
          <div style={{ width: page.width * contentScale, height: stackHeight * contentScale }}>
            {renderStack()}
          </div>
        )
      )}
    </div>
  );
}
