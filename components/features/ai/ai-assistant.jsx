"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Briefcase,
  ListChecks,
  Wrench,
  FolderOpen,
  Trophy,
  Search,
  BarChart3,
  MessageSquare,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore } from "@/store";
import { useSubscription, useIsKeyboardOpen } from "@/hooks";
import { UpgradePromptModal } from "@/components/features/billing/upgrade-prompt-modal";
import { post } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { lookupJobLocally } from "@/lib/job-data";

const AI_TOOLS = [
  { id: "SUMMARY", label: "Generate Summary", icon: Sparkles, description: "Create a professional summary" },
  { id: "GENERATE_EXPERIENCE", label: "Generate Experience", icon: Briefcase, description: "Create a new work experience entry" },
  { id: "IMPROVE_EXPERIENCE", label: "Improve Experience", icon: Briefcase, description: "Enhance work descriptions" },
  { id: "REWRITE_BULLETS", label: "Rewrite Bullets", icon: ListChecks, description: "Make bullet points stronger" },
  { id: "GENERATE_SKILLS", label: "Generate Skills", icon: Wrench, description: "Suggest relevant skills" },
  { id: "GENERATE_PROJECTS", label: "Generate Projects", icon: FolderOpen, description: "Suggest project ideas" },
  { id: "GENERATE_ACHIEVEMENTS", label: "Generate Achievements", icon: Trophy, description: "Suggest achievements" },
  { id: "ATS_KEYWORDS", label: "ATS Keywords", icon: Search, description: "Optimize for ATS systems" },
  { id: "RESUME_ANALYSIS", label: "Resume Analysis", icon: BarChart3, description: "Get scored feedback" },
  { id: "INTERVIEW_QUESTIONS", label: "Interview Prep", icon: MessageSquare, description: "Practice questions" },
  { id: "CAREER_SUGGESTIONS", label: "Career Suggestions", icon: Briefcase, description: "Career path ideas" },
];

