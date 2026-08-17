import PageContent from "./page-content";

export const metadata = {
  title: "Dashboard – Resumate",
  description:
    "Manage your resumes, track ATS scores, and monitor your job application progress with the Resumate dashboard.",
  keywords: ["resume dashboard", "ATS score tracker", "resume management"],
  openGraph: {
    title: "Dashboard – Resumate",
    description:
      "Manage your resumes, track ATS scores, and monitor your job application progress.",
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
    title: "Dashboard – Resumate",
    description:
      "Manage your resumes, track ATS scores, and monitor your job application progress.",
  },
  alternates: {
    canonical: "/dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

