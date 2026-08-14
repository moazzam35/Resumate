"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  MoreVertical,
  Trash2,
  Copy,
  Search,
  Grid3X3,
  List,
  Download,
  Eye,
  BarChart3,
  Clock,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime, cn, downloadResumePDF, checkResumeCompletion } from "@/lib/utils";
import { get, post, del } from "@/lib/api";
import { useUIStore } from "@/store";
import { useSubscription, useMediaQuery, useIntersectionObserver } from "@/hooks";
import { UpgradePromptModal } from "@/components/features/billing/upgrade-prompt-modal";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { MiniTemplateCard, ScaledResume } from "@/components/features/templates/scaled-resume";
import { normalizeResume } from "@/lib/templates/normalize";
import { getTemplate } from "@/lib/templates/registry";
import { resolveDesign, PAGE_SIZES } from "@/lib/templates/design";

const STATUS_FILTERS = ["All", "COMPLETED", "DRAFT"];

const STATUS_COLORS = {
  COMPLETED: "success",
  DRAFT: "warning",
};

const TEMPLATE_COLORS = {
  modern: "bg-violet-500",
  minimal: "bg-emerald-500",
  professional: "bg-blue-600",
  corporate: "bg-gray-600",
  creative: "bg-pink-500",
  developer: "bg-amber-500",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

function resumePageSize(resume) {
  const resolved = resolveDesign(resume.template, resume.design, resume.colorTheme);
  return PAGE_SIZES[resolved.pageSize] || PAGE_SIZES.letter;
}

/* ============================================================
   Lazy resume thumbnail — shimmer skeleton, then the real A4
   document fades in at full card width (object-fit: contain).
   ============================================================ */
function LazyResumeThumb({ resume, className }) {
  const [ref, inView] = useIntersectionObserver({ rootMargin: "240px" });
  const page = resumePageSize(resume);
  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden bg-muted/30", className)}
      style={{ aspectRatio: `${page.width} / ${page.height}` }}
    >
      <div className="absolute inset-0">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      {inView && (
        <ScaledResume
          template={getTemplate(resume.template)}
          data={normalizeResume(resume)}
          design={resume.design}
          colorTheme={resume.colorTheme}
          className="relative w-full animate-fade-in"
        />
      )}
    </div>
  );
}

/* ============================================================
   Shared "More" menu — Preview, Duplicate, Delete.
   ============================================================ */
