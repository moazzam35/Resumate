import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";

export const metadata = {
  title: "Reset Password – Resumate",
  description: "Set a new password for your Resumate account.",
  keywords: ["reset password", "new password", "resume builder account"],
  openGraph: {
    title: "Reset Password – Resumate",
    description: "Set a new password for your Resumate account.",
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
    title: "Reset Password – Resumate",
    description: "Set a new password for your Resumate account.",
    creator: "@airesumebuilder",
  },
  alternates: {
    canonical: "/reset-password",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
