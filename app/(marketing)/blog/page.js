import PageContent from "./page-content";

export const metadata = {
  title: "Blog – Career Tips & Resume Advice | Resumate",
  description:
    "Expert career advice, resume tips, and interview preparation guides from Resumate. Learn how to build ATS-friendly resumes and land your dream job.",
  keywords: [
    "resume blog",
    "career advice",
    "resume tips",
    "ATS resume guide",
    "interview preparation",
    "cover letter tips",
    "job search advice",
  ],
  openGraph: {
    title: "Blog – Career Tips & Resume Advice | Resumate",
    description:
      "Expert career advice, resume tips, and interview preparation guides from Resumate.",
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
    title: "Blog – Career Tips & Resume Advice | Resumate",
    description:
      "Expert career advice, resume tips, and interview preparation guides from Resumate.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function Page({ params }) {
  return <PageContent params={params} />;
}

