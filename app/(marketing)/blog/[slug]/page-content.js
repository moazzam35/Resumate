"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { blogPosts } from "@/lib/blog-posts";

import { getPostContent, renderMarkdown } from "@/components/shared/blog-content";

export default function BlogPostPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const content = getPostContent(resolvedParams.slug);
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="heading-display text-2xl font-semibold">Post not found</h1>
          <p className="mt-2 text-muted">
            The article you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button className="mt-4" onClick={() => router.push("/blog")} leftIcon={ArrowLeft}>
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <article className="px-4 pt-24 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="mb-8 rounded-md text-muted hover:text-ink"
              onClick={() => router.push("/blog")}
              leftIcon={ArrowLeft}
            >
              Back to Blog
            </Button>

            {post && (
              <>
                <h1 className="heading-display mb-3 text-3xl font-semibold sm:text-4xl">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {post?.image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md border border-border">
                <img
                  src={post.image}
                  alt={post.title}
                  width={768}
                  height={512}
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
          )}

          <Separator className="mb-8" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-gray dark:prose-invert max-w-none"
          >
            {renderMarkdown(content)}
          </motion.div>
        </div>
      </article>
    </div>
  );
}
