import React from "react";
import {
  FONTS,
  SPACING_PX,
  MARGINS,
  PAGE_SIZES,
  resolveDesign,
  withAlpha,
  contrastColor,
  scaleFont,
} from "@/lib/templates/design";
import { getTemplate, ARCHETYPES } from "@/lib/templates/registry";
import { formatDate } from "@/lib/templates/normalize";

const ICONS = {
  email: "✉",
  phone: "✆",
  location: "◎",
  linkedin: "in",
  github: "⌥",
  portfolio: "⊕",
  website: "◎",
};

function contactItems(data) {
  const p = data.personal || {};
  const items = [];
  if (p.email) items.push({ key: "email", label: p.email });
  if (p.phone) items.push({ key: "phone", label: p.phone });
  if (p.location) items.push({ key: "location", label: p.location });
  if (p.linkedin) items.push({ key: "linkedin", label: p.linkedin });
  if (p.github) items.push({ key: "github", label: p.github });
  if (p.portfolio) items.push({ key: "portfolio", label: p.portfolio });
  if (p.website) items.push({ key: "website", label: p.website });
  return items;
}

function initialsOf(name) {
  return (name || "·")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Avatar({ name, accent, ink, r = 44, fontSize = 20 }) {
  return (
    <div
      style={{
        width: r,
        height: r,
        borderRadius: r,
        background: accent,
        color: contrastColor(accent),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize,
        fontFamily: FONTS.sans.family,
        flexShrink: 0,
      }}
    >
      {initialsOf(name)}
    </div>
  );
}

function hasList(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

export function buildTokens(template, design) {
  const page = PAGE_SIZES[design.pageSize] || PAGE_SIZES.letter;
  const margin = MARGINS[design.margins] || MARGINS.normal;
  const spacing = SPACING_PX[design.spacing] || SPACING_PX.comfortable;

  const accent = design.color || "#2563eb";
  const dark = Boolean(design.darkMode);
  const ink = dark ? "#f4f1ea" : "#1c1917";
  const muted = dark ? "#b8b3a9" : "#6b645c";
  const paper = dark ? "#11100d" : "#ffffff";
  const hairline = dark ? "rgba(244,241,234,0.18)" : "rgba(28,25,23,0.14)";

  const fontFamily = FONTS[design.font]?.family || FONTS.sans.family;
  const body = Math.round(scaleFont(13.5, design) * 10) / 10;
  const namePx = Math.round(scaleFont(30, design) * 10) / 10;
  const titlePx = Math.round(scaleFont(15, design) * 10) / 10;
  const sectionPx = Math.round(scaleFont(13.5, design) * 10) / 10;

  return {
    accent,
    ink,
    muted,
    paper,
    hairline,
    dark,
    fontFamily,
    body,
    namePx,
    titlePx,
    sectionPx,
    page,
    margin: margin.px,
    gap: spacing.sectionGap,
    lineHeight: spacing.line,
  };
}

export function ResumeDocument({
  template: templateOrId,
  data,
  design: userDesign,
  colorTheme,
  scale = 1,
  sectionOrder,
  shadow = true,
  style,
}) {
  const template = getTemplate(templateOrId);
  const design = resolveDesign(template.id, userDesign, colorTheme);
  const tokens = buildTokens(template, design);
  const { page, paper, ink, fontFamily, body, margin } = tokens;

  const SectionTitle = ({ children }) => <SectionHeading text={children} design={design} tokens={tokens} />;

  const Sheet = ({ children, innerStyle }) => (
    <div
      style={{
        width: page.width,
        height: page.height,
        background: paper,
        color: ink,
        fontFamily,
        fontSize: body,
        lineHeight: tokens.lineHeight,
        overflow: "hidden",
        position: "relative",
        boxShadow: shadow ? "0 24px 48px -16px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.08)" : "none",
        ...innerStyle,
      }}
    >
      {children}
    </div>
  );

  const layouts = {
    [ARCHETYPES.CLASSIC]: () => (
      <Sheet innerStyle={{ padding: margin }}>
        <ClassicHeader data={data} tokens={tokens} />
        {renderMain(data, tokens, SectionTitle, "classic", sectionOrder, design)}
      </Sheet>
    ),
    [ARCHETYPES.MODERN]: () => (
      <Sheet innerStyle={{ padding: margin }}>
        <ModernHeader data={data} tokens={tokens} />
        {renderMain(data, tokens, SectionTitle, "modern", sectionOrder, design)}
      </Sheet>
    ),
    [ARCHETYPES.SIDEBAR]: () => (
      <SidebarLayout data={data} tokens={tokens} SectionTitle={SectionTitle} sectionOrder={sectionOrder} />
    ),
    [ARCHETYPES.HERO]: () => (
      <Sheet>
        <HeroHeader data={data} tokens={tokens} />
        <div style={{ padding: `0 ${margin}px ${margin}px` }}>
          {renderMain(data, tokens, SectionTitle, "hero", sectionOrder, design)}
        </div>
      </Sheet>
    ),
    [ARCHETYPES.EDITORIAL]: () => (
      <Sheet innerStyle={{ padding: margin + 8 }}>
        <EditorialHeader data={data} tokens={tokens} />
        {renderMain(data, tokens, SectionTitle, "editorial", sectionOrder, design)}
      </Sheet>
    ),
    [ARCHETYPES.SPLIT]: () => (
      <SplitLayout data={data} tokens={tokens} SectionTitle={SectionTitle} sectionOrder={sectionOrder} />
    ),
    [ARCHETYPES.CREATIVE]: () => (
      <Sheet>
        <CreativeHeader data={data} tokens={tokens} />
        <div style={{ padding: `0 ${margin}px ${margin}px` }}>
          {renderMain(data, tokens, SectionTitle, "creative", sectionOrder, design)}
        </div>
      </Sheet>
    ),
  };

  const content = layouts[template.archetype] ? layouts[template.archetype]() : layouts[ARCHETYPES.MODERN]();

  return (
    <div
      className="resume-document"
      style={{
        width: page.width,
        height: page.height,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
        flexShrink: 0,
        ...style,
      }}
    >
      {content}
    </div>
  );
}

export function SectionHeading({ text, design, tokens }) {
  const { accent, ink, muted, hairline, sectionPx, fontFamily } = tokens;
  const styleMap = {
    accent: (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ width: 4, height: 16, background: accent, borderRadius: 2, flexShrink: 0 }} />
        <span style={{ fontSize: sectionPx, fontWeight: 700, letterSpacing: 0.2, color: ink, textTransform: "uppercase" }}>
          {text}
        </span>
      </div>
    ),
    underline: (
      <div
        style={{
          fontSize: sectionPx,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: ink,
          borderBottom: `2px solid ${accent}`,
          paddingBottom: 4,
          marginBottom: 10,
        }}
      >
        {text}
      </div>
    ),
    rule: (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: sectionPx, fontWeight: 700, color: ink, textTransform: "uppercase", letterSpacing: 1 }}>
          {text}
        </span>
        <span style={{ flex: 1, height: 1, background: hairline }} />
      </div>
    ),
    caps: (
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            fontSize: sectionPx - 1.5,
            fontWeight: 600,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 2.4,
          }}
        >
          {text}
        </span>
        <div style={{ height: 1, background: hairline, marginTop: 5 }} />
      </div>
    ),
    pill: (
      <div style={{ display: "inline-block", marginBottom: 10 }}>
        <span
          style={{
            display: "inline-block",
            fontSize: sectionPx - 1,
            fontWeight: 700,
            color: contrastColor(accent),
            background: accent,
            padding: "3px 12px",
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {text}
        </span>
      </div>
    ),
  };
  return styleMap[design.sectionStyle] || styleMap.accent;
}