function cleanItem(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Converts a parsed AI result into structured blocks so it can be rendered as
// clean, human-readable content (never raw JSON) and copied as plain text.
function resultBlocks(result, toolType) {
  if (result == null) return [{ kind: "text", text: "" }];
  if (typeof result === "string") return [{ kind: "text", text: result }];

  if (Array.isArray(result)) {
    const items = result
      .map((item) => {
        if (item == null) return null;
        if (typeof item === "string") return item.trim();
        if (toolType === "GENERATE_SKILLS") {
          return [cleanItem(item.name), item.category && `(${item.category})`, item.level && `- ${item.level}`]
            .filter(Boolean)
            .join(" ");
        }
        if (toolType === "GENERATE_PROJECTS") {
          const tech = Array.isArray(item.technologies) && item.technologies.length
            ? `Tech: ${item.technologies.join(", ")}`
            : "";
          return [cleanItem(item.name), cleanItem(item.description), tech].filter(Boolean).join("\n");
        }
        if (toolType === "GENERATE_ACHIEVEMENTS") {
          return [cleanItem(item.title), cleanItem(item.description)].filter(Boolean).join("\n");
        }
        return [cleanItem(item.title) || cleanItem(item.name), cleanItem(item.description)]
          .filter(Boolean)
          .join("\n");
      })
      .filter(Boolean);
    return items.length ? [{ kind: "bullets", items }] : [{ kind: "text", text: "" }];
  }

  if (typeof result === "object") {
    const blocks = [];
    if (toolType === "IMPROVE_EXPERIENCE" || toolType === "GENERATE_EXPERIENCE") {
      if (cleanItem(result.description)) {
        blocks.push({ kind: "heading", text: toolType === "GENERATE_EXPERIENCE" ? "Description" : "Improved description" }, { kind: "text", text: cleanItem(result.description) });
      }
      if (Array.isArray(result.highlights) && result.highlights.length) {
        blocks.push({ kind: "heading", text: "Highlights" }, { kind: "bullets", items: result.highlights.map(cleanItem).filter(Boolean) });
      }
      if (blocks.length) return blocks;
    }
    if (toolType === "ATS_KEYWORDS") {
      if (Array.isArray(result.keywords) && result.keywords.length) {
        blocks.push({ kind: "heading", text: "Keywords" }, { kind: "bullets", items: result.keywords.map(cleanItem).filter(Boolean) });
      }
      if (Array.isArray(result.suggestions) && result.suggestions.length) {
        blocks.push({ kind: "heading", text: "Suggestions" }, { kind: "bullets", items: result.suggestions.map(cleanItem).filter(Boolean) });
      }
      if (blocks.length) return blocks;
    }
    if (toolType === "RESUME_ANALYSIS") {
      if (cleanItem(result.summary)) blocks.push({ kind: "text", text: cleanItem(result.summary) });
      if (result.score != null) blocks.push({ kind: "kv", label: "Score", text: `${result.score}` });
      if (result.contentScore != null) blocks.push({ kind: "kv", label: "Content", text: `${result.contentScore}` });
      if (result.atsScore != null) blocks.push({ kind: "kv", label: "ATS", text: `${result.atsScore}` });
      if (Array.isArray(result.strengths) && result.strengths.length) {
        blocks.push({ kind: "heading", text: "Strengths" }, { kind: "bullets", items: result.strengths.map(cleanItem).filter(Boolean) });
      }
      if (Array.isArray(result.improvements) && result.improvements.length) {
        blocks.push({ kind: "heading", text: "Improvements" }, { kind: "bullets", items: result.improvements.map(cleanItem).filter(Boolean) });
      }
      if (blocks.length) return blocks;
    }
    if (toolType === "INTERVIEW_QUESTIONS") {
      for (const cat of ["technical", "behavioral", "situational"]) {
        const list = result[cat];
        if (!Array.isArray(list) || !list.length) continue;
        blocks.push({ kind: "heading", text: cat.charAt(0).toUpperCase() + cat.slice(1) });
        for (const q of list) {
          if (q && (cleanItem(q.question) || cleanItem(q.answer))) {
            blocks.push({ kind: "bullets", items: [[cleanItem(q.question), cleanItem(q.answer)].filter(Boolean).join("\n")] });
          }
        }
      }
      if (blocks.length) return blocks;
    }
    if (toolType === "CAREER_SUGGESTIONS") {
      if (Array.isArray(result.suggestedRoles) && result.suggestedRoles.length) {
        blocks.push({ kind: "heading", text: "Suggested roles" });
        for (const r of result.suggestedRoles) {
          const parts = [cleanItem(r.title), cleanItem(r.description)];
          if (Array.isArray(r.requiredSkills) && r.requiredSkills.length) {
            parts.push(`Required: ${r.requiredSkills.join(", ")}`);
          }
          blocks.push({ kind: "text", text: parts.filter(Boolean).join("\n") });
        }
      }
      if (Array.isArray(result.learningPath) && result.learningPath.length) {
        blocks.push({ kind: "heading", text: "Learning path" });
        for (const s of result.learningPath) {
          blocks.push({ kind: "bullets", items: [[cleanItem(s.skill), cleanItem(s.resource), cleanItem(s.priority)].filter(Boolean).join(" - ")] });
        }
      }
      if (Array.isArray(result.growthTips) && result.growthTips.length) {
        blocks.push({ kind: "heading", text: "Growth tips" }, { kind: "bullets", items: result.growthTips.map(cleanItem).filter(Boolean) });
      }
      if (blocks.length) return blocks;
    }
    // Generic object fallback: key/value rows, arrays as bullets, primitives as text.
    for (const [key, value] of Object.entries(result)) {
      if (value == null || value === "") continue;
      if (Array.isArray(value)) {
        const items = value.map(cleanItem).filter(Boolean);
        if (items.length) blocks.push({ kind: "heading", text: key }, { kind: "bullets", items });
      } else if (typeof value === "object") {
        const inner = Object.entries(value)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
          .join("\n");
        if (inner) blocks.push({ kind: "text", text: `${key}\n${inner}` });
      } else {
        blocks.push({ kind: "kv", label: key, text: String(value) });
      }
    }
    return blocks.length ? blocks : [{ kind: "text", text: "" }];
  }

  return [{ kind: "text", text: String(result) }];
}

function ResultBlocks({ result, toolType }) {
  const blocks = resultBlocks(result, toolType);
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <p key={i} className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {block.text}
            </p>
          );
        }
        if (block.kind === "bullets") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-4 text-sm">
              {block.items.map((item, j) => (
                <li key={j} className="whitespace-pre-wrap">{item}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === "kv") {
          return (
            <p key={i} className="text-sm">
              <span className="font-semibold">{block.label}: </span>
              {block.text}
            </p>
          );
        }
        return (
          <p key={i} className="text-sm whitespace-pre-wrap">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

function resultToText(result, toolType) {
  const lines = [];
  for (const block of resultBlocks(result, toolType)) {
    if (block.kind === "heading") lines.push(block.text.toUpperCase());
    else if (block.kind === "bullets") block.items.forEach((item) => lines.push(`• ${item}`));
    else if (block.kind === "kv") lines.push(`${block.label}: ${block.text}`);
    else lines.push(block.text);
  }
  return lines.join("\n");
}

export function AIAssistant({ resumeId, resume, onApplyResult, request, onRequestHandled, open, onOpenChange }) {
  const isControlled = open !== undefined;
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isControlled ? open : isOpenInternal;
  const setIsOpen = isControlled ? onOpenChange : setIsOpenInternal;
  const [selectedTool, setSelectedTool] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputData, setInputData] = useState({});
  const [copied, setCopied] = useState(false);
  const [targetExperienceId, setTargetExperienceId] = useState(null);
  const copyTimer = useRef(null);
  const showToast = useUIStore((s) => s.showToast);
  const { atAiLimit, isEnterprise } = useSubscription();
  const aiAtLimit = atAiLimit && !isEnterprise;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isKeyboardOpen = useIsKeyboardOpen();

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!request) return;
    setSelectedTool(request.tool || null);
    setIsOpen(true);
    if (request.tool === "GENERATE_EXPERIENCE") {
      const targetJobTitle = resume?.personalInfo?.title || resume?.personalInfo?.jobTitle || "";
      setInputData((prev) => ({
        ...prev,
        position: prev.position || targetJobTitle,
        company: prev.company || "",
        startDate: prev.startDate || "",
        endDate: prev.endDate || "",
        description: prev.description || "",
      }));
    }
    onRequestHandled?.();
  }, [request, onRequestHandled, setIsOpen]);

  const handleGenerate = async () => {
    if (!selectedTool) return;
    if (aiAtLimit) {
      setShowUpgrade(true);
      return;
    }
    setIsLoading(true);
    setResult(null);

    try {
      // The job title (stored in personalInfo.title) is the primary context for
      // every AI generation request — the resume's own title is just its name
      // (e.g. "Untitled Resume") and must NOT be used as the target role.
      const targetJobTitle = resume?.personalInfo?.title || resume?.personalInfo?.jobTitle || "";
      const jobData = lookupJobLocally(targetJobTitle);
      const data = {
        ...inputData,
        targetJobTitle,
        title: targetJobTitle,
        skills: resume?.skills?.map((s) => s.name).join(", "),
        experience: resume?.experiences?.map((e) => `${e.position} at ${e.company}: ${e.description}`).join("\n"),
        ...(jobData
          ? {
              suggestedSkills: jobData.skills?.join(", "),
              suggestedResponsibilities: jobData.responsibilities?.join("; "),
              suggestedKeywords: jobData.keywords?.join(", "),
              jobCategory: jobData.category,
            }
          : {}),
      };

      const response = await post("/ai", {
        type: selectedTool,
        data,
        resumeId,
      });

      setResult(response.result);
    } catch (error) {
      showToast({ message: error.message || "AI generation failed", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const text = resultToText(result, selectedTool);
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
    showToast({ message: "Copied to clipboard", type: "success" });
  };

  const handleSelectTool = (toolId) => {
    setSelectedTool(toolId === selectedTool ? null : toolId);
    if (toolId === "GENERATE_EXPERIENCE") {
      // Fresh entry: default position to the resume's target job title.
      const targetJobTitle = resume?.personalInfo?.title || resume?.personalInfo?.jobTitle || "";
      setTargetExperienceId(null);
      setInputData((prev) => ({
        ...prev,
        position: prev.position || targetJobTitle,
        company: prev.company || "",
        startDate: prev.startDate || "",
        endDate: prev.endDate || "",
        description: prev.description || "",
      }));
      return;
    }
    if (toolId === "IMPROVE_EXPERIENCE" || toolId === "REWRITE_BULLETS") {
      const firstExp = resume?.experiences?.[0];
      if (firstExp) {
        setTargetExperienceId(firstExp.id);
        setInputData((prev) => ({
          ...prev,
          position: firstExp.position,
          company: firstExp.company,
          [toolId === "IMPROVE_EXPERIENCE" ? "description" : "bullets"]:
            toolId === "IMPROVE_EXPERIENCE"
              ? firstExp.description || ""
              : (firstExp.highlights || []).length
                ? [...firstExp.highlights]
                : (firstExp.description || "").split("\n").filter(Boolean),
        }));
      }
    }
  };

  const handleExperienceTargetChange = (id) => {
    setTargetExperienceId(id);
    const exp = resume?.experiences?.find((e) => e.id === id);
    if (exp) {
      setInputData((prev) => ({
        ...prev,
        position: exp.position,
        company: exp.company,
        ...(selectedTool === "IMPROVE_EXPERIENCE"
          ? { description: exp.description || "" }
          : {
              bullets: (exp.highlights || []).length
                ? [...exp.highlights]
                : (exp.description || "").split("\n").filter(Boolean),
            }),
      }));
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isKeyboardOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 md:flex"
          >
            <Sparkles className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Assistant
            </DialogTitle>
          </DialogHeader>

          {!result ? (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AI_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleSelectTool(tool.id)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all ${
                      selectedTool === tool.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <tool.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{tool.label}</span>
                  </button>
                ))}
              </div>

              {selectedTool && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 border-t pt-4"
                >
                  <p className="text-sm text-muted-foreground">
                    {AI_TOOLS.find((t) => t.id === selectedTool)?.description}
                  </p>

                  {isLoading ? (
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ) : (
                    <>
                  {(selectedTool === "IMPROVE_EXPERIENCE" || selectedTool === "REWRITE_BULLETS") && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="target-experience">Target Experience</Label>
                        {resume?.experiences?.length ? (
                          <Select value={targetExperienceId} onValueChange={handleExperienceTargetChange}>
                            <SelectTrigger id="target-experience" aria-label="Target Experience">
                              <SelectValue placeholder="Select an experience" />
                            </SelectTrigger>
                            <SelectContent>
                              {resume.experiences.map((exp) => (
                                <SelectItem key={exp.id} value={exp.id}>
                                  {exp.position || "Untitled"} at {exp.company || "Unknown"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No experiences yet — add one in the Resume tab first.
                          </p>
                        )}
                      </div>
                      <Label htmlFor="ai-input-text">
                        {selectedTool === "IMPROVE_EXPERIENCE" ? "Current Description" : "Bullet Points (one per line)"}
                      </Label>
                      <Textarea
                        id="ai-input-text"
                        placeholder={
                          selectedTool === "IMPROVE_EXPERIENCE"
                            ? "Describe your role and responsibilities..."
                            : "• Managed a team of 5 engineers\n• Increased revenue by 20%"
                        }
                        rows={4}
                        value={inputData.description || inputData.bullets?.join("\n") || ""}
                        onChange={(e) =>
                          setInputData((prev) => ({
                            ...prev,
                            [selectedTool === "IMPROVE_EXPERIENCE" ? "description" : "bullets"]: e.target.value.split("\n").filter(Boolean),
                          }))
                        }
                      />
                    </div>
                  )}

                  {selectedTool === "GENERATE_EXPERIENCE" && (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="gen-exp-company">Company</Label>
                          <Input
                            id="gen-exp-company"
                            placeholder="Google"
                            value={inputData.company || ""}
                            onChange={(e) =>
                              setInputData((prev) => ({ ...prev, company: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="gen-exp-position">Position</Label>
                          <Input
                            id="gen-exp-position"
                            placeholder="Software Engineer"
                            value={inputData.position || ""}
                            onChange={(e) =>
                              setInputData((prev) => ({ ...prev, position: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="gen-exp-start">Start Date</Label>
                          <Input
                            id="gen-exp-start"
                            type="date"
                            value={inputData.startDate || ""}
                            onChange={(e) =>
                              setInputData((prev) => ({ ...prev, startDate: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="gen-exp-end">End Date</Label>
                          <Input
                            id="gen-exp-end"
                            type="date"
                            value={inputData.endDate || ""}
                            onChange={(e) =>
                              setInputData((prev) => ({ ...prev, endDate: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="gen-exp-notes">What did you do? (optional)</Label>
                        <Textarea
                          id="gen-exp-notes"
                          placeholder="Describe your responsibilities, tools, and any results — the AI will turn this into polished resume bullets."
                          rows={4}
                          value={inputData.description || ""}
                          onChange={(e) =>
                            setInputData((prev) => ({ ...prev, description: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {selectedTool === "COVER_LETTER" && (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            placeholder="Google"
                            value={inputData.company || ""}
                            onChange={(e) =>
                              setInputData((prev) => ({ ...prev, company: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            placeholder="Software Engineer"
                            value={inputData.position || ""}
                            onChange={(e) =>
                              setInputData((prev) => ({ ...prev, position: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTool === "ATS_KEYWORDS" && (
                    <div className="space-y-2">
                      <Label htmlFor="job-description">Job Description (optional)</Label>
                      <Textarea
                        id="job-description"
                        placeholder="Paste the job description here..."
                        rows={4}
                        value={inputData.jobDescription || ""}
                        onChange={(e) =>
                          setInputData((prev) => ({ ...prev, jobDescription: e.target.value }))
                        }
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleGenerate}
                    className={cn("w-full", aiAtLimit && "opacity-40")}
                    leftIcon={Sparkles}
                  >
                    Generate
                  </Button>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <ResultBlocks result={result} toolType={selectedTool} />
              </div>

              {(selectedTool === "IMPROVE_EXPERIENCE" || selectedTool === "REWRITE_BULLETS") &&
                targetExperienceId && (
                  <p className="text-xs text-muted-foreground">
                    Applying to:{" "}
                    {resume?.experiences?.find((e) => e.id === targetExperienceId)?.position || "Untitled"} at{" "}
                    {resume?.experiences?.find((e) => e.id === targetExperienceId)?.company || "Unknown"}
                  </p>
                )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopy} className="flex-1">
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setSelectedTool(null);
                  }}
                >
                  Try Again
                </Button>
              </div>

              {onApplyResult && (
                <Button
                  onClick={() => {
                    onApplyResult(result, selectedTool, targetExperienceId, inputData);
                    setIsOpen(false);
                    setResult(null);
                    setSelectedTool(null);
                    setTargetExperienceId(null);
                  }}
                  className="w-full"
                >
                  Apply to Resume
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UpgradePromptModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        kind="ai"
      />
    </>
  );
}
