import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PricingSection from "@/components/features/landing/pricing";
import CTASection from "@/components/features/landing/cta";

export const metadata = {
  title: "Pricing – AI Resume Builder Plans | Resumate",
  description:
    "Simple, transparent pricing for Resumate. Start free with 3 resumes and 7 AI actions per month, or upgrade to Pro or Enterprise for unlimited potential.",
  keywords: [
    "Resumate pricing",
    "AI resume builder cost",
    "resume builder plans",
    "Pro resume plan",
    "Enterprise resume builder",
    "free resume builder",
  ],
  openGraph: {
    title: "Pricing – AI Resume Builder Plans | Resumate",
    description:
      "Simple, transparent pricing for Resumate. Start free or upgrade to Pro or Enterprise for unlimited potential.",
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
    title: "Pricing – AI Resume Builder Plans | Resumate",
    description:
      "Simple, transparent pricing for Resumate. Start free or upgrade to Pro or Enterprise for unlimited potential.",
  },
  alternates: {
    canonical: "/pricing",
  },
};

const pricingQuestions = [
  {
    question: "What plans does Resumate offer?",
    answer:
      "Resumate has three plans. Free ($0) includes 3 resumes, 3 templates, 7 AI actions per month, PDF export, and a basic ATS score. Pro ($12/month) includes 10 resumes, all templates, 20 AI actions per month, the cover letter generator, version history, custom colors, and priority support. Enterprise ($29/month) adds everything in Pro plus team collaboration, API access, custom branding, dedicated support, analytics, and SSO.",
  },
  {
    question: "Is there really a free plan?",
    answer:
      "Yes. The Free plan never requires a card. Start with 3 resumes and 7 AI actions per month, and upgrade whenever you need more room to grow.",
  },
  {
    question: "How do AI actions work?",
    answer:
      "Each AI-powered request — generating a professional summary, improving experience bullet points, or running ATS suggestions — uses one AI action. Your dashboard shows how many actions you have left for the month.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. You can upgrade or change your plan at any time from your account settings. Your resumes, cover letters, and content are always preserved.",
  },
  {
    question: "What happens when I hit my plan limits?",
    answer:
      "Once you reach your resume or AI action limits on a plan, you can upgrade to Pro or Enterprise to unlock higher limits and keep going without losing any work.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Refund eligibility follows the policy described in our Terms of Service. For any billing or refund question, contact moazzampasha356@gmail.com.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
            Pricing Plans
          </div>
          <h1 className="heading-display text-4xl font-semibold sm:text-5xl text-balance">
            Choose the plan that fits your{" "}
            <span className="gradient-text">job search</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-balance">
            Start free, upgrade when you&apos;re ready. No hidden fees, and you
            can change your plan at any time.
          </p>
        </div>
      </section>

      <PricingSection />

      <section className="border-t border-border/50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <h2 className="heading-display text-3xl font-semibold sm:text-4xl text-balance">
              Pricing questions
            </h2>
            <p className="mt-3 text-muted">
              Everything you need to know about plans, limits, and billing.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {pricingQuestions.map((item, i) => (
              <AccordionItem key={i} value={`pricing-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted leading-relaxed">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
