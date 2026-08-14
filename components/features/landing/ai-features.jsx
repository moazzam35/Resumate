"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  FileEdit,
  Wand2,
  BarChart3,
  MessageSquare,
  Target,
  Search,
  Briefcase,
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks";

const aiFeatures = [
  {
    icon: Sparkles,
    title: "Professional Summary",
    description: "Generate compelling summaries tailored to your industry",
  },
  {
    icon: FileEdit,
    title: "Improve Experience",
    description: "Enhance work descriptions with impact-driven language",
  },
  {
    icon: Wand2,
    title: "Rewrite Bullets",
    description: "Transform basic bullets into achievement-focused statements",
  },
  {
    icon: Target,
    title: "Generate Skills",
    description: "Discover relevant skills for your target role",
  },
  {
    icon: Search,
    title: "ATS Keywords",
    description: "Optimize your resume for applicant tracking systems",
  },
  {
    icon: BarChart3,
    title: "Resume Analysis",
    description: "Get detailed feedback and improvement suggestions",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Generate practice questions based on your resume",
  },
  {
    icon: Briefcase,
    title: "Career Suggestions",
    description: "Get personalized career path recommendations",
  },
];

export default function AIFeaturesSection() {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section id="ai-features" className="py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance"
          >
            Let AI do the{" "}
            <span className="gradient-text">heavy lifting</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-muted-foreground text-balance"
          >
            Our AI assistant helps you write, improve, and optimize every
            section of your resume.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {aiFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.04 * i, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 relative rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          <div className="relative p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-3">
                  See the AI in action
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Watch how our AI transforms a basic resume into a
                  professional, ATS-optimized document in seconds.
                </p>
                <div className="space-y-3">
                  {[
                    "Analyzes job requirements",
                    "Suggests relevant keywords",
                    "Improves bullet points",
                    "Scores your resume",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl border border-border/50 bg-surface p-6 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    <span className="text-xs text-muted-foreground ml-2">
                      AI Analysis
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { icon: "check", text: "ATS Score: 92/100", color: "text-success" },
                      { icon: "check", text: "Keywords: 15/18 matched", color: "text-success" },
                      { icon: "warn", text: "Summary: Could be more specific", color: "text-warning" },
                      { icon: "check", text: "Format: ATS-friendly", color: "text-success" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span className={item.color}>
                          {item.icon === "check" ? "✓" : "!"}
                        </span>
                        <span className="text-muted-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
