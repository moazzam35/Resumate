"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompareArrows,
  Loader2,
  Lightbulb,
  Briefcase,
  FileText,
  Star,
  TrendingUp,
  ClipboardPaste,
  FileUp,
  X,
  Check,
} from "lucide-react";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubscription } from "@/hooks";
import { UpgradePromptModal } from "@/components/features/billing/upgrade-prompt-modal";
import { cn } from "@/lib/utils";

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

export default function JobMatchPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeContent, setResumeContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const [inputMode, setInputMode] = useState("paste");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const fileInputRef = useRef(null);
  const { atAiLimit, isEnterprise } = useSubscription();
  const aiAtLimit = atAiLimit && !isEnterprise;
  const [showUpgrade, setShowUpgrade] = useState(false);

  const extractTextFromFile = useCallback(async (file) => {
    setIsExtracting(true);
    setExtractError(null);
    setUploadedFile(file);
    setResumeContent("");
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
        setResumeContent(data.data.text);
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
    setResumeContent("");
    setExtractError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !resumeContent.trim()) return;
    if (aiAtLimit) {
      setShowUpgrade(true);
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/job-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ resumeContent, jobDescription }),
      });
      const data = await res.json();
      if (data.success) {
        const raw = data.data?.matchPercentage;
        const normalized = Number.isFinite(Number(raw))
          ? Math.min(100, Math.max(0, Math.round(Number(raw))))
          : 0;
        setResults({ ...(data.data || {}), matchPercentage: normalized });
      } else {
        setError(data.message || "Failed to analyze match. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Job Match Analyzer"
          description="See how well your resume matches a specific job description."
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        {/* Job Description */}
        <Card className="rounded-md border-border transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stamp/10">
                <Briefcase className="h-4 w-4 text-stamp" />
              </div>
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the job description here..."
              className="min-h-[280px] resize-none rounded-md border-border transition-all focus:border-stamp/50 focus:ring-stamp/20"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </CardContent>
        </Card>

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
                  onClick={() => { setInputMode("paste"); clearUpload(); }}
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
                  onClick={() => { setInputMode("upload"); setResumeContent(""); }}
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
                value={resumeContent}
                onChange={(e) => setResumeContent(e.target.value)}
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
                          {resumeContent.length.toLocaleString()} characters extracted
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
                        ? "border-stamp bg-stamp/5"
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

                {resumeContent && uploadedFile && !isExtracting && (
                  <div className="rounded-md bg-paper-alt/30 border border-border p-3">
                    <p className="text-xs font-medium text-muted mb-2">
                      Extracted preview:
                    </p>
                    <p className="text-xs text-muted line-clamp-4 leading-relaxed">
                      {resumeContent.substring(0, 300)}
                      {resumeContent.length > 300 ? "..." : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
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
          onClick={handleAnalyze}
          disabled={isAnalyzing || !jobDescription.trim() || !resumeContent.trim()}
          loading={isAnalyzing}
          leftIcon={GitCompareArrows}
          className={cn(aiAtLimit && "opacity-40")}
        >
          {isAnalyzing ? "Analyzing Match..." : "Analyze Match"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="rounded-md border-border">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="relative mb-6">
                  <svg
                    className="h-36 w-36 -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="var(--color-muted)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke={
                        results.matchPercentage >= 75
                          ? "url(#matchGradientGreen)"
                          : results.matchPercentage >= 50
                            ? "url(#matchGradientAmber)"
                            : "url(#matchGradientRed)"
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(results.matchPercentage / 100) * 327} 327`}
                    />
                    <defs>
                      <linearGradient id="matchGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B6E5E" />
                        <stop offset="100%" stopColor="#2D5547" />
                      </linearGradient>
                      <linearGradient id="matchGradientAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#C9A227" />
                        <stop offset="100%" stopColor="#A68520" />
                      </linearGradient>
                      <linearGradient id="matchGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#B3432B" />
                        <stop offset="100%" stopColor="#8C3420" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl heading-display font-semibold tracking-tight">
                      {results.matchPercentage}%
                    </span>
                    <span className="text-sm font-medium text-muted">
                      Match Score
                    </span>
                  </div>
                </div>
                <p className="text-center text-sm text-muted max-w-md leading-relaxed">
                  {results.matchPercentage >= 75
                    ? "Strong match! Your resume aligns well with this position."
                    : results.matchPercentage >= 50
                      ? "Decent match. Addressing missing skills would strengthen your application."
                      : "There's a significant gap. Consider tailoring your resume more specifically."}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-md border-border transition-all">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Matched Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.matchedSkills?.length > 0 ? (
                      results.matchedSkills.map((skill) => {
                        const name = typeof skill === "string" ? skill : skill.name;
                        return (
                          <motion.div
                            key={name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between rounded-md bg-verified/5 border border-verified/20 px-4 py-2.5 transition-all hover:bg-verified/10"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-verified/10">
                                <Star className="h-3 w-3 text-verified" />
                              </div>
                              <span className="text-sm font-medium">{name}</span>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted">No matched skills found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-md border-border transition-all">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Missing Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.missingSkills?.length > 0 ? (
                      results.missingSkills.map((skill) => {
                        const name = typeof skill === "string" ? skill : skill.name;
                        return (
                          <motion.div
                            key={name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between rounded-md bg-seal/5 border border-seal/20 px-4 py-2.5 transition-all hover:bg-seal/10"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-seal/10">
                                <TrendingUp className="h-3 w-3 text-seal" />
                              </div>
                              <span className="text-sm font-medium">{name}</span>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted">No missing skills detected.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {(results.recommendedKeywords?.length > 0 || results.recommendations?.length > 0) && (
              <Card className="rounded-md border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stamp/10">
                      <Lightbulb className="h-4 w-4 text-stamp" />
                    </div>
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(results.recommendations || results.recommendedKeywords || []).map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3.5 rounded-md border border-border p-4 transition-all hover:bg-paper-alt/50"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stamp/10 text-xs font-bold text-stamp">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-muted">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <UpgradePromptModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        kind="ai"
      />
    </motion.div>
  );
}
