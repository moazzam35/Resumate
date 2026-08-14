import PageContent from "./page-content";

export const metadata = {
  title: "Admin Dashboard – Resumate",
  description:
    "Administrative dashboard for managing users, resumes, and platform analytics.",
  keywords: ["admin dashboard", "platform management", "resume analytics"],
  openGraph: {
    title: "Admin Dashboard – Resumate",
    description: "Administrative dashboard for managing users, resumes, and platform analytics.",
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
    title: "Admin Dashboard – Resumate",
    description: "Administrative dashboard for managing users, resumes, and platform analytics.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

