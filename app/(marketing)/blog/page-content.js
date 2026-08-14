"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { blogPosts, blogCategories } from "@/lib/blog-posts";

const posts = blogPosts;

const categories = blogCategories;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
};

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        search === "" ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id || activeCategory !== "All");

  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-stamp/5 via-transparent to-stamp/5" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge variant="default" className="mb-4 rounded-md">
              Blog
            </Badge>
            <h1 className="heading-display gradient-text text-4xl font-semibold sm:text-5xl">
              Career insights & resume tips
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
              Expert advice to help you build better resumes and land more
              interviews.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {activeCategory === "All" && !search && featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="gradient-border group overflow-hidden rounded-md border border-border transition-all hover:border-stamp/20">
                  <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
                    <div className="flex flex-col justify-center">
                      <Badge variant="default" className="mb-3 w-fit rounded-md">
                        Featured
                      </Badge>
                      <h2 className="heading-display mb-3 text-2xl font-semibold transition-colors group-hover:text-stamp sm:text-3xl">
                        {featuredPost.title}
                      </h2>
                      <p className="mb-4 text-muted">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted">
                        <span>{featuredPost.author}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {featuredPost.readTime}
                        </span>
                        <span>{featuredPost.date}</span>
                      </div>
                      <Button variant="link" size="link" className="mt-4 w-fit" rightIcon={ArrowRight}>
                        Read more
                      </Button>
                    </div>
                    <div className="relative hidden items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-stamp/10 to-stamp/5 p-8 md:flex">
                      <Image
                        src="/blog_hero.webp"
                        alt={featuredPost.title}
                        width={1536}
                        height={1024}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="h-auto w-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stamp/20 to-transparent" />
                      <div className="relative text-center p-4">
                        <Badge variant="outline" className="rounded-md">{featuredPost.category}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-md pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  className="cursor-pointer rounded-md transition-all hover:bg-stamp/10 hover:text-stamp"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {regularPosts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted">
                No articles found matching your search.
              </p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {regularPosts.map((post, i) => (
                <motion.div key={post.id} variants={fadeUp} custom={i}>
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="group flex h-full flex-col rounded-md border border-border bg-paper-alt transition-all hover:border-stamp/20">
                      <div className="flex items-center justify-between p-6 pb-0">
                        <Badge variant="default" className="rounded-md">{post.category}</Badge>
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <CardContent className="flex flex-1 flex-col p-6">
                        <h3 className="heading-display mb-2 text-lg font-semibold transition-colors group-hover:text-stamp">
                          {post.title}
                        </h3>
                        <p className="mb-4 flex-1 text-sm text-muted">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted">
                          <span>{post.author}</span>
                          <span>{post.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
