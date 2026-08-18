export const metadata = {
  title: "Terms of Service – Resumate",
  description:
    "The terms and conditions governing your use of the Resumate resume-building platform.",
  keywords: [
    "Resumate terms of service",
    "resume builder terms",
    "AI resume terms and conditions",
  ],
  openGraph: {
    title: "Terms of Service – Resumate",
    description:
      "The terms and conditions governing your use of the Resumate resume-building platform.",
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
    title: "Terms of Service – Resumate",
    description:
      "The terms and conditions governing your use of the Resumate resume-building platform.",
  },
  alternates: {
    canonical: "/terms",
  },
};

const sections = [
  {
    title: "Acceptance of Terms",
    body: [
      "By accessing or using Resumate, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.",
    ],
  },
  {
    title: "Your Account",
    body: [
      "You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.",
      "You must provide accurate information when creating an account and keep it up to date.",
      "You must notify us immediately of any unauthorized use of your account.",
    ],
  },
  {
    title: "Acceptable Use",
    body: [
      "You agree not to misuse the platform, including attempting to gain unauthorized access, interfering with service availability, or using the service for unlawful purposes.",
      "You may not attempt to reverse engineer, scrape, or copy substantial portions of the platform.",
      "You may not use automated tools or scripts to abuse AI features or bypass rate limits.",
    ],
  },
  {
    title: "AI-Generated Content",
    body: [
      "Resumate's AI features provide suggestions and are provided 'as is' without warranties of accuracy.",
      "You are responsible for reviewing and verifying all content in your resumes and cover letters before using them.",
      "You retain ownership of your content. We do not claim ownership of the resumes, cover letters, or AI-generated suggestions you create.",
    ],
  },
  {
    title: "Subscriptions and Payments",
    body: [
      "Premium plans are billed on a recurring basis until cancelled. You can cancel at any time from your account settings.",
      "Refunds are handled in accordance with applicable law. Contact support for billing inquiries.",
      "We may change pricing with reasonable notice. Continued use after a pricing change constitutes acceptance.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "The Resumate platform, including its design, templates, and code, is protected by copyright and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the platform for personal, non-commercial resume creation.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "The platform is provided 'as is' and 'as available' without warranties of any kind, express or implied.",
      "To the maximum extent permitted by law, Resumate shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the platform.",
      "Nothing in these terms limits liability that cannot be limited under applicable law.",
    ],
  },
  {
    title: "Account Termination",
    body: [
      "We may suspend or terminate accounts that violate these terms, abuse the service, or pose a security risk.",
      "You may delete your account at any time, which permanently removes your data from our systems.",
    ],
  },
  {
    title: "Changes to These Terms",
    body: [
      "We may update these terms from time to time. Material changes will be posted on this page. Continued use of the platform after changes take effect constitutes acceptance.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For questions about these Terms of Service, contact us at moazzampasha356@gmail.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
            Legal
          </div>
          <h1 className="heading-display text-4xl font-semibold sm:text-5xl text-balance">
            Terms of Service
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-balance">
            The rules and guidelines for using the Resumate platform.
          </p>
          <p className="mt-4 text-xs text-muted">Last updated: January 2026</p>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="heading-display mb-3 text-lg font-semibold">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mb-2 text-sm text-muted leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
