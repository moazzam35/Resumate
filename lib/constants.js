export const SITE_CONFIG = {
  name: "Resumate",
  title: "Resumate - AI Resume Builder",
  description:
    "Craft ATS-optimized resumes with AI. Professional templates, intelligent suggestions, and instant PDF export.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/opengraph-image",
  links: {
    twitter: "https://twitter.com/airesumebuilder",
    github: "https://github.com/airesumebuilder",
  },
};

export const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and modern design with a professional look",
    category: "professional",
    isPremium: false,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Minimalist design focusing on content",
    category: "minimal",
    isPremium: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Traditional professional resume format",
    category: "professional",
    isPremium: false,
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Corporate-style layout for business roles",
    category: "professional",
    isPremium: true,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stand out with creative visual elements",
    category: "creative",
    isPremium: true,
  },
  {
    id: "developer",
    name: "Developer",
    description: "Optimized for technical roles",
    category: "technical",
    isPremium: true,
  },
];

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: null,
    description: "Perfect for getting started",
    features: [
      "3 Resumes",
      "3 Templates",
      "7 AI Actions / month",
      "PDF Export",
      "Basic ATS Score",
    ],
    limits: {
      maxResumes: 3,
      aiRequestsPerMonth: 7,
      templates: ["modern", "minimal", "professional"],
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    period: "month",
    description: "For serious job seekers",
    features: [
      "10 Resumes",
      "All Templates",
      "20 AI Actions / month",
      "Cover Letter Generator",
      "Priority Support",
      "Version History",
      "Custom Colors",
    ],
    limits: {
      maxResumes: 10,
      aiRequestsPerMonth: 20,
      templates: "all",
    },
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 29,
    period: "month",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team Collaboration",
      "API Access",
      "Custom Branding",
      "Dedicated Support",
      "Analytics Dashboard",
      "SSO Integration",
    ],
    limits: {
      maxResumes: null,
      aiRequestsPerMonth: null,
      templates: "all",
    },
  },
];

export const FAQ_ITEMS = [
  {
    question: "How does the AI resume builder work?",
    answer:
      "Our AI uses Google Gemini to analyze your input and generate professional, ATS-optimized content. It suggests improvements for your summary, experience bullet points, skills, and more based on industry best practices.",
  },
  {
    question: "Will my resume pass ATS (Applicant Tracking Systems)?",
    answer:
      "Yes! All our templates are designed to be ATS-friendly. We also provide an ATS score and keyword suggestions to help you optimize your resume for specific job descriptions.",
  },
  {
    question: "Can I download my resume as a PDF?",
    answer:
      "Absolutely! You can download your resume as a high-quality, print-ready PDF with multiple color themes. The PDF is optimized for both digital submission and printing.",
  },
  {
    question: "How many resumes can I create?",
    answer:
      "Free users can create 3 resumes with 7 AI actions per month. Pro users get 10 resumes and 20 AI actions per month. Enterprise users get unlimited access. You can also create multiple versions of the same resume for different job applications.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We take data security seriously. All data is encrypted at rest and in transit. We never share your personal information with third parties. You can delete your account and data at any time.",
  },
  {
    question: "Can I switch between templates?",
    answer:
      "Yes! You can switch between templates at any time without losing your content. Your data is preserved and automatically formatted to match the new template.",
  },
];
