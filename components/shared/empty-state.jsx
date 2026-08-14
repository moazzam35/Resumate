"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex flex-col items-center justify-center py-16 text-center", className)}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-paper-alt border border-border mb-3">
          <Icon className="h-6 w-6 text-muted" />
        </div>
      )}
      <h3 className="heading-display text-base font-semibold">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-muted max-w-sm leading-relaxed">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-4">
          <Button size="sm" variant="primary">{actionLabel}</Button>
        </Link>
      )}
    </motion.div>
  );
}
