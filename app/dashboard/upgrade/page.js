import PageContent from "./page-content";

export const metadata = {
  title: "Upgrade to Pro – Resumate",
  description: "Upgrade your Resumate plan to unlock premium templates, unlimited AI features, and more.",
  keywords: ["upgrade pro", "premium resume", "resumate pricing"],
  openGraph: {
    title: "Upgrade to Pro – Resumate",
    description: "Upgrade your Resumate plan to unlock premium templates, unlimited AI features, and more.",
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
    title: "Upgrade to Pro – Resumate",
    description: "Upgrade your Resumate plan to unlock premium templates, unlimited AI features, and more.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/upgrade",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

