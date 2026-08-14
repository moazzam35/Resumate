"use client";

import { motion } from "framer-motion";
import { TemplateGallery } from "@/components/features/templates/template-gallery";
import { useAuthStore } from "@/store";
import { isPremiumUser } from "@/lib/templates/access";
import { setPendingTemplate } from "@/lib/templates/pending";
import { useRouter } from "next/navigation";


export default function TemplatesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const handleUse = (template) => {
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
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <TemplateGallery
            onUse={handleUse}
            title="Resume Templates"
            subtitle="Professionally designed templates that pass ATS filters and impress recruiters. Preview any template with realistic content, then start from a blank or pre-filled resume."
          />
        </motion.div>
      </div>
    </div>
  );
}
