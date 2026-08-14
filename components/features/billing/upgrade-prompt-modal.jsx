"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Friendly upgrade prompt shown when a Free user hits a plan limit.
 * `kind`: "ai" | "resume"
 */
export function UpgradePromptModal({ open, onOpenChange, kind = "ai" }) {
  const isResume = kind === "resume";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isResume ? "You've reached your resume limit" : "You've reached your AI limit"}
          </DialogTitle>
          <DialogDescription>
            {isResume ? (
              <>
                Upgrade to <span className="font-semibold text-ink">Pro</span> to create and
                duplicate up to 10 resumes, or go{" "}
                <span className="font-semibold text-ink">Enterprise</span> for unlimited resumes.
              </>
            ) : (
              <>
                Upgrade to <span className="font-semibold text-ink">Pro</span> for 20 AI actions
                per month, or go <span className="font-semibold text-ink">Enterprise</span> for
                unlimited AI actions.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Link href="/dashboard/upgrade">
            <Button leftIcon={Sparkles}>Upgrade to Pro</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
