"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScaledResume } from "./scaled-resume";
import { TEMPLATES } from "@/lib/templates/registry";
import { normalizeResume } from "@/lib/templates/normalize";
import { FONTS, SPACING, MARGINS, PAGE_SIZES, HEADER_STYLES, SECTION_STYLES, resolveDesign } from "@/lib/templates/design";
import { isPremiumUser } from "@/lib/templates/access";
import { useAuthStore } from "@/store";
import { cn } from "@/lib/utils";
import { Search, Check, Sparkles, Palette, LayoutTemplate } from "lucide-react";

export function TemplatePicker({ open, onOpenChange, resume, onApplyTemplate, onApplyDesign, onUpgradeNeeded, defaultTab }) {
  const { user } = useAuthStore();
  const [tab, setTab] = useState("templates");
  const [search, setSearch] = useState("");

  const premium = isPremiumUser(user);
  const data = useMemo(() => normalizeResume(resume), [resume]);
  const design = useMemo(() => (resume?.design ? { ...resume.design } : null), [resume]);
  const resolvedDesign = useMemo(
    () => (resume ? resolveDesign(resume.template, resume.design, resume.colorTheme) : null),
    [resume]
  );

  useEffect(() => {
    if (open) {
      setSearch("");
      setTab(defaultTab || "templates");
    }
  }, [open, defaultTab]);

  const templates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter((tpl) => {
      const haystack = [tpl.name, tpl.tagline, tpl.category, ...tpl.industries, ...tpl.jobTitles].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [search]);

  const patch = (key, value) => {
    onApplyDesign?.({ [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Templates & Design</DialogTitle>
        <DialogDescription className="sr-only">Choose a template and customize its design.</DialogDescription>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="heading-display text-base font-semibold text-ink">Template & Design Studio</h2>
            <TabsList>
              <TabsTrigger value="templates" className="gap-1.5">
                <LayoutTemplate className="h-3.5 w-3.5" /> Templates
              </TabsTrigger>
              <TabsTrigger value="design" className="gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Customize
              </TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="templates" className="mt-0">
          <div className="border-b border-border px-5 py-3">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a template…"
                className="h-9 rounded-lg pl-9 text-[13px]"
              />
            </div>
          </div>
          <div className="grid max-h-[62vh] grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-3 lg:grid-cols-4">
            {templates.map((tpl) => {
              const active = resume?.template === tpl.id;
              const locked = tpl.isPremium && !premium;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    if (locked) {
                      onUpgradeNeeded?.(tpl);
                      return;
                    }
                    onApplyTemplate?.(tpl.id);
                  }}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-xl border bg-paper text-left transition-all",
                    active ? "border-stamp ring-2 ring-stamp/25" : "border-border hover:border-border-strong hover:shadow-md"
                  )}
                >
                  <div className="relative aspect-[3/3.6] w-full overflow-hidden bg-paper-alt">
                    <ScaledResume template={tpl} data={data} design={resolvedDesign} className="opacity-90" />
                    {locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-overlay backdrop-blur-[1px]">
                        <Badge variant="pro" className="gap-1">
                          <Sparkles className="h-3 w-3" /> Pro
                        </Badge>
                      </div>
                    )}
                    {active && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-stamp text-paper shadow">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="truncate text-[12px] font-semibold text-ink">{tpl.name}</span>
                    {!premium && (tpl.isPremium ? (
                      <Badge variant="pro" className="px-1.5 py-0 text-[9px]">
                        Pro
                      </Badge>
                    ) : (
                      <Badge variant="success" className="px-1.5 py-0 text-[9px]">
                        Free
                      </Badge>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="design" className="mt-0">
          {resolvedDesign && (
            <div className="grid max-h-[62vh] grid-cols-1 gap-0 overflow-y-auto md:grid-cols-[240px_minmax(0,1fr)]">
              <div className="flex items-start justify-center bg-[#e7e3db] p-5 md:max-h-[62vh]">
                <div className="w-full max-w-[200px]">
                  <ScaledResume template={resume?.template} data={data} design={design} colorTheme={resume?.colorTheme} className="rounded-sm shadow-lg" />
                </div>
              </div>

              <div className="space-y-6 p-5">
                <div>
                  <ControlLabel>Accent color</ControlLabel>
                  <div className="flex flex-wrap gap-2">
                    {getTemplateSwatches(resume?.template).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => patch("color", c)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                          (resolvedDesign.color || "").toLowerCase() === c.toLowerCase()
                            ? "border-ink ring-2 ring-ink/20"
                            : "border-border"
                        )}
                        style={{ background: c }}
                        aria-label={c}
                      />
                    ))}
                    <label className="flex h-8 items-center gap-1 rounded-full border border-dashed border-border px-2 text-[11px] text-muted-foreground hover:border-border-strong">
                      Custom
                      <input
                        type="color"
                        value={resolvedDesign.color}
                        onChange={(e) => patch("color", e.target.value)}
                        className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <ControlLabel>Typography</ControlLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(FONTS).map(([key, f]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => patch("font", key)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-[12px] transition-colors",
                          resolvedDesign.font === key ? "border-stamp bg-stamp/5 text-ink" : "border-border text-ink-soft hover:border-border-strong"
                        )}
                        style={{ fontFamily: f.family }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ControlLabel>Spacing</ControlLabel>
                    <div className="space-y-1">
                      {Object.entries(SPACING).map(([key, s]) => (
                        <SelectRow key={key} active={resolvedDesign.spacing === key} onClick={() => patch("spacing", key)}>
                          {s.label}
                        </SelectRow>
                      ))}
                    </div>
                  </div>
                  <div>
                    <ControlLabel>Page size</ControlLabel>
                    <div className="space-y-1">
                      {Object.entries(PAGE_SIZES).map(([key, s]) => (
                        <SelectRow key={key} active={resolvedDesign.pageSize === key} onClick={() => patch("pageSize", key)}>
                          {s.label}
                        </SelectRow>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <ControlLabel>Header style</ControlLabel>
                    <div className="space-y-1">
                      {Object.entries(HEADER_STYLES).map(([key, s]) => (
                        <SelectRow key={key} active={resolvedDesign.headerStyle === key} onClick={() => patch("headerStyle", key)}>
                          {s.label}
                        </SelectRow>
                      ))}
                    </div>
                  </div>
                  <div>
                    <ControlLabel>Section style</ControlLabel>
                    <div className="space-y-1">
                      {Object.entries(SECTION_STYLES).map(([key, s]) => (
                        <SelectRow key={key} active={resolvedDesign.sectionStyle === key} onClick={() => patch("sectionStyle", key)}>
                          {s.label}
                        </SelectRow>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <ControlLabel>Margins</ControlLabel>
                  <div className="flex gap-2">
                    {Object.entries(MARGINS).map(([key, m]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => patch("margins", key)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors",
                          resolvedDesign.margins === key ? "border-stamp bg-stamp/5 text-ink" : "border-border text-ink-soft hover:border-border-strong"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function getTemplateSwatches(templateId) {
  const tpl = TEMPLATES.find((t) => t.id === templateId);
  return tpl?.swatches || ["#2563eb", "#059669", "#7c3aed", "#db2777", "#0f172a"];
}

function ControlLabel({ children }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</p>;
}

function SelectRow({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left text-[12px] transition-colors",
        active ? "border-stamp bg-stamp/5 text-ink" : "border-border text-ink-soft hover:border-border-strong"
      )}
    >
      {children}
      {active && <Check className="h-3.5 w-3.5 text-stamp" />}
    </button>
  );
}
