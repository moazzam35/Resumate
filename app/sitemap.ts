import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { SITE_CONFIG } from "@/lib/constants";

const BASE_URL = SITE_CONFIG.url.replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const staticPages: Array<{
    url: string;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
    priority: number;
  }> = [
    { url: "", changeFrequency: "daily", priority: 1.0 },
    { url: "/features", changeFrequency: "weekly", priority: 0.9 },
    { url: "/about", changeFrequency: "monthly", priority: 0.5 },
    { url: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { url: "/faq", changeFrequency: "monthly", priority: 0.6 },
    { url: "/blog", changeFrequency: "weekly", priority: 0.7 },
    { url: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { url: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { url: "/security", changeFrequency: "yearly", priority: 0.3 },
  ];

  const blogEntries = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date).toISOString() : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages.map((page) => ({
      url: `${BASE_URL}${page.url}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...blogEntries,
  ];
}
