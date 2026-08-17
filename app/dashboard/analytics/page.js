import PageContent from "./page-content";

export const metadata = {
  title: "Resume Analytics – Resumate",
  description: "Track resume views, downloads, and performance insights across your Resumate account.",
  keywords: ["resume analytics", "resume performance", "ATS insights"],
  openGraph: {
    title: "Resume Analytics – Resumate",
    description: "Track resume views, downloads, and performance insights across your Resumate account.",
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
    title: "Resume Analytics – Resumate",
    description: "Track resume views, downloads, and performance insights across your Resumate account.",
  },
  alternates: {
    canonical: "/dashboard/analytics",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

