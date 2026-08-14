"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Wand2, ScanSearch, FileDown, ArrowRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks";
import { Button } from "@/components/ui/button";

const previewBullets = [
  { icon: Wand2, text: "AI rewrites bullets with action verbs & metrics" },
  { icon: ScanSearch, text: "Live ATS keyword matching against job posts" },
  { icon: FileDown, text: "Pixel-perfect PDF export in one click" },
];

export default function LiveDemoSection() {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section id="live-demo" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div ref={ref}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4"
            >
              <Play className="h-3.5 w-3.5" />
              Live Demo
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-ink"
            >
              Watch your resume transform in real time.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 max-w-md text-base text-muted-foreground leading-relaxed"
            >
              Resumate's AI editor works alongside you — rewriting bullets, matching ATS keywords, and formatting as you type.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 space-y-3"
            >
              {previewBullets.map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.text} className="flex items-center gap-3 text-sm text-ink">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stamp/10 text-stamp">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {b.text}
                  </li>
                );
              })}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8"
            >
              <Link href="/templates">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={ArrowRight}>
                  Browse Templates
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* MOCK APP PREVIEW */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-paper-alt px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-flag/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-seal/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-verified/70" />
                <span className="ml-3 rounded-sm border border-border bg-paper px-3 py-0.5 text-[10px] font-mono text-muted">
                  resumate.app/editor
                </span>
              </div>

              <div className="grid grid-cols-5 divide-x divide-border">
                <div className="col-span-2 p-4 space-y-2">
                  <div className="h-2.5 w-3/4 rounded-sm bg-paper-alt" />
                  <div className="h-2.5 w-1/2 rounded-sm bg-paper-alt" />
                  <div className="h-2.5 w-2/3 rounded-sm bg-paper-alt" />
                  <div className="h-2.5 w-4/5 rounded-sm bg-paper-alt" />
                  <div className="h-2.5 w-1/3 rounded-sm bg-paper-alt" />
                </div>

                <div className="col-span-3 p-5 space-y-3">
                  <div className="space-y-1">
                    <div className="h-4 w-40 rounded-sm bg-paper-alt" />
                    <div className="h-2 w-24 rounded-sm bg-paper-alt" />
                  </div>
                  <div className="rounded-md border border-stamp/20 bg-stamp/5 p-3 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5 text-stamp" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stamp">
                        AI Suggestion
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-sm bg-paper-alt" />
                    <div className="h-2 w-5/6 rounded-sm bg-paper-alt" />
                    <div className="flex gap-2 pt-1">
                      <span className="rounded-sm bg-stamp px-2 py-1 text-[10px] font-semibold text-paper">Apply</span>
                      <span className="rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-muted">Dismiss</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-sm bg-paper-alt" />
                    <div className="h-2 w-11/12 rounded-sm bg-paper-alt" />
                    <div className="h-2 w-4/5 rounded-sm bg-paper-alt" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="rounded-sm border border-verified/20 bg-verified/10 px-2 py-0.5 text-[10px] font-mono text-verified">
                      ATS 92
                    </span>
                    <span className="rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-ink">
                      Export PDF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
