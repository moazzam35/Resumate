"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, Heart, ShieldCheck, Sparkles, RefreshCcw, LayoutTemplate, CheckCircle2 } from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES, SORT_OPTIONS } from "@/lib/templates/registry";
import { isPremiumUser } from "@/lib/templates/access";
import { TemplateCard, TemplateCardSkeleton } from "./template-card";
import { TemplatePreviewModal } from "./template-preview-modal";
import { UpgradeModal } from "./upgrade-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store";
import { useLocalStorage, useDebounce } from "@/hooks";
import { cn } from "@/lib/utils";

export function TemplateGallery({ onUse, title = "Browse templates", subtitle }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [plan, setPlan] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [atsOnly, setAtsOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [upgradeTemplate, setUpgradeTemplate] = useState(null);
  const [used, setUsed] = useLocalStorage("used-templates", []);
  const debouncedSearch = useDebounce(search, 200);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    fetch("/api/template-favorites")
      .then((r) => r.json())
      .then((data) => {
        if (active && data?.success) setFavorites(data.favorites || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const handleToggleFavorite = useCallback(
    async (template) => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      const isFav = favorites.includes(template.id);
      const next = isFav ? favorites.filter((id) => id !== template.id) : [...favorites, template.id];
      setFavorites(next);
      try {
        let ok;
        if (isFav) {
          ok = (await fetch(`/api/template-favorites?templateId=${template.id}`, { method: "DELETE" })).ok;
        } else {
          ok = (
            await fetch("/api/template-favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ templateId: template.id }),
            })
          ).ok;
        }
        if (!ok) throw new Error("Failed to update favorite");
      } catch {
        // revert on failure (network error or non-2xx response)
        setFavorites(isFav ? [...favorites, template.id] : favorites.filter((id) => id !== template.id));
      }
    },
    [isAuthenticated, router, favorites]
  );

  const handleUse = useCallback(
    (template) => {
      if (onUse) {
        onUse(template);
        return;
      }
      const premium = isPremiumUser(user);
      if (template.isPremium && !premium) {
        setUpgradeTemplate(template);
        return;
      }
      setUsed((prev) => [template.id, ...prev.filter((id) => id !== template.id)].slice(0, 20));
      if (!isAuthenticated) {
        router.push(`/register?plan=${template.isPremium ? "pro" : ""}`);
        return;
      }
      router.push(`/resume/new?template=${template.id}`);
    },
    [onUse, user, isAuthenticated, router]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = TEMPLATES.filter((tpl) => {
      if (category !== "all" && tpl.category !== category) return false;
      if (plan === "free" && tpl.isPremium) return false;
      if (plan === "pro" && !tpl.isPremium) return false;
      if (atsOnly && tpl.atsScore < 90) return false;
      if (favoritesOnly && !favorites.includes(tpl.id)) return false;
      if (q) {
        const haystack = [tpl.name, tpl.tagline, tpl.description, tpl.category, ...tpl.industries, ...tpl.jobTitles]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "popular":
        sorted.sort((a, b) => b.popularity - a.popularity);
        break;
      case "ats":
        sorted.sort((a, b) => b.atsScore - a.atsScore);
        break;
      case "az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        sorted.sort((a, b) => (b.tags?.includes("NEW") ? 1 : 0) - (a.tags?.includes("NEW") ? 1 : 0) || b.popularity - a.popularity);
        break;
      default:
        sorted.sort((a, b) => b.popularity - a.popularity || b.atsScore - a.atsScore);
    }
    return sorted;
  }, [debouncedSearch, category, plan, sort, atsOnly, favoritesOnly, favorites]);

  const freeCount = TEMPLATES.filter((t) => !t.isPremium).length;
  const proCount = TEMPLATES.length - freeCount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatsPill icon={LayoutTemplate} label={`${TEMPLATES.length} templates`} />
          <StatsPill icon={Sparkles} label={`${proCount} pro`} />
          <StatsPill icon={CheckCircle2} label={`${freeCount} free`} />
          <StatsPill icon={ShieldCheck} label="ATS-optimized" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, or industry…"
              className="h-11 rounded-xl pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 w-auto min-w-[170px] rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-11 w-auto min-w-[150px] rounded-xl">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex h-11 items-center rounded-xl border border-border bg-paper p-1">
              {[
                { id: "all", label: "All" },
                { id: "free", label: "Free" },
                { id: "pro", label: "Pro" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                    plan === p.id ? "bg-stamp text-paper shadow-sm" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={atsOnly} onClick={() => setAtsOnly(!atsOnly)} icon={ShieldCheck} label="ATS 90+" />
          <FilterChip active={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)} icon={Heart} label="Favorites" />
          {favoritesOnly && (
            <button
              type="button"
              onClick={() => setFavoritesOnly(false)}
              className="text-xs font-medium text-stamp hover:underline"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {TEMPLATES.length} templates
          </span>
        </div>
      </div>

      {authLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <TemplateCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-paper-alt py-20 text-center"
        >
          <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-ink">No templates match your filters</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a different search or clear some filters.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            leftIcon={RefreshCcw}
            onClick={() => {
              setSearch("");
              setCategory("all");
              setPlan("all");
              setAtsOnly(false);
              setFavoritesOnly(false);
            }}
          >
            Reset filters
          </Button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                onPreview={setPreviewTemplate}
                isFavorite={favorites.includes(template.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUse={(tpl) => {
          setPreviewTemplate(null);
          handleUse(tpl);
        }}
        isFavorite={previewTemplate ? favorites.includes(previewTemplate.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <UpgradeModal
        template={upgradeTemplate}
        open={!!upgradeTemplate}
        onOpenChange={(open) => !open && setUpgradeTemplate(null)}
      />
    </div>
  );
}

function StatsPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1 text-xs font-medium text-ink-soft">
      <Icon className="h-3.5 w-3.5 text-stamp" />
      {label}
    </span>
  );
}

function FilterChip({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-stamp bg-stamp/10 text-stamp"
          : "border-border bg-paper text-ink-soft hover:border-border-strong hover:text-ink"
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", active && "fill-stamp/20")} />
      {label}
    </button>
  );
}