function ContactRow({ data, tokens, align = "center", separator = "·", light = false }) {
  const items = contactItems(data);
  if (!items.length) return null;
  const color = light ? "rgba(255,255,255,0.85)" : tokens.muted;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "2px 10px",
        justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        fontSize: Math.round(tokens.body * 0.86 * 10) / 10,
        color,
        marginTop: 8,
      }}
    >
      {items.map((it, i) => (
        <React.Fragment key={it.key}>
          {i > 0 && <span style={{ color: tokens.accent }}>{separator}</span>}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: tokens.accent, fontWeight: 600 }}>{it.key === "linkedin" ? "in" : "•"}</span>
            {it.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export function ClassicHeader({ data, tokens }) {
  const p = data.personal || {};
  return (
    <div style={{ marginBottom: tokens.gap }}>
      <h1 style={{ fontSize: tokens.namePx, fontWeight: 700, color: tokens.ink, margin: 0, letterSpacing: -0.5 }}>
        {p.name || "Your Name"}
      </h1>
      {p.title && (
        <div style={{ fontSize: tokens.titlePx, color: tokens.accent, fontWeight: 600, marginTop: 3 }}>{p.title}</div>
      )}
      <ContactRow data={data} tokens={tokens} align="left" />
    </div>
  );
}

export function ModernHeader({ data, tokens }) {
  const p = data.personal || {};
  return (
    <div style={{ textAlign: "center", marginBottom: tokens.gap }}>
      {data.showAvatar && p.name && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <Avatar name={p.name} accent={tokens.accent} ink={tokens.ink} />
        </div>
      )}
      <h1 style={{ fontSize: tokens.namePx, fontWeight: 700, color: tokens.ink, margin: 0, letterSpacing: -0.5 }}>
        {p.name || "Your Name"}
      </h1>
      {p.title && (
        <div
          style={{
            display: "inline-block",
            marginTop: 5,
            fontSize: tokens.titlePx,
            color: tokens.accent,
            fontWeight: 600,
            padding: "2px 14px",
            border: `1.5px solid ${tokens.accent}`,
            borderRadius: 20,
          }}
        >
          {p.title}
        </div>
      )}
      <ContactRow data={data} tokens={tokens} align="center" />
    </div>
  );
}

export function HeroHeader({ data, tokens }) {
  const p = data.personal || {};
  const c = contrastColor(tokens.accent);
  return (
    <div style={{ background: tokens.accent, color: c, padding: `${tokens.margin * 0.9}px ${tokens.margin}px`, marginBottom: tokens.gap }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar name={p.name} accent="rgba(255,255,255,0.18)" ink={c} r={52} fontSize={24} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: tokens.namePx + 2, fontWeight: 700, margin: 0, letterSpacing: -0.5, color: c }}>
            {p.name || "Your Name"}
          </h1>
          {p.title && (
            <div style={{ fontSize: tokens.titlePx, fontWeight: 600, opacity: 0.95, marginTop: 2 }}>{p.title}</div>
          )}
        </div>
      </div>
      <ContactRow data={data} tokens={{ ...tokens, accent: "rgba(255,255,255,0.9)", muted: "rgba(255,255,255,0.85)" }} align="left" />
    </div>
  );
}

