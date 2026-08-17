import PageContent from "./page-content";

export const metadata = {
  title: "User Management – Resumate",
  description: "Manage user accounts, roles, subscriptions, and account status for Resumate.",
  keywords: ["user management", "admin users", "account management"],
  openGraph: {
    title: "User Management – Resumate",
    description: "Manage user accounts, roles, subscriptions, and account status for Resumate.",
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
    title: "User Management – Resumate",
    description: "Manage user accounts, roles, subscriptions, and account status for Resumate.",
  },
  alternates: {
    canonical: "/admin/users",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}

