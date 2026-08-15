"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Lock, Zap, FileText, Palette, Wand2 } from "lucide-react";
import { setPendingTemplate } from "@/lib/templates/pending";

export function UpgradeModal({ template, open, onOpenChange, resumeId }) {
  const router = useRouter();

  if (!template) return null;

  const goUpgrade = () => {
    setPendingTemplate({ templateId: template.id, resumeId: resumeId || null });
    onOpenChange(false);
    router.push("/dashboard/upgrade");
  };

  const benefits = [
    { icon: FileText, text: "All 30+ templates, free and pro" },
    { icon: Palette, text: "Colors, fonts & layout customization" },
    { icon: Wand2, text: "AI writing, ATS scoring & analysis" },
    { icon: Zap, text: "Unlimited PDF downloads in every design" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-stamp via-primary to-[oklch(0.55_0.2_303)] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-paper/15 text-paper backdrop-blur">
            <Sparkles className="h-7 w-7" />
          </div>
          <DialogTitle className="heading-display mt-4 text-2xl font-semibold text-paper">
            {template.name} is a Pro template
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-paper/85">
            Unlock every premium template plus unlimited customization and AI tools.
          </DialogDescription>
          <div className="mt-4 inline-flex items-center gap-2">
            <Badge variant="outline" className="border-paper/40 text-paper">
              <Lock className="h-3 w-3" /> Currently locked
            </Badge>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <ul className="space-y-3">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-verified/10 text-verified">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full" size="lg" rightIcon={Sparkles} onClick={goUpgrade}>
            Upgrade to Pro
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            From $12/mo · Cancel anytime · 14-day money-back guarantee
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
