import PageContent from "./page-content";

export const metadata = {
  title: "Template Management – Resumate",
  description: "Manage, approve, and curate the resume templates available on Resumate.",
  keywords: ["template management", "resume template admin", "template approval"],
  openGraph: {
    title: "Template Management – Resumate",
    description: "Manage, approve, and curate the resume templates available on Resumate.",
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
    title: "Template Management – Resumate",
    description: "Manage, approve, and curate the resume templates available on Resumate.",
  },
  alternates: {
    canonical: "/admin/templates",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

