import PageContent from "./page-content";

export const metadata = {
  title: "Payments – Resumate",
  description: "Manage subscriptions, payments, and billing records for all Resumate users.",
  keywords: ["payments", "subscriptions", "billing"],
  openGraph: {
    title: "Payments – Resumate",
    description: "Manage subscriptions, payments, and billing records for all Resumate users.",
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
    title: "Payments – Resumate",
    description: "Manage subscriptions, payments, and billing records for all Resumate users.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/admin/payments",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

