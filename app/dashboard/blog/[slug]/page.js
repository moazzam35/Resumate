import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import PageContent from "./page-content";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return notFound();

  return {
    title: `${post.title} | Resumate`,
    description: post.excerpt,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/dashboard/blog/${post.slug}`,
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return <PageContent slug={slug} />;
}
