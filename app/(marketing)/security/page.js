export const metadata = {
  title: "Security Overview – Resumate",
  description:
    "How Resumate protects your data with encryption, secure authentication, rate limiting, and proactive monitoring.",
  keywords: [
    "Resumate security",
    "resume builder security",
    "data encryption",
    "secure authentication",
  ],
  openGraph: {
    title: "Security Overview – Resumate",
    description:
      "How Resumate protects your data with encryption, secure authentication, rate limiting, and proactive monitoring.",
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
    title: "Security Overview – Resumate",
    description:
      "How Resumate protects your data with encryption, secure authentication, rate limiting, and proactive monitoring.",
  },
  alternates: {
    canonical: "/security",
  },
};

const items = [
  {
    title: "Encryption",
    icon: "Lock",
    body: [
      "All traffic to and from Resumate is encrypted in transit using TLS/HTTPS.",
      "Sensitive data is stored with encryption at rest on secure infrastructure.",
    ],
  },
  {
    title: "Secure Authentication",
    icon: "Key",
    body: [
      "Passwords are never stored in plain text. They are hashed using bcrypt with a per-user salt.",
      "Session tokens are short-lived access tokens paired with rotating refresh tokens.",
      "Refresh tokens are stored as salted hashes, so a database leak cannot be replayed as valid sessions.",
    ],
  },
  {
    title: "Rate Limiting and Abuse Prevention",
    icon: "Shield",
    body: [
      "Login, registration, AI, and document-processing endpoints are rate limited per IP and per account.",
      "Anonymous AI usage is capped per IP to prevent abuse of the platform's resources.",
      "Uploads are validated for type and size, and legacy document formats are rejected.",
    ],
  },
  {
    title: "Account Protection",
    icon: "UserCheck",
    body: [
      "Administrators can suspend accounts and force a password reset, which invalidates all active sessions.",
      "Password reset tokens expire quickly and are single-use.",
      "Suspicious activity is logged to an auditable trail.",
    ],
  },
  {
    title: "Data Isolation",
    icon: "Database",
    body: [
      "Resumes and content are scoped to the owning account. API routes verify ownership before serving any data.",
      "Role-based access control separates regular users from administrators.",
    ],
  },
  {
    title: "Monitoring and Response",
    icon: "Radar",
    body: [
      "Errors are logged and reviewed to detect anomalies.",
      "We follow responsible disclosure practices. If you discover a vulnerability, report it to moazzampasha356@gmail.com.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-sm border border-stamp/10 bg-stamp/5 px-4 py-1.5 text-sm font-medium text-stamp mb-6">
            Security
          </div>
          <h1 className="heading-display text-4xl font-semibold sm:text-5xl text-balance">
            Security Overview
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted text-balance">
            We take the protection of your data seriously. Here&apos;s how we
            keep the platform and your information safe.
          </p>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          {items.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-paper-alt/60 p-5">
              <h2 className="heading-display mb-3 text-lg font-semibold">
                {item.title}
              </h2>
              {item.body.map((paragraph) => (
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
