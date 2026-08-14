import PageContent from "./page-content";

export const metadata = {
  title: "Reports – Resumate",
  description: "Generate and review platform reports on usage, performance, and user activity.",
  keywords: ["admin reports", "platform reports", "usage reports"],
  openGraph: {
    title: "Reports – Resumate",
    description: "Generate and review platform reports on usage, performance, and user activity.",
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
    title: "Reports – Resumate",
    description: "Generate and review platform reports on usage, performance, and user activity.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/admin/reports",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

