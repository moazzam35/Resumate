"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PageHeader({ title, description, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}
    >
      <div>
        <h1 className="heading-display text-xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 mt-3 sm:mt-0">{children}</div>}
    </motion.div>
  );
}
