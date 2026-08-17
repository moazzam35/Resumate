import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/constants";

export const metadata = {
  title: "FAQ – AI Resume Builder & ATS Checker | Resumate",
  description:
    "Frequently asked questions about Resumate. Find answers to common questions about our features, pricing, and more.",
  keywords: [
    "Resumate FAQ",
    "AI resume builder FAQ",
    "ATS checker FAQ",
    "resume builder questions",
    "cover letter generator FAQ",
  ],
  openGraph: {
    title: "FAQ – AI Resume Builder & ATS Checker | Resumate",
    description:
      "Frequently asked questions about Resumate. Find answers to common questions about our features, pricing, and more.",
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
    title: "FAQ – AI Resume Builder & ATS Checker | Resumate",
    description:
      "Frequently asked questions about Resumate. Find answers to common questions about our features, pricing, and more.",
  },
  alternates: {
    canonical: "/faq",
  },
};

const generalQuestions = [
  {
    question: "What is Resumate?",
    answer:
      "Resumate is an intelligent resume creation platform that uses artificial intelligence to help you build professional, ATS-optimized resumes. Our AI analyzes your input and provides suggestions for content, formatting, and optimization to help you land more interviews.",
  },
  {
    question: "Is Resumate free to use?",
    answer:
      "Yes! Our free plan includes 3 resumes, 3 templates, basic AI suggestions, and PDF export. For 10 resumes, all templates, and advanced AI features, check out our Pro plan at just $12/month.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "You can browse templates and explore features without an account. To start building and saving resumes, you'll need to create a free account. The process takes less than 30 seconds.",
  },
  {
    question: "Can I use Resumate on mobile?",
    answer:
      "Absolutely! Resumate is fully responsive and works great on mobile devices. You can create, edit, and export your resume from your phone or tablet.",
  },
];

const featureQuestions = FAQ_ITEMS;

const accountQuestions = [
  {
    question: "How do I delete my account?",
    answer:
      "You can delete your account from your account settings page. Please note that this action is irreversible and all your data will be permanently deleted.",
  },
  {
    question: "Can I change my email address?",
    answer:
      "Yes, you can update your email address from your profile settings. You'll need to verify your new email address to complete the change.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Click the 'Forgot password?' link on the login page. You'll receive an email with a link to reset your password. The link expires after 24 hours.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
            FAQ
          </div>
          <h1 className="heading-display text-4xl font-semibold sm:text-5xl text-balance">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-balance">
            Everything you need to know about Resumate. Can&apos;t find the
            answer you&apos;re looking for? Contact our support team.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-10">
          <div>
            <h2 className="heading-display mb-4 text-lg font-semibold">General</h2>
            <Accordion type="single" collapsible className="w-full">
              {generalQuestions.map((item, i) => (
                <AccordionItem key={i} value={`general-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted leading-relaxed">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div>
            <h2 className="heading-display mb-4 text-lg font-semibold">Features</h2>
            <Accordion type="single" collapsible className="w-full">
              {featureQuestions.map((item, i) => (
                <AccordionItem key={i} value={`feature-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted leading-relaxed">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div>
            <h2 className="heading-display mb-4 text-lg font-semibold">Account & Billing</h2>
            <Accordion type="single" collapsible className="w-full">
              {accountQuestions.map((item, i) => (
                <AccordionItem key={i} value={`account-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted leading-relaxed">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
