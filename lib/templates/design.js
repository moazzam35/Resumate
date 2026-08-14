import { getTemplate } from "./registry";

export const FONTS = {
  sans: { label: "Public Sans", family: "var(--font-sans)" },
  serif: { label: "Fraunces", family: "var(--font-display)" },
  display: { label: "Fraunces Display", family: "var(--font-display)" },
  heading: { label: "Space Grotesk", family: "var(--font-heading)" },
  mono: { label: "IBM Plex Mono", family: "var(--font-mono)" },
};

export const SPACING = {
  compact: { label: "Compact", unit: 1 },
  comfortable: { label: "Comfortable", unit: 1.25 },
  spacious: { label: "Spacious", unit: 1.55 },
};

export const MARGINS = {
  narrow: { label: "Narrow", px: 28 },
  normal: { label: "Normal", px: 40 },
  wide: { label: "Wide", px: 56 },
};

export const PAGE_SIZES = {
  letter: { label: "US Letter", width: 816, height: 1056 },
  a4: { label: "A4", width: 794, height: 1123 },
};

export const HEADER_STYLES = {
  left: { label: "Left aligned" },
  center: { label: "Centered" },
  band: { label: "Color band" },
  sidebar: { label: "Sidebar" },
  split: { label: "Split" },
  editorial: { label: "Editorial" },
  creative: { label: "Creative" },
};

export const SECTION_STYLES = {
  accent: { label: "Accent bar" },
  underline: { label: "Underline" },
  rule: { label: "Hairline rule" },
  caps: { label: "Small caps" },
  pill: { label: "Pills" },
};

const DESIGN_DEFAULTS = {
  color: "#2563eb",
  font: "sans",
  spacing: "comfortable",
  headerStyle: "center",
  sectionStyle: "accent",
  pageSize: "a4",
  margins: "normal",
  darkMode: false,
};

const DESIGN_KEYS = Object.keys(DESIGN_DEFAULTS);

function sanitizeDesign(design) {
  if (!design || typeof design !== "object") return { ...DESIGN_DEFAULTS };
  const out = { ...DESIGN_DEFAULTS };
  for (const key of DESIGN_KEYS) {
    if (design[key] !== undefined && design[key] !== null && design[key] !== "") {
      out[key] = design[key];
    }
  }
  return out;
}

/**
 * Resolves the effective design for a resume by merging:
 * template defaults < resume.design < resume.colorTheme (accent override).
 *
 * An explicit `design.color` (user picked a color) takes precedence over the
 * template's `colorTheme` so picked colors aren't silently overridden.
 */
export function resolveDesign(templateId, design, colorTheme) {
  const template = getTemplate(templateId);
  const merged = sanitizeDesign({ ...template.design, ...design });
  if (
    colorTheme &&
    /^#([0-9a-fA-F]{6})$/.test(colorTheme) &&
    (!merged.color || merged.color === template.design.color)
  ) {
    merged.color = colorTheme;
  }
  return merged;
}

export const SPACING_PX = {
  compact: { body: 12, sectionGap: 14, line: 1.4 },
  comfortable: { body: 15, sectionGap: 18, line: 1.5 },
  spacious: { body: 18, sectionGap: 24, line: 1.6 },
};

export function scaleFont(base, design) {
  const { unit } = SPACING[design.spacing] || SPACING.comfortable;
  return Math.round(base * (0.92 + (unit - 1) * 0.12) * 10) / 10;
}

export function hexToRgb(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex || "");
  if (!m) return { r: 37, g: 99, b: 235 };
  const v = parseInt(m[1], 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function contrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}
