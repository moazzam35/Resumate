"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { post } from "@/lib/api";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useSubscription } from "@/hooks";
import { UpgradePromptModal } from "@/components/features/billing/upgrade-prompt-modal";


export default function NewResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { atResumeLimit, isEnterprise } = useSubscription();
  const resumeAtLimit = atResumeLimit && !isEnterprise;

  useEffect(() => {
    async function create() {
      // Gate the limit client-side like the dashboard create flows so capped
      // users see the friendly upgrade prompt instead of a raw server error.
      if (resumeAtLimit) {
        setIsCreating(false);
        setShowUpgrade(true);
        return;
      }
      try {
        const template = searchParams.get("template") || "modern";
        const data = await post("/resumes", { title: "Untitled Resume", template });
        router.replace(`/resume/${data.resume.id}`);
      } catch (err) {
        // Fallback for a server-side 403 limit response (e.g. stale client usage).
        if ((err.message || "").includes("resume limit")) {
          setIsCreating(false);
          setShowUpgrade(true);
          return;
        }
        setError(err.message || "Failed to create resume");
        setIsCreating(false);
      }
    }
    create();
  }, [router, searchParams, resumeAtLimit]);

  const closeUpgrade = (open) => {
    setShowUpgrade(open);
    if (!open) router.push("/dashboard");
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-28" />
          </CardContent>
        </Card>
      </motion.div>
      <UpgradePromptModal open={showUpgrade} onOpenChange={closeUpgrade} kind="resume" />
    </div>
  );
}
