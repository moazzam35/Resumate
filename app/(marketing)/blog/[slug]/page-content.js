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


const blogContent = {
  "ats-friendly-resume-2026": `
    Applicant Tracking Systems (ATS) have become the first gatekeeper in the modern hiring process. Over 75% of resumes are rejected by ATS before a human ever sees them. Here's how to make sure yours gets through.

    ## Understanding ATS

    ATS software scans your resume for keywords, formatting, and structure. It parses your information into a candidate profile and ranks you against other applicants. Understanding how these systems work is the first step to optimizing your resume.

    ## Key Optimization Strategies

    **Use standard section headings.** Stick to conventional labels like "Work Experience," "Education," and "Skills." Creative alternatives like "My Journey" or "What I've Done" can confuse ATS parsers.

    **Incorporate relevant keywords.** Carefully read the job description and mirror its language. If they say "project management," use that exact phrase rather than "managed projects."

    **Choose clean formatting.** Avoid tables, text boxes, headers/footers, and complex graphics. These elements often can't be read by ATS software.

    ## The Power of Plain Text

    While visual design matters for human readers, ATS reads the underlying text. Save your beautifully designed version for the interview and submit a clean, ATS-optimized version online.

    ## Final Checklist

    - Standard fonts (Arial, Calibri, Times New Roman)
    - No graphics or icons in the body
    - Simple bullet points
    - Consistent date formatting
    - PDF or DOCX file format
  `,
  "top-resume-templates-tech": `
    Choosing the right resume template can make a significant difference in how your application is perceived. Here are the top templates designed specifically for tech professionals.

    ## Why Template Choice Matters

    Tech hiring managers spend an average of 6 seconds scanning a resume. Your template needs to present information clearly and efficiently while still looking professional.

    ## Top Picks for 2026

    ### 1. The Developer Template
    Optimized for technical roles with dedicated sections for tech stacks, GitHub contributions, and project highlights.

    ### 2. The Modern Template
    Clean lines and a contemporary feel that works across all tech roles from junior to senior.

    ### 3. The Minimal Template
    Content-first design that lets your experience speak for itself. Perfect for candidates with strong backgrounds.

    ## Pro Tips

    - Match your template to the company culture
    - Keep it to one or two pages
    - Ensure mobile responsiveness (recruiters read on phones)
  `,
  "ai-resume-writing": `
    Artificial intelligence is transforming every industry, and resume writing is no exception. Let's explore how AI tools are revolutionizing the way we create and optimize resumes.

    ## The AI Advantage

    AI resume builders can analyze thousands of successful resumes in your field and identify patterns that work. This data-driven approach removes guesswork from the equation.

    ## Key AI Features

    **Smart Summaries:** AI generates compelling professional summaries tailored to your specific role and industry.

    **Bullet Point Enhancement:** Transform weak bullet points into powerful, achievement-focused statements.

    **Keyword Optimization:** AI identifies missing keywords that ATS systems look for in your target role.

    **Format Suggestions:** Get real-time feedback on layout and formatting to maximize readability.

    ## The Human Touch

    While AI provides the tools and data, your unique experiences and personality are what make a resume stand out. Use AI as a starting point, then add your personal story.
  `,
  "common-resume-mistakes": `
    Even the most qualified candidates can undermine their chances with preventable resume mistakes. Here are the most common pitfalls and how to avoid them.

    ## Top 10 Resume Mistakes

    ### 1. Typos and Grammar Errors
    Nothing kills credibility faster than spelling mistakes. Always proofread multiple times and use tools to catch errors.

    ### 2. Generic Objective Statements
    Replace outdated objective statements with compelling professional summaries that highlight your value.

    ### 3. Listing Duties Instead of Achievements
    Don't just describe what you did — show the impact you made with quantifiable results.

    ### 4. Too Much Information
    Keep your resume focused and relevant. Aim for quality over quantity.

    ### 5. Poor Formatting
    Inconsistent fonts, colors, and spacing make your resume hard to read.

    ## Quick Fixes

    - Use action verbs to start each bullet point
    - Include metrics and numbers wherever possible
    - Tailor your resume for each application
    - Keep it to 1-2 pages maximum
  `,
  "tailor-resume-industries": `
    One size doesn't fit all when it comes to resumes. Here's how to customize your resume for different industries and maximize your chances.

    ## Why Tailoring Matters

    Each industry has its own language, values, and expectations. A resume that works for a tech startup may fall flat at a financial institution.

    ## Industry-Specific Tips

    ### Tech Industry
    - Highlight technical skills prominently
    - Include GitHub links and portfolio
    - Mention specific technologies and tools

    ### Finance
    - Emphasize quantitative achievements
    - Use formal language and structure
    - Highlight certifications and licenses

    ### Creative Fields
    - Show don't tell with portfolio samples
    - Consider visual elements (but keep ATS compatibility)
    - Highlight creative tools and software

    ### Healthcare
    - Include relevant certifications
    - Emphasize patient outcomes
    - Follow industry-standard formatting
  `,
  "cover-letter-best-practices": `
    A well-crafted cover letter can be the difference between landing an interview and being overlooked. Here's how to write cover letters that get results.

    ## The Purpose of a Cover Letter

    Your cover letter is your chance to tell a story that your resume can't. It's where you connect your experience to the specific role and company.

    ## Structure That Works

    **Opening:** Hook the reader with a compelling first sentence that shows you've done your research.

    **Body:** Connect your experience to the role's requirements. Use specific examples and quantify your achievements.

    **Closing:** End with a clear call to action and express genuine enthusiasm for the opportunity.

    ## Common Mistakes to Avoid

    - Starting with "I am writing to apply for..."
    - Simply repeating your resume
    - Being too generic
    - Making it all about you instead of the employer

    ## Pro Tips

    - Research the company and mention specific details
    - Match the tone to the company culture
    - Keep it to one page
    - Always customize for each application
  `,
};

function getPostContent(slug) {
  return blogContent[slug] || null;
}

function renderMarkdown(content) {
  const lines = content.trim().split("\n");
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="mb-4 space-y-2 pl-5">
          {listItems.map((item, i) => (
            <li key={i} className="text-muted list-disc">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInline = (text) => {
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-semibold text-ink">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={i}
          className="heading-display mb-3 mt-6 text-lg font-semibold"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={i}
          className="heading-display mb-4 mt-8 text-2xl font-semibold"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={i} className="mb-3 text-muted leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }
  flushList();

  return elements;
}

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
