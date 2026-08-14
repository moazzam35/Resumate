import PageContent from "./page-content";

export const metadata = {
  title: "Create New Resume – Resumate",
  description: "Create a new ATS-optimized resume using AI-powered assistance and professional templates.",
  keywords: ["create resume", "new resume", "AI resume builder", "resume creator"],
  openGraph: {
    title: "Create New Resume – Resumate",
    description: "Create a new ATS-optimized resume using AI-powered assistance and professional templates.",
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
    description: "Create a new ATS-optimized resume using AI-powered assistance.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/resume/new",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

