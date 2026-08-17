import PageContent from "./page-content";

export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    title: "User Details – Resumate",
    description: "View and manage an individual user account, subscription, and activity on Resumate.",
    keywords: ["user details", "user account", "admin user"],
    openGraph: {
      title: "User Details – Resumate",
      description: "View and manage an individual user account, subscription, and activity on Resumate.",
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
      title: "User Details – Resumate",
      description: "View and manage an individual user account, subscription, and activity on Resumate.",
    },
    alternates: {
      canonical: `/admin/users/${id}`,
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
