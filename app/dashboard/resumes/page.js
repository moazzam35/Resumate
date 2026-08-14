import PageContent from "./page-content";

export const metadata = {
  title: "My Resumes – Resumate",
  description: "Create, edit, and manage all your ATS-friendly resumes in one place with Resumate.",
  keywords: ["my resumes", "resume manager", "resume library"],
  openGraph: {
    title: "My Resumes – Resumate",
    description: "Create, edit, and manage all your ATS-friendly resumes in one place with Resumate.",
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
    title: "My Resumes – Resumate",
    description: "Create, edit, and manage all your ATS-friendly resumes in one place with Resumate.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/resumes",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

