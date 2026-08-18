"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Check,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  LayoutTemplate,
  AlertCircle,
  MoreVertical,
  Trash2,
  Copy,
  Settings2,
  CheckCircle2,
  Loader2,
  Sparkles,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumeStore, useUIStore } from "@/store";
import { useIsKeyboardOpen } from "@/hooks";
import { get, put, post, del } from "@/lib/api";
import {
  cn,
  downloadResumePDF,
  checkResumeCompletion,
  getResumeSectionStatus,
  getStepStatus,
  serializeResume,
} from "@/lib/utils";
import { PersonalInfoStep } from "@/components/features/resume/personal-info-step";
import { ExperienceStep } from "@/components/features/resume/experience-step";
import { EducationStep } from "@/components/features/resume/education-step";
import { SkillsStep } from "@/components/features/resume/skills-step";
import { ProjectsStep } from "@/components/features/resume/projects-step";
import { CertificatesStep } from "@/components/features/resume/certificates-step";
import { LanguagesStep } from "@/components/features/resume/languages-step";
import { AchievementsStep } from "@/components/features/resume/achievements-step";
import { AtsScoreStep } from "@/components/features/resume/ats-score-step";
import { ResumePreview } from "@/components/features/resume/resume-preview";
import { ResumeCompletion } from "@/components/features/resume/resume-completion";
import { ResumeCompleted } from "@/components/features/resume/resume-completed";
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
  { id: "ats", label: "ATS Score", component: AtsScoreStep },
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [isPublicToggle, setIsPublicToggle] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const isKeyboardOpen = useIsKeyboardOpen();

  const stepBarRef = useRef(null);
  const activeStepRef = useRef(null);

  const { currentResume, setCurrentResume, currentStep, setCurrentStep, lastSaved, setLastSaved, isSaving, setIsSaving } = useResumeStore();
  const showToast = useUIStore((s) => s.showToast);

  const resumeCompletion = getResumeSectionStatus(currentResume);
  const isResumeComplete = resumeCompletion.isReady;
  const missingSections = resumeCompletion.missing;
  const sectionStatus = resumeCompletion.status;
  const completedCount = resumeCompletion.completed;
  const totalSections = resumeCompletion.total;

  const stepStatuses = steps.map((step) => getStepStatus(currentResume, step.id));
  const currentValid = stepStatuses[currentStep]?.valid ?? false;
  const currentMissing = stepStatuses[currentStep]?.missing || [];

  const isFinalStep = currentStep === steps.length - 1;
  const hasUnsavedChanges = useMemo(() => {
    if (!currentResume || !savedSnapshot) return false;
    return JSON.stringify(serializeResume(currentResume)) !== JSON.stringify(serializeResume(savedSnapshot));
  }, [currentResume, savedSnapshot]);

  const saveStatus = useMemo(() => {
    if (isSaving) return { label: "Saving…", tone: "muted" };
    if (hasUnsavedChanges) return { label: "Unsaved Changes", tone: "warning" };
    if (lastSaved) return { label: "Saved", tone: "success" };
    return { label: "Not saved yet", tone: "muted" };
  }, [isSaving, hasUnsavedChanges, lastSaved]);

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
      // Persist any local design/template/title changes first, then pull the
      // freshest server state so the PDF always reflects the exact latest
      // resume data — never an older saved version.
      if (currentResume) {
        const payload = {
          title: currentResume.title,
          template: currentResume.template,
          colorTheme: currentResume.colorTheme,
          design: currentResume.design,
        };
        await put(`/resumes/${resumeId}`, payload);
      }
      const data = await get(`/resumes/${resumeId}`);
      const latest = data.resume;
      setCurrentResume(latest);
      setSavedSnapshot(latest);
      setLastSaved(new Date());
      await downloadResumePDF(resumeId, latest?.title || currentResume?.title);
      showToast({ message: "PDF downloaded successfully", type: "success" });
    } catch (error) {
      showToast({ message: error.message || "Failed to export PDF", type: "error" });
    } finally {
      setIsExporting(false);
    }
  }, [resumeId, currentResume, setCurrentResume, setLastSaved, showToast]);

  const handleSaveAndFinish = useCallback(async () => {
    if (!resumeId) return;
    setIsSaving(true);
    try {
      // Every section persists its changes to the server as you go, so pull
      // the latest state before finishing — never mark completion with stale
      // data in the store.
      const data = await get(`/resumes/${resumeId}`);
      const latest = data.resume;
      setCurrentResume(latest);
      setSavedSnapshot(latest);
      setLastSaved(new Date());

      // Validate completion before marking done. If incomplete, jump to the
      // first missing section and explain what's left.
      const { complete, missing } = checkResumeCompletion(latest);
      if (!complete) {
        const firstMissing = steps.findIndex(
          (s, i) => i < steps.length - 1 && !getStepStatus(latest, s.id).valid
        );
        if (firstMissing >= 0) setCurrentStep(firstMissing);
        showToast({
          message: `Resume incomplete — missing: ${missing.join(", ")}`,
          type: "error",
        });
        return;
      }

      // Save everything; the server computes and stores COMPLETED status.
      const response = await put(`/resumes/${resumeId}`, serializeResume(latest));
      const savedResume = response.resume || response;
      setCurrentResume(savedResume);
      setSavedSnapshot(savedResume);
      setLastSaved(new Date());
      setFinished(true);
      showToast({ message: "Resume completed!", type: "success" });
    } catch (error) {
      showToast({ message: error.message || "Failed to finish resume", type: "error" });
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, setCurrentResume, setLastSaved, showToast]);

  const handleDuplicate = useCallback(async () => {
    try {
      const response = await post(`/resumes/${resumeId}/duplicate`, {});
      const newResume = response?.data || response?.resume || response;
      showToast({ message: "Resume duplicated", type: "success" });
      if (newResume?.id) {
        router.push(`/resume/${newResume.id}`);
      }
    } catch (error) {
      showToast({ message: error.message || "Failed to duplicate resume", type: "error" });
    }
  }, [resumeId, router, showToast]);

  const handleDeleteResume = useCallback(async () => {
    if (!resumeId) return;
    setIsDeleting(true);
    try {
      await del(`/resumes/${resumeId}`);
      showToast({ message: "Resume deleted", type: "success" });
      router.push("/dashboard/resumes");
    } catch (error) {
      showToast({ message: error.message || "Failed to delete resume", type: "error" });
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }, [resumeId, router, showToast]);

  const handleOpenSettings = useCallback(() => {
    setTitleInput(currentResume?.title || "");
    setIsPublicToggle(Boolean(currentResume?.isPublic));
    setSettingsOpen(true);
  }, [currentResume]);

  const handleSaveSettings = useCallback(async () => {
    const nextTitle = (titleInput || "").trim();
    if (!nextTitle) {
      showToast({ message: "Resume name can't be empty", type: "error" });
      return;
    }
    try {
      const response = await put(`/resumes/${resumeId}`, {
        title: nextTitle,
        isPublic: isPublicToggle,
      });
      const savedResume = response?.resume || response;
      if (savedResume) {
        setCurrentResume(savedResume);
        setSavedSnapshot(savedResume);
      } else {
        setCurrentResume((prev) =>
          prev ? { ...prev, title: nextTitle, isPublic: isPublicToggle } : prev
        );
      }
      setLastSaved(new Date());
      setSettingsOpen(false);
      showToast({ message: "Settings saved", type: "success" });
    } catch (error) {
      showToast({ message: error.message || "Failed to save settings", type: "error" });
    }
  }, [resumeId, titleInput, isPublicToggle, setCurrentResume, setLastSaved, showToast]);

  const handleOpenTemplatePicker = useCallback(() => {
    setPickerTab("templates");
    setPickerOpen(true);
  }, []);

  const handleOpenDesignPicker = useCallback(() => {
    setPickerTab("design");
    setPickerOpen(true);
  }, []);

  const handleEditResume = useCallback(() => {
    setFinished(false);
    setCurrentStep(0);
  }, []);

  const handleApplyResult = useCallback(async (result, toolType, targetExperienceId, inputData) => {
    if (!resumeId || !result) return;

    try {
      if (toolType === "GENERATE_EXPERIENCE") {
        const description = typeof result === "string" ? result : result.description || "";
        const highlights = Array.isArray(result?.highlights)
          ? result.highlights.filter(Boolean)
          : Array.isArray(result)
            ? result.filter((b) => typeof b === "string" && b.trim())
            : [];
        const company = (inputData?.company || "").trim();
        const position = (inputData?.position || "").trim();
        const startDate = inputData?.startDate || "";
        if (!company || !position) {
          showToast({ message: "Company and position are required to add this experience", type: "error" });
          return;
        }
        if (!startDate) {
          showToast({ message: "A start date is required to add this experience", type: "error" });
          return;
        }
        const payload = {
          company,
          position,
          location: inputData?.location || "",
          startDate,
          endDate: inputData?.endDate || undefined,
          description,
          highlights,
        };
        await post(`/resumes/${resumeId}/experiences`, payload);
        const data = await get(`/resumes/${resumeId}`);
        setCurrentResume(data.resume);
        showToast({ message: "Experience added to resume", type: "success" });
        return;
      }

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

  const handleAtsChecked = useCallback(
    async (result) => {
      const score = typeof result?.score === "number" ? result.score : null;
      if (score == null) return;
      const current = useResumeStore.getState().currentResume;
      if (current) setCurrentResume({ ...current, atsScore: score });
      try {
        await put(`/resumes/${resumeId}`, { atsScore: score });
      } catch {
        // persistence is best-effort; the score still shows live in the badge
      }
    },
    [resumeId, setCurrentResume]
  );

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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    const handleFocusIn = (e) => {
      const target = e.target;
      if (!target || typeof target.scrollIntoView !== "function") return;
      const tag = target.tagName;
      if (!["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    };
    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

  // Keep the active step pill visible inside the horizontally scrollable
  // mobile step bar without ever widening the page.
  useEffect(() => {
    const bar = stepBarRef.current;
    const pill = activeStepRef.current;
    if (!bar || !pill) return;
    const barRect = bar.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    if (pillRect.left < barRect.left || pillRect.right > barRect.right) {
      bar.scrollTo({
        left: pill.offsetLeft - (bar.clientWidth - pill.clientWidth) / 2,
        behavior: "smooth",
      });
    }
  }, [currentStep]);

  const handlePreviewCompleted = useCallback(() => {
    const el = document.getElementById("resume-completed-preview");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleMobileExport = useCallback(() => {
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
  }, [isResumeComplete, missingSections, showToast, handleExportPDF]);

  const progressPct = resumeCompletion.percentage;

  // A sidebar step shows a checkmark only when it has REAL content. ATS Score
  // and Live Preview are not content sections and never get a content check.
  const getSectionComplete = (stepId) => {
    switch (stepId) {
      case "personal":
        return sectionStatus.personal;
      case "experience":
        return sectionStatus.experience;
      case "education":
        return sectionStatus.education;
      case "skills":
        return sectionStatus.skills;
      case "projects":
        return sectionStatus.projects;
      case "certificates":
        return sectionStatus.certificates;
      case "languages":
        return sectionStatus.languages;
      case "achievements":
        return sectionStatus.achievements;
      default:
        return false;
    }
  };

  const renderStepItem = (step, index, onSelect) => {
    const isCompleted = getSectionComplete(step.id);
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

  // Compact pill used by the horizontally scrollable mobile step bar.
  const renderStepPill = (step, index) => {
    const isCompleted = getSectionComplete(step.id);
    const isCurrent = index === currentStep;
    const isLocked =
      index > currentStep && !(index === currentStep + 1 && currentValid);
    return (
      <button
        key={step.id}
        type="button"
        ref={isCurrent ? activeStepRef : undefined}
        onClick={() => {
          if (!isLocked) setCurrentStep(index);
        }}
        disabled={isLocked}
        aria-current={isCurrent ? "step" : undefined}
        title={
          isLocked
            ? "Complete the current section to unlock this step"
            : step.label
        }
        className={cn(
          "flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
          isCurrent
            ? "border-stamp bg-stamp text-paper shadow-sm"
            : isCompleted
            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
            : isLocked
            ? "border-border text-muted-foreground opacity-40"
            : "border-border text-muted-foreground hover:bg-secondary"
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
            isCurrent
              ? "border-paper bg-paper text-stamp"
              : isCompleted
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
              : "border-border"
          )}
        >
          {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
        </span>
        <span className="whitespace-nowrap">{step.label}</span>
      </button>
    );
  };

  const StepComponent = steps[currentStep]?.component;

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] flex-col bg-background overflow-hidden">
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
              <div className="md:rounded-2xl md:border md:border-border md:bg-card md:p-6 md:shadow-xs space-y-5">
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
    <div className="flex h-[100dvh] flex-col bg-background overflow-hidden w-full max-w-full">
      {/* STUDIO TOOLBAR HEADER */}
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-2 sm:px-3 md:px-4 w-full max-w-full">
        <div className="flex min-w-0 items-center gap-1.5 md:gap-3">
          <Link
            href="/dashboard/resumes"
            aria-label="Back to My Resumes"
            className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5 md:h-4 md:w-4" />
            <span className="hidden md:inline">Dashboard</span>
            <span className="md:hidden">My Resumes</span>
          </Link>
          <div className="h-4 w-px shrink-0 bg-border hidden md:block" />
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

        {/* CONTROLS */}
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

          {/* MORE MENU — mobile only */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="More options">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px]">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : saveStatus.tone === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      saveStatus.tone === "success"
                        ? "text-success"
                        : saveStatus.tone === "warning"
                        ? "text-warning"
                        : "text-muted-foreground"
                    )}
                  >
                    {saveStatus.label}
                  </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMobileExport} disabled={isExporting}>
                  <Download />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenTemplatePicker}>
                  <LayoutTemplate />
                  Change Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRunAtsCheck}>
                  <ShieldCheck />
                  ATS Score
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenSettings}>
                  <Settings2 />
                  Resume Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy />
                  Duplicate Resume
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 />
                  Delete Resume
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* MOBILE STEP NAVIGATION — horizontally scrollable, never widens the page */}
      {!finished && (
        <div className="border-b border-border bg-card md:hidden">
          <div
            ref={stepBarRef}
            className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto px-3 py-2"
          >
            {steps.map((step, index) => renderStepPill(step, index))}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Show all sections"
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              <List className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">All</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPLETED STATE — polished finish view replaces the studio workspace */}
      {finished ? (
        <main className="min-w-0 flex-1 overflow-y-auto bg-surface px-4 pb-16 pt-6 sm:px-6 md:pb-10">
          <div className="mx-auto max-w-4xl">
            <ResumeCompleted
              resume={currentResume}
              isExporting={isExporting}
              isComplete={isResumeComplete}
              hasUnsavedChanges={hasUnsavedChanges}
              missingSections={missingSections}
              onPreview={handlePreviewCompleted}
              onExport={handleExportPDF}
              onEdit={handleEditResume}
            />
            <div id="resume-completed-preview" className="mt-8 scroll-mt-4">
              <ResumePreview
                resume={currentResume}
                resumeId={resumeId}
                onPageCountChange={setPageCount}
              />
            </div>
          </div>
        </main>
      ) : (
      /* STUDIO THREE-COLUMN WORKSPACE */
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

        {/* STICKY BOTTOM NAV — mobile */}
        <AnimatePresence>
          {!isKeyboardOpen && !finished && (
            <motion.nav
              initial={{ y: 96 }}
              animate={{ y: 0 }}
              exit={{ y: 96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {isFinalStep ? (
                <div className="px-3 pb-2 pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-0"
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      leftIcon={ArrowLeft}
                    >
                      <span>Previous</span>
                    </Button>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="flex-1 min-w-0"
                      onClick={handleMobileExport}
                      disabled={isExporting || !isResumeComplete}
                      loading={isExporting}
                      leftIcon={Download}
                    >
                      <span>Download PDF</span>
                    </Button>
                  </div>
                  {!isResumeComplete && (
                    <p className="px-1 pb-1.5 pt-2 text-[11px] font-medium leading-snug text-destructive">
                      {missingSections.length > 0
                        ? `Missing: ${missingSections.join(", ")}`
                        : "Complete all required sections to download your PDF"}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={handleSaveAndFinish}
                    loading={isSaving}
                    leftIcon={CheckCircle2}
                  >
                    <span>Save &amp; Finish</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-0"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    leftIcon={ArrowLeft}
                  >
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Open AI Assistant"
                    title="Open AI Assistant"
                    onClick={() => setAiAssistantOpen(true)}
                  >
                    <Sparkles className="h-5 w-5 text-primary" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 min-w-0"
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={!currentValid}
                    rightIcon={ArrowRight}
                  >
                    <span>Next</span>
                  </Button>
                </div>
              )}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* CENTER FORM & PAPER CANVAS SHEET */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-surface px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6 md:pb-8">
          <div className={cn("mx-auto w-full min-w-0", isFinalStep ? "max-w-6xl" : "max-w-3xl")}>
            <div
              className={cn(
                "w-full min-w-0 items-start",
                isFinalStep
                  ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]"
                  : "space-y-6"
              )}
            >
              {/* LEFT / ACTIVE STEP COLUMN */}
              <div className={cn("min-w-0 w-full", isFinalStep && "md:space-y-6")}>
                <div
                  className="w-full"
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
                      className="w-full min-w-0 md:rounded-2xl md:border md:border-border md:bg-card md:p-6 md:shadow-xs"
                    >
                      {StepComponent && (
                        <StepComponent
                          resume={currentResume}
                          resumeId={resumeId}
                          onGenerateTool={handleGenerateTool}
                          {...(steps[currentStep]?.id === "preview" ? { onPageCountChange: setPageCount } : {})}
                          {...(steps[currentStep]?.id === "ats" ? { onChecked: handleAtsChecked } : {})}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* PREV / NEXT NAV BUTTONS — desktop only (mobile uses sticky bottom nav) */}
                <div className="hidden md:block">
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
                </div>

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
                <div id="resume-completion" className="min-w-0 scroll-mt-4 lg:sticky lg:top-0">
                  <ResumeCompletion
                    resume={currentResume}
                    resumeId={resumeId}
                    pageCount={pageCount}
                    completedCount={completedCount}
                    totalSections={totalSections}
                    percentage={resumeCompletion.percentage}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSaving={isSaving}
                    isExporting={isExporting}
                    isComplete={isResumeComplete}
                    missingSections={missingSections}
                    lastSaved={lastSaved}
                    onFinish={handleSaveAndFinish}
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
          open={aiAssistantOpen}
          onOpenChange={setAiAssistantOpen}
          resumeId={resumeId}
          resume={currentResume}
          onApplyResult={handleApplyResult}
          request={aiRequest}
          onRequestHandled={handleRequestHandled}
        />
      </div>
      )}

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

      {/* RESUME SETTINGS — mobile menu */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resume Settings</DialogTitle>
            <DialogDescription>
              Update the name and visibility of this resume.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSettings();
            }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="resume-title">Resume Name</Label>
              <Input
                id="resume-title"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="My Resume"
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary/30 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Public</p>
                <p className="text-xs text-muted-foreground">
                  Allow others to view this resume with the link.
                </p>
              </div>
              <Switch
                checked={isPublicToggle}
                onCheckedChange={setIsPublicToggle}
                aria-label="Toggle public visibility"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE RESUME — mobile menu */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Resume?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {currentResume?.title || "this resume"}
              </span>{" "}
              and all of its contents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteResume}
              disabled={isDeleting}
              loading={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
