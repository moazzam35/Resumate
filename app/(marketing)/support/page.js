import PageContent from "./page-content";

export const metadata = {
  title: "Help & Support | Resumate",
  description:
    "Need help with Resumate? Contact the developer for questions, problems, feedback, or assistance, or send us a message through the support form and we'll get back to you as soon as possible.",
  keywords: [
    "Resumate help",
    "Resumate support",
    "contact developer",
    "resume builder support",
    "help center",
  ],
  openGraph: {
    title: "Help & Support | Resumate",
    description:
      "Need help with Resumate? Contact the developer directly or send a message through our support form.",
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
    title: "Help & Support | Resumate",
    description:
      "Need help with Resumate? Contact the developer directly or send a message through our support form.",
  },
  alternates: {
    canonical: "/support",
  },
};

export default function Page() {
  return <PageContent />;
}