function ResumeMoreMenu({ resume, onDuplicate, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          leftIcon={MoreVertical}
          className="shrink-0 text-muted"
          aria-label="More actions"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/resume/${resume.id}`}>
            <Eye className="mr-2 h-[18px] w-[18px]" />
            Preview
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(resume)}>
          <Copy className="mr-2 h-[18px] w-[18px]" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(resume.id)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-[18px] w-[18px]" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ============================================================
   Mobile — premium vertical card (grid view).
   Large A4 thumbnail, status in the card header, quick actions.
   ============================================================ */
function MobileResumeCard({ resume, onDownload, onDuplicate, onDelete }) {
  const template = getTemplate(resume.template);
  const complete = checkResumeCompletion(resume).complete;
  const recentlyUpdated = Date.now() - new Date(resume.updatedAt).getTime() < 24 * 60 * 60 * 1000;

  return (
    <motion.div
      variants={item}
      whileTap={{ scale: 0.98 }}
      className="rounded-[18px] will-change-transform"
    >
      <Card className="group overflow-hidden rounded-[18px] border-border bg-surface-elevated shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-16px_rgba(15,23,42,0.16)]">
        <div className={cn("h-1 w-full", TEMPLATE_COLORS[resume.template] || "bg-stamp")} />

        <Link
          href={`/resume/${resume.id}`}
          className="relative block"
          aria-label={`Edit ${resume.title}`}
        >
          <LazyResumeThumb resume={resume} />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Badge
              variant={STATUS_COLORS[resume.status] || "secondary"}
              className="bg-paper/90 shadow-sm backdrop-blur-sm"
            >
              {resume.status === "COMPLETED" ? "Completed" : "Draft"}
            </Badge>
            {resume.atsScore > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-ink/85 px-2 py-0.5 text-[11px] font-semibold text-paper shadow-sm backdrop-blur-sm">
                <BarChart3 className="h-3 w-3" />
                {resume.atsScore}%
              </span>
            )}
          </div>
        </Link>

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-ink">
                <Link href={`/resume/${resume.id}`}>{resume.title}</Link>
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <span className="capitalize">{template.name}</span>
                <span className="text-muted/60">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(resume.updatedAt)}
                </span>
                {template.pages > 1 && (
                  <>
                    <span className="text-muted/60">·</span>
                    <span>{template.pages} pages</span>
                  </>
                )}
                {recentlyUpdated && (
                  <span
                    className="ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stamp"
                    title="Recently updated"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
            <Button size="sm" variant="primary" className="flex-1" asChild>
              <Link
                href={`/resume/${resume.id}`}
                className="inline-flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              leftIcon={Download}
              disabled={!complete}
              onClick={() => onDownload(resume)}
            >
              PDF
            </Button>
            <ResumeMoreMenu resume={resume} onDuplicate={onDuplicate} onDelete={onDelete} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ============================================================
   Mobile — compact horizontal row (list view).
   ============================================================ */
function MobileResumeRow({ resume, onDownload, onDuplicate, onDelete }) {
  const template = getTemplate(resume.template);
  const complete = checkResumeCompletion(resume).complete;

  return (
    <motion.div
      variants={item}
      whileTap={{ scale: 0.98 }}
      className="rounded-[16px] will-change-transform"
    >
      <Card className="group overflow-hidden rounded-[16px] border-border bg-surface-elevated shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_18px_-14px_rgba(15,23,42,0.14)]">
        <div className="flex items-center gap-3 p-3">
          <Link
            href={`/resume/${resume.id}`}
            className="block shrink-0 overflow-hidden rounded-[10px] border border-border/60"
            aria-label={`Edit ${resume.title}`}
          >
            <LazyResumeThumb resume={resume} className="w-14 sm:w-16" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-ink">
                <Link href={`/resume/${resume.id}`}>{resume.title}</Link>
              </h3>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <span className="capitalize">{template.name}</span>
              <span className="text-muted/60">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(resume.updatedAt)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <Badge variant={STATUS_COLORS[resume.status] || "secondary"}>
                {resume.status === "COMPLETED" ? "Completed" : "Draft"}
              </Badge>
              {resume.atsScore > 0 && (
                <Badge variant="primary" dot>
                  ATS {resume.atsScore}%
                </Badge>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <Button size="sm" variant="ghost" className="px-2.5" asChild>
              <Link href={`/resume/${resume.id}`} aria-label={`Edit ${resume.title}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="px-2.5"
              leftIcon={Download}
              disabled={!complete}
              onClick={() => onDownload(resume)}
              aria-label="Download PDF"
            />
            <ResumeMoreMenu resume={resume} onDuplicate={onDuplicate} onDelete={onDelete} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function ResumeGridSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-md border-border">
          <div className="aspect-[8.5/11] bg-gradient-to-br from-muted/50 to-muted p-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-2 w-1/2" />
              <Skeleton className="h-2 w-2/3" />
            </div>
            <div className="mt-4 space-y-1.5">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-1.5" style={{ width: `${85 - j * 10}%` }} />
              ))}
            </div>
          </div>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-2 flex items-center gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ResumeListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="rounded-md border-border">
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MobileResumeSkeleton({ list = false }) {
  return (
    <div className={list ? "space-y-2.5" : "space-y-3"}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-[18px] border-border bg-surface-elevated">
          {!list && <Skeleton className="h-1 w-full rounded-none" />}
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-none bg-muted/30",
              !list && "aspect-[816/1056]"
            )}
          >
            <div className="absolute inset-0">
              <Skeleton className="h-full w-full rounded-none" />
            </div>
          </div>
          <div className="p-3.5">
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
              <Skeleton className="h-10 flex-1 rounded-[10px]" />
              <Skeleton className="h-10 flex-1 rounded-[10px]" />
              <Skeleton className="h-10 w-10 rounded-[10px]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const showToast = useUIStore((s) => s.showToast);
  const { atResumeLimit, isEnterprise } = useSubscription();
  const resumeAtLimit = atResumeLimit && !isEnterprise;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleCreateClick = (e) => {
    if (resumeAtLimit) {
      e.preventDefault();
      setShowUpgrade(true);
    }
  };

  useEffect(() => {
    async function fetchResumes() {
      try {
        const data = await get("/resumes?limit=50");
        setResumes(data.resumes || []);
      } catch {
        showToast({ message: "Failed to load resumes", type: "error" });
      } finally {
        setIsLoadingResumes(false);
      }
    }
    fetchResumes();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return resumes.filter((r) => {
      const matchesSearch =
        !q ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.personalInfo?.name || "").toLowerCase().includes(q) ||
        (r.personalInfo?.title || "").toLowerCase().includes(q) ||
        (r.template || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [resumes, searchQuery, statusFilter]);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await del(`/resumes/${deleteId}`);
      setResumes((prev) => prev.filter((r) => r.id !== deleteId));
      showToast({ message: "Resume deleted successfully", type: "success" });
    } catch {
      showToast({ message: "Failed to delete resume", type: "error" });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  }

  async function handleDuplicate(resume) {
    if (resumeAtLimit) {
      setShowUpgrade(true);
      return;
    }
    try {
      const data = await post(`/resumes/${resume.id}/duplicate`, {});
      setResumes((prev) => [data.data || data.resume, ...prev]);
      showToast({ message: "Resume duplicated", type: "success" });
    } catch {
      showToast({ message: "Failed to duplicate resume", type: "error" });
    }
  }

  function handleDownload(resume) {
    downloadResumePDF(resume.id, resume.title).catch((e) =>
      showToast({ message: e.message, type: "error" })
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="heading-display text-xl font-semibold sm:text-2xl">My Resumes</h2>
          <p className="mt-0.5 text-sm text-muted">
            Manage and organize all your resumes in one place
          </p>
        </div>
        <Link href="/dashboard/resumes/new" onClick={handleCreateClick} className="sm:shrink-0">
          <Button leftIcon={Plus} className={cn("w-full sm:w-auto", resumeAtLimit && "opacity-60")}>
            Create New Resume
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div className="min-w-0 flex-1 sm:flex-none">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="h-9 w-full sm:w-auto">
                {STATUS_FILTERS.map((s) => (
                  <TabsTrigger key={s} value={s} className="flex-1 px-2 text-xs sm:flex-none sm:px-3">
                    {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <div className="flex items-center rounded-lg border border-border">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon-sm"
                leftIcon={Grid3X3}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              />
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon-sm"
                leftIcon={List}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted sm:text-sm">
        {isLoadingResumes ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <>{filtered.length} resume{filtered.length !== 1 ? "s" : ""} found</>
        )}
      </div>

      {isLoadingResumes ? (
        isMobile ? (
          <MobileResumeSkeleton list={viewMode === "list"} />
        ) : viewMode === "grid" ? (
          <ResumeGridSkeleton />
        ) : (
          <ResumeListSkeleton />
        )
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center sm:py-16"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-md bg-muted">
            <FileText className="h-10 w-10 text-muted" />
          </div>
          <p className="text-lg font-medium">
            {searchQuery || statusFilter !== "All"
              ? "No resumes match your filters"
              : "No resumes yet"}
          </p>
          <p className="mb-4 text-sm text-muted">
            {searchQuery || statusFilter !== "All"
              ? "Try adjusting your search or filter"
              : "Create your first resume to get started"}
          </p>
          {!searchQuery && statusFilter === "All" && (
            <Link href="/dashboard/resumes/new" onClick={handleCreateClick}>
              <Button leftIcon={Plus} className={cn(resumeAtLimit && "opacity-60")}>
                Create Resume
              </Button>
            </Link>
          )}
        </motion.div>
      ) : isMobile ? (
        viewMode === "grid" ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filtered.map((resume) => (
              <MobileResumeCard
                key={resume.id}
                resume={resume}
                onDownload={handleDownload}
                onDuplicate={handleDuplicate}
                onDelete={setDeleteId}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2.5"
          >
            {filtered.map((resume) => (
              <MobileResumeRow
                key={resume.id}
                resume={resume}
                onDownload={handleDownload}
                onDuplicate={handleDuplicate}
                onDelete={setDeleteId}
              />
            ))}
          </motion.div>
        )
      ) : viewMode === "grid" ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((resume) => (
            <motion.div key={resume.id} variants={item}>
              <Card className="group relative overflow-hidden rounded-md border-border transition-all hover:border-stamp/20">
                <div className="aspect-[8.5/11] relative overflow-hidden rounded-t-md">
                  <MiniTemplateCard
                    template={getTemplate(resume.template)}
                    data={normalizeResume(resume)}
                    design={resume.design}
                    colorTheme={resume.colorTheme}
                    scale={0.22}
                    className="rounded-none"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <Badge variant={STATUS_COLORS[resume.status] || "secondary"}>
                      {resume.status === "COMPLETED" ? "Completed" : "Draft"}
                    </Badge>
                    {resume.atsScore > 0 && (
                      <div className="flex items-center gap-1 rounded-sm bg-paper/80 backdrop-blur px-2 py-0.5 text-xs font-medium">
                        <BarChart3 className="h-3 w-3" />
                        {resume.atsScore}%
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{resume.title}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(resume.updatedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {resume.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {resume.downloads || 0}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 shrink-0"
                          leftIcon={MoreVertical}
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/resume/${resume.id}`}>
                            <FileText className="mr-2 h-[18px] w-[18px]" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(resume)}>
                          <Copy className="mr-2 h-[18px] w-[18px]" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => downloadResumePDF(resume.id, resume.title).catch((e) => showToast({ message: e.message, type: "error" }))}
                          className={cn(
                            !checkResumeCompletion(resume).complete && "opacity-50 pointer-events-none"
                          )}
                        >
                          <Download className="mr-2 h-[18px] w-[18px]" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(resume.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-[18px] w-[18px]" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {filtered.map((resume) => (
            <motion.div key={resume.id} variants={item}>
              <Card className="group rounded-md border-border transition-all hover:border-stamp/20">
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      "h-10 w-10 shrink-0 rounded-md",
                      TEMPLATE_COLORS[resume.template] || "bg-stamp"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{resume.title}</p>
                      <Badge
                        variant={STATUS_COLORS[resume.status] || "secondary"}
                        className="shrink-0"
                      >
                        {resume.status === "COMPLETED" ? "Completed" : "Draft"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted">
                      <span className="capitalize">{resume.template}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(resume.updatedAt)}
                      </span>
                      {resume.atsScore > 0 && (
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          ATS: {resume.atsScore}%
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {resume.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {resume.downloads || 0} downloads
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/resume/${resume.id}`}>
                      <Button variant="ghost" size="sm" leftIcon={FileText}>
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => handleDuplicate(resume)}
                      leftIcon={Copy}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                      onClick={() => setDeleteId(resume.id)}
                      leftIcon={Trash2}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
              loading={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UpgradePromptModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        kind="resume"
      />
    </div>
  );
}
