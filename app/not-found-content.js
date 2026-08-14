"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10"
        >
          <FileQuestion className="h-12 w-12 text-primary" />
        </motion.div>
        <h1 className="text-6xl font-bold tracking-tight">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            leftIcon={ArrowLeft}
          >
            Go Back
          </Button>
          <Link href="/">
            <Button leftIcon={Home}>
              Go Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
