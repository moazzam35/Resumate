import PageContent from "./page-content";

export const metadata = {
  title: "Resume Management – Resumate",
  description: "Review and manage user resumes across the Resumate platform.",
  keywords: ["resume management", "user resumes", "admin resumes"],
  openGraph: {
    title: "Resume Management – Resumate",
    description: "Review and manage user resumes across the Resumate platform.",
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
    title: "Resume Management – Resumate",
    description: "Review and manage user resumes across the Resumate platform.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/admin/resumes",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

