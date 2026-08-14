import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getTemplate } from "@/lib/templates/registry";
import {
  resolveDesign,
  PAGE_SIZES,
  MARGINS,
  SPACING_PX,
  scaleFont,
  FONTS,
  hexToRgb,
  contrastColor,
} from "@/lib/templates/design";
import { normalizeResume, formatDate } from "@/lib/templates/normalize";

/**
 * PDF export that mirrors the on-screen template preview as closely as the
 * standard fonts allow. All layout is computed in CSS pixels (the same space
 * the preview uses) and scaled by PX_TO_PT (96dpi -> 72dpi) when drawn.
 */

const PX_TO_PT = 0.75;

const PDF_FONTS = {
  sans: StandardFonts.Helvetica,
  heading: StandardFonts.Helvetica,
  mono: StandardFonts.Courier,
  serif: StandardFonts.TimesRoman,
  display: StandardFonts.TimesRoman,
};

const PDF_FONTS_BOLD = {
  sans: StandardFonts.HelveticaBold,
  heading: StandardFonts.HelveticaBold,
  mono: StandardFonts.CourierBold,
  serif: StandardFonts.TimesRomanBold,
  display: StandardFonts.TimesRomanBold,
};

const FONT_ASCENT = {
  Helvetica: 0.905,
  HelveticaBold: 0.905,
  TimesRoman: 0.891,
  TimesRomanBold: 0.891,
  Courier: 0.8,
  CourierBold: 0.8,
};

const DEFAULT_SECTIONS = [
  { key: "summary", title: "Summary", has: (d) => !!d.summary },
  { key: "experience", title: "Experience", has: (d) => d.experience.length > 0 },
  { key: "education", title: "Education", has: (d) => d.education.length > 0 },
  { key: "skills", title: "Skills", has: (d) => d.skills.length > 0 },
  { key: "projects", title: "Projects", has: (d) => d.projects.length > 0 },
  { key: "certificates", title: "Certifications", has: (d) => d.certificates.length > 0 },
  { key: "languages", title: "Languages", has: (d) => d.languages.length > 0 },
  { key: "achievements", title: "Achievements", has: (d) => d.achievements.length > 0 },
  { key: "references", title: "References", has: (d) => d.references.length > 0 },
];

function color(hex) {
  const { r, g, b } = hexToRgb(hex || "");
  return rgb(r / 255, g / 255, b / 255);
}

// Accept either a hex string or an existing pdf-lib color object.
function pdfColor(value, fallback = "#1c1917") {
  return typeof value === "string" ? color(value || fallback) : value;
}

function initialsOf(name) {
  return String(name || "·")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// --- WinAnsi-safe text handling -------------------------------------------
// Standard PDF fonts only support the WinAnsi encoding. Drawing any other
// character (CJK, emoji, ...) throws, which previously crashed the export.
const CHAR_MAP = {
  "—": "-", "–": "-", "‐": "-", "‑": "-", "‘": "'", "’": "'", "“": '"', "”": '"', "„": '"',
  "…": "...", "★": "*", "✦": "*", "⭐": "*", "◆": "•", "●": "•", "▪": "•", "▫": "•", "◦": "•", "⁃": "-",
  "‣": ">", "▸": ">", "►": ">", "◈": "•", "·": "•", "•": "•",
  "✓": "•", "✔": "•", "✅": "•", "✗": "x", "✕": "x", "❌": "x", "⚡": "*",
  "→": "->", "←": "<-", "↑": "^", "↓": "v", "↔": "<->",
  "€": "EUR ", "£": "GBP ", "¥": "JPY ", "©": "(c)", "®": "(R)", "™": "(TM)",
};

function isWinAnsiCodePoint(cp) {
  if (cp >= 0x20 && cp <= 0x7e) return true; // ASCII printable
  if (cp >= 0xa0 && cp <= 0xff) return true; // Latin-1 supplement
  // WinAnsi C1 control range (0x80-0x9f), minus the undefined slots
  const c1 = cp >= 0x80 && cp <= 0x9f;
  if (!c1) return false;
  return !(cp === 0x81 || cp === 0x8d || cp === 0x8f || cp === 0x90 || cp === 0x9d);
}

function sanitize(text) {
  if (text == null) return "";
  let out = "";
  for (const ch of String(text)) {
    if (CHAR_MAP[ch] !== undefined) {
      out += CHAR_MAP[ch];
      continue;
    }
    const cp = ch.codePointAt(0);
    out += isWinAnsiCodePoint(cp) ? ch : "";
  }
  return out.replace(/\s{3,}/g, "  ").trim();
}

// Rounded-rect SVG path in top-origin points (y grows downward).
function roundedRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    "Z",
  ].join(" ");
}

class PdfBuilder {
  constructor(pdfDoc, templateId, design, resume) {
    this.doc = pdfDoc;
    this.template = getTemplate(templateId);
    this.design = design;
    this.resume = resume;
    this.data = normalizeResume(resume);
    this.pages = [];

    this.pageSize = PAGE_SIZES[design.pageSize] || PAGE_SIZES.a4;
    this.pageW = this.pageSize.width;
    this.pageH = this.pageSize.height;
    this.margin = (MARGINS[design.margins] || MARGINS.normal).px;
    this.spacing = SPACING_PX[design.spacing] || SPACING_PX.comfortable;

    this.dark = Boolean(design.darkMode);
    this.accent = design.color || "#2563eb";
    this.ink = this.dark ? "#f4f1ea" : "#1c1917";
    this.muted = this.dark ? "#b8b3a9" : "#6b645c";
    this.paper = this.dark ? "#11100d" : "#ffffff";
    this.hairlineAlpha = this.dark ? 0.18 : 0.14;

    this.body = scaleFont(13.5, design);
    this.namePx = scaleFont(30, design);
    this.titlePx = scaleFont(15, design);
    this.sectionPx = scaleFont(13.5, design);

    const fontKey = FONTS[design.font] ? design.font : "sans";
    this.fontKey = fontKey;

    // Columns: set to the full content area by default (overridden by two-column layouts)
    this.colX = this.margin;
    this.colW = this.pageW - this.margin * 2;
    this.clip = false; // two-column layouts clip to one page like the preview
  }

