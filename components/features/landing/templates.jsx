"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIntersectionObserver } from "@/hooks";
import { ScaledResume } from "@/components/features/templates/scaled-resume";
import { TemplatePreviewModal } from "@/components/features/templates/template-preview-modal";
import { sampleResumeFor } from "@/lib/templates/normalize";
import { getTemplate } from "@/lib/templates/registry";
import { isPremiumUser } from "@/lib/templates/access";
import { setPendingTemplate } from "@/lib/templates/pending";
import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SHOWCASE_IDS = [
  "modern",
  "minimal",
  "software-engineer",
  "corporate",
  "editorial",
  "portfolio",
];

const TEMPLATES = SHOWCASE_IDS.map((id) => getTemplate(id));

function TemplateCard({ template, visible, index, onPreview, premium }) {
  const sample = useMemo(() => sampleResumeFor(template), [template]);
  const accent = template.design?.color || "#2563eb";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-xl hover:border-border transition-all duration-300"
    >
      {/* Live miniature preview */}
      <div
        className="relative overflow-hidden bg-surface px-5 pt-5 pb-7"
        style={{ backgroundImage: `linear-gradient(135deg, ${accent}14, transparent 60%)` }}
      >
        <div className="relative mx-auto w-full max-w-[250px]">
          {visible && (
            <ScaledResume
              template={template.id}
              data={sample}
              design={template.design}
              className="rounded-[2px] bg-white shadow-[0_14px_34px_-16px_rgba(15,23,42,0.4),0_1px_3px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.06] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <h3 className="font-semibold text-sm truncate">{template.name}</h3>
          {!premium && (template.isPremium ? (
            <Badge variant="default" className="text-[10px]">Pro</Badge>
          ) : (
            <Badge variant="success" className="text-[10px]">Free</Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>

        <div className="mt-auto pt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            rightIcon={ArrowRight}
            onClick={() => onPreview?.(template)}
          >
            Preview Template
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TemplatesSection() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [ref, isVisible] = useIntersectionObserver();
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handleUse = useCallback(
    (template) => {
      setPreviewTemplate(null);
      const premium = isPremiumUser(user);
      if (template.isPremium && !premium) {
        setPendingTemplate({ templateId: template.id, resumeId: null });
        router.push("/dashboard/upgrade");
        return;
      }
      if (!isAuthenticated) {
        router.push("/register");
        return;
      }
      router.push(`/resume/new?template=${template.id}`);
    },
    [user, isAuthenticated, router]
  );

  return (
    <section id="template" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4"
          >
            <Eye className="h-3.5 w-3.5" />
            Templates
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance"
          >
            Templates that{" "}
            <span className="gradient-text">make an impression</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-muted-foreground text-balance"
          >
            Choose from professionally designed templates. All ATS-friendly and customizable.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((template, i) => (
            <TemplateCard
              key={template.id}
              template={template}
              visible={isVisible}
              index={i}
              onPreview={setPreviewTemplate}
              premium={isPremiumUser(user)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href="/#template">
            <Button variant="outline" size="lg" rightIcon={ArrowRight}>
              View All Templates
            </Button>
          </Link>
        </motion.div>
      </div>

      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUse={handleUse}
      />
    </section>
  );
}
