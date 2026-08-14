import PageContent from "./page-content";

export const metadata = {
  title: "Resume Templates – ATS-Friendly Designs | Resumate",
  description:
    "Browse professionally designed, ATS-friendly resume templates. Choose from modern, minimal, corporate, and creative layouts to build your perfect resume.",
  keywords: [
    "resume templates",
    "ATS-friendly templates",
    "resume designs",
    "professional resume templates",
    "AI resume templates",
    "job resume templates",
  ],
  openGraph: {
    title: "Resume Templates – ATS-Friendly Designs | Resumate",
    description:
      "Browse professionally designed, ATS-friendly resume templates. Choose from modern, minimal, corporate, and creative layouts.",
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
    title: "Resume Templates – ATS-Friendly Designs | Resumate",
    description:
      "Browse professionally designed, ATS-friendly resume templates. Choose from modern, minimal, corporate, and creative layouts.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/templates",
  },
};

export default function Page() {
  return <PageContent />;
}

