"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ScanSearch,
  Loader2,
  FileText,
  Target,
  ClipboardPaste,
  FileUp,
  X,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/store";
import { useSubscription } from "@/hooks";
import { UpgradePromptModal } from "@/components/features/billing/upgrade-prompt-modal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function CheckingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-xl space-y-4"
    >
      <div className="flex flex-col items-center gap-4 py-6">
        <Loader2 className="h-8 w-8 animate-spin text-stamp" />
        <p className="text-sm font-medium text-ink">Analyzing your resume…</p>
        <p className="text-xs text-muted">
          Scoring keyword matches, structure, and content against the job.
        </p>
      </div>
      <Card className="rounded-md border-border">
        <CardContent className="flex flex-col items-center gap-8 py-8 lg:flex-row lg:items-center lg:justify-center">
          <Skeleton className="h-36 w-36 rounded-full" />
          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ATSCheckerPage() {
  const router = useRouter();
  const showToast = useUIStore((s) => s.showToast);
  const [inputMode, setInputMode] = useState("paste");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const { atAiLimit, isEnterprise } = useSubscription();
  const aiAtLimit = atAiLimit && !isEnterprise;
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleCheck = async (textOverride) => {
    const content = String(textOverride ?? resumeText ?? "");
    if (!content.trim() || !jobDescription.trim()) return;
    if (aiAtLimit) {
      setShowUpgrade(true);
      return;
    }
    setIsChecking(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ats-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ resumeContent: content, jobDescription, targetJobTitle: targetJobTitle.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success && data.data?.resultId) {
        showToast("Analysis complete.");
        router.push(`/dashboard/ats-checker/${data.data.resultId}`);
      } else if (data.success) {
        setError("Analysis succeeded but could not be saved. Please try again.");
      } else {
        setError(data.message || "Failed to analyze resume. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  // File upload state
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const fileInputRef = useRef(null);

  const extractTextFromFile = useCallback(async (file) => {
    setIsExtracting(true);
    setExtractError(null);
    setUploadedFile(file);
    setResumeText("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-text", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResumeText(data.data.text);
      } else {
        setExtractError(data.message || "Failed to extract text from file.");
        setUploadedFile(null);
      }
    } catch {
      setExtractError("Failed to upload file. Please try again.");
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) extractTextFromFile(file);
    },
    [extractTextFromFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) extractTextFromFile(file);
    },
    [extractTextFromFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const clearUpload = useCallback(() => {
    setUploadedFile(null);
    setResumeText("");
    setExtractError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const switchToPaste = useCallback(() => {
    setInputMode("paste");
    clearUpload();
  }, [clearUpload]);

  const switchToUpload = useCallback(() => {
    setInputMode("upload");
    setResumeText("");
  }, []);

  const canCheck = resumeText.trim().length > 0 && jobDescription.trim().length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="ATS Score Checker"
          description="Upload or paste your resume and job description to get an ATS compatibility score."
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        {/* Resume Input */}
        <Card className="rounded-md border-border transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stamp/10">
                  <FileText className="h-4 w-4 text-stamp" />
                </div>
                Your Resume
              </CardTitle>
              <div className="flex items-center gap-1 rounded-lg bg-paper-alt p-1">
                <button
                  onClick={switchToPaste}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    inputMode === "paste"
                      ? "bg-paper text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <ClipboardPaste className="h-[18px] w-[18px]" />
                  Paste
                </button>
                <button
                  onClick={switchToUpload}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    inputMode === "upload"
                      ? "bg-paper text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <FileUp className="h-[18px] w-[18px]" />
                  Upload
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {inputMode === "paste" ? (
              <Textarea
                placeholder="Paste your resume content here..."
                className="min-h-[280px] resize-none rounded-md border-border transition-all focus:border-stamp/50 focus:ring-stamp/20"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            ) : (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploadedFile && !isExtracting ? (
                  <div className="relative rounded-md border border-border bg-paper-alt/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-verified/10">
                        <Check className="h-5 w-5 text-verified" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-muted">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                          {" \u00b7 "}
                          {resumeText.length.toLocaleString()} characters extracted
                        </p>
                      </div>
                      <button
                        onClick={clearUpload}
                        className="rounded-lg p-1.5 text-muted hover:bg-flag/10 hover:text-flag transition-colors cursor-pointer"
                      >
                        <X className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </div>
                ) : isExtracting ? (
                  <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-primary/30 bg-stamp/5 p-10">
                    <Loader2 className="h-8 w-8 text-stamp animate-spin mb-3" />
                    <p className="text-sm font-medium">Extracting text...</p>
                    <p className="text-xs text-muted mt-1">
                      Reading {uploadedFile?.name}
                    </p>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group flex flex-col items-center justify-center rounded-md border-2 border-dashed p-10 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      isDragOver
                        ? "border-stamp bg-stamp/5 "
                        : "border-border hover:border-stamp/30 hover:bg-paper-alt/30"
                    }`}
                  >
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-stamp/10 mb-4 transition-all duration-300 ${isDragOver ? "scale-110 bg-stamp/15" : "group-hover:scale-105"}`}>
                      <FileUp className={`h-8 w-8 transition-colors duration-300 ${isDragOver ? "text-stamp" : "text-stamp/70"}`} />
                    </div>
                    <p className="text-sm font-medium">
                      {isDragOver
                        ? "Drop your file here"
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      PDF or DOCX up to 10MB
                    </p>
                  </div>
                )}

                {extractError && (
                  <div className="rounded-md border border-flag/30 bg-flag/5 p-3 text-sm text-flag">
                    {extractError}
                  </div>
                )}

                {resumeText && uploadedFile && !isExtracting && (
                  <div className="rounded-md bg-paper-alt/30 border border-border p-3">
                    <p className="text-xs font-medium text-muted mb-2">
                      Extracted preview:
                    </p>
                    <p className="text-xs text-muted line-clamp-4 leading-relaxed">
                      {resumeText.substring(0, 300)}
                      {resumeText.length > 300 ? "..." : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="rounded-md border-border transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stamp/10">
                <Target className="h-4 w-4 text-stamp" />
              </div>
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Job Title (optional)</Label>
              <Input
                placeholder="e.g. Frontend Developer"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
              />
              <p className="text-xs text-muted">
                Used to tailor the ATS analysis to the specific role.
              </p>
            </div>
            <Textarea
              placeholder="Paste the job description here..."
              className="min-h-[280px] resize-none rounded-md border-border transition-all focus:border-stamp/50 focus:ring-stamp/20"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-flag/30 bg-flag/5 p-4 text-sm text-flag"
        >
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex justify-center">
        <Button
          size="lg"
          onClick={() => handleCheck()}
          disabled={isChecking || !canCheck}
          loading={isChecking}
          leftIcon={ScanSearch}
          className={aiAtLimit ? "opacity-40" : undefined}
        >
          {isChecking ? "Analyzing..." : "Check ATS Score"}
        </Button>
      </motion.div>

      {isChecking && <CheckingSkeleton />}

      <UpgradePromptModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        kind="ai"
      />
    </motion.div>
  );
}
