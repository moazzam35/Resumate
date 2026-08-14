import PageContent from "./page-content";

export const metadata = {
  title: "Cover Letters – Resumate",
  description: "Create, edit, and manage professional AI-generated cover letters that match your resume.",
  keywords: ["cover letter builder", "AI cover letter", "cover letter templates"],
  openGraph: {
    title: "Cover Letters – Resumate",
    description: "Create, edit, and manage professional AI-generated cover letters that match your resume.",
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
    title: "Cover Letters – Resumate",
    description: "Create, edit, and manage professional AI-generated cover letters that match your resume.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/cover-letters",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

