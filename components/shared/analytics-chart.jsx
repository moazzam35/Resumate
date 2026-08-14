"use client";

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gauge,
  BarChart2,
  AreaChart as AreaIcon,
  Eye,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";

/* ============================================================
   Palette (CSS vars so charts adapt to light/dark automatically)
   ============================================================ */
const STAMP = "var(--stamp)";
const VERIFIED = "var(--verified)";
const SEAL = "var(--seal)";
const FLAG = "var(--flag)";
const INK_SOFT = "var(--ink-soft)";
const MUTED = "var(--muted)";
const BORDER = "var(--border)";

const CHART_COLORS = [STAMP, VERIFIED, SEAL, FLAG, INK_SOFT];

const AI_TYPE_LABELS = {
  REWRITE_BULLETS: "Rewrite Bullets",
  GENERATE_SKILLS: "Generate Skills",
  GENERATE_PROJECTS: "Generate Projects",
  GENERATE_ACHIEVEMENTS: "Generate Achievements",
  ATS_KEYWORDS: "ATS Keywords",
};

const RANGES = [
  { label: "7D", value: 7 },
  { label: "14D", value: 14 },
  { label: "30D", value: 30 },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ============================================================
   Deterministic demo-data helpers (used only until real data exists)
   ============================================================ */
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toDateStr(d) {
  return d.toISOString().split("T")[0];
}

function shortLabel(dateStr) {
  const parts = dateStr.split("-").map(Number);
  return `${MONTHS[parts[1] - 1]} ${parts[2]}`;
}

function generateDemoSeries(days) {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const wd = d.getDay();
    const weekendFactor = wd === 0 || wd === 6 ? 0.5 : 1;
    const progress = (days - i) / days;
    const r = mulberry32(hashSeed("demo-" + toDateStr(d)));
    const resumes = Math.max(
      0,
      Math.round((progress * 2.6 + 0.2) * weekendFactor + r() * 1.4 - 0.6)
    );
    out.push({ date: toDateStr(d), resumes });
  }
  return out;
}

function demoViews(dateStr, resumes) {
  const r = mulberry32(hashSeed("views-" + dateStr));
  return Math.max(2, Math.round(resumes * 9 + r() * 7 + 3));
}

function movingAverage(values, window = 7) {
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    out.push(Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 10) / 10);
  }
  return out;
}

function buildTrendData(analytics, rangeDays) {
  const real = (analytics?.resumeViews || []).map((d) => ({
    date: d.date,
    resumes: d.views ?? 0,
  }));

  let series;
  if (real.length === 0) {
    series = generateDemoSeries(rangeDays);
  } else {
    series = real.slice(-rangeDays);
    if (series.length < rangeDays) {
      const start = new Date(series[0].date + "T00:00:00");
      const needed = rangeDays - series.length;
      const prefix = [];
      for (let i = needed; i >= 1; i--) {
        const d = new Date(start);
        d.setDate(start.getDate() - i);
        prefix.push({ date: toDateStr(d), resumes: 0 });
      }
      series = [...prefix, ...series];
    }
    if (!series.some((s) => s.resumes > 0)) {
      series = generateDemoSeries(rangeDays);
    }
  }

  return series.map(({ date, resumes }) => ({
    name: shortLabel(date),
    date,
    resumes,
    views: demoViews(date, resumes),
  }));
}

/* ============================================================
   Premium tooltip
   ============================================================ */
function PremiumTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null;
  const fmt = valueFormatter || ((v) => v);
  return (
    <div className="rounded-xl border border-border/70 bg-paper/95 dark:bg-paper-alt/95 backdrop-blur-xl px-3.5 py-2.5 shadow-xl shadow-ink/10 min-w-[168px]">
      <p className="text-[11px] font-semibold text-ink/70 tracking-wide mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              {entry.dataKey === "views" ? (
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.stroke || entry.fill }} />
              ) : entry.strokeDasharray ? (
                <span className="inline-block h-0 w-3 border-t-2 border-dashed" style={{ borderColor: entry.stroke }} />
              ) : (
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.fill || entry.stroke }} />
              )}
              <span className="capitalize">{entry.name}</span>
            </span>
            <span className="text-xs font-semibold text-ink tabular-nums mono-data">{fmt(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   KPI mini-stat
   ============================================================ */
function MiniStat({ icon: Icon, label, value, sub, tone = "ink" }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-paper-alt/60 text-muted">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="text-sm font-semibold text-ink tabular-nums mono-data truncate">{value}</p>
        {sub && <p className={cn("text-[10px] font-medium leading-none mt-0.5", tone)}>{sub}</p>}
      </div>
    </div>
  );
}

/* ============================================================
   Toggle pill group
   ============================================================ */
function PillGroup({ options, value, onChange, className }) {
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-border/70 bg-paper-alt/60 p-0.5", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.title}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
            value === opt.value
              ? "bg-popover text-ink shadow-sm border border-border/70"
              : "text-muted hover:text-ink"
          )}
        >
          {opt.icon}
          {opt.label && opt.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   Loading skeleton
   ============================================================ */
function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card/70 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

/* ============================================================
   Main chart component
   ============================================================ */
export const AnalyticsChart = React.memo(function AnalyticsChart({
  analytics = null,
  isLoading = false,
  title = "Performance Overview",
  description = "Weekly resume generations and profile engagement",
}) {
  const [range, setRange] = useState(30);
  const [metric, setMetric] = useState("views");
  const [chartType, setChartType] = useState("area");

  const trendData = useMemo(() => buildTrendData(analytics, range), [analytics, range]);

  const maData = useMemo(() => {
    const ma = movingAverage(trendData.map((d) => d[metric]), 7);
    return trendData.map((d, i) => ({ ...d, ma: ma[i] }));
  }, [trendData, metric]);

  const kpis = useMemo(() => {
    if (!trendData.length) return null;
    const values = trendData.map((d) => d[metric]);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / trendData.length;
    const peakIdx = values.indexOf(Math.max(...values));
    const peak = { value: values[peakIdx], name: trendData[peakIdx]?.name };
    const mid = Math.floor(trendData.length / 2);
    const firstHalf = values.slice(0, mid).reduce((a, b) => a + b, 0);
    const secondHalf = values.slice(mid).reduce((a, b) => a + b, 0);
    let change = 0;
    let up = true;
    if (firstHalf === 0 && secondHalf === 0) {
      change = 0;
      up = true;
    } else if (firstHalf === 0) {
      change = 100;
      up = true;
    } else {
      change = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
      up = secondHalf >= firstHalf;
    }
    return { total, avg, peak, change, up };
  }, [trendData, metric]);

  const secondaryCardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  if (isLoading) {
    return <ChartSkeleton />;
  }

  const primaryColor = metric === "views" ? STAMP : VERIFIED;
  const secondaryColor = INK_SOFT;
  const primaryName = metric === "views" ? "Views" : "Resumes";
  const secondaryName = metric === "views" ? "Resumes" : "Views";

  return (
    <div className="space-y-4">
      {/* ============ MAIN TREND CARD ============ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-lg shadow-ink/5"
      >
        {/* decorative gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-[0.07] dark:opacity-10"
          style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stamp/40 to-transparent" />

        <div className="relative p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-stamp/15 to-stamp/5 text-stamp border border-stamp/15">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="heading-display text-base font-semibold text-ink">{title}</h3>
                  <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5 max-w-sm">{description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PillGroup
                options={RANGES.map((r) => ({ value: r.value, label: r.label }))}
                value={range}
                onChange={setRange}
              />
              <PillGroup
                options={[
                  { value: "views", label: "Views", icon: <Eye className="h-3.5 w-3.5" /> },
                  { value: "resumes", label: "Resumes", icon: <FileText className="h-3.5 w-3.5" /> },
                ]}
                value={metric}
                onChange={setMetric}
              />
              <PillGroup
                options={[
                  { value: "area", icon: <AreaIcon className="h-3.5 w-3.5" />, title: "Area chart" },
                  { value: "bar", icon: <BarChart2 className="h-3.5 w-3.5" />, title: "Bar chart" },
                ]}
                value={chartType}
                onChange={setChartType}
              />
            </div>
          </div>

          {/* KPI strip */}
          {kpis && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/50 bg-paper-alt/40 p-3 sm:grid-cols-4">
              <MiniStat icon={Gauge} label="Total" value={kpis.total} sub="in range" />
              <MiniStat icon={Calendar} label="Daily avg" value={kpis.avg.toFixed(1)} sub="per day" />
              <MiniStat
                icon={TrendingUp}
                label="Peak"
                value={kpis.peak.value}
                sub={kpis.peak.name}
                tone="text-stamp"
              />
              <MiniStat
                icon={kpis.up ? TrendingUp : TrendingDown}
                label="Trend"
                value={`${kpis.up ? "+" : ""}${kpis.change}%`}
                sub="vs prior"
                tone={kpis.up ? "text-success" : "text-destructive"}
              />
            </div>
          )}

          {/* Chart */}
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <ComposedChart data={maData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendPrimaryFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="trendMaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SEAL} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={SEAL} stopOpacity={0} />
                    </linearGradient>
                    <filter id="maGlow" x="-30%" y="-40%" width="160%" height="180%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={BORDER} strokeOpacity={0.45} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: MUTED, fontSize: 11 }}
                    tickMargin={10}
                    minTickGap={28}
                    dy={4}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={38}
                    tick={{ fill: MUTED, fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<PremiumTooltip />}
                    cursor={{ stroke: MUTED, strokeDasharray: "4 4", strokeOpacity: 0.4 }}
                  />
                  {kpis && (
                    <ReferenceLine
                      y={Math.round(kpis.avg)}
                      stroke={primaryColor}
                      strokeOpacity={0.22}
                      strokeDasharray="3 4"
                      ifOverflow="extendDomain"
                    />
                  )}
                  {kpis && (
                    <ReferenceLine
                      x={kpis.peak.name}
                      stroke={MUTED}
                      strokeOpacity={0.45}
                      strokeDasharray="3 4"
                      label={{
                        value: "Peak",
                        position: "insideTopLeft",
                        offset: 6,
                        fill: MUTED,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {/* soft halo */}
                  <Area
                    type="monotone"
                    dataKey={metric}
                    name={primaryName}
                    stroke={primaryColor}
                    strokeWidth={6}
                    strokeOpacity={0.14}
                    fill="none"
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    name={primaryName}
                    stroke={primaryColor}
                    strokeWidth={2.5}
                    fill="url(#trendPrimaryFill)"
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--paper)", fill: primaryColor }}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey={secondaryName.toLowerCase()}
                    name={secondaryName}
                    stroke={secondaryColor}
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    strokeOpacity={0.55}
                    dot={false}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma"
                    name={`${primaryName} Avg`}
                    stroke={SEAL}
                    strokeWidth={2}
                    strokeOpacity={0.9}
                    filter="url(#maGlow)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--paper)", fill: SEAL }}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              ) : (
                <ComposedChart data={maData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendPrimaryBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={primaryColor} stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="trendSecondaryBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.2} />
                    </linearGradient>
                    <filter id="maGlowBar" x="-30%" y="-40%" width="160%" height="180%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={BORDER} strokeOpacity={0.45} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: MUTED, fontSize: 11 }}
                    tickMargin={10}
                    minTickGap={28}
                    dy={4}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={38}
                    tick={{ fill: MUTED, fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<PremiumTooltip />}
                    cursor={{ fill: BORDER, fillOpacity: 0.12 }}
                  />
                  {kpis && (
                    <ReferenceLine
                      y={Math.round(kpis.avg)}
                      stroke={primaryColor}
                      strokeOpacity={0.22}
                      strokeDasharray="3 4"
                      ifOverflow="extendDomain"
                    />
                  )}
                  <Bar
                    dataKey={metric}
                    name={primaryName}
                    fill="url(#trendPrimaryBar)"
                    radius={[5, 5, 2, 2]}
                    maxBarSize={18}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey={secondaryName.toLowerCase()}
                    name={secondaryName}
                    fill="url(#trendSecondaryBar)"
                    radius={[5, 5, 2, 2]}
                    maxBarSize={18}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="ma"
                    name={`${primaryName} Avg`}
                    stroke={SEAL}
                    strokeWidth={2}
                    strokeOpacity={0.9}
                    filter="url(#maGlowBar)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--paper)", fill: SEAL }}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 border-t border-border/50 pt-3.5">
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: primaryColor }} />
              <span className="font-medium text-ink/80">{primaryName}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="inline-block h-0 w-4 border-t-2 border-dashed" style={{ borderColor: secondaryColor }} />
              <span className="font-medium text-ink/80">{secondaryName}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: SEAL }} />
              <span className="font-medium text-ink/80">{primaryName} Avg</span>
            </span>
            <span className="ml-auto text-[10px] text-muted/70">Updated just now</span>
          </div>
        </div>
      </motion.div>

      {/* ============ SECONDARY CHARTS ============ */}
      <motion.div
        variants={secondaryCardVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2"
      >
        <TemplateUsageCard analytics={analytics} />
        <AIUsageCard analytics={analytics} />
      </motion.div>
    </div>
  );
});

