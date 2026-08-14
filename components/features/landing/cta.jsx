"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntersectionObserver } from "@/hooks";

export default function CTASection() {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[oklch(0.5_0.2_303)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]" />
          <div className="absolute inset-0 dot-pattern opacity-10" />

          <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:px-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 mb-6 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Ready to get started?
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
                Start building your dream resume today
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
                Join thousands of job seekers who landed their dream jobs with
                our AI-powered resume builder. Start for free, no credit card
                required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button
                    size="xl"
                    variant="primary"
                    className="bg-white text-primary hover:bg-white/90"
                    rightIcon={ArrowRight}
                  >
                    Get Started for Free
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/50 mt-6">
                Free plan includes 1 resume, 3 templates, and basic AI suggestions.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
