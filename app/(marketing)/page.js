import dynamic from "next/dynamic";
import HeroSection from "@/components/features/landing/hero";

const LiveDemoSection = dynamic(() => import("@/components/features/landing/live-demo"));
const FeaturesSection = dynamic(() => import("@/components/features/landing/features"));
const AIFeaturesSection = dynamic(() => import("@/components/features/landing/ai-features"));
const TemplatesSection = dynamic(() => import("@/components/features/landing/templates"));
const TestimonialsSection = dynamic(() => import("@/components/features/landing/testimonials"));
const PricingSection = dynamic(() => import("@/components/features/landing/pricing"));
const FAQSection = dynamic(() => import("@/components/features/landing/faq"));
const CTASection = dynamic(() => import("@/components/features/landing/cta"));

export const metadata = {
  title: "Resumate – AI Resume Builder & ATS Resume Checker",
  description:
    "Create professional ATS-friendly resumes in minutes using AI. Improve your ATS score, generate tailored cover letters, optimize your resume, and prepare for interviews—all in one platform.",
  keywords: [
    "AI Resume Builder",
    "Resume Builder",
    "ATS Resume Checker",
    "ATS Resume Score",
    "Resume Optimization",
    "Cover Letter Generator",
    "Interview Preparation",
    "Resume Templates",
    "Professional Resume",
    "CV Builder",
    "AI Career Assistant",
    "Resume Analyzer",
    "Job Application Tools",
    "Resume Creator",
    "Resume Generator",
  ],
  openGraph: {
    title: "Resumate – AI Resume Builder",
    description:
      "Build ATS-friendly resumes with AI, improve your resume score, generate cover letters, and prepare for interviews.",
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
    title: "Resumate – AI Resume Builder",
    description:
      "Build ATS-friendly resumes with AI, improve your resume score, generate cover letters, and prepare for interviews.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <LiveDemoSection />
      <FeaturesSection />
      <AIFeaturesSection />
      <TemplatesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
