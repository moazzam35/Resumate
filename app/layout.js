import { ThemeProvider } from "@/components/theme-provider";
import { AuthInitializer } from "@/components/auth-initializer";
import { Toast } from "@/components/toast";
import Preloader from "@/components/shared/preloader";
import StructuredData from "@/components/seo/structured-data";
import { Fraunces, IBM_Plex_Mono, Public_Sans, Space_Grotesk } from "next/font/google";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const fontSans = Public_Sans({
  subsets: ["latin"],
  variable: "--next-font-sans",
});

const fontDisplay = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--next-font-display",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--next-font-mono",
});

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--next-font-space-grotesk",
});

export const metadata = {
  title: {
    default: "Resumate – AI Resume Builder & ATS Resume Checker",
  },
  description:
    "Create professional ATS-friendly resumes in minutes using AI. Improve your ATS score, generate tailored cover letters, optimize your resume, and prepare for interviews—all in one platform.",
  keywords: [
    "AI Resume Builder",
    "Resume Builder",
    "ATS Resume Checker",
    "ATS Resume Score",
    "Resume Optimization",
    "Cover Letter Generator",
    "Interview Preparation",
    "Resume Templates",
    "Professional Resume",
    "CV Builder",
    "AI Career Assistant",
    "Resume Analyzer",
    "Job Application Tools",
    "Resume Creator",
    "Resume Generator",
  ],
  authors: [{ name: "Resumate Team" }],
  applicationName: "Resumate",
  category: "Business",
  creator: "Resumate",
  publisher: "Resumate",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Resumate – AI Resume Builder",
    description:
      "Build ATS-friendly resumes with AI, improve your resume score, generate cover letters, and prepare for interviews.",
    type: "website",
    locale: "en_US",
    siteName: "Resumate",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Resumate – AI Resume Builder & ATS Resume Checker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumate – AI Resume Builder",
    description:
      "Build ATS-friendly resumes with AI, improve your resume score, generate cover letters, and prepare for interviews.",
    images: ["/twitter-image"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
    other: [
      {
        rel: "icon",
        type: "image/svg+xml",
        sizes: "192x192",
        url: "/icon-192.svg",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        sizes: "512x512",
        url: "/icon-512.svg",
      },
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#2E4374",
      },
    ],
  },
  metadataBase: new URL(SITE_CONFIG.url),
  charset: "utf-8",
  generator: "Resumate",
};

export const viewport = {
  themeColor: "#2E4374",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
      </head>
      <body
        className={`min-h-screen bg-paper text-ink antialiased ${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} ${fontSpaceGrotesk.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInitializer>
            <Preloader />
            {children}
            <Toast />
          </AuthInitializer>
        </ThemeProvider>
        <StructuredData />
      </body>
    </html>
  );
}
