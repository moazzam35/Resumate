"use client";

import { motion } from "framer-motion";
import { Star, Quote, BadgeCheck, ArrowUpRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks";
import { TESTIMONIALS } from "@/lib/constants";
import { getInitials, cn } from "@/lib/utils";
import Link from "next/link";

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-sky-500",
];

const COMPANIES = ["Google", "Meta", "Figma", "OpenAI", "Stripe", "AWS"];

function Stars({ className }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-3.5 w-3.5 fill-seal text-seal", className)} />
      ))}
    </div>
  );
}

function Avatar({ name, gradient, className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-paper",
        gradient,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

export default function TestimonialsSection() {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <section id="testimonials" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4"
          >
            <Star className="h-3.5 w-3.5" />
            Testimonials
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance"
          >
            Loved by{" "}
            <span className="gradient-text">thousands</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg text-muted-foreground text-balance"
          >
            Real stories from job seekers who landed interviews — and offers.
          </motion.p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ===== Rating panel ===== */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative h-full overflow-hidden rounded-2xl bg-ink p-8 text-paper sm:p-10">
              <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-stamp/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-seal/20 blur-3xl" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-paper/50">
                  <Star className="h-3.5 w-3.5 fill-seal text-seal" />
                  Overall rating
                </div>

                <div className="mt-5 flex items-end gap-4">
                  <span className="font-display text-6xl leading-none sm:text-7xl">4.9</span>
                  <div className="pb-1.5">
                    <Stars className="h-4 w-4" />
                    <p className="mt-2 text-[13px] text-paper/55">2,400+ five-star reviews</p>
                  </div>
                </div>

                <div className="mt-9 flex items-center gap-4">
                  <div className="flex -space-x-2.5">
                    {TESTIMONIALS.slice(0, 4).map((t, i) => (
                      <Avatar
                        key={t.id}
                        name={t.name}
                        gradient={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}
                        className="h-10 w-10 text-[11px] ring-2 ring-ink"
                      />
                    ))}
                  </div>
                  <p className="text-[13px] leading-snug text-paper/60">
                    Loved by job seekers at
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] font-semibold text-paper/85">
                      {COMPANIES.map((c) => (
                        <span key={c} className="inline-flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-seal" />
                          {c}
                        </span>
                      ))}
                    </span>
                  </p>
                </div>

                <div className="mt-auto pt-9">
                  <Link
                    href="/templates"
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-paper transition-colors hover:text-seal"
                  >
                    Explore 30+ templates
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== Testimonial grid ===== */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.45, delay: 0.12 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col rounded-xl border border-border/70 bg-card p-6 transition-shadow duration-300 hover:border-border-strong hover:shadow-lg"
              >
                <Quote className="absolute right-5 top-5 h-8 w-8 text-stamp/10 transition-colors duration-300 group-hover:text-stamp/20" />
                <Stars className="mb-4" />
                <p className="flex-1 text-[15px] leading-relaxed text-ink text-balance">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
                  <Avatar
                    name={t.name}
                    gradient={AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]}
                    className="h-10 w-10 shrink-0 text-[11px]"
                  />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-semibold text-ink">
                      <span className="truncate">{t.name}</span>
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-verified" />
                    </p>
                    <p className="truncate text-[13px] text-muted-foreground">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
