"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, unstable_retry }) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[50vh] items-center justify-center p-6"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">This section hit a snag</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Something went wrong while loading this part of the dashboard. Try
          again, or head back to the overview.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => unstable_retry()} leftIcon={RefreshCw}>
            Try Again
          </Button>
          <Button leftIcon={LayoutDashboard} onClick={() => (window.location.href = "/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
