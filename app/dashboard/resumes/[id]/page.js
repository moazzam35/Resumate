import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: "Resume Editor – Resumate",
    description: "Edit and optimize your ATS-friendly resume.",
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  redirect(`/resume/${id}`);
}
