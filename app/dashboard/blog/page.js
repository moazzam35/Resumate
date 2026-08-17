import PageContent from "./page-content";

export const metadata = {
  title: "Blog – Resume Tips & Career Advice | Resumate",
  description:
    "Resume tips, ATS guides, cover letter advice, and interview preparation articles to help you land more interviews.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <PageContent />;
}
