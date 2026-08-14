"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { post } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isPremiumUser } from "@/lib/templates/access";
import { useAuthStore } from "@/store";
import { useSubscription } from "@/hooks";
import { UpgradePromptModal } from "@/components/features/billing/upgrade-prompt-modal";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function NewResumePage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const premium = isPremiumUser(useAuthStore((s) => s.user));
  const { atResumeLimit, isEnterprise } = useSubscription();
  const resumeAtLimit = atResumeLimit && !isEnterprise;
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    if (resumeAtLimit) {
      setShowUpgrade(true);
      return;
    }
    setIsCreating(true);
    try {
      const data = await post("/resumes", { title, template: selectedTemplate });
      router.push(`/dashboard/resumes/${data.resume.id}`);
    } catch (err) {
      console.error("Failed to create resume", err);
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/resumes"
          className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-all"
        >
           <ArrowLeft className="h-[18px] w-[18px]" />
          Back to Resumes
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl heading-display font-semibold">
          Create New Resume
        </h1>
        <p className="text-muted">
          Choose a template and give your resume a title to get started.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <Label htmlFor="title" className="text-base font-medium">
          Resume Title
        </Label>
        <Input
          id="title"
          placeholder="e.g. Senior Software Engineer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="max-w-md text-base"
          autoFocus
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <Label className="text-base font-medium">Choose a Template</Label>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TEMPLATES.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <motion.div key={template.id} variants={item}>
                <button
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    "w-full text-left rounded-md border-2 p-4 transition-all",
                    isSelected
                      ? "border-stamp bg-stamp/5"
                      : "border-border bg-paper-alt/50 hover:border-stamp/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="h-28 w-full rounded-md mb-3 flex flex-col items-center justify-center relative overflow-hidden"
                      style={{
                        backgroundColor: `${template.color}15`,
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: template.color }}
                      />
                      <div className="space-y-1.5 px-4 w-full">
                        <div
                          className="h-2.5 w-1/3 rounded"
                          style={{ backgroundColor: `${template.color}40` }}
                        />
                        <div className="h-1.5 w-1/2 rounded bg-muted-foreground/10" />
                        <div className="h-1.5 w-2/5 rounded bg-muted-foreground/10" />
                        <div className="mt-2 space-y-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-1 rounded bg-muted-foreground/5"
                              style={{ width: `${90 - i * 15}%` }}
                            />
                          ))}
                        </div>
                      </div>
                      {!premium && template.isPremium && (
                        <Badge
                          variant="default"
                          className="absolute top-2 right-2 text-[10px] gap-1"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <div
                      className={cn(
                        "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-all",
                        isSelected
                          ? "border-stamp bg-stamp text-paper"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{template.name}</p>
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: template.color }}
                      />
                    </div>
                    <p className="text-xs text-muted line-clamp-2">
                      {template.description}
                    </p>
                    <p className="text-[10px] text-muted capitalize">
                      {template.category}
                    </p>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-end gap-3 pt-4 border-t border-border"
      >
        <Link href="/dashboard/resumes">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleCreate}
          disabled={!title.trim() || isCreating}
          loading={isCreating}
          rightIcon={ArrowRight}
          className={cn(resumeAtLimit && "opacity-60")}
        >
          {isCreating ? "Creating..." : "Start Building"}
        </Button>
      </motion.div>

      <UpgradePromptModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        kind="resume"
      />
    </div>
  );
}
