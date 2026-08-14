const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Resumate",
      description:
        "Create professional ATS-friendly resumes in minutes using AI. Improve your ATS score, generate tailored cover letters, optimize your resume, and prepare for interviews—all in one platform.",
      url: "https://resumate.ai",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://resumate.ai/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Resumate",
      description:
        "AI-powered resume builder and ATS resume checker that helps professionals create ATS-friendly resumes, generate cover letters, and prepare for interviews.",
      url: "https://resumate.ai",
      logo: "https://resumate.ai/icon-512.svg",
      sameAs: [
        "https://twitter.com/airesumebuilder",
        "https://github.com/airesumebuilder",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@resumate.com",
      },
    },
    {
      "@type": "WebApplication",
      name: "Resumate",
      description:
        "Create professional ATS-friendly resumes in minutes using AI. Improve your ATS score, generate tailored cover letters, optimize your resume, and prepare for interviews—all in one platform.",
      url: "https://resumate.ai",
      applicationCategory: "Business",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan available",
      },
      softwareApplicationCategory: "Resume Builder",
    },
    {
      "@type": "SoftwareApplication",
      name: "Resumate",
      description:
        "Create professional ATS-friendly resumes in minutes using AI. Improve your ATS score, generate tailored cover letters, optimize your resume, and prepare for interviews—all in one platform.",
      url: "https://resumate.ai",
      applicationCategory: "Business",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "29",
        priceCurrency: "USD",
        offerCount: "3",
      },
      features: [
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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}