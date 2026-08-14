"use client";

import { motion } from "framer-motion";
import { TemplateGallery } from "@/components/features/templates/template-gallery";

export default function TemplatesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <TemplateGallery
        title="Template Library"
        subtitle="Preview any template with realistic content, save your favorites, and start a new resume in one click."
      />
    </motion.div>
  );
}
