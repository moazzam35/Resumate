"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { blogPosts, blogCategories } from "@/lib/blog-posts";

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    const q = search.toLowerCase();
    return blogPosts.filter((post) => {
      const matchesSearch =
        search === "" ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const featuredPost = blogPosts.find((p) => p.featured);
  const showFeaturedCard = activeCategory === "All" && !search && featuredPost;
  const regularPosts = showFeaturedCard
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-display text-2xl font-semibold">Career Blog</h2>
        <p className="text-sm text-muted">
          Resume tips, ATS guides, and career advice to help you land more
          interviews.
        </p>
      </div>

      {showFeaturedCard && (
        <Link href={`/dashboard/blog/${featuredPost.slug}`} className="group block">
          <Card className="flex flex-col overflow-hidden rounded-md border border-border transition-all hover:border-stamp/20 md:flex-row">
            <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-border/60 md:aspect-auto md:w-1/2 md:border-b-0 md:border-r">
              <img
                src="/blog_hero.webp"
                alt={featuredPost.title}
                width={768}
                height={512}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stamp/20 to-transparent" />
            </div>
            <div className="flex flex-1 flex-col justify-center p-5 sm:p-7">
              <Badge variant="default" className="mb-3 w-fit rounded-md">
                Featured
              </Badge>
              <h3 className="heading-display mb-2 text-xl font-semibold text-balance transition-colors group-hover:text-stamp sm:text-2xl">
                {featuredPost.title}
              </h3>
              <p className="mb-4 line-clamp-2 text-sm text-muted sm:line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span>{featuredPost.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {featuredPost.readTime}
                </span>
                <span>{featuredPost.date}</span>
              </div>
              <Button variant="link" size="link" className="mt-3 w-fit" rightIcon={ArrowRight}>
                Read more
              </Button>
            </div>
          </Card>
        </Link>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {blogCategories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className="cursor-pointer rounded-md px-3 py-1.5 text-xs transition-all hover:bg-stamp/10 hover:text-stamp"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {regularPosts.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted">
          No articles found matching your search.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {regularPosts.map((post) => (
            <Link
              key={post.id}
              href={`/dashboard/blog/${post.slug}`}
              className="group block h-full"
            >
              <Card className="flex h-full flex-col overflow-hidden rounded-md border border-border transition-all hover:border-stamp/20">
                <div className="relative aspect-[3/2] w-full overflow-hidden border-b border-border/60">
                  <img
                    src={post.image}
                    alt={post.title}
                    width={768}
                    height={512}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default" className="rounded-md">
                      {post.category}
                    </Badge>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="heading-display mt-3 mb-2 line-clamp-2 text-base font-semibold transition-colors group-hover:text-stamp">
                    {post.title}
                  </h3>
                  <p className="mb-4 flex-1 line-clamp-3 text-sm text-muted">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted">
                    <span className="truncate">{post.author}</span>
                    <span className="flex shrink-0 items-center gap-1 font-medium text-stamp">
                      Read
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
