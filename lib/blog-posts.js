export const blogPosts = [
  {
    id: 1,
    slug: "ats-friendly-resume-2026",
    title: "How to Build an ATS-Friendly Resume in 2026",
    excerpt:
      "Over 75% of resumes are rejected by applicant tracking systems before a human ever reads them. Here's how to make sure yours gets through.",
    author: "Resumate Team",
    readTime: "5 min read",
    date: "Feb 12, 2026",
    category: "ATS",
    featured: true,
  },
  {
    id: 2,
    slug: "top-resume-templates-tech",
    title: "Top Resume Templates for Tech Professionals",
    excerpt:
      "Tech hiring managers spend an average of 6 seconds scanning a resume. Pick a template that presents your experience clearly.",
    author: "Resumate Team",
    readTime: "4 min read",
    date: "Jan 28, 2026",
    category: "Templates",
  },
  {
    id: 3,
    slug: "ai-resume-writing",
    title: "How AI Is Revolutionizing Resume Writing",
    excerpt:
      "AI resume builders analyze thousands of successful resumes to help you craft content that stands out. Here's how to use them well.",
    author: "Resumate Team",
    readTime: "6 min read",
    date: "Jan 15, 2026",
    category: "AI",
  },
  {
    id: 4,
    slug: "common-resume-mistakes",
    title: "10 Common Resume Mistakes and How to Avoid Them",
    excerpt:
      "Even the most qualified candidates can undermine their chances with preventable mistakes. Avoid these pitfalls to stand out.",
    author: "Resumate Team",
    readTime: "5 min read",
    date: "Dec 30, 2025",
    category: "Tips",
  },
  {
    id: 5,
    slug: "tailor-resume-industries",
    title: "How to Tailor Your Resume for Any Industry",
    excerpt:
      "One size doesn't fit all. Customize your resume for tech, finance, creative, and healthcare roles with these strategies.",
    author: "Resumate Team",
    readTime: "7 min read",
    date: "Dec 12, 2025",
    category: "Career Advice",
  },
  {
    id: 6,
    slug: "cover-letter-best-practices",
    title: "Cover Letter Best Practices That Get You Interviews",
    excerpt:
      "A well-crafted cover letter can be the difference between an interview and a rejection. Write one that gets results.",
    author: "Resumate Team",
    readTime: "5 min read",
    date: "Nov 24, 2025",
    category: "Cover Letters",
  },
];

export const blogCategories = [
  "All",
  ...Array.from(new Set(blogPosts.map((p) => p.category))),
];
