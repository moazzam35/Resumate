import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password – Resumate",
  description: "Reset your Resumate account password to regain access.",
  keywords: ["forgot password", "reset password", "resume builder login"],
  openGraph: {
    title: "Forgot Password – Resumate",
    description: "Reset your Resumate account password to regain access.",
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
    title: "Forgot Password – Resumate",
    description: "Reset your Resumate account password to regain access.",
  },
  alternates: {
    canonical: "/forgot-password",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
