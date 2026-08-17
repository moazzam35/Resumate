import PageContent from "./page-content";

export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    title: "Resume Version History – Resumate",
    description: "Track changes to your resume and restore previous versions anytime.",
    keywords: ["resume history", "version control resume", "restore resume"],
    openGraph: {
      title: "Resume Version History – Resumate",
      description: "Track changes to your resume and restore previous versions anytime.",
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
      title: "Resume Version History – Resumate",
      description: "Track changes to your resume and restore previous versions anytime.",
    },
    alternates: {
      canonical: `/dashboard/resumes/${id}/history`,
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
