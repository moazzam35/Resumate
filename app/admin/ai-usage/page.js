import PageContent from "./page-content";

export const metadata = {
  title: "AI Usage – Resumate",
  description: "Monitor AI usage, credits, and API consumption across your Resumate platform.",
  keywords: ["AI usage", "AI credits", "platform usage"],
  openGraph: {
    title: "AI Usage – Resumate",
    description: "Monitor AI usage, credits, and API consumption across your Resumate platform.",
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
    title: "AI Usage – Resumate",
    description: "Monitor AI usage, credits, and API consumption across your Resumate platform.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/admin/ai-usage",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

