"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ScanSearch,
  LayoutTemplate,
  FileCheck2,
  Lock,
  Download,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI Impact Enhancer",
    description: "Transforms weak bullet points into high-impact, metrics-driven achievements tailored to executive hiring managers.",
  },
  {
    icon: ScanSearch,
    title: "Real-Time ATS Keyword Matcher",
    description: "Scan your resume against job postings to identify missing keywords and ensure maximum ATS pass rates.",
  },
  {
    icon: LayoutTemplate,
    title: "Executive Template Collection",
    description: "Handcrafted templates engineered by top product designers to look stunning in both digital PDF and print.",
  },
  {
    icon: FileCheck2,
    title: "Cover Letter Generator",
    description: "Automatically generate tailored cover letters matched to your targeted job description in one click.",
  },
  {
    icon: Download,
    title: "One-Click Vector PDF Export",
    description: "Download crystal-clear vector PDFs formatted for immediate submission through HR portals.",
  },
  {
    icon: Lock,
    title: "Privacy & Data Protection",
    description: "Your resume data is end-to-end encrypted and never sold or shared with external recruiters.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 border-b border-border/50 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Platform Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Everything Required for Career Growth.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Eliminate guesswork. Our intelligent platform optimizes every section of your application for top tier performance.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover className="h-full border-border bg-card p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
