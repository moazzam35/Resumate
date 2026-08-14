"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  History,
  RotateCcw,
  GitCommit,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/shared/loading-skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { get, post } from "@/lib/api";
import { useUIStore } from "@/store";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

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

export default function ResumeHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params?.id;
  const showToast = useUIStore((s) => s.showToast);

  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const fetchVersions = useCallback(async () => {
    if (!resumeId) return;
    try {
      const data = await get(`/resumes/${resumeId}/version`);
      setVersions(data.data || []);
    } catch {
      showToast({ message: "Failed to load version history", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [resumeId, showToast]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleRestore = async () => {
    if (!confirmId) return;
    setRestoringId(confirmId);
    try {
      await post(`/resumes/${resumeId}/version/${confirmId}`, {});
      showToast({ message: "Resume restored", type: "success" });
      await fetchVersions();
    } catch {
      showToast({ message: "Failed to restore version", type: "error" });
    } finally {
      setRestoringId(null);
      setConfirmId(null);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
            leftIcon={ArrowLeft}
            onClick={() => router.push(`/dashboard/resumes/${resumeId}`)}
          >
            Back to editor
          </Button>
          <h2 className="text-2xl heading-display font-semibold">Version History</h2>
          <p className="text-sm text-muted">
            Track changes to your resume and restore previous versions.
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-md border-border">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : versions.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-md bg-muted">
            <History className="h-10 w-10 text-muted" />
          </div>
          <p className="text-lg font-medium">No version history</p>
          <p className="text-sm text-muted">
            Version snapshots will appear here as you save changes to your
            resume.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="rounded-md border-border">
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute left-[19px] top-0 bottom-0 w-px bg-stamp/40 via-border to-border" />

                <div className="space-y-0">
                  {versions.map((version, index) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                          version.isCurrent
                            ? "bg-stamp border-stamp text-paper"
                            : "bg-paper border-border text-muted"
                        }`}
                      >
                        <GitCommit className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold">
                                {version.title}
                              </h3>
                              {version.isCurrent && (
                                <Badge variant="default" className="text-[10px]">
                                  Current
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px]">
                                v{version.version}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(version.createdAt)}
                              </span>
                              <span>{timeAgo(version.createdAt)}</span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Snapshot
                              </span>
                            </div>
                          </div>

                          {!version.isCurrent && (
                            <Button
                              size="sm"
                              onClick={() => setConfirmId(version.id)}
                              disabled={restoringId === version.id}
                              loading={restoringId === version.id}
                              className="shrink-0"
                              leftIcon={RotateCcw}
                            >
                              {restoringId === version.id ? "Restoring..." : "Restore"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore this version?</DialogTitle>
            <DialogDescription>
              Restoring will replace your current resume with this snapshot. The
              current state is saved automatically as a safety-net version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRestore}
              disabled={!!restoringId}
              loading={!!restoringId}
            >
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