  // --- fonts ---------------------------------------------------------------
  async setupFonts() {
    this.font = await this.doc.embedFont(PDF_FONTS[this.fontKey]);
    this.bold = await this.doc.embedFont(PDF_FONTS_BOLD[this.fontKey]);
    this.ascent = FONT_ASCENT[this.font.fontName] || 0.85;
  }

  // --- geometry ------------------------------------------------------------
  pt(px) {
    return px * PX_TO_PT;
  }

  pdfYTop(yPx) {
    // convert a top-origin px y to the pdf bottom-up pt y for the *top* edge
    return (this.pageH - yPx) * PX_TO_PT;
  }

  addPage() {
    const page = this.doc.addPage([this.pageW * PX_TO_PT, this.pageH * PX_TO_PT]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: this.pageW * PX_TO_PT,
      height: this.pageH * PX_TO_PT,
      color: color(this.paper),
    });
    this.pages.push(page);
    this.page = page;
    this.y = this.margin;
  }

  ensure(spacePx) {
    if (this.clip) return;
    if (this.y + spacePx > this.pageH - this.margin) {
      this.addPage();
    }
  }

  // --- shapes --------------------------------------------------------------
  rect(xPx, yPx, wPx, hPx, opts = {}) {
    const {
      fill = this.ink,
      fillOpacity = 1,
      stroke,
      strokeWidth = 1,
    } = opts;
    this.page.drawRectangle({
      x: xPx * PX_TO_PT,
      y: this.pdfYTop(yPx) - hPx * PX_TO_PT,
      width: wPx * PX_TO_PT,
      height: hPx * PX_TO_PT,
      color: pdfColor(fill),
      opacity: fillOpacity,
      borderColor: stroke !== undefined ? pdfColor(stroke) : undefined,
      borderWidth: strokeWidth,
    });
  }

  roundedRect(xPx, yPx, wPx, hPx, rPx, opts = {}) {
    const { fill, fillOpacity = 1, stroke, strokeWidth = 1 } = opts;
    const path = roundedRectPath(
      xPx * PX_TO_PT,
      yPx * PX_TO_PT,
      wPx * PX_TO_PT,
      hPx * PX_TO_PT,
      rPx * PX_TO_PT
    );
    this.page.drawSvgPath(path, {
      x: 0,
      y: this.pageH * PX_TO_PT,
      color: fill !== undefined ? pdfColor(fill) : undefined,
      opacity: fillOpacity,
      borderColor: stroke !== undefined ? pdfColor(stroke) : undefined,
      borderWidth: strokeWidth,
    });
  }

  circle(cxPx, cyPx, rPx, opts = {}) {
    const { fill, opacity = 1, stroke, strokeWidth = 1 } = opts;
    this.page.drawCircle({
      x: cxPx * PX_TO_PT,
      y: this.pdfYTop(cyPx),
      size: rPx * PX_TO_PT,
      color: fill !== undefined ? pdfColor(fill) : undefined,
      opacity,
      borderColor: stroke !== undefined ? pdfColor(stroke) : undefined,
      borderWidth: strokeWidth,
    });
  }

  hline(xPx, yPx, wPx, opts = {}) {
    const { thickness = 1, color = this.ink, opacity = this.hairlineAlpha } = opts;
    const y = this.pdfYTop(yPx);
    this.page.drawLine({
      start: { x: xPx * PX_TO_PT, y },
      end: { x: (xPx + wPx) * PX_TO_PT, y },
      thickness: thickness * PX_TO_PT,
      color: pdfColor(color),
      opacity,
    });
  }

  // --- text ----------------------------------------------------------------
  measure(text, font, sizePx) {
    return font.widthOfTextAtSize(text, this.pt(sizePx));
  }

  wrap(text, font, sizePx, maxWidthPx) {
    const maxW = this.pt(maxWidthPx);
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (this.measure(test, font, sizePx) > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  drawLine(text, xPx, yTopPx, opts = {}) {
    const { font = this.font, sizePx = this.body, color = this.ink, opacity = 1 } = opts;
    const size = this.pt(sizePx);
    const ascent = FONT_ASCENT[font.fontName] || 0.85;
    this.page.drawText(text, {
      x: xPx * PX_TO_PT,
      y: this.pdfYTop(yTopPx) - ascent * size,
      size,
      font,
      color: pdfColor(color),
      opacity,
    });
  }

  /**
   * Post-pass: draw a centred footer ("Name · Page X of Y") in the bottom
   * margin strip of every page when the document spans more than one page.
   * Mirrors the on-screen MultiPageResume footer.
   */
  drawPageFooters() {
    const pages = this.pages;
    if (pages.length <= 1 || !this.font) return;
    const sizePx = Math.max(8, Math.round(this.body * 0.6));
    const size = this.pt(sizePx);
    const baseline = this.pt(Math.round(this.margin * 0.32));
    const hairlineY = baseline + size + this.pt(5);
    const halfW = (this.pageW * 0.12) * PX_TO_PT;
    const pageW = this.pageW * PX_TO_PT;
    pages.forEach((pg, i) => {
      const label = [this.data.personal?.name, `Page ${i + 1} of ${pages.length}`]
        .filter(Boolean)
        .join(" \u00B7 ");
      const w = this.font.widthOfTextAtSize(label, size);
      pg.drawLine({
        start: { x: pageW / 2 - halfW, y: hairlineY },
        end: { x: pageW / 2 + halfW, y: hairlineY },
        thickness: this.pt(0.75),
        color: pdfColor(this.muted),
        opacity: this.hairlineAlpha,
      });
      pg.drawText(label, {
        x: (pageW - w) / 2,
        y: baseline,
        size,
        font: this.font,
        color: pdfColor(this.muted),
      });
    });
  }

  /**
   * Draw wrapped text at (xPx, yPx) (top origin). Returns the new y after
   * advancing by lineHeight for each line.
   */
  text(text, xPx, yPx, opts = {}) {
    const {
      font = this.font,
      sizePx = this.body,
      color = this.ink,
      opacity = 1,
      align = "left",
      maxWidthPx = this.colW,
      lineHeight = this.spacing.line,
    } = opts;
    const clean = sanitize(text);
    if (!clean) return yPx;

    const lines = this.wrap(clean, font, sizePx, maxWidthPx);
    let y = yPx;
    for (const line of lines) {
      if (this.clip && y + sizePx * 0.8 > this.pageH - this.margin) break;
      if (!this.clip && y + sizePx * lineHeight > this.pageH - this.margin) {
        this.addPage();
        y = this.y;
      }
      let x = xPx;
      if (align === "center") x = xPx + (maxWidthPx - this.measure(line, font, sizePx) / PX_TO_PT) / 2;
      else if (align === "right") x = xPx + maxWidthPx - this.measure(line, font, sizePx) / PX_TO_PT;
      this.drawLine(line, x, y, { font, sizePx, color, opacity });
      y += sizePx * lineHeight;
    }
    return y;
  }

  textCentered(text, xPx, yPx, wPx, hPx, opts = {}) {
    const { font = this.bold, sizePx = this.body, color = this.ink } = opts;
    const clean = sanitize(text);
    const width = this.measure(clean, font, sizePx) / PX_TO_PT;
    const tx = xPx + (wPx - width) / 2;
    const top = yPx + (hPx - sizePx * 1.15) / 2;
    this.drawLine(clean, tx, top, { font, sizePx, color });
  }

  // --- content helpers -----------------------------------------------------
  contactItems() {
    const p = this.data.personal || {};
    const items = [];
    if (p.email) items.push(p.email);
    if (p.phone) items.push(p.phone);
    if (p.location) items.push(p.location);
    if (p.linkedin) items.push(p.linkedin);
    if (p.github) items.push(p.github);
    if (p.portfolio) items.push(p.portfolio);
    if (p.website) items.push(p.website);
    return items;
  }

  contactRow(yPx, align = "center", opts = {}) {
    const items = this.contactItems();
    if (!items.length) return yPx;
    const { color = this.muted, maxWidthPx = this.colW } = opts;
    const size = this.body * 0.86;
    let y = yPx;
    let line = "";
    const flush = (l) => {
      y = this.text(l, this.colX, y, {
        font: this.font,
        sizePx: size,
        color,
        align,
        maxWidthPx,
        lineHeight: 1.5,
      });
    };
    for (let i = 0; i < items.length; i++) {
      const part = (i === 0 ? "" : " · ") + items[i];
      if (line && this.measure(line + part, this.font, size) > this.pt(maxWidthPx)) {
        flush(line);
        line = part;
      } else {
        line += part;
      }
    }
    if (line) flush(line);
    return y;
  }

  dateRange(startDate, isCurrent, endDate) {
    const s = startDate ? formatDate(startDate) : "";
    if (!s) return "";
    if (isCurrent) return `${s} – Present`;
    const e = endDate ? formatDate(endDate) : "";
    return e ? `${s} – ${e}` : s;
  }

  drawSectionTitle(title, yPx) {
    const style = this.design.sectionStyle || "accent";
    const size = this.sectionPx;
    const text = sanitize(String(title).toUpperCase());
    const m = this.colX;
    const w = this.colW;

    const reserve = (h) => {
      this.ensure(h);
      if (this.clip && this.y + h > this.pageH - this.margin) return true; // clipped
      return false;
    };

    switch (style) {
      case "underline": {
        if (reserve(size * 1.6 + 14)) return this.y;
        this.text(text, m, this.y, { font: this.bold, sizePx: size, maxWidthPx: w });
        this.hline(m, this.y + size + 3, w, { color: this.accent, thickness: 2, opacity: 1 });
        this.y += size + 14;
        break;
      }
      case "rule": {
        if (reserve(size * 1.5 + 12)) return this.y;
        const tw = this.measure(text, this.bold, size) / PX_TO_PT;
        this.text(text, m, this.y, { font: this.bold, sizePx: size, maxWidthPx: w });
        this.hline(m + tw + 10, this.y + size * 0.55, w - tw - 10, { thickness: 1 });
        this.y += size + 12;
        break;
      }
      case "caps": {
        if (reserve(size * 1.5 + 12)) return this.y;
        this.text(text, m, this.y, { font: this.bold, sizePx: size - 1.5, color: this.accent, maxWidthPx: w });
        this.hline(m, this.y + size * 0.45, w, { thickness: 1 });
        this.y += size + 12;
        break;
      }
      case "pill": {
        const h = size + 7;
        if (reserve(h + 12)) return this.y;
        const tw = this.measure(text, this.bold, size - 1) / PX_TO_PT + 24;
        this.roundedRect(m, this.y, tw, h, 20, { fill: this.accent });
        this.textCentered(text, m, this.y, tw, h, {
          font: this.bold,
          sizePx: size - 1,
          color: contrastColor(this.accent),
        });
        this.y += h + 12;
        break;
      }
      case "accent":
      default: {
        if (reserve(size * 1.5 + 12)) return this.y;
        this.rect(m, this.y + 2, 4, size - 2, { fill: this.accent });
        this.text(text, m + 8, this.y, { font: this.bold, sizePx: size, maxWidthPx: w - 8 });
        this.y += size + 12;
        break;
      }
    }
    return this.y;
  }

  // --- headers -------------------------------------------------------------
  renderClassicHeader() {
    const p = this.data.personal || {};
    let y = this.y;
    y = this.text(p.name || "Your Name", this.colX, y, {
      font: this.bold,
      sizePx: this.namePx,
      maxWidthPx: this.colW,
      lineHeight: 1.15,
    });
    if (p.title) {
      y += 3;
      y = this.text(p.title, this.colX, y, {
        font: this.bold,
        sizePx: this.titlePx,
        color: this.accent,
        maxWidthPx: this.colW,
      });
    }
    y += 4;
    y = this.contactRow(y, "left");
    this.y = y + this.spacing.sectionGap;
  }

  renderModernHeader() {
    const p = this.data.personal || {};
    let y = this.y;
    const cw = this.colW;

    if (this.data.showAvatar && p.name) {
      const r = 22;
      const cx = this.colX + cw / 2;
      const cyTop = y + r;
      this.circle(cx, cyTop, r, { fill: this.accent });
      this.textCentered(initialsOf(p.name), cx - r, cyTop - r, r * 2, r * 2, {
        font: this.bold,
        sizePx: 15,
        color: contrastColor(this.accent),
      });
      y = cyTop + r + 8;
    }

    y = this.text(p.name || "Your Name", this.colX, y, {
      font: this.bold,
      sizePx: this.namePx,
      align: "center",
      maxWidthPx: cw,
      lineHeight: 1.15,
    });

    if (p.title) {
      y += 2;
      const tSize = this.titlePx;
      const tw = this.measure(sanitize(p.title), this.bold, tSize) / PX_TO_PT + 28;
      const pillX = this.colX + (cw - tw) / 2;
      const pillY = y + 1;
      this.roundedRect(pillX, pillY, tw, tSize + 6, 20, {
        stroke: this.accent,
        strokeWidth: 1.5,
      });
      this.textCentered(p.title, pillX, pillY, tw, tSize + 6, {
        font: this.bold,
        sizePx: tSize,
        color: this.accent,
      });
      y = pillY + (tSize + 6) + 4;
    }

    y = this.contactRow(y, "center");
    this.y = y + this.spacing.sectionGap;
  }

  renderHeroHeader() {
    const p = this.data.personal || {};
    const padX = this.margin;
    const topPad = Math.round(this.margin * 0.9);
    const fg = contrastColor(this.accent);
    const nameLineH = (this.namePx + 2) * 1.15;
    const titleLineH = p.title ? this.titlePx * 1.3 : 0;
    const contactLineH = this.contactItems().length ? this.body * 0.86 * 1.5 + 6 : 0;
    const avatarR = 26;
    const bandH =
      topPad + Math.max(avatarR * 2, nameLineH + titleLineH) + contactLineH + 14;

    this.rect(0, 0, this.pageW, bandH, { fill: this.accent });

    const textX = padX + avatarR * 2 + 16;
    this.circle(padX + avatarR, topPad + avatarR, avatarR, {
      fill: rgb(1, 1, 1),
      opacity: 0.18,
    });
    this.textCentered(initialsOf(p.name), padX, topPad, avatarR * 2, avatarR * 2, {
      font: this.bold,
      sizePx: 18,
      color: fg,
    });

    let y = topPad + 4;
    y = this.text(p.name || "Your Name", textX, y, {
      font: this.bold,
      sizePx: this.namePx + 2,
      color: fg,
      maxWidthPx: this.pageW - textX - padX,
      lineHeight: 1.15,
    });
    if (p.title) {
      y += 2;
      y = this.text(p.title, textX, y, {
        font: this.bold,
        sizePx: this.titlePx,
        color: fg,
        maxWidthPx: this.pageW - textX - padX,
      });
    }

    const contactY = topPad + Math.max(avatarR * 2, nameLineH + titleLineH) + 6;
    const savedColX = this.colX;
    const savedColW = this.colW;
    this.colX = padX;
    this.colW = this.pageW - padX * 2;
    this.contactRow(contactY, "left", { color: rgb(1, 1, 1), maxWidthPx: this.colW, });
    this.colX = savedColX;
    this.colW = savedColW;

    this.y = bandH + this.spacing.sectionGap;
  }

  renderEditorialHeader() {
    const p = this.data.personal || {};
    const cw = this.colW;
    let y = this.y;
    this.hline(this.colX, y, cw, { color: this.accent, thickness: 1, opacity: 1 });
    y += 12;
    y = this.text(p.name || "Your Name", this.colX, y, {
      font: this.font,
      sizePx: this.namePx + 2,
      align: "center",
      maxWidthPx: cw,
      lineHeight: 1.2,
    });
    if (p.title) {
      y += 4;
      y = this.text(sanitize(p.title).toUpperCase(), this.colX, y, {
        font: this.bold,
        sizePx: this.titlePx * 0.92,
        color: this.accent,
        align: "center",
        maxWidthPx: cw,
      });
    }
    y += 2;
    y = this.contactRow(y, "center");
    this.hline(this.colX, y + 8, cw, { color: this.accent, thickness: 1, opacity: 1 });
    this.y = y + this.spacing.sectionGap + 6;
  }

  renderCreativeHeader() {
    const p = this.data.personal || {};
    const padX = this.margin;
    const topPad = Math.round(this.margin * 0.9);
    const avatarR = 23;
    const nameLineH = (this.namePx + 2) * 1.15;
    const titleLineH = p.title ? this.titlePx * 1.3 : 0;
    const contactLineH = this.contactItems().length ? this.body * 0.86 * 1.5 + 6 : 0;
    const bandH = topPad + Math.max(avatarR * 2, nameLineH + titleLineH) + contactLineH + 14;

    this.rect(0, 0, this.pageW, bandH, { fill: this.ink });

    const fg = contrastColor(this.accent);
    this.rect(padX, topPad, avatarR * 2, avatarR * 2, { fill: this.accent });
    this.textCentered(initialsOf(p.name), padX, topPad, avatarR * 2, avatarR * 2, {
      font: this.bold,
      sizePx: 18,
      color: fg,
    });

    const textX = padX + avatarR * 2 + 14;
    let y = topPad + 2;
    y = this.text(p.name || "Your Name", textX, y, {
      font: this.bold,
      sizePx: this.namePx + 2,
      color: this.paper,
      maxWidthPx: this.pageW - textX - padX - 30,
      lineHeight: 1.15,
    });
    if (p.title) {
      y += 2;
      y = this.text(p.title, textX, y, {
        font: this.bold,
        sizePx: this.titlePx,
        color: this.accent,
        maxWidthPx: this.pageW - textX - padX - 30,
      });
    }

    const contactY = topPad + Math.max(avatarR * 2, nameLineH + titleLineH) + 6;
    const savedColX = this.colX;
    const savedColW = this.colW;
    this.colX = padX;
    this.colW = this.pageW - padX * 2;
    this.contactRow(contactY, "left", { color: this.muted, maxWidthPx: this.colW });
    this.colX = savedColX;
    this.colW = savedColW;

    // decorative mark on the right edge of the band
    const markX = this.pageW - padX - 14;
    this.textCentered("◆", markX, topPad + 4, 28, 28, {
      font: this.bold,
      sizePx: 16,
      color: this.accent,
    });

    this.y = bandH + this.spacing.sectionGap;
  }

  // --- section content -----------------------------------------------------
  renderExperienceSection() {
    for (const e of this.data.experience) {
      let y = this.y;
      const dateRange = this.dateRange(e.startDate, e.isCurrent, e.endDate);
      const dSize = this.body * 0.82;
      const dateW = dateRange ? this.measure(dateRange, this.font, dSize) / PX_TO_PT : 0;
      const dateX = this.pageW - this.margin - dateW;
      const lineW = this.colW - (dateRange ? dateW + 14 : 0);

      if (!this.clip && y + 60 > this.pageH - this.margin) {
        this.addPage();
        y = this.y;
      } else if (this.clip && y + 60 > this.pageH - this.margin) break;

      const left = [e.position, e.company && `· ${e.company}`].filter(Boolean).join(" ");
      y = this.text(left, this.colX, y, {
        font: this.bold,
        sizePx: this.body,
        maxWidthPx: lineW,
      });
      if (dateRange) {
        this.text(dateRange, dateX, y, {
          font: this.font,
          sizePx: dSize,
          color: this.muted,
          maxWidthPx: dateW + 2,
          align: "right",
        });
      }
      y += 2;
      if (e.location) {
        y = this.text(e.location, this.colX, y, {
          font: this.font,
          sizePx: this.body * 0.84,
          color: this.muted,
          maxWidthPx: this.colW,
        });
        y += 2;
      }
      for (const h of e.highlights || []) {
        if (!sanitize(h)) continue;
        const startY = y;
        this.text("•", this.colX, startY, {
          font: this.font,
          sizePx: this.body * 0.9,
          color: this.accent,
        });
        y = this.text(h, this.colX + 12, y, {
          font: this.font,
          sizePx: this.body * 0.9,
          maxWidthPx: this.colW - 12,
        });
      }
      this.y = y + 6;
    }
  }

  renderEducationSection() {
    for (const e of this.data.education) {
      let y = this.y;
      const dateRange = this.dateRange(e.startDate, false, e.endDate || null);
      const dSize = this.body * 0.82;
      const dateW = dateRange ? this.measure(dateRange, this.font, dSize) / PX_TO_PT : 0;
      const dateX = this.pageW - this.margin - dateW;
      const lineW = this.colW - (dateRange ? dateW + 14 : 0);

      if (!this.clip && y + 60 > this.pageH - this.margin) {
        this.addPage();
        y = this.y;
      } else if (this.clip && y + 60 > this.pageH - this.margin) break;

      const left = [e.degree, e.field && `· ${e.field}`].filter(Boolean).join(" ");
      y = this.text(left, this.colX, y, { font: this.bold, sizePx: this.body, maxWidthPx: lineW });
      if (dateRange) {
        this.text(dateRange, dateX, y, {
          font: this.font,
          sizePx: dSize,
          color: this.muted,
          maxWidthPx: dateW + 2,
          align: "right",
        });
      }
      y += 2;
      const schoolLine = [
        e.institution,
        e.location && `· ${e.location}`,
        e.gpa && `· GPA ${e.gpa}`,
      ]
        .filter(Boolean)
        .join(" ");
      y = this.text(schoolLine, this.colX, y, {
        font: this.font,
        sizePx: this.body * 0.84,
        color: this.muted,
        maxWidthPx: this.colW,
      });
      this.y = y + 8;
    }
  }

  renderSkillsSection() {
    const chips = this.data.skills;
    const size = this.body * 0.86;
    const h = size + 7;
    const gap = 6;
    let x = this.colX;
    let y = this.y;
    for (const s of chips) {
      const label = sanitize(s.name);
      if (!label) continue;
      const tw = this.measure(label, this.font, size) / PX_TO_PT;
      const w = tw + 18;
      if (x + w > this.colX + this.colW) {
        x = this.colX;
        y += h + gap;
        if (!this.clip && y + h > this.pageH - this.margin) {
          this.addPage();
          y = this.y;
        } else if (this.clip && y + h > this.pageH - this.margin) {
          break;
        }
      }
      this.roundedRect(x, y, w, h, 20, {
        fill: this.accent,
        fillOpacity: 0.12,
        stroke: this.accent,
        strokeWidth: 0.6,
      });
      this.textCentered(label, x, y, w, h, { font: this.font, sizePx: size, color: this.ink });
      x += w + gap;
    }
    this.y = y + gap;
  }

  renderProjectsSection() {
    for (const pr of this.data.projects) {
      let y = this.y;
      if (!this.clip && y + 60 > this.pageH - this.margin) {
        this.addPage();
        y = this.y;
      } else if (this.clip && y + 60 > this.pageH - this.margin) break;
      y = this.text(pr.name, this.colX, y, { font: this.bold, sizePx: this.body, maxWidthPx: this.colW });
      const link = pr.url || pr.github;
      if (link) {
        this.text(link, this.colX + this.measure(pr.name, this.bold, this.body) / PX_TO_PT + 8, y, {
          font: this.font,
          sizePx: this.body * 0.78,
          color: this.accent,
        });
      }
      y += 2;
      if (pr.description) {
        y = this.text(pr.description, this.colX, y, {
          font: this.font,
          sizePx: this.body,
          color: this.muted,
          maxWidthPx: this.colW,
        });
      }
      if (pr.technologies && pr.technologies.length) {
        y += 1;
        y = this.text(pr.technologies.join(" · "), this.colX, y, {
          font: this.font,
          sizePx: this.body * 0.8,
          color: this.accent,
          maxWidthPx: this.colW,
        });
      }
      this.y = y + 6;
    }
  }

  renderCertificatesSection() {
    for (const c of this.data.certificates) {
      let y = this.y;
      if (!this.clip && y + 50 > this.pageH - this.margin) {
        this.addPage();
        y = this.y;
      } else if (this.clip && y + 50 > this.pageH - this.margin) break;
      y = this.text(c.name, this.colX, y, { font: this.bold, sizePx: this.body * 0.94, maxWidthPx: this.colW });
      const sub = [c.issuer, c.date && formatDate(c.date)].filter(Boolean).join(" · ");
      if (sub) {
        y += 1;
        y = this.text(sub, this.colX, y, {
          font: this.font,
          sizePx: this.body * 0.84,
          color: this.muted,
          maxWidthPx: this.colW,
        });
      }
      this.y = y + 6;
    }
  }

  renderLanguagesSection() {
    let y = this.y;
    for (const l of this.data.languages) {
      const name = typeof l === "string" ? l : l.name;
      const prof = typeof l === "string" ? "" : l.proficiency;
      if (!this.clip && y + 30 > this.pageH - this.margin) {
        this.addPage();
        y = this.y;
      } else if (this.clip && y + 30 > this.pageH - this.margin) break;
      const profW = prof ? this.measure(prof, this.font, this.body * 0.8) / PX_TO_PT : 0;
      y = this.text(name, this.colX, y, { font: this.font, sizePx: this.body, maxWidthPx: this.colW - profW - 10 });
      if (prof) {
        this.text(prof, this.pageW - this.margin - profW, y, {
          font: this.font,
          sizePx: this.body * 0.8,
          color: this.muted,
          maxWidthPx: profW + 2,
          align: "right",
        });
      }
      y += 6;
    }
    this.y = y;
  }

  renderAchievementsSection() {
    for (const a of this.data.achievements) {
      let y = this.y;
      if (!this.clip && y + 50 > this.pageH - this.margin) {
        this.addPage();
        y = this.y;
      } else if (this.clip && y + 50 > this.pageH - this.margin) break;
      const date = a.date ? formatDate(a.date) : "";
      const dateW = date ? this.measure(date, this.font, this.body * 0.8) / PX_TO_PT : 0;
      y = this.text(a.title, this.colX, y, {
        font: this.bold,
        sizePx: this.body,
        maxWidthPx: this.colW - dateW - 10,
      });
      if (date) {
        this.text(date, this.pageW - this.margin - dateW, y, {
          font: this.font,
          sizePx: this.body * 0.8,
          color: this.muted,
          maxWidthPx: dateW + 2,
          align: "right",
        });
      }
      y += 2;
      if (a.description) {
        y = this.text(a.description, this.colX, y, {
          font: this.font,
          sizePx: this.body,
          color: this.muted,
          maxWidthPx: this.colW,
        });
      }
      this.y = y + 6;
    }
  }

  renderReferencesSection() {
    for (const r of this.data.references) {
      let y = this.y;
      if (!this.clip && y + 50 > this.pageH - this.margin) {
        this.addPage();
        y = this.y;
      } else if (this.clip && y + 50 > this.pageH - this.margin) break;
      y = this.text(r.name, this.colX, y, { font: this.bold, sizePx: this.body, maxWidthPx: this.colW });
      y += 2;
      const sub = [r.title, r.company && `· ${r.company}`, r.email && `· ${r.email}`, r.phone && `· ${r.phone}`]
        .filter(Boolean)
        .join(" ");
      if (sub) {
        y = this.text(sub, this.colX, y, {
          font: this.font,
          sizePx: this.body * 0.84,
          color: this.muted,
          maxWidthPx: this.colW,
        });
      }
      this.y = y + 8;
    }
  }

  renderSections(skipKeys = []) {
    for (const sec of DEFAULT_SECTIONS) {
      if (skipKeys.includes(sec.key)) continue;
      if (!sec.has(this.data)) continue;
      this.drawSectionTitle(sec.title, this.y);
      switch (sec.key) {
        case "summary":
          this.y = this.text(this.data.summary, this.colX, this.y, {
            font: this.font,
            sizePx: this.body,
            maxWidthPx: this.colW,
          });
          this.y += this.spacing.sectionGap;
          break;
        case "experience":
          this.renderExperienceSection();
          this.y += this.spacing.sectionGap;
          break;
        case "education":
          this.renderEducationSection();
          this.y += this.spacing.sectionGap;
          break;
        case "skills":
          this.renderSkillsSection();
          this.y += this.spacing.sectionGap;
          break;
        case "projects":
          this.renderProjectsSection();
          this.y += this.spacing.sectionGap;
          break;
        case "certificates":
          this.renderCertificatesSection();
          this.y += this.spacing.sectionGap;
          break;
        case "languages":
          this.renderLanguagesSection();
          this.y += this.spacing.sectionGap;
          break;
        case "achievements":
          this.renderAchievementsSection();
          this.y += this.spacing.sectionGap;
          break;
        case "references":
          this.renderReferencesSection();
          this.y += this.spacing.sectionGap;
          break;
      }
    }
  }

  // --- two-column layouts --------------------------------------------------
  sidebarSectionTitle(title, yPx, fg) {
    const text = sanitize(String(title).toUpperCase());
    this.text(text, this.colX, yPx, { font: this.bold, sizePx: this.sectionPx * 0.95, color: fg });
    this.hline(this.colX, yPx + this.sectionPx * 0.6, this.colW, { color: fg, opacity: 0.3, thickness: 1 });
    return yPx + this.sectionPx * 1.2 + 8;
  }

  renderSidebarLayout() {
    const sbW = Math.round(this.pageW * 0.32);
    const m = this.margin;
    const sidebarBg = this.dark ? "#1a1815" : this.accent;
    const sidebarFg = this.dark ? this.ink : contrastColor(this.accent);
    const sidebarMuted = this.dark ? this.muted : sidebarFg;

    this.clip = true;
    this.rect(0, 0, sbW, this.pageH, { fill: sidebarBg });

    const p = this.data.personal || {};
    let sy = m;
    this.colX = 12;
    this.colW = sbW - 24;
    sy = this.text(p.name || "Your Name", this.colX, sy, {
      font: this.bold,
      sizePx: this.namePx * 0.72,
      color: sidebarFg,
      align: "center",
      maxWidthPx: this.colW,
      lineHeight: 1.25,
    });
    if (p.title) {
      sy += 2;
      sy = this.text(p.title, this.colX, sy, {
        font: this.bold,
        sizePx: this.titlePx * 0.9,
        color: sidebarFg,
        align: "center",
        maxWidthPx: this.colW,
        opacity: 0.95,
      });
    }
    sy += this.spacing.sectionGap;

    const sidebarBlock = (title, items, renderItem) => {
      if (!items.length) return sy;
      sy = this.sidebarSectionTitle(title, sy, sidebarFg);
      for (const it of items) {
        sy = renderItem(it, sy);
        sy += 3;
      }
      sy += 6;
    };

    const contactItems = this.contactItems();
    sidebarBlock(
      "Contact",
      contactItems,
      (it, yy) => this.text(it, this.colX, yy, { font: this.font, sizePx: this.body * 0.86, color: sidebarFg, maxWidthPx: this.colW })
    );
    sidebarBlock(
      "Skills",
      this.data.skills,
      (s, yy) => this.text(s.name, this.colX, yy, { font: this.font, sizePx: this.body * 0.86, color: sidebarFg, maxWidthPx: this.colW })
    );
    sidebarBlock(
      "Languages",
      this.data.languages,
      (l, yy) => this.text(typeof l === "string" ? l : l.name, this.colX, yy, { font: this.font, sizePx: this.body * 0.86, color: sidebarFg, maxWidthPx: this.colW })
    );
    sidebarBlock(
      "Certifications",
      this.data.certificates,
      (c, yy) => {
        yy = this.text(c.name, this.colX, yy, { font: this.bold, sizePx: this.body * 0.94, color: sidebarFg, maxWidthPx: this.colW });
        const sub = [c.issuer, c.date && formatDate(c.date)].filter(Boolean).join(" · ");
        if (sub) {
          yy += 1;
          yy = this.text(sub, this.colX, yy, { font: this.font, sizePx: this.body * 0.84, color: sidebarMuted, maxWidthPx: this.colW });
        }
        return yy;
      }
    );

    // main column
    this.colX = sbW + m;
    this.colW = this.pageW - sbW - m * 2;
    let y = m;
    if (this.data.summary) {
      this.y = y;
      this.drawSectionTitle("Summary", this.y);
      y = this.text(this.data.summary, this.colX, this.y, { font: this.font, sizePx: this.body, maxWidthPx: this.colW });
      y += this.spacing.sectionGap;
    }
    this.y = y;
    this.renderSections(["summary", "skills", "languages", "certificates"]);
  }

  renderSplitLayout() {
    const leftW = Math.round(this.pageW * 0.62);
    const rightW = this.pageW - leftW;
    const m = this.margin;
    const rightBg = this.dark ? "#1a1815" : "#faf8f4";

    this.clip = true;
    this.rect(leftW, 0, rightW, this.pageH, { fill: rightBg });

    const p = this.data.personal || {};

    // LEFT column
    this.colX = m;
    this.colW = leftW - m * 2;
    let y = m;
    y = this.text(p.name || "Your Name", this.colX, y, {
      font: this.bold,
      sizePx: this.namePx,
      color: this.ink,
      maxWidthPx: this.colW,
      lineHeight: 1.15,
    });
    if (p.title) {
      y += 2;
      y = this.text(p.title, this.colX, y, { font: this.bold, sizePx: this.titlePx, color: this.accent });
    }
    y += this.spacing.sectionGap;
    if (this.data.summary) {
      this.y = y;
      this.drawSectionTitle("Profile", this.y);
      y = this.text(this.data.summary, this.colX, this.y, { font: this.font, sizePx: this.body, maxWidthPx: this.colW });
      y += this.spacing.sectionGap;
    }
    this.y = y;
    this.renderSections(["summary", "skills", "languages", "certificates", "projects"]);

    // RIGHT column
    this.colX = leftW + m;
    this.colW = rightW - m * 2;
    let ry = m;
    this.y = ry;
    this.drawSectionTitle("Contact", this.y);
    ry = this.y;
    const contactItems = this.contactItems();
    for (const it of contactItems) {
      ry = this.text(it, this.colX, ry, { font: this.font, sizePx: this.body * 0.86, color: this.muted, maxWidthPx: this.colW });
      ry += 2;
    }
    ry += this.spacing.sectionGap - 2;

    const rightSection = (title, items, renderItem) => {
      if (!items.length) return ry;
      this.y = ry;
      this.drawSectionTitle(title, this.y);
      ry = this.y;
      for (const it of items) {
        ry = renderItem(it, ry);
        ry += 3;
      }
      ry += this.spacing.sectionGap - 3;
      return ry;
    };    rightSection("Skills", this.data.skills, (s, yy) =>
      this.text(s.name, this.colX, yy, { font: this.font, sizePx: this.body * 0.86, maxWidthPx: this.colW })
    );
    rightSection("Languages", this.data.languages, (l, yy) => {
      const name = typeof l === "string" ? l : l.name;
      const prof = typeof l === "string" ? "" : l.proficiency;
      let line = name;
      if (prof) line += `  —  ${prof}`;
      return this.text(line, this.colX, yy, { font: this.font, sizePx: this.body * 0.86, maxWidthPx: this.colW });
    });
    rightSection("Certifications", this.data.certificates, (c, yy) =>
      this.text(c.name, this.colX, yy, { font: this.bold, sizePx: this.body * 0.94, maxWidthPx: this.colW })
    );
    rightSection("Projects", this.data.projects, (pr, yy) =>
      this.text(pr.name, this.colX, yy, { font: this.bold, sizePx: this.body * 0.94, maxWidthPx: this.colW })
    );
  }

  // --- top level -----------------------------------------------------------
  render() {
    const archetype = this.template.archetype || "modern";
    this.addPage();

    this.colX = this.margin;
    this.colW = this.pageW - this.margin * 2;

    if (archetype === "sidebar") {
      this.renderSidebarLayout();
      return;
    }
    if (archetype === "split") {
      this.renderSplitLayout();
      return;
    }

    switch (archetype) {
      case "classic":
        this.renderClassicHeader();
        break;
      case "hero":
        this.renderHeroHeader();
        break;
      case "editorial":
        this.renderEditorialHeader();
        break;
      case "creative":
        this.renderCreativeHeader();
        break;
      case "modern":
      default:
        this.renderModernHeader();
        break;
    }

    this.renderSections([]);
  }
}

/**
 * Generate a PDF from resume data, mirroring the selected template preview.
 *
 * @param {object} resume - Complete resume object with all sections
 * @param {object} options
 * @param {string} options.template - Template name
 * @param {string} options.colorTheme - Hex color for headers
 * @param {object} [options.design] - User design overrides
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateResumePDF(resume, options = {}) {
  const { template = "modern", colorTheme = null, design = null } = options;

  const resolvedDesign = resolveDesign(template, design, colorTheme);

  const pdfDoc = await PDFDocument.create();
  const builder = new PdfBuilder(pdfDoc, template, resolvedDesign, resume);
  await builder.setupFonts();
  builder.render();
  builder.drawPageFooters();

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
