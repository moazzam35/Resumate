import PageContent from "./page-content";

export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    title: "Resume Editor – Resumate",
    description: "Edit and optimize your ATS-friendly resume with AI-powered assistance.",
    keywords: ["resume editor", "edit resume", "ATS resume", "resume builder"],
    openGraph: {
      title: "Resume Editor – Resumate",
      description: "Edit and optimize your ATS-friendly resume with AI-powered assistance.",
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
      title: "Resume Editor – Resumate",
      description: "Edit and optimize your ATS-friendly resume with AI-powered assistance.",
    },
    alternates: {
      canonical: `/resume/${id}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Page() {
  return <PageContent />;
}
