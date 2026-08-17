"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/blog-posts";
import { getPostContent, renderMarkdown } from "@/components/shared/blog-content";

export default function BlogPostPage({ slug }) {
  const router = useRouter();
  const content = getPostContent(slug);
  const post = blogPosts.find((p) => p.slug === slug);

  if (!content || !post) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="heading-display text-2xl font-semibold">Post not found</h1>
          <p className="mt-2 text-sm text-muted">
            The article you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/dashboard/blog")}
            leftIcon={ArrowLeft}
          >
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Button
          variant="ghost"
          className="mb-4 -ml-2 rounded-md text-muted hover:text-ink"
          onClick={() => router.push("/dashboard/blog")}
          leftIcon={ArrowLeft}
        >
          Back to Blog
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="rounded-md">
            {post.category}
          </Badge>
        </div>
        <h1 className="heading-display mt-3 text-2xl font-semibold sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>{post.author}</span>
          <span>{post.date}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>
      </motion.div>

      {post.image && (
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md border border-border">
          <img
            src={post.image}
            alt={post.title}
            width={768}
            height={512}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <Separator />

      <div className="prose prose-gray dark:prose-invert max-w-none">
        {renderMarkdown(content)}
      </div>
    </div>
  );
}
