"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";
import { useUIStore } from "@/store";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  loading: Loader2,
};

const colors = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-stamp/30 bg-stamp/10 text-stamp",
  loading: "border-warning/30 bg-warning/10 text-warning",
};

const iconColors = {
  success: "text-success",
  error: "text-destructive",
  info: "text-stamp",
  loading: "text-warning",
};

export function Toast() {
  const toastMessage = useUIStore((s) => s.toastMessage);
  const setToastMessage = useUIStore((s) => s.setToastMessage);

  if (!toastMessage) return null;

  const Icon = icons[toastMessage.type] || Info;
  const colorClass = colors[toastMessage.type] || colors.info;
  const iconColor = iconColors[toastMessage.type] || iconColors.info;
  const isLoading = toastMessage.type === "loading";

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role={toastMessage.type === "error" ? "alert" : "status"}
          aria-live={toastMessage.type === "error" ? "assertive" : "polite"}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-border/70 bg-popover/95 backdrop-blur-xl px-5 py-3 shadow-lg shadow-ink/10"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              toastMessage.type === "success"
                ? "bg-success/10"
                : toastMessage.type === "error"
                ? "bg-destructive/10"
                : toastMessage.type === "loading"
                ? "bg-warning/10"
                : "bg-stamp/10"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${iconColor} ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-semibold text-ink">
            {toastMessage.message}
          </p>
          <button
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="ml-1 rounded-full p-1 opacity-40 transition-opacity hover:opacity-100 hover:bg-paper-alt"
          >
            <X className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
