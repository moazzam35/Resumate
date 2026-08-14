import PageContent from "./page-content";

export const metadata = {
  title: "Audit Log – Resumate",
  description: "Review security and administrative actions recorded in the Resumate audit log.",
  keywords: ["audit log", "security audit", "admin actions"],
  openGraph: {
    title: "Audit Log – Resumate",
    description: "Review security and administrative actions recorded in the Resumate audit log.",
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
    title: "Audit Log – Resumate",
    description: "Review security and administrative actions recorded in the Resumate audit log.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/admin/audit-log",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

