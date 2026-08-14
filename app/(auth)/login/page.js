import PageContent from "./page-content";

export const metadata = {
  title: "Sign In – Resumate",
  description: "Sign in to your Resumate account to access your resumes, ATS analytics, and more.",
  keywords: ["sign in", "login", "resume builder login", "ATS resume checker login"],
  openGraph: {
    title: "Sign In – Resumate",
    description: "Sign in to your Resumate account to access your resumes and ATS analytics.",
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
    title: "Sign In – Resumate",
    description: "Sign in to your Resumate account to access your resumes and ATS analytics.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

