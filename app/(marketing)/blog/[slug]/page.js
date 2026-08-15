import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";
import { SITE_CONFIG } from "@/lib/constants";
import PageContent from "./page-content";

const BASE_URL = SITE_CONFIG.url.replace(/\/$/, "");

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return notFound();

  const title = `${post.title} | Resumate`;
  const description = post.excerpt;
  const publishedTime = post.date ? new Date(post.date).toISOString() : undefined;

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
      url: `${BASE_URL}/blog/${post.slug}`,
      authors: [post.author],
      publishedTime,
    },
    twitter: {
      card: "summary_large_image",
      images: ["/twitter-image"],
      title,
      description,
      creator: "@airesumebuilder",
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <ArticleStructuredData params={params} />
      <PageContent params={params} />
    </>
  );
}

async function ArticleStructuredData({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return null;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `${BASE_URL}/blog_hero.webp`,
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    author: {
      "@type": "Organization",
      name: post.author,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon-512.svg`,
      },
    },
    mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(article).replace(/</g, "\\u003c"),
      }}
    />
  );
}
