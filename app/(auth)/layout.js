import AuthLayoutContent from "./layout-content";

export const metadata = {
  title: "Sign In – Resumate",
  description: "Sign in or create a Resumate account to start building ATS-optimized resumes.",
  keywords: ["sign in", "register", "resume builder login", "create account"],
  openGraph: {
    title: "Sign In – Resumate",
    description: "Sign in or create a Resumate account to start building ATS-optimized resumes.",
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
    title: "Sign In – Resumate",
    description: "Sign in or create a Resumate account to start building ATS-optimized resumes.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }) {
  return <AuthLayoutContent>{children}</AuthLayoutContent>;
}
