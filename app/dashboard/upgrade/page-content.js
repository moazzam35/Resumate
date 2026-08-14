"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Crown, ArrowRight, ArrowLeft, Lock, ShieldCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PLANS } from "@/lib/constants";
import { useAuthStore } from "@/store";
import { cn } from "@/lib/utils";
import { getPendingTemplate } from "@/lib/templates/pending";

const PLAN_LABEL = { FREE: "Free", PRO: "Pro", ENTERPRISE: "Enterprise" };

const planCard = (plan) => ({
  ...plan,
  variant: plan.id === "pro" ? "primary" : "outline",
  badge: plan.id === "pro" ? "Most Popular" : null,
  action: plan.id === "pro" ? "Upgrade to Pro" : "Get Executive Access",
});

export default function UpgradePage() {
  const { user, refreshUser } = useAuthStore();
  const currentPlan = user?.subscription?.plan || "FREE";

  const [step, setStep] = useState("select");
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending] = useState(() => getPendingTemplate());

  const cards = PLANS.map(planCard);

  const startCheckout = (plan) => {
    setError("");
    setSelected(plan);
    setStep("checkout");
  };

  const confirmUpgrade = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected.id.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed. Please try again.");
      await refreshUser();
      setStep("success");
    } catch (err) {
      setError(err.message || "Upgrade failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl heading-display font-semibold text-ink">Upgrade your plan</h2>
          <p className="text-xs text-muted mt-0.5">
            Choose the plan that fits your career goals. Cancel anytime.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted">Current plan</span>
          <Badge variant={currentPlan === "PRO" ? "pro" : currentPlan === "ENTERPRISE" ? "primary" : "outline"}>
            {PLAN_LABEL[currentPlan] || "Free"}
          </Badge>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1 — PICK A PLAN */}
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-5 md:grid-cols-3"
          >
            {cards.map((plan) => {
              const isCurrent = plan.id === "free"
                ? !["PRO", "ENTERPRISE"].includes(currentPlan)
                : plan.id.toUpperCase() === currentPlan;
              const isLocked = plan.id !== "free" && !isCurrent;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col justify-between p-6",
                    plan.badge === "Most Popular"
                      ? "border-primary shadow-md ring-1 ring-primary/20"
                      : "border-border"
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 right-6">
                      <Badge variant="primary" dot>{plan.badge}</Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-ink flex items-center gap-1.5">
                        {plan.id === "pro" && <Sparkles className="h-4 w-4 text-stamp" />}
                        {plan.id === "enterprise" && <Crown className="h-4 w-4 text-stamp" />}
                        {plan.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-ink tabular-nums">
                        ${plan.price}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {plan.price === 0 ? "forever" : "/month"}
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-border/60">
                      {plan.features.slice(0, 5).map((feat) => (
                        <div key={feat} className="flex items-center gap-2.5 text-xs text-ink">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <Check className="h-3 w-3" />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : isLocked ? (
                      <Button variant={plan.variant} className="w-full" onClick={() => startCheckout(plan)}>
                        {plan.action}
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}

        {/* STEP 2 — MOCK CHECKOUT */}
        {step === "checkout" && selected && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 md:grid-cols-5"
          >
            <Card className="md:col-span-3 flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Complete your upgrade</CardTitle>
                <CardDescription>
                  Review your plan and confirm your order.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-border bg-paper-alt p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                        {selected.id === "pro" ? <Sparkles className="h-4 w-4 text-stamp" /> : <Crown className="h-4 w-4 text-stamp" />}
                        Resumate {selected.name}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">{selected.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-ink tabular-nums">${selected.price}</p>
                      <p className="text-[10px] text-muted font-medium">/month</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
                    {selected.features.slice(0, 4).map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-[11px] text-muted">
                        <Check className="h-3 w-3 text-verified shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Input label="Card number" placeholder="4242 4242 4242 4242" leftIcon={Lock} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Expiry" placeholder="MM / YY" />
                    <Input label="CVC" placeholder="•••" />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-flag font-medium">{error}</p>
                )}

                <p className="flex items-center gap-1.5 text-[10px] font-mono text-muted">
                  <ShieldCheck className="h-3 w-3 text-verified" />
                  Demo checkout — no real payment is processed.
                </p>
              </CardContent>
              <CardFooter className="gap-3">
                <Button variant="outline" onClick={() => setStep("select")} leftIcon={ArrowLeft}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  loading={isLoading}
                  onClick={confirmUpgrade}
                  rightIcon={ArrowRight}
                >
                  Confirm &amp; Activate
                </Button>
              </CardFooter>
            </Card>

            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">What you get</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {selected.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-muted">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mt-px">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card variant="surface" className="p-5">
                <p className="text-xs font-semibold text-ink mb-2">Money-back guarantee</p>
                <p className="text-[11px] text-muted leading-relaxed">
                  14-day money-back guarantee. No hidden fees. Cancel anytime.
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — SUCCESS */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto"
          >
            <Card className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-verified/10 text-verified mb-4">
                <Check className="h-7 w-7" />
              </div>
              <h3 className="heading-display text-xl font-semibold text-ink">
                Welcome to {selected?.name}!
              </h3>
              <p className="text-xs text-muted mt-2 max-w-sm mx-auto">
                Your plan has been activated. Unlimited resumes, all templates, and advanced AI features are now unlocked.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge variant="pro" dot>{selected?.name} Active</Badge>
              </div>

              {pending && (
                <Link
                  href={pending.resumeId ? `/resume/${pending.resumeId}` : `/resume/new?template=${pending.templateId}`}
                  className="block mt-6"
                >
                  <Button className="w-full sm:w-auto" rightIcon={Wand2}>
                    Apply my template &amp; continue editing
                  </Button>
                </Link>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">Back to Dashboard</Button>
                </Link>
                <Link href="/dashboard/templates" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto" rightIcon={ArrowRight}>
                    Browse All Templates
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
