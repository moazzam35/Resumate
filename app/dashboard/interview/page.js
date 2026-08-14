import PageContent from "./page-content";

export const metadata = {
  title: "Interview Preparation – Resumate",
  description: "Prepare for job interviews with AI-powered practice questions, mock interviews, and instant feedback.",
  keywords: ["interview preparation", "AI mock interview", "job interview practice"],
  openGraph: {
    title: "Interview Preparation – Resumate",
    description: "Prepare for job interviews with AI-powered practice questions, mock interviews, and instant feedback.",
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
    title: "Interview Preparation – Resumate",
    description: "Prepare for job interviews with AI-powered practice questions, mock interviews, and instant feedback.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/dashboard/interview",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

