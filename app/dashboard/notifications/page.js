import PageContent from "./page-content";

export const metadata = {
  title: "Notifications – Resumate",
  description: "Manage your Resumate notifications, alerts, and activity updates in one place.",
  keywords: ["resume notifications", "account alerts"],
  openGraph: {
    title: "Notifications – Resumate",
    description: "Manage your Resumate notifications, alerts, and activity updates in one place.",
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
    title: "Notifications – Resumate",
    description: "Manage your Resumate notifications, alerts, and activity updates in one place.",
  },
  alternates: {
    canonical: "/dashboard/notifications",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

