import PageContent from "./page-content";

export const metadata = {
  title: "About Us – AI Resume Builder | Resumate",
  description:
    "Learn about Resumate, our mission to democratize career tools with AI-powered resume building, ATS checking, and interview preparation.",
  keywords: [
    "about Resumate",
    "AI resume builder",
    "ATS resume checker",
    "career tools",
    "resume optimization",
  ],
  openGraph: {
    title: "About Us – AI Resume Builder | Resumate",
    description:
      "Learn about Resumate, our mission to democratize career tools with AI-powered resume building, ATS checking, and interview preparation.",
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
    title: "About Us – AI Resume Builder | Resumate",
    description:
      "Learn about Resumate, our mission to democratize career tools with AI-powered resume building, ATS checking, and interview preparation.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function Page() {
  return <PageContent />;
}

