import PageContent from "./page-content";

export const metadata = {
  title: "Features – AI Resume Builder & ATS Checker | Resumate",
  description:
    "Discover Resumate's powerful AI-driven features: ATS optimization, cover letter generation, interview prep, resume templates, and job matching.",
  keywords: [
    "AI Resume Builder features",
    "ATS optimization",
    "cover letter generator",
    "interview preparation",
    "resume templates",
    "job matching",
    "AI career assistant",
  ],
  openGraph: {
    title: "Features – AI Resume Builder & ATS Checker | Resumate",
    description:
      "Discover Resumate's powerful AI-driven features: ATS optimization, cover letter generation, interview prep, resume templates, and job matching.",
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
    title: "Features – AI Resume Builder & ATS Checker | Resumate",
    description:
      "Discover Resumate's powerful AI-driven features: ATS optimization, cover letter generation, interview prep, resume templates, and job matching.",
  },
  alternates: {
    canonical: "/features",
  },
};

export default function Page() {
  return <PageContent />;
}

