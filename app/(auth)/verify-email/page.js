import { Suspense } from "react";
import { VerifyEmailContent } from "@/components/features/auth/verify-email-content";

export const metadata = {
  title: "Verify Email – Resumate",
  description: "Verify your Resumate account email address to activate your account.",
  keywords: ["verify email", "email verification", "resume builder account"],
  openGraph: {
    title: "Verify Email – Resumate",
    description: "Verify your Resumate account email address to activate your account.",
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
    title: "Verify Email – Resumate",
    description: "Verify your Resumate account email address to activate your account.",
  },
  alternates: {
    canonical: "/verify-email",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
