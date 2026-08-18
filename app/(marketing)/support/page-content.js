"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Send,
  ExternalLink,
  CheckCircle2,
  LifeBuoy,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const PORTFOLIO_URL = "https://moazzam35.github.io/portfolio/";

const supportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254),
  subject: z
    .string()
    .trim()
    .min(2, "Subject is required")
    .max(200, "Subject must be 200 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or fewer"),
});

const helpTopics = [
  {
    icon: MessageSquare,
    title: "Questions",
    description: "Not sure how something works? Ask away.",
  },
  {
    icon: AlertCircle,
    title: "Problems",
    description: "Something broken or not behaving? Let's fix it.",
  },
  {
    icon: LifeBuoy,
    title: "Feedback",
    description: "Ideas, suggestions, or things you'd love to see.",
  },
  {
    icon: CheckCircle2,
    title: "Assistance",
    description: "Need a hand with your resume or account?",
  },
];

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(supportSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || "Failed to send message");
      }
      setIsSubmitted(true);
      reset();
    } catch (err) {
      setSubmitError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
              <LifeBuoy className="h-4 w-4" />
              Help &amp; Support
            </div>
            <h1 className="heading-display text-4xl font-semibold sm:text-5xl text-balance">
              Need Help? We&apos;re Here for You.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-balance">
              Have questions, problems, feedback, or need assistance with
              Resumate? Reach out directly — the developer reads every
              message.
            </p>

            {/* Primary CTA */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href={PORTFOLIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  size="xl"
                  variant="gradient"
                  rightIcon={ExternalLink}
                  className="w-full sm:w-auto shadow-[0_10px_30px_-10px_color-mix(in_srgb,var(--stamp)_60%,transparent)]"
                >
                  Contact Developer
                </Button>
              </a>
              <Button
                size="xl"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() =>
                  document
                    .getElementById("support-form")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Send a Message
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FORM SECTION ============ */}
      <section id="support-form" className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* LEFT — info panel */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2"
            >
              <Card className="h-full">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="heading-display mb-2 text-lg font-semibold">
                    Prefer to talk directly?
                  </h2>
                  <p className="text-sm text-muted leading-relaxed">
                    The fastest way to reach the developer is through the
                    portfolio. Questions, bug reports, feature ideas — all
                    welcome.
                  </p>
                  <a
                    href={PORTFOLIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 block"
                  >
                    <Button
                      variant="primary"
                      rightIcon={ExternalLink}
                      className="w-full"
                    >
                      Contact Developer
                    </Button>
                  </a>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {helpTopics.map((topic) => {
                      const Icon = topic.icon;
                      return (
                        <div key={topic.title} className="flex items-start gap-3">
                          <div className="rounded-md bg-stamp/10 p-2 shrink-0">
                            <Icon className="h-4 w-4 text-stamp" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ink">
                              {topic.title}
                            </p>
                            <p className="text-xs text-muted leading-relaxed">
                              {topic.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 border-t border-border pt-6">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      Other ways to get help
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/faq"
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-paper px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink hover:border-border-strong"
                      >
                        Browse FAQ
                      </Link>
                      <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-paper px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink hover:border-border-strong"
                      >
                        Career Blog
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* RIGHT — form card */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-3"
            >
              <Card className="h-full">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="heading-display mb-1 text-lg font-semibold">
                    Send us a message
                  </h2>
                  <p className="mb-6 text-sm text-muted">
                    Fill out the form and we&apos;ll get back to you as soon as
                    possible.
                  </p>

                  {isSubmitted ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-verified/10">
                        <CheckCircle2 className="h-7 w-7 text-verified" />
                      </div>
                      <h3 className="heading-display text-lg font-semibold">
                        Message sent successfully.
                      </h3>
                      <p className="mt-2 text-sm text-muted">
                        We&apos;ll get back to you as soon as possible.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                      {submitError && (
                        <div
                          role="alert"
                          className="flex items-start gap-2.5 rounded-lg border border-flag/30 bg-flag/5 px-4 py-3 text-sm text-flag"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 min-w-0">
                          <Label htmlFor="support-name">Name</Label>
                          <Input
                            id="support-name"
                            placeholder="Your name"
                            autoComplete="name"
                            {...register("name")}
                          />
                          {errors.name && (
                            <p className="text-xs text-flag">{errors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2 min-w-0">
                          <Label htmlFor="support-email">Email</Label>
                          <Input
                            id="support-email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            {...register("email")}
                          />
                          {errors.email && (
                            <p className="text-xs text-flag">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="support-subject">Subject</Label>
                        <Input
                          id="support-subject"
                          placeholder="How can we help?"
                          {...register("subject")}
                        />
                        {errors.subject && (
                          <p className="text-xs text-flag">{errors.subject.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="support-message">Message</Label>
                        <Textarea
                          id="support-message"
                          placeholder="Tell us a bit more about your question, problem, or feedback..."
                          rows={6}
                          {...register("message")}
                        />
                        {errors.message && (
                          <p className="text-xs text-flag">{errors.message.message}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          type="submit"
                          variant="gradient"
                          className="w-full sm:w-auto"
                          disabled={isSubmitting}
                          loading={isSubmitting}
                          showLabelWhileLoading
                          rightIcon={Send}
                        >
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                        <p className="text-[11px] text-muted">
                          We reply as soon as possible — usually within 24 hours.
                        </p>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
