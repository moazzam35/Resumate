import PageContent from "./page-content";

export const metadata = {
  title: "Admin Analytics – Resumate",
  description: "View platform-wide analytics, user growth, and engagement trends for Resumate.",
  keywords: ["admin analytics", "platform analytics", "user analytics"],
  openGraph: {
    title: "Admin Analytics – Resumate",
    description: "View platform-wide analytics, user growth, and engagement trends for Resumate.",
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
    title: "Admin Analytics – Resumate",
    description: "View platform-wide analytics, user growth, and engagement trends for Resumate.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/admin/analytics",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

