import PageContent from "./page-content";

export const metadata = {
  title: "ATS Resume Checker – Resumate",
  description: "Run a free ATS resume check to find keyword gaps, improve your score, and get hired faster with Resumate.",
  keywords: ["ATS resume checker", "resume keyword check", "ATS score"],
  openGraph: {
    title: "ATS Resume Checker – Resumate",
    description: "Run a free ATS resume check to find keyword gaps, improve your score, and get hired faster with Resumate.",
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
    title: "ATS Resume Checker – Resumate",
    description: "Run a free ATS resume check to find keyword gaps, improve your score, and get hired faster with Resumate.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/ats-checker",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

