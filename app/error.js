"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RootError({ error, unstable_retry }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <title>Something Went Wrong – Resumate</title>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-destructive/10"
        >
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          An unexpected error occurred while loading this page. Please try again —
          if the problem persists, contact support.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => unstable_retry()} leftIcon={RefreshCw}>
            Try Again
          </Button>
          <Link href="/">
            <Button leftIcon={Home}>Go Home</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
