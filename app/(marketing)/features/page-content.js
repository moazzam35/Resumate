"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  FileSearch,
  FileText,
  Briefcase,
  MessageSquare,
  LayoutTemplate,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


const features = [
  {
    icon: Sparkles,
    title: "AI Summary Generator",
    description:
      "Generate compelling professional summaries tailored to your industry and experience level.",
    highlights: ["Industry-specific language", "Keyword optimization", "Tone customization", "Instant regeneration"],
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: FileSearch,
    title: "ATS Optimizer",
    description:
      "Ensure your resume passes through Applicant Tracking Systems with flying colors.",
    highlights: ["Real-time ATS scoring", "Keyword gap analysis", "Format compatibility check", "Industry benchmarks"],
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description:
      "Create personalized, professional cover letters that complement your resume.",
    highlights: ["Job-specific customization", "Tone matching", "Multiple templates", "One-click generation"],
    color: "text-verified",
    bg: "bg-verified/10",
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    description:
      "Get matched with opportunities that align with your skills and experience.",
    highlights: ["Skill-based matching", "Culture fit analysis", "Salary estimation", "Application tracking"],
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description:
      "Practice with AI-generated interview questions based on your resume and target role.",
    highlights: ["Role-specific questions", "Answer feedback", "Common pitfalls alerts", "STAR method coaching"],
    color: "text-flag",
    bg: "bg-flag/10",
  },
  {
    icon: LayoutTemplate,
    title: "Resume Templates",
    description:
      "Choose from a library of professionally designed, ATS-friendly templates.",
    highlights: ["6+ premium designs", "Fully customizable", "ATS-optimized layout", "PDF export ready"],
    color: "text-stamp",
    bg: "bg-stamp/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
              Features
            </div>
            <h1 className="heading-display text-4xl font-semibold sm:text-5xl lg:text-6xl text-balance">
              Everything you need to{" "}
              <span className="gradient-text">land your dream job</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted text-balance">
              Powerful AI-driven tools that take your resume from good to
              exceptional. Build, optimize, and submit with confidence.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card hover className="group h-full">
                    <CardContent className="p-6">
                      <div className={`mb-4 inline-flex rounded-md p-2.5 ${feature.bg}`}>
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <h3 className="heading-display mb-2 text-base font-semibold">{feature.title}</h3>
                      <p className="mb-4 text-sm text-muted leading-relaxed">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.highlights.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted">
                            <Check className="h-3.5 w-3.5 shrink-0 text-verified" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl text-balance">
              Ready to build your winning resume?
            </h2>
            <p className="mt-3 text-lg text-muted text-balance">
              Build a professional, ATS-friendly resume with AI-powered tools.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="gradient" rightIcon={ArrowRight}>
                  Get Started Free
                </Button>
              </Link>
              <Link href="/templates">
                <Button size="lg" variant="outline">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
