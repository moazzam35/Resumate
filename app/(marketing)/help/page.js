import Link from "next/link";
import {
  HelpCircle,
  Mail,
  Shield,
  BookOpen,
  LayoutTemplate,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FAQ_ITEMS } from "@/lib/constants";

export const metadata = {
  title: "Help Center – Support & Resources | Resumate",
  description:
    "Get help with Resumate. Find answers in our FAQ, contact our support team, browse career guides, and learn about plans, security, and templates.",
  keywords: [
    "Resumate help",
    "resume builder support",
    "help center",
    "resume builder FAQ",
    "contact support",
    "career guides",
  ],
  openGraph: {
    title: "Help Center – Support & Resources | Resumate",
    description:
      "Get help with Resumate. Find answers in our FAQ, contact our support team, and browse career guides.",
    type: "website",
    locale: "en_US",
    siteName: "Resumate",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Resumate AI Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/twitter-image"],
    title: "Help Center – Support & Resources | Resumate",
    description:
      "Get help with Resumate. Find answers in our FAQ, contact our support team, and browse career guides.",
  },
  alternates: {
    canonical: "/help",
  },
};

const resources = [
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Quick answers to the most common questions about Resumate.",
    href: "/faq",
  },
  {
    icon: Mail,
    title: "Contact Support",
    description: "Have a question or feedback? Talk directly to our team.",
    href: "/contact",
  },
  {
    icon: BookOpen,
    title: "Career Blog",
    description: "Resume tips, ATS guides, and interview preparation advice.",
    href: "/blog",
  },
  {
    icon: LayoutTemplate,
    title: "Templates",
    description: "Browse our ATS-friendly resume templates and previews.",
    href: "/#template",
  },
  {
    icon: CreditCard,
    title: "Plans & Billing",
    description: "Compare plans, check limits, and learn about upgrades.",
    href: "/pricing",
  },
  {
    icon: Shield,
    title: "Security",
    description: "How Resumate protects your data and keeps your account safe.",
    href: "/security",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
            Help Center
          </div>
          <h1 className="heading-display text-4xl font-semibold sm:text-5xl text-balance">
            How can we help?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-balance">
            Find quick answers, browse resources, or reach out to our support
            team. We&apos;re here to help you land your dream job.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link key={resource.href} href={resource.href} className="group">
                  <Card hover className="h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex rounded-md bg-stamp/10 p-2.5">
                        <Icon className="h-5 w-5 text-stamp" />
                      </div>
                      <h2 className="heading-display mb-1.5 text-base font-semibold group-hover:text-stamp transition-colors">
                        {resource.title}
                      </h2>
                      <p className="text-sm text-muted leading-relaxed">
                        {resource.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-stamp">
                        Explore
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl text-balance">
              Quick answers
            </h2>
            <p className="mt-3 text-muted">
              The most common questions we hear from new users.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.slice(0, 4).map((item, i) => (
              <AccordionItem key={i} value={`help-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted leading-relaxed">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-10 text-center">
            <p className="mb-4 text-sm text-muted">Still need a hand?</p>
            <Link href="/contact">
              <Button variant="gradient" rightIcon={ArrowRight}>
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