export function EditorialHeader({ data, tokens }) {
  const p = data.personal || {};
  const serif = FONTS.serif.family;
  return (
    <div style={{ textAlign: "center", marginBottom: tokens.gap, paddingTop: 4 }}>
      <div style={{ height: 1, background: tokens.accent, width: "100%" }} />
      <h1
        style={{
          fontSize: tokens.namePx + 2,
          fontWeight: 600,
          margin: "12px 0 4px",
          color: tokens.ink,
          fontFamily: serif,
          letterSpacing: 1.5,
        }}
      >
        {p.name || "Your Name"}
      </h1>
      {p.title && (
        <div
          style={{
            fontSize: Math.round(tokens.titlePx * 0.92),
            color: tokens.accent,
            letterSpacing: 3.5,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {p.title}
        </div>
      )}
      <ContactRow data={data} tokens={tokens} align="center" />
      <div style={{ height: 1, background: tokens.accent, width: "100%", marginTop: 10 }} />
    </div>
  );
}

export function CreativeHeader({ data, tokens }) {
  const p = data.personal || {};
  const c = contrastColor(tokens.accent);
  return (
    <div style={{ background: tokens.ink, color: tokens.paper, padding: `${tokens.margin * 0.9}px ${tokens.margin}px`, marginBottom: tokens.gap }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: tokens.accent,
            color: c,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 22,
            transform: "rotate(-6deg)",
          }}
        >
          {initialsOf(p.name)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: tokens.namePx + 2, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>{p.name || "Your Name"}</h1>
          <div style={{ fontSize: tokens.titlePx, fontWeight: 600, color: tokens.accent }}>{p.title}</div>
        </div>
        <div style={{ fontSize: 40, color: tokens.accent, opacity: 0.5, fontWeight: 700, transform: "rotate(12deg)" }}>
          ✦
        </div>
      </div>
      <ContactRow data={data} tokens={{ ...tokens, accent: tokens.accent, muted: "rgba(244,241,234,0.75)" }} align="left" />
    </div>
  );
}

function SidebarLayout({ data, tokens, SectionTitle, sectionOrder }) {
  const sidebarBg = tokens.dark ? "#1a1815" : tokens.accent;
  const sidebarFg = tokens.dark ? tokens.ink : contrastColor(tokens.accent);
  const sidebarMuted = tokens.dark ? tokens.muted : withAlpha(sidebarFg, 0.82);
  const sbTokens = { ...tokens, accent: sidebarFg, ink: sidebarFg, muted: sidebarMuted, hairline: withAlpha(sidebarFg, 0.25) };
  const width = Math.round(tokens.page.width * 0.32);

  const sbSection = (title, children, force = true) =>
    force && children ? (
      <div style={{ marginBottom: tokens.gap }}>
        <div
          style={{
            fontSize: Math.round(tokens.sectionPx * 0.95),
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            color: sidebarFg,
            borderBottom: `1px solid ${withAlpha(sidebarFg, 0.3)}`,
            paddingBottom: 4,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        {children}
      </div>
    ) : null;

  const p = data.personal || {};
  const skills = hasList(data.skills);
  const langs = hasList(data.languages);
  const certs = hasList(data.certificates);
  const contactItemsList = contactItems(data);

  return (
    <div style={{ display: "flex", width: tokens.page.width, height: tokens.page.height, overflow: "hidden", background: tokens.paper, color: tokens.ink }}>
      <div style={{ width, background: sidebarBg, color: sidebarFg, padding: tokens.margin, flexShrink: 0, overflow: "hidden" }}>
        <div style={{ textAlign: "center", marginBottom: tokens.gap }}>
          <div style={{ fontSize: tokens.namePx * 0.72, fontWeight: 700, lineHeight: 1.25 }}>{p.name || "Your Name"}</div>
          {p.title && <div style={{ fontSize: Math.round(tokens.titlePx * 0.9), fontWeight: 600, marginTop: 4, color: sidebarFg, opacity: 0.95 }}>{p.title}</div>}
        </div>
        {sbSection("Contact", contactItemsList.map((it) => <ContactItem key={it.key} it={it} tokens={sbTokens} />))}
        {sbSection("Skills", <SkillCloud skills={data.skills} tokens={sbTokens} variant="sidebar" />, skills)}
        {hasList(data.languages) && sbSection("Languages", data.languages.map((l) => <LanguageItem key={l.id || l.name} l={l} tokens={sbTokens} variant="sidebar" />), langs)}
        {hasList(data.certificates) && sbSection("Certifications", data.certificates.map((c) => <CertItem key={c.id} c={c} tokens={sbTokens} variant="sidebar" />), certs)}
      </div>
      <div style={{ flex: 1, padding: tokens.margin, overflow: "hidden" }}>
        {data.summary && (
          <div style={{ marginBottom: tokens.gap }}>
            <SectionTitle>Summary</SectionTitle>
            <p style={{ margin: 0, color: tokens.ink, whiteSpace: "pre-wrap" }}>{data.summary}</p>
          </div>
        )}
        {renderMain(data, tokens, SectionTitle, "sidebar", sectionOrder, null, {
          skipSummary: true,
          skipSections: ["skills", "languages", "certificates"],
        })}
      </div>
    </div>
  );
}

function SplitLayout({ data, tokens, SectionTitle, sectionOrder }) {
  const leftW = Math.round(tokens.page.width * 0.62);
  const rightW = tokens.page.width - leftW;
  const p = data.personal || {};

  const col = (content, bg) => (
    <div style={{ width: content === "left" ? leftW : rightW, background: bg, padding: tokens.margin, overflow: "hidden" }}>
      {content === "left" ? <LeftCol /> : <RightCol />}
    </div>
  );

  const LeftCol = () => (
    <>
      <div style={{ marginBottom: tokens.gap }}>
        <h1 style={{ fontSize: tokens.namePx, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>{p.name || "Your Name"}</h1>
        <div style={{ fontSize: tokens.titlePx, color: tokens.accent, fontWeight: 600, marginTop: 2 }}>{p.title}</div>
      </div>
      {data.summary && (
        <div style={{ marginBottom: tokens.gap }}>
          <SectionTitle>Profile</SectionTitle>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{data.summary}</p>
        </div>
      )}
      {renderMain(data, tokens, SectionTitle, "split", sectionOrder, null, {
        skipSummary: true,
        skipSections: ["skills", "languages", "certificates", "projects"],
      })}
    </>
  );

  const RightCol = () => (
    <>
      <div style={{ marginBottom: tokens.gap }}>
        <SectionTitle>Contact</SectionTitle>
        {contactItems(data).map((it) => (
          <div key={it.key} style={{ marginBottom: 6 }}>
            <span style={{ color: tokens.accent, fontWeight: 600, fontSize: Math.round(tokens.body * 0.82) }}>{it.key.toUpperCase()}</span>
            <div style={{ color: tokens.muted }}>{it.label}</div>
          </div>
        ))}
      </div>
      {hasList(data.skills) && (
        <div style={{ marginBottom: tokens.gap }}>
          <SectionTitle>Skills</SectionTitle>
          <SkillCloud skills={data.skills} tokens={tokens} variant="split" />
        </div>
      )}
      {hasList(data.languages) && (
        <div style={{ marginBottom: tokens.gap }}>
          <SectionTitle>Languages</SectionTitle>
          {data.languages.map((l) => <LanguageItem key={l.id || l.name} l={l} tokens={tokens} />)}
        </div>
      )}
      {hasList(data.certificates) && (
        <div style={{ marginBottom: tokens.gap }}>
          <SectionTitle>Certifications</SectionTitle>
          {data.certificates.map((c) => <CertItem key={c.id} c={c} tokens={tokens} />)}
        </div>
      )}
      {hasList(data.projects) && (
        <div style={{ marginBottom: tokens.gap }}>
          <SectionTitle>Projects</SectionTitle>
          {data.projects.map((pr) => <ProjectItem key={pr.id} pr={pr} tokens={tokens} variant="split" />)}
        </div>
      )}
    </>
  );

  return (
    <div style={{ display: "flex", width: tokens.page.width, height: tokens.page.height, background: tokens.paper, color: tokens.ink }}>
      {col("left", tokens.paper)}
      {col("right", tokens.dark ? "#1a1815" : "#faf8f4")}
    </div>
  );
}

function ContactItem({ it, tokens }) {
  return (
    <div style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "flex-start", fontSize: Math.round(tokens.body * 0.86) }}>
      <span style={{ color: tokens.accent, fontWeight: 700, flexShrink: 0 }}>•</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</span>
    </div>
  );
}

export function SkillCloud({ skills, tokens, variant = "chips" }) {
  const chip =
    variant === "sidebar"
      ? { display: "block", padding: "2px 0", fontSize: Math.round(tokens.body * 0.86) }
      : {
          display: "inline-block",
          padding: "3px 9px",
          borderRadius: 20,
          background: withAlpha(tokens.accent, 0.12),
          color: tokens.ink,
          border: `1px solid ${withAlpha(tokens.accent, 0.3)}`,
          margin: "0 5px 6px 0",
          fontSize: Math.round(tokens.body * 0.86),
        };
  return (
    <div>
      {skills.map((s, i) => (
        <span key={s.id || s.name + i} style={{ ...chip, color: variant === "sidebar" ? tokens.ink : chip.color, fontWeight: 500 }}>
          {s.name}
        </span>
      ))}
    </div>
  );
}

export function LanguageItem({ l, tokens, variant }) {
  const name = typeof l === "string" ? l : l.name;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
      <span style={{ fontWeight: 500 }}>{name}</span>
      {typeof l !== "string" && l.proficiency && (
        <span style={{ fontSize: Math.round(tokens.body * 0.8), color: tokens.muted }}>{l.proficiency}</span>
      )}
    </div>
  );
}

export function CertItem({ c, tokens, variant }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ fontWeight: 600, fontSize: Math.round(tokens.body * 0.94) }}>{c.name}</div>
      <div style={{ color: tokens.muted, fontSize: Math.round(tokens.body * 0.84) }}>
        {c.issuer}
        {c.date ? ` · ${formatDate(c.date)}` : ""}
      </div>
    </div>
  );
}

