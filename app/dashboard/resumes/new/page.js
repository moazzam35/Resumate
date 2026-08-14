import PageContent from "./page-content";

export const metadata = {
  title: "Create New Resume – Resumate",
  description: "Create a new ATS-friendly resume with professional templates and AI-powered suggestions.",
  keywords: ["create resume", "new resume", "resume templates"],
  openGraph: {
    title: "Create New Resume – Resumate",
    description: "Create a new ATS-friendly resume with professional templates and AI-powered suggestions.",
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
    title: "Create New Resume – Resumate",
    description: "Create a new ATS-friendly resume with professional templates and AI-powered suggestions.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/resumes/new",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

