import PageContent from "./page-content";

export const metadata = {
  title: "Admin Settings – Resumate",
  description: "Configure platform settings, features, and system preferences for Resumate.",
  keywords: ["admin settings", "platform configuration", "system settings"],
  openGraph: {
    title: "Admin Settings – Resumate",
    description: "Configure platform settings, features, and system preferences for Resumate.",
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
    title: "Admin Settings – Resumate",
    description: "Configure platform settings, features, and system preferences for Resumate.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/admin/settings",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

