import PageContent from "./page-content";

export const metadata = {
  title: "Job Match – Resumate",
  description: "Compare your resume against job descriptions to find your best job matches and improve your applications.",
  keywords: ["job match", "resume match score", "job description match"],
  openGraph: {
    title: "Job Match – Resumate",
    description: "Compare your resume against job descriptions to find your best job matches and improve your applications.",
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
    title: "Job Match – Resumate",
    description: "Compare your resume against job descriptions to find your best job matches and improve your applications.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/job-match",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

