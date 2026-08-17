import PageContent from "./page-content";

export const metadata = {
  title: "Contact Us – Resumate",
  description:
    "Get in touch with the Resumate team. Contact us for support, feedback, or partnership inquiries.",
  keywords: ["contact Resumate", "support", "resume builder contact"],
  openGraph: {
    title: "Contact Us – Resumate",
    description:
      "Get in touch with the Resumate team. Contact us for support, feedback, or partnership inquiries.",
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
    title: "Contact Us – Resumate",
    description:
      "Get in touch with the Resumate team. Contact us for support, feedback, or partnership inquiries.",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function Page() {
  return <PageContent />;
}

