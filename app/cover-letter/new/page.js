import PageContent from "./page-content";

export const metadata = {
  title: "Cover Letter Generator – Resumate",
  description: "Generate AI-powered cover letters tailored to your target job and resume.",
  keywords: [
    "cover letter generator",
    "AI cover letter",
    "cover letter builder",
    "resume cover letter",
    "job application letter",
  ],
  openGraph: {
    title: "Cover Letter Generator – Resumate",
    description: "Generate AI-powered cover letters tailored to your target job and resume.",
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
    title: "Cover Letter Generator – Resumate",
    description: "Generate AI-powered cover letters tailored to your target job.",
  },
  alternates: {
    canonical: "/cover-letter/new",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

