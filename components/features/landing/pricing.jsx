"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free Forever",
    priceMonthly: "$0",
    priceAnnual: "$0",
    description: "Essential resume editing for job seekers.",
    features: [
      "1 Resume Document",
      "Standard PDF Download",
      "Basic ATS Optimization Check",
      "Access to 3 Standard Templates",
    ],
    cta: "Get Started Free",
    variant: "outline",
    badge: null,
    href: "/register",
  },
  {
    name: "Pro Architect",
    priceMonthly: "$14",
    priceAnnual: "$9",
    description: "Complete AI Suite for active career seekers.",
    features: [
      "Unlimited Resume Documents",
      "AI Bullet Point Rewriter (Unlimited)",
      "Real-time ATS Keyword Matcher",
      "All Executive Templates",
      "Cover Letter Generator",
      "Priority Vector PDF Export",
    ],
    cta: "Upgrade to Pro",
    variant: "primary",
    badge: "Most Popular",
    href: "/register?plan=pro",
  },
  {
    name: "Executive Suite",
    priceMonthly: "$29",
    priceAnnual: "$19",
    description: "Designed for C-suite and executive leaders.",
    features: [
      "Everything in Pro Architect",
      "1-on-1 Human Career Review",
      "Custom Typography & Layout Studio",
      "LinkedIn Profile Optimization",
      "Dedicated Support Manager",
    ],
    cta: "Get Executive Access",
    variant: "outline",
    badge: "Enterprise",
    href: "/register?plan=enterprise",
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 sm:py-24 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Simple Transparent Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Invest in Your Next Career Move.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            No hidden fees. Cancel anytime with a 14-day money-back guarantee.
          </p>

          {/* BILLING TOGGLE PILL */}
          <div className="pt-4 inline-flex items-center gap-3">
            <div className="inline-flex rounded-full border border-border bg-surface p-1 shadow-2xs">
              <button
                onClick={() => setAnnual(false)}
                aria-pressed={!annual}
                className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full transition-all leading-none ${
                  !annual ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                aria-pressed={annual}
                className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full transition-all leading-none ${
                  annual ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                Annual (Save 35%)
              </button>
            </div>
          </div>
        </div>

        {/* PRICING MATRIX GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col justify-between p-6 rounded-2xl ${
                plan.badge === "Most Popular"
                  ? "border-primary shadow-md ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6">
                  <Badge variant={plan.badge === "Most Popular" ? "primary" : "outline"} dot>
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-foreground">{plan.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {annual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">/month</span>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-border/60">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-foreground">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Link href={plan.href}>
                  <Button variant={plan.variant} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
