import NotFoundContent from "./not-found-content";

export const metadata = {
  title: "Page Not Found – Resumate",
  description: "The page you are looking for does not exist or has been moved.",
  keywords: ["404", "page not found", "missing page"],
  openGraph: {
    title: "Page Not Found – Resumate",
    description: "The page you are looking for does not exist or has been moved.",
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
    title: "Page Not Found – Resumate",
    description: "The page you are looking for does not exist or has been moved.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/404",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <NotFoundContent />;
}
