"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Download,
  Check,
  ChevronRight,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  LayoutTemplate,
  AlertCircle,
  Save,
  Menu,
  X,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumeStore, useUIStore } from "@/store";
import { get, put, post } from "@/lib/api";
import { cn, downloadResumePDF, checkResumeCompletion, getStepStatus, serializeResume } from "@/lib/utils";
import { PersonalInfoStep } from "@/components/features/resume/personal-info-step";
import { ExperienceStep } from "@/components/features/resume/experience-step";
import { EducationStep } from "@/components/features/resume/education-step";
import { SkillsStep } from "@/components/features/resume/skills-step";
import { ProjectsStep } from "@/components/features/resume/projects-step";
import { CertificatesStep } from "@/components/features/resume/certificates-step";
import { LanguagesStep } from "@/components/features/resume/languages-step";
import { AchievementsStep } from "@/components/features/resume/achievements-step";
import { ResumePreview } from "@/components/features/resume/resume-preview";
import { ResumeCompletion } from "@/components/features/resume/resume-completion";
import { AIAssistant } from "@/components/features/ai/ai-assistant";
import { TemplatePicker } from "@/components/features/templates/template-picker";
import { UpgradeModal } from "@/components/features/templates/upgrade-modal";
import { getTemplate } from "@/lib/templates/registry";
import { getPendingTemplate, clearPendingTemplate } from "@/lib/templates/pending";
import { Skeleton } from "@/components/shared/loading-skeleton";


const steps = [
  { id: "personal", label: "Personal Info", component: PersonalInfoStep },
  { id: "experience", label: "Work Experience", component: ExperienceStep },
  { id: "education", label: "Education", component: EducationStep },
  { id: "skills", label: "Skills & Keywords", component: SkillsStep },
  { id: "projects", label: "Projects", component: ProjectsStep },
  { id: "certificates", label: "Certifications", component: CertificatesStep },
  { id: "languages", label: "Languages", component: LanguagesStep },
  { id: "achievements", label: "Achievements", component: AchievementsStep },
  { id: "preview", label: "Live Preview", component: ResumePreview },
];

