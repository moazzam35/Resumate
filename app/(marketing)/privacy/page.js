export const metadata = {
  title: "Privacy Policy – Resumate",
  description:
    "How Resumate collects, uses, and protects your personal information. Read our privacy policy to understand your data rights.",
  keywords: [
    "Resumate privacy policy",
    "data protection",
    "resume builder privacy",
    "GDPR",
    "cookie policy",
  ],
  openGraph: {
    title: "Privacy Policy – Resumate",
    description:
      "How Resumate collects, uses, and protects your personal information.",
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
    title: "Privacy Policy – Resumate",
    description:
      "How Resumate collects, uses, and protects your personal information.",
  },
  alternates: {
    canonical: "/privacy",
  },
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "Account information such as your name, email address, and password (stored securely using industry-standard hashing).",
      "Resume and cover letter content you create, including personal details, work history, education, and skills.",
      "Usage data including pages visited, features used, and AI request history to improve our services.",
      "Device and browser information, IP addresses, and cookies for security and analytics purposes.",
    ],
  },
  {
    title: "How We Use Your Information",
    body: [
      "To provide, maintain, and improve our resume-building and AI features.",
      "To personalize your experience and recommend templates and content.",
      "To process AI requests that generate or improve resume content on your behalf.",
      "To secure your account, prevent fraud and abuse, and enforce our terms.",
      "To communicate important updates about our services or policies.",
    ],
  },
  {
    title: "AI and Content Processing",
    body: [
      "When you use our AI features, the resume content you provide is sent to our AI provider to generate suggestions and improvements. We do not use this content to train shared models in a way that can identify you.",
      "You retain full ownership of the content you create. We only process it to deliver the features you request.",
    ],
  },
  {
    title: "Data Storage and Retention",
    body: [
      "Your data is stored on secure servers with encryption at rest and in transit.",
      "We retain your data for as long as your account is active. If you delete your account, your personal data and created content are permanently removed.",
      "AI request histories are retained to provide usage analytics and audit trails, and may be cleared on account deletion.",
    ],
  },
  {
    title: "Sharing of Information",
    body: [
      "We do not sell your personal information.",
      "We share data only with service providers that help us operate the platform (hosting, AI processing, email delivery) under strict contractual obligations.",
      "We may disclose information when required by law, or to protect the rights, property, and safety of Resumate, our users, or the public.",
    ],
  },
  {
    title: "Cookies and Local Storage",
    body: [
      "We use cookies and browser local storage to keep you signed in and remember your preferences.",
      "Your session token is stored securely and is transmitted only over HTTPS.",
      "You can clear local storage and cookies at any time, though you may need to sign in again.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "You may access, correct, or delete your personal information at any time from your account settings.",
      "You may request a copy of the data we hold about you by contacting support.",
      "You may export your resume content and close your account at any time.",
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      "Resumate is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us personal information, please contact us and we will delete it.",
    ],
  },
  {
    title: "Contact Us",
    body: [
      "If you have questions about this Privacy Policy or how your data is handled, contact us at moazzampasha356@gmail.com.",
      "We may update this policy from time to time. We will notify you of material changes by posting the updated policy on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
            Legal
          </div>
          <h1 className="heading-display text-4xl font-semibold sm:text-5xl text-balance">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-balance">
            Your data belongs to you. Learn how Resumate collects, uses, and
            protects your personal information.
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