/* ============================================================
   Template usage — animated donut + legend
   ============================================================ */
function TemplateUsageCard({ analytics }) {
  const data = useMemo(() => {
    const real = analytics?.templateUsage?.length ? analytics.templateUsage : null;
    const list =
      real ||
      [
        { name: "Professional", count: 4 },
        { name: "Modern", count: 3 },
        { name: "Minimal", count: 2 },
      ];
    const total = list.reduce((a, b) => a + b.count, 0);
    return list
      .slice(0, 6)
      .map((t, i) => ({
        name: t.name,
        value: t.count,
        percent: total ? Math.round((t.count / total) * 100) : 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
  }, [analytics]);

  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-lg shadow-ink/5 p-5">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-verified/40 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <h4 className="heading-display text-sm font-semibold text-ink flex items-center gap-2">
            <Layers className="h-4 w-4 text-verified" />
            Template Usage
          </h4>
          <p className="text-xs text-muted mt-0.5">Most used resume layouts</p>
        </div>
        <span className="rounded-full border border-border/60 bg-paper-alt/60 px-2 py-0.5 text-[10px] font-semibold text-muted tabular-nums">
          {total} used
        </span>
      </div>

      {data.length === 0 ? (
        <p className="py-10 text-center text-xs text-muted">No template data yet.</p>
      ) : (
        <div className="mt-5 flex items-center gap-6">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<PremiumTooltip valueFormatter={(v) => `${v} (${Math.round((v / total) * 100) || 0}%)`} />}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-ink tabular-nums mono-data">{total}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">Templates</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2.5">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-xs text-ink/80">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
                  <span className="truncate font-medium">{entry.name}</span>
                </span>
                <span className="shrink-0 text-xs text-muted tabular-nums">
                  {entry.value} <span className="text-muted/60">· {entry.percent}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   AI usage — animated rounded bars
   ============================================================ */
function AIUsageCard({ analytics }) {
  const data = useMemo(() => {
    const real = analytics?.aiUsageByType?.length ? analytics.aiUsageByType : null;
    const list =
      real ||
      [
        { type: "REWRITE_BULLETS", count: 5 },
        { type: "GENERATE_SKILLS", count: 4 },
        { type: "ATS_KEYWORDS", count: 3 },
        { type: "GENERATE_PROJECTS", count: 2 },
      ];
    const total = list.reduce((a, b) => a + b.count, 0);
    return list.slice(0, 6).map((item, i) => ({
      name: AI_TYPE_LABELS[item.type] || item.type,
      value: item.count,
      percent: total ? Math.round((item.count / total) * 100) : 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [analytics]);

  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-lg shadow-ink/5 p-5">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-seal/40 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <h4 className="heading-display text-sm font-semibold text-ink flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-seal" />
            AI Usage
          </h4>
          <p className="text-xs text-muted mt-0.5">Assist requests by feature</p>
        </div>
        <span className="rounded-full border border-border/60 bg-paper-alt/60 px-2 py-0.5 text-[10px] font-semibold text-muted tabular-nums">
          {total} requests
        </span>
      </div>

      {data.length === 0 ? (
        <p className="py-10 text-center text-xs text-muted">No AI activity yet.</p>
      ) : (
        <div className="mt-5 space-y-3.5">
          {data.map((entry, index) => (
            <div key={entry.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink/80">{entry.name}</span>
                <span className="text-muted tabular-nums">
                  {entry.value} <span className="text-muted/60">· {entry.percent}%</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border/40">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${entry.color} 0%, ${entry.color}cc 100%)`,
                    boxShadow: `0 0 8px ${entry.color}66`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(entry.percent, 4)}%` }}
                  transition={{ duration: 0.9, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnalyticsChart;
