"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/constants";

const CTA_CONFIG = {
  free: { label: "Get Started Free", href: "/register", variant: "outline" },
  pro: { label: "Upgrade to Pro", href: "/register?plan=pro", variant: "primary", badge: "Most Popular" },
  enterprise: { label: "Get Enterprise Access", href: "/register?plan=enterprise", variant: "outline", badge: "Enterprise" },
};

export default function PricingSection() {
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
        </div>

        {/* PRICING MATRIX GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const cta = CTA_CONFIG[plan.id] || CTA_CONFIG.free;
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between p-6 rounded-2xl ${
                  cta.badge === "Most Popular"
                    ? "border-primary shadow-md ring-1 ring-primary/20"
                    : "border-border"
                }`}
              >
                {cta.badge && (
                  <div className="absolute -top-3 right-6">
                    <Badge variant={cta.badge === "Most Popular" ? "primary" : "outline"} dot>
                      {cta.badge}
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
                      ${plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {plan.price === 0 ? "forever" : "/month"}
                    </span>
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
                  <Link href={cta.href}>
                    <Button variant={cta.variant} className="w-full">
                      {cta.label}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
