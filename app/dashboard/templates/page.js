import PageContent from "./page-content";

export const metadata = {
  title: "Resume Templates – Resumate",
  description: "Browse professional ATS-friendly resume templates and pick the perfect design for your job search.",
  keywords: ["resume templates", "ATS friendly templates", "resume designs"],
  openGraph: {
    title: "Resume Templates – Resumate",
    description: "Browse professional ATS-friendly resume templates and pick the perfect design for your job search.",
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
    title: "Resume Templates – Resumate",
    description: "Browse professional ATS-friendly resume templates and pick the perfect design for your job search.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/templates",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

