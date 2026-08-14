import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import PageContent from "./page-content";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return notFound();

  const title = `${post.title} | Resumate`;
  const description = post.excerpt;

  return {
    title,
    description,
    keywords: [
      post.category.toLowerCase(),
      "resume tips",
      "career advice",
      "ATS resume",
      "job search",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      locale: "en_US",
      siteName: "Resumate",
      url: `/blog/${post.slug}`,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/twitter-image"],
      title,
      description,
      creator: "@airesumebuilder",
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Page({ params }) {
  return <PageContent params={params} />;
}
