import ResultPageContent from "./page-content";

export const metadata = {
  title: "ATS Result – Resumate",
  description: "View your ATS compatibility score, keyword analysis, and improvement recommendations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({ params }) {
  const { id } = await params;
  return <ResultPageContent id={id} />;
}
