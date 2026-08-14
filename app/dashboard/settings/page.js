import PageContent from "./page-content";

export const metadata = {
  title: "Settings – Resumate",
  description: "Manage your Resumate account settings, security options, and preferences.",
  keywords: ["account settings", "resume account settings", "security"],
  openGraph: {
    title: "Settings – Resumate",
    description: "Manage your Resumate account settings, security options, and preferences.",
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
    title: "Settings – Resumate",
    description: "Manage your Resumate account settings, security options, and preferences.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/settings",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

