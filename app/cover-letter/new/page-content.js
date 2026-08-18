"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Save,
  PenTool,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUIStore, useAuthStore } from "@/store";
import { useSubscription } from "@/hooks";
import { UpgradePromptModal } from "@/components/features/billing/upgrade-prompt-modal";
import { get, post, put } from "@/lib/api";
import { cn } from "@/lib/utils";


const TEMPLATES = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal and polished cover letter",
  },
  {
    id: "internship",
    name: "Internship",
    description: "Tailored for internship applications",
  },
  {
    id: "frontend",
    name: "Frontend Developer",
    description: "For frontend engineering roles",
  },
  {
    id: "backend",
    name: "Backend Developer",
    description: "For backend engineering roles",
  },
  {
    id: "fullstack",
    name: "Full Stack Developer",
    description: "For full stack engineering roles",
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    description: "General software engineering roles",
  },
];

export default function CoverLetterPage({ id }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    position: "",
    jobDescription: "",
    name: "",
  });
  const [content, setContent] = useState("");
  const showToast = useUIStore((s) => s.showToast);
  const { user } = useAuthStore();
  const { atAiLimit, isEnterprise } = useSubscription();
  const aiAtLimit = atAiLimit && !isEnterprise;
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    get(`/cover-letters/${id}`)
      .then((data) => {
        if (cancelled) return;
        const coverLetter = data.result || data;
        setFormData((p) => ({
          ...p,
          title: coverLetter.title || "",
          company: coverLetter.company || "",
          position: coverLetter.position || "",
        }));
        setContent(coverLetter.content || "");
        if (coverLetter.template) setSelectedTemplate(coverLetter.template);
      })
      .catch((error) => {
        if (cancelled) return;
        showToast({ message: error.message || "Failed to load cover letter", type: "error" });
        router.push("/dashboard/cover-letters");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, router, showToast]);

  const handleGenerate = async () => {
    if (!formData.position) {
      showToast({ message: "Please enter a position", type: "error" });
      return;
    }
    if (aiAtLimit) {
      setShowUpgrade(true);
      return;
    }
    setIsGenerating(true);
    try {
      const response = await post("/ai", {
        type: "COVER_LETTER",
        data: {
          name: formData.name || user?.name || "Applicant",
          position: formData.position,
          targetJobTitle: formData.position,
          company: formData.company,
          jobDescription: formData.jobDescription,
          skills: "",
          experience: "",
        },
      });
      setContent(response.result);
      showToast({ message: "Cover letter generated!", type: "success" });
    } catch (error) {
      showToast({ message: error.message || "Generation failed", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!content || !formData.title) {
      showToast({ message: "Title and content are required", type: "error" });
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing) {
        await put(`/cover-letters/${id}`, {
          title: formData.title,
          company: formData.company,
          position: formData.position,
          content,
          template: selectedTemplate,
        });
      } else {
        await post("/cover-letters", {
          title: formData.title,
          company: formData.company,
          position: formData.position,
          content,
          template: selectedTemplate,
        });
      }
      showToast({ message: "Cover letter saved!", type: "success" });
      router.push("/dashboard/cover-letters");
    } catch (error) {
      showToast({ message: "Failed to save", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
               <ArrowLeft className="h-[18px] w-[18px]" />
              Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {content && !isLoading && (
              <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving} loading={isSaving} leftIcon={Save}>
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenTool className="h-6 w-6 text-primary" />
            Cover Letter Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered cover letters tailored to your target role
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Title *</Label>
                  <Input
                    placeholder="Google Frontend Role"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Company</Label>
                  <Input
                    placeholder="Google"
                    value={formData.company}
                    onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Position *</Label>
                  <Input
                    placeholder="Software Engineer"
                    value={formData.position}
                    onChange={(e) => setFormData((p) => ({ ...p, position: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Job Description (optional)</Label>
                  <Textarea
                    placeholder="Paste the job description..."
                    rows={4}
                    value={formData.jobDescription}
                    onChange={(e) => setFormData((p) => ({ ...p, jobDescription: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Template Style</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`rounded-lg border p-2 text-left text-xs transition-all ${
                          selectedTemplate === t.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-accent"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating} loading={isGenerating} className={cn("w-full", aiAtLimit && "opacity-40")} leftIcon={Sparkles}>
                  Generate Cover Letter
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="min-h-[500px]">
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <Loader2 className="h-8 w-8 text-muted-foreground/50 mb-3 animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading cover letter...</p>
                  </div>
                ) : content ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Fill in the details and click &quot;Generate&quot; to create your cover letter
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <UpgradePromptModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        kind="ai"
      />
    </div>
  );
}