export function ExperienceItem({ e, tokens, variant }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div>
          <span style={{ fontWeight: 700 }}>{e.position}</span>
          {e.company && <span style={{ color: tokens.muted }}> · {e.company}</span>}
        </div>
        <span style={{ fontSize: Math.round(tokens.body * 0.82), color: tokens.muted, whiteSpace: "nowrap" }}>
          {formatDate(e.startDate)} – {e.isCurrent ? "Present" : formatDate(e.endDate)}
        </span>
      </div>
      {e.location && <div style={{ color: tokens.muted, fontSize: Math.round(tokens.body * 0.84) }}>{e.location}</div>}
      {hasList(e.highlights) && (
        <ul style={{ margin: "5px 0 0", paddingLeft: 16 }}>
          {e.highlights.map((h, i) => (
            <li key={i} style={{ marginBottom: 3 }}>
              {h}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EducationItem({ e, tokens, variant }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div>
          <span style={{ fontWeight: 700 }}>{e.degree}</span>
          {e.field && <span style={{ color: tokens.muted }}> · {e.field}</span>}
        </div>
        <span style={{ fontSize: Math.round(tokens.body * 0.82), color: tokens.muted, whiteSpace: "nowrap" }}>
          {formatDate(e.startDate)} – {e.endDate ? formatDate(e.endDate) : "Present"}
        </span>
      </div>
      <div style={{ color: tokens.muted, fontSize: Math.round(tokens.body * 0.84) }}>
        {e.institution}
        {e.location ? ` · ${e.location}` : ""}
        {e.gpa ? ` · GPA ${e.gpa}` : ""}
      </div>
    </div>
  );
}

export function ProjectItem({ pr, tokens, variant }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontWeight: 700, display: "flex", alignItems: "baseline", gap: 8 }}>
        {pr.name}
        {(pr.url || pr.github) && (
          <span style={{ fontSize: Math.round(tokens.body * 0.78), color: tokens.accent, fontWeight: 500 }}>{pr.url || pr.github}</span>
        )}
      </div>
      {pr.description && <div style={{ color: tokens.muted }}>{pr.description}</div>}
      {hasList(pr.technologies) && (
        <div style={{ marginTop: 3, fontSize: Math.round(tokens.body * 0.8), color: tokens.accent, fontWeight: 500 }}>
          {pr.technologies.join(" · ")}
        </div>
      )}
    </div>
  );
}

export function AchievementItem({ a, tokens }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontWeight: 700 }}>{a.title}</span>
        {a.date && <span style={{ fontSize: Math.round(tokens.body * 0.8), color: tokens.muted }}>{formatDate(a.date)}</span>}
      </div>
      {a.description && <div style={{ color: tokens.muted }}>{a.description}</div>}
    </div>
  );
}

