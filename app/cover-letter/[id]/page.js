import PageContent from "./page-content";

export const metadata = {
  title: "Edit Cover Letter – Resumate",
  description: "Edit your AI-generated cover letter.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({ params }) {
  const { id } = await params;
  return <PageContent id={id} />;
}
