import PageContent from "./page-content";

export const metadata = {
  title: "Profile – Resumate",
  description: "Manage your Resumate profile, personal details, and account information.",
  keywords: ["profile settings", "account profile", "resume account"],
  openGraph: {
    title: "Profile – Resumate",
    description: "Manage your Resumate profile, personal details, and account information.",
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
    title: "Profile – Resumate",
    description: "Manage your Resumate profile, personal details, and account information.",
  },
  alternates: {
    canonical: "/dashboard/profile",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