export function ReferenceItem({ r, tokens }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontWeight: 700 }}>{r.name}</div>
      <div style={{ color: tokens.muted }}>
        {r.title}
        {r.company ? ` · ${r.company}` : ""}
        {r.email ? ` · ${r.email}` : ""}
        {r.phone ? ` · ${r.phone}` : ""}
      </div>
    </div>
  );
}

export const DEFAULT_SECTIONS = [
  { key: "summary", title: "Summary", has: (d) => !!d.summary },
  { key: "experience", title: "Experience", has: (d) => hasList(d.experience) },
  { key: "education", title: "Education", has: (d) => hasList(d.education) },
  { key: "skills", title: "Skills", has: (d) => hasList(d.skills) },
  { key: "projects", title: "Projects", has: (d) => hasList(d.projects) },
  { key: "certificates", title: "Certifications", has: (d) => hasList(d.certificates) },
  { key: "languages", title: "Languages", has: (d) => hasList(d.languages) },
  { key: "achievements", title: "Achievements", has: (d) => hasList(d.achievements) },
  { key: "references", title: "References", has: (d) => hasList(d.references) },
];

function renderMain(data, tokens, SectionTitle, archetype, sectionOrder, design, opts = {}) {
  const order =
    Array.isArray(sectionOrder) && sectionOrder.length
      ? DEFAULT_SECTIONS.filter((s) => sectionOrder.includes(s.key))
      : DEFAULT_SECTIONS;

  const blocks = {
    summary: (d) => (
      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{d.summary}</p>
    ),
    experience: (d) => d.experience.map((e) => <ExperienceItem key={e.id || e.position} e={e} tokens={tokens} />),
    education: (d) => d.education.map((e) => <EducationItem key={e.id || e.institution} e={e} tokens={tokens} />),
    skills: (d) => <SkillCloud skills={d.skills} tokens={tokens} variant={archetype === "sidebar" ? "sidebar" : "chips"} />,
    projects: (d) => d.projects.map((pr) => <ProjectItem key={pr.id || pr.name} pr={pr} tokens={tokens} />),
    certificates: (d) => d.certificates.map((c) => <CertItem key={c.id} c={c} tokens={tokens} />),
    languages: (d) => d.languages.map((l) => <LanguageItem key={l.id || l.name} l={l} tokens={tokens} />),
    achievements: (d) => d.achievements.map((a) => <AchievementItem key={a.id || a.title} a={a} tokens={tokens} />),
    references: (d) => d.references.map((r) => <ReferenceItem key={r.id || r.name} r={r} tokens={tokens} />),
  };

  return (
    <div>
      {order.map((s) => {
        const skip = (opts.skipSummary && s.key === "summary") || (opts.skipSections && opts.skipSections.includes(s.key));
        if (skip || !s.has(data)) return null;
        return (
          <div key={s.key} style={{ marginBottom: tokens.gap }}>
            <SectionTitle>{s.title}</SectionTitle>
            {blocks[s.key](data)}
          </div>
        );
      })}
    </div>
  );
}