export default function ResumeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState("templates");
  const [upgradeTemplate, setUpgradeTemplate] = useState(null);
  const [aiRequest, setAiRequest] = useState(null);
  const [pageCount, setPageCount] = useState(1);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { currentResume, setCurrentResume, currentStep, setCurrentStep, lastSaved, setLastSaved, isSaving, setIsSaving } = useResumeStore();
  const showToast = useUIStore((s) => s.showToast);

  const { complete: isResumeComplete, missing: missingSections } = checkResumeCompletion(currentResume);

  const stepStatuses = steps.map((step) => getStepStatus(currentResume, step.id));
  const currentValid = stepStatuses[currentStep]?.valid ?? false;
  const currentMissing = stepStatuses[currentStep]?.missing || [];

  const isFinalStep = currentStep === steps.length - 1;
  const completedCount = steps.slice(0, -1).filter((step, index) => stepStatuses[index]?.valid).length;
  const hasUnsavedChanges = useMemo(() => {
    if (!currentResume || !savedSnapshot) return false;
    return JSON.stringify(serializeResume(currentResume)) !== JSON.stringify(serializeResume(savedSnapshot));
  }, [currentResume, savedSnapshot]);

  useEffect(() => {
    async function fetchResume() {
      try {
        const data = await get(`/resumes/${resumeId}`);
        setCurrentResume(data.resume);
        setSavedSnapshot(data.resume);
        setLastSaved(new Date());

        const pending = getPendingTemplate();
        if (pending && pending.resumeId === resumeId && pending.templateId) {
          clearPendingTemplate();
          const tpl = getTemplate(pending.templateId);
          await put(`/resumes/${resumeId}`, { template: tpl.id, colorTheme: tpl.design.color });
          const updated = await get(`/resumes/${resumeId}`);
          setCurrentResume(updated.resume);
          showToast({ message: `${tpl.name} template applied`, type: "success" });
        }
      } catch (error) {
        showToast({ message: "Failed to load resume", type: "error" });
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    if (resumeId) fetchResume();
  }, [resumeId]);

  useEffect(() => {
    if (!resumeId || !isFinalStep || !currentResume) return;
    let cancelled = false;
    async function reconcile() {
      try {
        const data = await get(`/resumes/${resumeId}`);
        if (cancelled) return;
        setSavedSnapshot(data.resume);
      } catch {
        // keep last known snapshot
      }
    }
    reconcile();
    return () => {
      cancelled = true;
    };
  }, [resumeId, isFinalStep]);

  const handleApplyTemplate = useCallback(
    async (templateId) => {
      const tpl = getTemplate(templateId);
      const hasCustomColor = Boolean(currentResume?.design?.color);
      const patch = { template: tpl.id };
      if (!hasCustomColor) patch.colorTheme = tpl.design.color;
      const prev = currentResume;
      const next = { ...currentResume, ...patch };
      setCurrentResume(next);
      try {
        await put(`/resumes/${resumeId}`, patch);
        setSavedSnapshot(next);
        showToast({ message: `Switched to ${tpl.name} template`, type: "success" });
      } catch (error) {
        setCurrentResume(prev);
        showToast({ message: "Failed to apply template", type: "error" });
      }
    },
    [currentResume, resumeId, setCurrentResume]
  );

  const handleApplyDesign = useCallback(
    async (patch) => {
      if (!currentResume) return;
      const nextDesign = { ...(currentResume.design || {}), ...patch };
      const payload = { design: nextDesign };
      if (patch.color) {
        payload.colorTheme = patch.color;
        nextDesign.color = patch.color;
      }
      setCurrentResume({ ...currentResume, design: nextDesign, ...(payload.colorTheme ? { colorTheme: payload.colorTheme } : {}) });
      try {
        await put(`/resumes/${resumeId}`, payload);
        setSavedSnapshot({ ...currentResume, design: nextDesign, ...(payload.colorTheme ? { colorTheme: payload.colorTheme } : {}) });
      } catch {
        // silent autosave
      }
    },
    [currentResume, resumeId, setCurrentResume]
  );

  const handleExportPDF = useCallback(async () => {
    if (!resumeId) return;
    setIsExporting(true);
    try {
      if (currentResume) {
        const payload = {
          title: currentResume.title,
          template: currentResume.template,
          colorTheme: currentResume.colorTheme,
          design: currentResume.design,
        };
        const response = await put(`/resumes/${resumeId}`, payload);
        const savedResume = response.resume || response;
        setCurrentResume(savedResume);
        setSavedSnapshot(savedResume);
        setLastSaved(new Date());
      }
      await downloadResumePDF(resumeId, currentResume?.title);
      showToast({ message: "PDF downloaded successfully", type: "success" });
    } catch (error) {
      showToast({ message: error.message || "Failed to export PDF", type: "error" });
    } finally {
      setIsExporting(false);
    }
  }, [resumeId, currentResume, put, setCurrentResume, showToast]);

  const handleSaveResume = useCallback(async () => {
    if (!resumeId || !currentResume) return;
    setIsSaving(true);
    try {
      const response = await put(`/resumes/${resumeId}`, serializeResume(currentResume));
      const savedResume = response.resume || response;
      setCurrentResume(savedResume);
      setSavedSnapshot(savedResume);
      setLastSaved(new Date());
      showToast({ message: "Resume saved successfully", type: "success" });
    } catch (error) {
      showToast({ message: error.message || "Failed to save resume", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, currentResume, setCurrentResume, setLastSaved, showToast]);

  const handleOpenTemplatePicker = useCallback(() => {
    setPickerTab("templates");
    setPickerOpen(true);
  }, []);

  const handleOpenDesignPicker = useCallback(() => {
    setPickerTab("design");
    setPickerOpen(true);
  }, []);

  const handleEditResume = useCallback(() => {
    setCurrentStep(0);
  }, []);

  const handleApplyResult = useCallback(async (result, toolType, targetExperienceId) => {
    if (!resumeId || !result) return;

    try {
      if (toolType === "SUMMARY") {
        const summary = typeof result === "string" ? result : result.summary || result.text || "";
        if (!summary || !summary.trim()) {
          showToast({ message: "No usable summary in the result", type: "error" });
          return;
        }
        await put(`/resumes/${resumeId}`, { summary });
        const data = await get(`/resumes/${resumeId}`);
        setCurrentResume(data.resume);
        showToast({ message: "Summary applied to resume", type: "success" });
        return;
      }

      if (toolType === "IMPROVE_EXPERIENCE" && targetExperienceId) {
        const description = typeof result === "string" ? result : result.description || result.improvedDescription || "";
        const highlights = Array.isArray(result?.highlights) ? result.highlights.filter(Boolean) : undefined;
        const patch = {};
        if (description) patch.description = description;
        if (highlights && highlights.length) patch.highlights = highlights;
        if (!Object.keys(patch).length) {
          showToast({ message: "No usable content in the result", type: "error" });
          return;
        }
        const current = useResumeStore.getState().currentResume;
        setCurrentResume({
          ...current,
          experiences: (current?.experiences || []).map((e) =>
            e.id === targetExperienceId ? { ...e, ...patch } : e
          ),
        });
        await put(`/resumes/${resumeId}/experiences`, {
          itemId: targetExperienceId,
          ...patch,
        });
        const data = await get(`/resumes/${resumeId}`);
        setCurrentResume(data.resume);
        showToast({ message: "Experience updated", type: "success" });
        return;
      }

      if (toolType === "REWRITE_BULLETS" && targetExperienceId) {
        const bullets = Array.isArray(result)
          ? result
          : Array.isArray(result?.highlights)
          ? result.highlights
          : typeof result === "string"
          ? result.split("\n").filter(Boolean)
          : null;
        if (!bullets || !bullets.length) {
          showToast({ message: "No usable bullets in the result", type: "error" });
          return;
        }
        const cleaned = bullets
          .map((b) => (typeof b === "string" ? b.trim() : b?.text || b?.title || ""))
          .filter(Boolean);
        const current = useResumeStore.getState().currentResume;
        setCurrentResume({
          ...current,
          experiences: (current?.experiences || []).map((e) =>
            e.id === targetExperienceId ? { ...e, highlights: cleaned } : e
          ),
        });
        await put(`/resumes/${resumeId}/experiences`, {
          itemId: targetExperienceId,
          highlights: cleaned,
        });
        const data = await get(`/resumes/${resumeId}`);
        setCurrentResume(data.resume);
        showToast({ message: "Bullets updated", type: "success" });
        return;
      }

      if (toolType === "GENERATE_SKILLS" && Array.isArray(result)) {
        const current = useResumeStore.getState().currentResume;
        const existing = new Set(
          (current?.skills || [])
            .map((s) => String(s?.name || "").trim().toLowerCase())
            .filter(Boolean)
        );
        const seen = new Set();
        const fresh = [];
        for (const item of result) {
          const name = typeof item?.name === "string" ? item.name.trim() : "";
          if (!name) continue;
          const key = name.toLowerCase();
          if (existing.has(key) || seen.has(key)) continue;
          seen.add(key);
          fresh.push({
            name,
            category: item.category || "",
            level: item.level || "INTERMEDIATE",
          });
        }
        if (fresh.length === 0) {
          showToast({ message: "No new skills to add", type: "info" });
          return;
        }
        setCurrentResume({
          ...current,
          skills: [
            ...(current?.skills || []),
            ...fresh.map((s) => ({ ...s, id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` })),
          ],
        });
        for (const s of fresh) {
          await post(`/resumes/${resumeId}/skills`, s);
        }
        const data = await get(`/resumes/${resumeId}`);
        setCurrentResume(data.resume);
        showToast({ message: `${fresh.length} skill${fresh.length > 1 ? "s" : ""} added`, type: "success" });
        return;
      }

      if (toolType === "GENERATE_PROJECTS" && Array.isArray(result)) {
        const current = useResumeStore.getState().currentResume;
        const existing = new Set(
          (current?.projects || [])
            .map((p) => String(p?.name || "").trim().toLowerCase())
            .filter(Boolean)
        );
        const seen = new Set();
        const fresh = [];
        for (const item of result) {
          const name = typeof item?.name === "string" ? item.name.trim() : "";
          if (!name) continue;
          const key = name.toLowerCase();
          if (existing.has(key) || seen.has(key)) continue;
          seen.add(key);
          fresh.push({
            name,
            description: item.description || "",
            technologies: item.technologies || [],
            url: item.url || "",
            github: item.github || "",
          });
        }
        if (fresh.length === 0) {
          showToast({ message: "No new projects to add", type: "info" });
          return;
        }
        setCurrentResume({
          ...current,
          projects: [
            ...(current?.projects || []),
            ...fresh.map((p) => ({ ...p, id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` })),
          ],
        });
        for (const p of fresh) {
          await post(`/resumes/${resumeId}/projects`, p);
        }
        const data = await get(`/resumes/${resumeId}`);
        setCurrentResume(data.resume);
        showToast({ message: `${fresh.length} project${fresh.length > 1 ? "s" : ""} added`, type: "success" });
        return;
      }

      if (toolType === "GENERATE_ACHIEVEMENTS" && Array.isArray(result)) {
        const current = useResumeStore.getState().currentResume;
        const existing = new Set(
          (current?.achievements || [])
            .map((a) => String(a?.title || "").trim().toLowerCase())
            .filter(Boolean)
        );
        const seen = new Set();
        const fresh = [];
        for (const item of result) {
          const title = typeof item?.title === "string" ? item.title.trim() : "";
          if (!title) continue;
          const key = title.toLowerCase();
          if (existing.has(key) || seen.has(key)) continue;
          seen.add(key);
          fresh.push({
            title,
            description: item.description || "",
          });
        }
        if (fresh.length === 0) {
          showToast({ message: "No new achievements to add", type: "info" });
          return;
        }
        setCurrentResume({
          ...current,
          achievements: [
            ...(current?.achievements || []),
            ...fresh.map((a) => ({ ...a, id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` })),
          ],
        });
        for (const a of fresh) {
          await post(`/resumes/${resumeId}/achievements`, a);
        }
        const data = await get(`/resumes/${resumeId}`);
        setCurrentResume(data.resume);
        showToast({ message: `${fresh.length} achievement${fresh.length > 1 ? "s" : ""} added`, type: "success" });
        return;
      }

      showToast({ message: "Generated! Copy the result and paste it into the relevant section.", type: "info" });
    } catch (error) {
      showToast({ message: error.message || "Failed to apply result", type: "error" });
    }
  }, [currentResume, resumeId, setCurrentResume]);

  const handleGenerateTool = useCallback((tool) => {
    setAiRequest({ tool });
  }, []);

  const handleRunAtsCheck = useCallback(() => {
    handleGenerateTool({ tool: "ATS_KEYWORDS" });
  }, [handleGenerateTool]);

  const handleRequestHandled = useCallback(() => {
    setAiRequest(null);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const totalSections = steps.length - 1;
  const progressPct = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  const renderStepItem = (step, index, onSelect) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;
    const isLocked =
      index > currentStep && !(index === currentStep + 1 && currentValid);
    return (
      <button
        key={step.id}
        onClick={() => {
          if (!isLocked) {
            setCurrentStep(index);
            onSelect?.();
          }
        }}
        disabled={isLocked}
        title={
          isLocked
            ? "Complete the current section to unlock this step"
            : step.label
        }
        className={cn(
          "flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer md:min-h-0",
          isCurrent
            ? "bg-primary text-primary-foreground font-bold shadow-xs"
            : isCompleted
            ? "text-emerald-500 hover:bg-secondary"
            : isLocked
            ? "text-muted-foreground opacity-40 cursor-not-allowed"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold border",
            isCurrent
              ? "border-primary-foreground bg-primary-foreground text-primary"
              : isCompleted
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
              : "border-border"
          )}
        >
          {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
        </div>
        <span className="truncate">{step.label}</span>
      </button>
    );
  };

  const StepComponent = steps[currentStep]?.component;

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-background overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-20" />
            <div className="h-4 w-px bg-border" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="hidden md:block h-8 w-32" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-56 border-r border-border bg-sidebar overflow-hidden p-3 space-y-2 shrink-0 hidden md:block">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl" />
            ))}
          </aside>

          <main className="flex-1 overflow-hidden bg-surface p-4 sm:p-6">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <Skeleton className="h-24 w-full" />
                <div className="flex justify-between border-t border-border pt-4">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* STUDIO TOOLBAR HEADER */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-2 sm:px-3 z-30 md:h-14 md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <Link
            href="/dashboard/resumes"
            aria-label="Back to Dashboard"
            className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 md:h-3.5 md:w-3.5" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-px shrink-0 bg-border" />
          <span className="min-w-0 truncate text-xs font-bold text-foreground">
            {currentResume?.title || "Untitled Resume"}
          </span>
          <Badge
            variant={currentResume?.atsScore >= 80 ? "success" : currentResume?.atsScore >= 60 ? "warning" : "outline"}
            dot
            className="hidden md:inline-flex"
          >
            {currentResume?.atsScore != null
              ? `ATS Score: ${currentResume.atsScore}%`
              : "ATS Score: Not scored"}
          </Badge>
        </div>

        {/* CONTROLS & SAVE */}
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          {/* ZOOM CONTROLS — desktop only */}
          <div className="hidden md:flex items-center rounded-xl border border-border bg-secondary/50 p-1 text-xs">
            <button
              onClick={() => setZoom(Math.max(70, zoom - 10))}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-muted-foreground tabular-nums">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(130, zoom + 10))}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-border hidden md:block" />

          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            onClick={handleOpenTemplatePicker}
            leftIcon={LayoutTemplate}
          >
            <span>Template</span>
          </Button>

          {lastSaved && (
            <span className="hidden md:inline text-[11px] font-mono text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {/* SAVE — mobile only */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 md:hidden"
            onClick={handleSaveResume}
            loading={isSaving}
            leftIcon={Save}
          >
            <span>Save</span>
          </Button>

          {/* EXPORT PDF — mobile (toast when incomplete) */}
          <Button
            size="sm"
            variant="primary"
            className="h-10 px-3 md:hidden"
            disabled={isExporting}
            loading={isExporting}
            leftIcon={Download}
            onClick={() => {
              if (!isResumeComplete) {
                showToast({
                  message: `Complete all required sections to export PDF${
                    missingSections.length ? ` — missing: ${missingSections.join(", ")}` : ""
                  }`,
                  type: "error",
                });
                return;
              }
              handleExportPDF();
            }}
          >
            <span>Export PDF</span>
          </Button>

          {/* MORE MENU — mobile only */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="More options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[190px]">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleOpenTemplatePicker}>
                  <LayoutTemplate />
                  Templates & Design
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRunAtsCheck}>
                  <ShieldCheck />
                  Run ATS check
                </DropdownMenuItem>
                {lastSaved && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      Saved {lastSaved.toLocaleTimeString()}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  {currentResume?.atsScore != null
                    ? `ATS Score: ${currentResume.atsScore}%`
                    : "ATS Score: Not scored"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* EXPORT PDF — desktop (tooltip when incomplete) */}
          <div className="hidden md:block">
            {isResumeComplete ? (
              <Button size="sm" variant="primary" onClick={handleExportPDF} disabled={isExporting} loading={isExporting} leftIcon={Download}>
                <span>Export PDF</span>
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="primary" disabled leftIcon={Download}>
                      <span>Export PDF</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Complete all required sections to enable PDF export</p>
                    {missingSections.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Missing: {missingSections.join(", ")}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </header>

      {/* STUDIO THREE-COLUMN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT STEP NAVIGATION PANEL — desktop */}
        <aside className="w-56 border-r border-border bg-sidebar overflow-y-auto p-3 space-y-1 shrink-0 hidden md:block">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-3 py-1 font-bold">
            Studio Sections
          </p>
          {steps.map((step, index) => renderStepItem(step, index))}
        </aside>

        {/* STEPS DRAWER — mobile */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[75dvh]">
            <DrawerHeader>
              <DrawerTitle className="text-left">
                Studio Sections
              </DrawerTitle>
              <DrawerDescription className="text-left">
                <span className="font-semibold text-foreground">{completedCount}</span> of{" "}
                {totalSections} sections complete
              </DrawerDescription>
              <Progress value={progressPct} className="mt-1 h-1.5" />
            </DrawerHeader>
            <div className="space-y-1 overflow-y-auto px-4 pb-6">
              {steps.map((step, index) =>
                renderStepItem(step, index, () => setDrawerOpen(false))
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* FLOATING STEP SWITCHER — mobile */}
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 md:hidden">
          <Button
            variant="default"
            size="sm"
            className="h-11 rounded-full px-4 shadow-lg"
            leftIcon={Menu}
            onClick={() => setDrawerOpen(true)}
          >
            <span>
              {isFinalStep
                ? "Final Review"
                : `Step ${currentStep + 1}/${steps.length} • ${
                    steps[currentStep]?.label
                  }`}
            </span>
          </Button>
        </div>

        {/* CENTER FORM & PAPER CANVAS SHEET */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface">
          <div className={cn("mx-auto", isFinalStep ? "max-w-6xl" : "max-w-3xl")}>
            <div
              className={cn(
                "items-start",
                isFinalStep
                  ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]"
                  : "space-y-6"
              )}
            >
              {/* LEFT / ACTIVE STEP COLUMN */}
              <div className={cn("min-w-0", isFinalStep && "space-y-6")}>
                {/* STEP PROGRESS STEPPER FOR MOBILE */}
                <div className="flex items-center justify-between md:hidden pb-2 border-b border-border">
                  <span className="text-xs font-bold text-primary">
                    {isFinalStep ? "Final review" : `Section ${currentStep + 1} of ${steps.length}`}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {steps[currentStep]?.label}
                  </span>
                </div>

                <div
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl border border-border bg-card p-6 shadow-xs"
                    >
                      {StepComponent && (
                        <StepComponent
                          resume={currentResume}
                          resumeId={resumeId}
                          onGenerateTool={handleGenerateTool}
                          {...(steps[currentStep]?.id === "preview" ? { onPageCountChange: setPageCount } : {})}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* PREV / NEXT NAV BUTTONS */}
                {isFinalStep ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      leftIcon={ArrowLeft}
                    >
                      Previous Section
                    </Button>

                    <div className="flex items-center justify-center gap-2">
                      {hasUnsavedChanges ? (
                        <Badge variant="warning" dot>
                          Unsaved changes
                        </Badge>
                      ) : (
                        <Badge variant="success" dot>
                          All changes saved
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      leftIcon={ArrowLeft}
                    >
                      Previous Section
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                      disabled={currentStep === steps.length - 1 || !currentValid}
                      rightIcon={ArrowRight}
                    >
                      Next Section
                    </Button>
                  </div>
                )}

                {currentStep < steps.length - 1 && !currentValid && (
                  <div className="flex items-start gap-2 rounded-xl border border-flag/30 bg-flag/5 px-3 py-2.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <p>
                      Complete this section to continue
                      {currentMissing.length > 0 && (
                        <span className="font-semibold">
                          : {currentMissing.join(", ")}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT / FINISH PANEL — shown on the final step */}
              {isFinalStep && (
                <div className="min-w-0 lg:sticky lg:top-0">
                  <ResumeCompletion
                    resume={currentResume}
                    resumeId={resumeId}
                    pageCount={pageCount}
                    completedCount={completedCount}
                    totalSections={steps.length - 1}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSaving={isSaving}
                    isExporting={isExporting}
                    isComplete={isResumeComplete}
                    missingSections={missingSections}
                    lastSaved={lastSaved}
                    onSave={handleSaveResume}
                    onExport={handleExportPDF}
                    onEdit={handleEditResume}
                    onPickTemplate={handleOpenTemplatePicker}
                    onCustomizeDesign={handleOpenDesignPicker}
                    onAtsCheck={handleRunAtsCheck}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT AI ASSISTANT & ATS INSPECTOR */}
        <AIAssistant
          resumeId={resumeId}
          resume={currentResume}
          onApplyResult={handleApplyResult}
          request={aiRequest}
          onRequestHandled={handleRequestHandled}
        />
      </div>

      <TemplatePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        defaultTab={pickerTab}
        resume={currentResume}
        onApplyTemplate={handleApplyTemplate}
        onApplyDesign={handleApplyDesign}
        onUpgradeNeeded={(tpl) => {
          setUpgradeTemplate(tpl);
        }}
      />

      <UpgradeModal
        template={upgradeTemplate}
        open={!!upgradeTemplate}
        onOpenChange={(open) => !open && setUpgradeTemplate(null)}
        resumeId={resumeId}
      />
    </div>
  );
}
