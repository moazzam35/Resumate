'use client';

import { useEffect } from 'react';
import { SITE_CONFIG } from "@/lib/constants";

const baseUrl = SITE_CONFIG.url.replace(/\/$/, "");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      description:
        "Create professional ATS-friendly resumes in minutes using AI. Improve your ATS score, generate tailored cover letters, optimize your resume, and prepare for interviews—all in one platform.",
      url: baseUrl,
    },
    {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      description:
        "AI-powered resume builder and ATS resume checker that helps professionals create ATS-friendly resumes, generate cover letters, and prepare for interviews.",
      url: baseUrl,
      logo: `${baseUrl}/icon-512.svg`,
      sameAs: Object.values(SITE_CONFIG.links),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "moazzampasha356@gmail.com",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_CONFIG.name,
      description:
        "Create professional ATS-friendly resumes in minutes using AI. Improve your ATS score, generate tailored cover letters, optimize your resume, and prepare for interviews—all in one platform.",
      url: baseUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "29",
        priceCurrency: "USD",
        offerCount: "3",
      },
      featureList: [
        "AI Resume Builder",
        "ATS Resume Checker",
        "Cover Letter Generator",
        "Interview Preparation",
        "Resume Templates",
        "Resume Optimization",
        "Job Matching",
      ],
    },
  ],
};

export default function StructuredData() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data';
    script.textContent = JSON.stringify(structuredData).replace(/</g, "\\u003c");
    document.head.appendChild(script);
    return () => {
      document.getElementById('structured-data')?.remove();
    };
  }, []);

  return null;
}
