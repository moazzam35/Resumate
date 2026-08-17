import PageContent from "./page-content";

export const metadata = {
  title: "Create Account – Resumate",
  description: "Create a free Resumate account to start building ATS-optimized resumes and cover letters.",
  keywords: ["sign up", "register", "create account", "resume builder signup", "free resume builder"],
  openGraph: {
    title: "Create Account – Resumate",
    description: "Create a free Resumate account to start building ATS-optimized resumes and cover letters.",
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
    title: "Create Account – Resumate",
    description: "Create a free Resumate account to start building ATS-optimized resumes.",
  },
  alternates: {
    canonical: "/register",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

