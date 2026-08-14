const CATEGORY = {
  PROFESSIONAL: "Professional",
  TECHNOLOGY: "Technology",
  BUSINESS: "Business",
  CREATIVE: "Creative",
  LUXURY: "Luxury & Executive",
  ACADEMIC: "Academic & Education",
};

const LEVEL = {
  ENTRY: "entry",
  MID: "mid",
  SENIOR: "senior",
  EXEC: "executive",
};

const P = (partial) => ({ isPremium: true, ...partial });
const F = (partial) => ({ isPremium: false, ...partial });

export const ARCHETYPES = {
  CLASSIC: "classic",
  MODERN: "modern",
  SIDEBAR: "sidebar",
  HERO: "hero",
  EDITORIAL: "editorial",
  SPLIT: "split",
  CREATIVE: "creative",
};

const FONT_OPTIONS = ["sans", "display", "heading", "mono"];

const BLUE = ["#2563eb", "#0ea5e9", "#1e40af", "#3b82f6", "#06b6d4", "#0f172a"];
const GREEN = ["#059669", "#10b981", "#0f766e", "#84cc16", "#15803d", "#1e293b"];
const PURPLE = ["#7c3aed", "#8b5cf6", "#6d28d9", "#d946ef", "#4f46e5", "#1e1b4b"];
const RED = ["#dc2626", "#ef4444", "#b91c1c", "#f97316", "#f43f5e", "#450a0a"];
const TEAL = ["#0d9488", "#14b8a6", "#0891b2", "#2dd4bf", "#155e75", "#042f2e"];
const GOLD = ["#b48a3d", "#c9a227", "#a16207", "#d4af37", "#8a6d1f", "#1c1917"];
const SLATE = ["#334155", "#475569", "#0f172a", "#64748b", "#1e293b", "#020617"];
const PINK = ["#db2777", "#ec4899", "#be185d", "#f472b6", "#e11d48", "#500724"];
const INDIGO = ["#4f46e5", "#6366f1", "#4338ca", "#818cf8", "#5b21b6", "#1e1b4b"];

const t = (def) => ({
  fontOptions: FONT_OPTIONS,
  levels: [LEVEL.ENTRY, LEVEL.MID, LEVEL.SENIOR],
  pages: 1,
  atsScore: 92,
  popularity: 70,
  tags: [],
  ...def,
});

export const TEMPLATES = [
  t(
    F({
      id: "modern",
      name: "Modern",
      category: CATEGORY.PROFESSIONAL,
      archetype: ARCHETYPES.MODERN,
      tagline: "Clean, balanced, universally loved",
      description:
        "Our signature template. A centered header, accent-driven section titles and pill-shaped skill chips keep the layout airy while staying ATS-friendly.",
      industries: ["Software", "Product", "Marketing", "General"],
      jobTitles: ["Software Engineer", "Product Manager", "Marketing Manager"],
      levels: [LEVEL.ENTRY, LEVEL.MID, LEVEL.SENIOR],
      popularity: 98,
      atsScore: 96,
      design: {
        color: "#2563eb",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "center",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: BLUE,
    })
  ),
  t(
    F({
      id: "minimal",
      name: "Minimal",
      category: CATEGORY.PROFESSIONAL,
      archetype: ARCHETYPES.CLASSIC,
      tagline: "Whitespace-first and distraction-free",
      description:
        "Generous whitespace, a refined single column and quiet typography let your content do the talking. Perfect for design-savvy applicants.",
      industries: ["Design", "Product", "Consulting", "General"],
      jobTitles: ["Designer", "Analyst", "Consultant"],
      popularity: 90,
      atsScore: 95,
      design: {
        color: "#334155",
        font: "sans",
        spacing: "spacious",
        headerStyle: "left",
        sectionStyle: "caps",
        pageSize: "letter",
        margins: "wide",
      },
      swatches: SLATE,
    })
  ),
  t(
    F({
      id: "ats-classic",
      name: "ATS Classic",
      category: CATEGORY.PROFESSIONAL,
      archetype: ARCHETYPES.CLASSIC,
      tagline: "Built to pass any ATS parser",
      description:
        "A conservative single-column layout with standard headings and no tables or graphics. Engineered for maximum ATS compatibility and recruiters who love tradition.",
      industries: ["Government", "Banking", "Healthcare", "General"],
      jobTitles: ["Administrator", "Analyst", "Coordinator"],
      levels: [LEVEL.ENTRY, LEVEL.MID, LEVEL.SENIOR],
      popularity: 93,
      atsScore: 99,
      design: {
        color: "#0f172a",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "left",
        sectionStyle: "underline",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: SLATE,
      tags: ["ATS"],
    })
  ),
  t(
    F({
      id: "modern-professional",
      name: "Modern Professional",
      category: CATEGORY.PROFESSIONAL,
      archetype: ARCHETYPES.MODERN,
      tagline: "The recruiter-approved all-rounder",
      description:
        "A contemporary take on the classic professional resume. Subtle accent bars, clear hierarchy and balanced columns that work across every industry.",
      industries: ["Business", "Operations", "Human Resources", "General"],
      jobTitles: ["Manager", "Specialist", "Analyst"],
      popularity: 95,
      atsScore: 94,
      design: {
        color: "#059669",
        font: "heading",
        spacing: "comfortable",
        headerStyle: "center",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: GREEN,
    })
  ),
  t(
    F({
      id: "corporate",
      name: "Corporate",
      category: CATEGORY.BUSINESS,
      archetype: ARCHETYPES.HERO,
      tagline: "Confident header, corporate polish",
      description:
        "A bold colored header band anchors a polished single-column layout. Project authority the moment a recruiter opens the page.",
      industries: ["Banking", "Consulting", "Legal", "Energy"],
      jobTitles: ["Manager", "Director", "Analyst"],
      levels: [LEVEL.MID, LEVEL.SENIOR],
      popularity: 88,
      atsScore: 91,
      design: {
        color: "#1e40af",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "band",
        sectionStyle: "underline",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: BLUE,
    })
  ),
  t(
    F({
      id: "software-engineer",
      name: "Software Engineer",
      category: CATEGORY.TECHNOLOGY,
      archetype: ARCHETYPES.SIDEBAR,
      tagline: "Tech-forward two-column layout",
      description:
        "A two-column layout with a tech-stack sidebar. Highlights skills and tools up front, then tells your engineering story in the main column.",
      industries: ["Software", "Internet", "Fintech"],
      jobTitles: ["Software Engineer", "Backend Engineer", "QA Engineer"],
      popularity: 89,
      atsScore: 93,
      design: {
        color: "#0ea5e9",
        font: "mono",
        spacing: "compact",
        headerStyle: "sidebar",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: BLUE,
      tags: ["Tech"],
    })
  ),
  t(
    F({
      id: "full-stack",
      name: "Full Stack Developer",
      category: CATEGORY.TECHNOLOGY,
      archetype: ARCHETYPES.MODERN,
      tagline: "Show your front-to-back range",
      description:
        "Designed to show both breadth and depth. A balanced layout with project-heavy sections and a clean skill matrix for front-end, back-end and DevOps.",
      industries: ["Software", "Startups", "Agency"],
      jobTitles: ["Full Stack Developer", "Web Developer", "Software Engineer"],
      popularity: 87,
      atsScore: 92,
      design: {
        color: "#7c3aed",
        font: "sans",
        spacing: "compact",
        headerStyle: "center",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: PURPLE,
      tags: ["Tech"],
    })
  ),
  t(
    F({
      id: "data-scientist",
      name: "Data Scientist",
      category: CATEGORY.TECHNOLOGY,
      archetype: ARCHETYPES.SPLIT,
      tagline: "Two-column clarity for data roles",
      description:
        "A refined two-column layout that lets you list tools and techniques beside your experience. Ideal for analysts and data scientists.",
      industries: ["Data", "AI", "Finance"],
      jobTitles: ["Data Scientist", "Data Analyst", "ML Engineer"],
      popularity: 84,
      atsScore: 93,
      design: {
        color: "#0d9488",
        font: "sans",
        spacing: "compact",
        headerStyle: "split",
        sectionStyle: "rule",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: TEAL,
      tags: ["Tech"],
    })
  ),
  t(
    F({
      id: "product-manager",
      name: "Product Manager",
      category: CATEGORY.BUSINESS,
      archetype: ARCHETYPES.MODERN,
      tagline: "Impact and ownership at a glance",
      description:
        "Structured to emphasize metrics, ownership and shipped outcomes. Clean sections for strategy work, launches and cross-functional leadership.",
      industries: ["Product", "SaaS", "Technology"],
      jobTitles: ["Product Manager", "Program Manager", "Product Owner"],
      popularity: 85,
      atsScore: 93,
      design: {
        color: "#4f46e5",
        font: "heading",
        spacing: "comfortable",
        headerStyle: "center",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: INDIGO,
    })
  ),
  t(
    F({
      id: "marketing",
      name: "Marketing",
      category: CATEGORY.CREATIVE,
      archetype: ARCHETYPES.MODERN,
      tagline: "Creative energy, campaign results",
      description:
        "A vibrant template that pairs campaign metrics with a lively layout. Great for brand, growth and performance marketers.",
      industries: ["Marketing", "Agency", "Media"],
      jobTitles: ["Marketing Manager", "Growth Marketer", "Brand Strategist"],
      popularity: 82,
      atsScore: 90,
      design: {
        color: "#db2777",
        font: "display",
        spacing: "comfortable",
        headerStyle: "center",
        sectionStyle: "pill",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: PINK,
    })
  ),
  t(
    F({
      id: "sales",
      name: "Sales",
      category: CATEGORY.BUSINESS,
      archetype: ARCHETYPES.HERO,
      tagline: "Quota-crushing numbers first",
      description:
        "Leads with a confident header and puts numbers front and center — revenue, quota attainment and deal velocity in a clean, persuasive layout.",
      industries: ["Sales", "SaaS", "Enterprise"],
      jobTitles: ["Account Executive", "Sales Manager", "SDR"],
      popularity: 80,
      atsScore: 89,
      design: {
        color: "#dc2626",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "band",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: RED,
    })
  ),
  t(
    F({
      id: "university",
      name: "University",
      category: CATEGORY.ACADEMIC,
      archetype: ARCHETYPES.CLASSIC,
      tagline: "Polished resume for faculty roles",
      description:
        "A scholarly single-column format suited to tenure-track, lecturer and research roles. Emphasis on publications, teaching and service.",
      industries: ["Academia", "Higher Education", "Research"],
      jobTitles: ["Professor", "Lecturer", "Researcher"],
      levels: [LEVEL.MID, LEVEL.SENIOR, LEVEL.EXEC],
      popularity: 74,
      atsScore: 94,
      design: {
        color: "#334155",
        font: "serif",
        spacing: "comfortable",
        headerStyle: "left",
        sectionStyle: "underline",
        pageSize: "a4",
        margins: "normal",
      },
      swatches: SLATE,
    })
  ),
  t(
    F({
      id: "teacher",
      name: "Teacher",
      category: CATEGORY.ACADEMIC,
      archetype: ARCHETYPES.CLASSIC,
      tagline: "Classroom-tested and clear",
      description:
        "A warm, readable layout for educators. Showcases certification, teaching philosophy and classroom experience in a reassuring format.",
      industries: ["Education", "K-12", "Tutoring"],
      jobTitles: ["Teacher", "Educator", "Curriculum Specialist"],
      levels: [LEVEL.ENTRY, LEVEL.MID],
      popularity: 76,
      atsScore: 95,
      design: {
        color: "#059669",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "left",
        sectionStyle: "caps",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: GREEN,
    })
  ),
  t(
    F({
      id: "student",
      name: "Student",
      category: CATEGORY.ACADEMIC,
      archetype: ARCHETYPES.MODERN,
      tagline: "Entry-level friendly and fresh",
      description:
        "Built for students and new grads. Puts education, projects and campus involvement first with a layout that flatters a lean experience section.",
      industries: ["General", "Internships", "Education"],
      jobTitles: ["Intern", "Student", "Graduate"],
      levels: [LEVEL.ENTRY],
      popularity: 86,
      atsScore: 92,
      design: {
        color: "#0ea5e9",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "center",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: BLUE,
    })
  ),
  t(
    F({
      id: "medical",
      name: "Medical",
      category: CATEGORY.PROFESSIONAL,
      archetype: ARCHETYPES.CLASSIC,
      tagline: "Trustworthy format for healthcare",
      description:
        "A precise, credential-first layout for physicians, nurses and allied health. Licenses, certifications and clinical experience take priority.",
      industries: ["Healthcare", "Clinical", "Pharma"],
      jobTitles: ["Registered Nurse", "Physician", "Medical Assistant"],
      levels: [LEVEL.MID, LEVEL.SENIOR],
      popularity: 78,
      atsScore: 96,
      design: {
        color: "#0f766e",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "left",
        sectionStyle: "underline",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: TEAL,
    })
  ),
  t(
    P({
      id: "executive",
      name: "Executive",
      category: CATEGORY.BUSINESS,
      archetype: ARCHETYPES.HERO,
      tagline: "Command attention at the C-suite",
      description:
        "A stately hero header and measured typography frame years of leadership. Engineered for directors, VPs and C-level roles.",
      industries: ["Executive", "Leadership", "Board"],
      jobTitles: ["Chief Executive", "VP", "Director"],
      levels: [LEVEL.SENIOR, LEVEL.EXEC],
      popularity: 91,
      atsScore: 90,
      design: {
        color: "#1e293b",
        font: "sans",
        spacing: "spacious",
        headerStyle: "band",
        sectionStyle: "rule",
        pageSize: "a4",
        margins: "normal",
      },
      swatches: SLATE,
    })
  ),
  t(
    P({
      id: "ai-engineer",
      name: "AI Engineer",
      category: CATEGORY.TECHNOLOGY,
      archetype: ARCHETYPES.MODERN,
      tagline: "Built for the AI era",
      description:
        "A modern layout for ML engineers and AI specialists. Emphasizes model work, frameworks and shipped AI products with a technical, clean structure.",
      industries: ["AI", "ML", "Software"],
      jobTitles: ["AI Engineer", "ML Engineer", "Applied Scientist"],
      popularity: 94,
      atsScore: 92,
      design: {
        color: "#7c3aed",
        font: "mono",
        spacing: "compact",
        headerStyle: "center",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: PURPLE,
      tags: ["Tech", "AI"],
    })
  ),
  t(
    P({
      id: "cyber-security",
      name: "Cyber Security",
      category: CATEGORY.TECHNOLOGY,
      archetype: ARCHETYPES.SIDEBAR,
      tagline: "Dark, disciplined, technical",
      description:
        "A sleek dark-sidebar layout built for security professionals. Certifications and tooling get their own column; incident response leads the main flow.",
      industries: ["Security", "Fintech", "Government"],
      jobTitles: ["Security Engineer", "Analyst", "Pentester"],
      popularity: 88,
      atsScore: 92,
      design: {
        color: "#0f766e",
        font: "mono",
        spacing: "compact",
        headerStyle: "sidebar",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: TEAL,
      tags: ["Tech"],
    })
  ),
  t(
    P({
      id: "finance",
      name: "Finance",
      category: CATEGORY.BUSINESS,
      archetype: ARCHETYPES.CLASSIC,
      tagline: "Conservative, precise, credible",
      description:
        "A restrained single-column format for finance and accounting. Numbers, qualifications and deal highlights read cleanly at any length.",
      industries: ["Finance", "Banking", "Accounting"],
      jobTitles: ["Financial Analyst", "Accountant", "Investment Analyst"],
      levels: [LEVEL.MID, LEVEL.SENIOR],
      popularity: 83,
      atsScore: 95,
      design: {
        color: "#0f172a",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "left",
        sectionStyle: "underline",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: SLATE,
    })
  ),
  t(
    P({
      id: "consultant",
      name: "Consultant",
      category: CATEGORY.BUSINESS,
      archetype: ARCHETYPES.HERO,
      tagline: "Deliverable-focused and sharp",
      description:
        "A crisp hero-header layout for consultants. Positions engagements, impact metrics and frameworks as the centerpiece of your story.",
      industries: ["Consulting", "Strategy", "Operations"],
      jobTitles: ["Consultant", "Senior Consultant", "Manager"],
      popularity: 81,
      atsScore: 91,
      design: {
        color: "#b45309",
        font: "sans",
        spacing: "comfortable",
        headerStyle: "band",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: ["#b45309", "#d97706", "#92400e", "#f59e0b", "#78350f", "#1c1917"],
    })
  ),
  t(
    P({
      id: "portfolio",
      name: "Portfolio",
      category: CATEGORY.CREATIVE,
      archetype: ARCHETYPES.CREATIVE,
      tagline: "Creative resume with visual flair",
      description:
        "A bold, portfolio-style layout for creatives and product designers. Color blocks and project showcases let your aesthetic lead.",
      industries: ["Design", "Agency", "Creative"],
      jobTitles: ["Product Designer", "Creative Director", "Art Director"],
      popularity: 86,
      atsScore: 82,
      design: {
        color: "#db2777",
        font: "display",
        spacing: "comfortable",
        headerStyle: "creative",
        sectionStyle: "pill",
        pageSize: "a4",
        margins: "narrow",
      },
      swatches: PINK,
      tags: ["Creative"],
    })
  ),
  t(
    P({
      id: "editorial",
      name: "Editorial",
      category: CATEGORY.CREATIVE,
      archetype: ARCHETYPES.EDITORIAL,
      tagline: "Magazine-grade typography",
      description:
        "Serif headlines, hairline rules and letterspaced labels create a publication-worthy resume. Ideal for writers, editors and brand storytellers.",
      industries: ["Publishing", "Media", "Communications"],
      jobTitles: ["Editor", "Writer", "Journalist"],
      popularity: 84,
      atsScore: 88,
      design: {
        color: "#b48a3d",
        font: "serif",
        spacing: "comfortable",
        headerStyle: "editorial",
        sectionStyle: "caps",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: GOLD,
      tags: ["Creative"],
    })
  ),
  t(
    P({
      id: "modern-creative",
      name: "Modern Creative",
      category: CATEGORY.CREATIVE,
      archetype: ARCHETYPES.CREATIVE,
      tagline: "Playful structure, pro polish",
      description:
        "A confident creative layout with colorful accents and expressive typography — polished enough for agencies, bold enough to be remembered.",
      industries: ["Agency", "Media", "Events"],
      jobTitles: ["Creative", "Copywriter", "Designer"],
      popularity: 87,
      atsScore: 83,
      design: {
        color: "#f97316",
        font: "display",
        spacing: "comfortable",
        headerStyle: "creative",
        sectionStyle: "accent",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: ["#f97316", "#f59e0b", "#ea580c", "#fb923c", "#c2410c", "#1c1917"],
      tags: ["Creative"],
    })
  ),
  t(
    P({
      id: "magazine",
      name: "Magazine",
      category: CATEGORY.CREATIVE,
      archetype: ARCHETYPES.EDITORIAL,
      tagline: "A headline you'll remember",
      description:
        "Big serif display type and structured columns make your experience read like a feature story. For communications and media roles.",
      industries: ["Media", "Publishing", "PR"],
      jobTitles: ["Editor", "Journalist", "Communications Manager"],
      popularity: 79,
      atsScore: 85,
      design: {
        color: "#b91c1c",
        font: "serif",
        spacing: "comfortable",
        headerStyle: "editorial",
        sectionStyle: "rule",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: RED,
      tags: ["Creative"],
    })
  ),
  t(
    P({
      id: "designer",
      name: "Designer",
      category: CATEGORY.CREATIVE,
      archetype: ARCHETYPES.CREATIVE,
      tagline: "A resume that's a design piece",
      description:
        "Every detail is a flex: asymmetric grid, duotone accents and generous negative space. For product, UI/UX and visual designers.",
      industries: ["Design", "Tech", "Startups"],
      jobTitles: ["Product Designer", "UX Designer", "Visual Designer"],
      popularity: 90,
      atsScore: 80,
      design: {
        color: "#8b5cf6",
        font: "display",
        spacing: "spacious",
        headerStyle: "creative",
        sectionStyle: "caps",
        pageSize: "a4",
        margins: "narrow",
      },
      swatches: PURPLE,
      tags: ["Creative"],
    })
  ),
  t(
    P({
      id: "black-luxury",
      name: "Black Luxury",
      category: CATEGORY.LUXURY,
      archetype: ARCHETYPES.SIDEBAR,
      tagline: "Prestige in a black sidebar",
      description:
        "A dramatic charcoal sidebar, ivory content and gold accents signal quiet authority. A statement resume for senior executives.",
      industries: ["Executive", "Luxury", "Finance"],
      jobTitles: ["Executive", "Director", "Partner"],
      levels: [LEVEL.SENIOR, LEVEL.EXEC],
      popularity: 92,
      atsScore: 88,
      design: {
        color: "#d4af37",
        font: "serif",
        spacing: "spacious",
        headerStyle: "sidebar",
        sectionStyle: "rule",
        pageSize: "a4",
        margins: "normal",
        darkMode: true,
      },
      swatches: GOLD,
      tags: ["Luxury"],
    })
  ),
  t(
    P({
      id: "gold-executive",
      name: "Gold Executive",
      category: CATEGORY.LUXURY,
      archetype: ARCHETYPES.EDITORIAL,
      tagline: "Golden serif, boardroom ready",
      description:
        "Warm gold rules and refined serif type frame a leadership story. Understated, expensive, and built for the boardroom.",
      industries: ["Executive", "Wealth", "Real Estate"],
      jobTitles: ["CEO", "Managing Director", "Founder"],
      levels: [LEVEL.SENIOR, LEVEL.EXEC],
      popularity: 89,
      atsScore: 89,
      design: {
        color: "#b48a3d",
        font: "serif",
        spacing: "spacious",
        headerStyle: "editorial",
        sectionStyle: "rule",
        pageSize: "a4",
        margins: "normal",
      },
      swatches: GOLD,
      tags: ["Luxury"],
    })
  ),
  t(
    P({
      id: "premium-minimal",
      name: "Premium Minimal",
      category: CATEGORY.LUXURY,
      archetype: ARCHETYPES.EDITORIAL,
      tagline: "Quiet luxury in black and white",
      description:
        "The ultimate restraint: monochrome, generous spacing, hairline rules and immaculate type. Luxury for those who whisper.",
      industries: ["Creative", "Consulting", "Executive"],
      jobTitles: ["Creative Director", "Consultant", "Executive"],
      levels: [LEVEL.MID, LEVEL.SENIOR, LEVEL.EXEC],
      popularity: 85,
      atsScore: 93,
      design: {
        color: "#0f172a",
        font: "serif",
        spacing: "spacious",
        headerStyle: "editorial",
        sectionStyle: "caps",
        pageSize: "letter",
        margins: "wide",
      },
      swatches: SLATE,
      tags: ["Luxury"],
    })
  ),
  t(
    P({
      id: "elegant-serif",
      name: "Elegant Serif",
      category: CATEGORY.LUXURY,
      archetype: ARCHETYPES.EDITORIAL,
      tagline: "Timeless serif sophistication",
      description:
        "Classic serif typography with delicate accents. A graceful, literary format for consultants, lawyers and senior professionals.",
      industries: ["Legal", "Consulting", "Publishing"],
      jobTitles: ["Attorney", "Consultant", "Editor"],
      levels: [LEVEL.MID, LEVEL.SENIOR],
      popularity: 82,
      atsScore: 92,
      design: {
        color: "#a16207",
        font: "serif",
        spacing: "comfortable",
        headerStyle: "editorial",
        sectionStyle: "rule",
        pageSize: "letter",
        margins: "normal",
      },
      swatches: GOLD,
      tags: ["Luxury"],
    })
  ),
  t(
    P({
      id: "platinum",
      name: "Platinum",
      category: CATEGORY.LUXURY,
      archetype: ARCHETYPES.EDITORIAL,
      tagline: "Cool silver, executive precision",
      description:
        "A cool platinum palette with crisp hairlines and executive spacing. Precision typography for high-stakes applications.",
      industries: ["Finance", "Executive", "Tech"],
      jobTitles: ["CFO", "VP", "Director"],
      levels: [LEVEL.SENIOR, LEVEL.EXEC],
      popularity: 83,
      atsScore: 91,
      design: {
        color: "#475569",
        font: "serif",
        spacing: "spacious",
        headerStyle: "editorial",
        sectionStyle: "caps",
        pageSize: "a4",
        margins: "normal",
      },
      swatches: SLATE,
      tags: ["Luxury"],
    })
  ),
  t(
    P({
      id: "research",
      name: "Research",
      category: CATEGORY.ACADEMIC,
      archetype: ARCHETYPES.SPLIT,
      tagline: "Publications meet experience",
      description:
        "A scholarly two-column layout that gives publications, grants and collaborations the space they deserve alongside your research roles.",
      industries: ["Research", "Pharma", "Academia"],
      jobTitles: ["Research Scientist", "Postdoc", "Principal Investigator"],
      levels: [LEVEL.MID, LEVEL.SENIOR],
      popularity: 77,
      atsScore: 94,
      design: {
        color: "#0f766e",
        font: "serif",
        spacing: "compact",
        headerStyle: "split",
        sectionStyle: "rule",
        pageSize: "a4",
        margins: "normal",
      },
      swatches: TEAL,
      tags: ["Academic"],
    })
  ),
];

export const getTemplate = (idOrTemplate) => {
  const id = typeof idOrTemplate === "object" && idOrTemplate !== null ? idOrTemplate.id : idOrTemplate;
  return TEMPLATES.find((tpl) => tpl.id === id) || TEMPLATES[0];
};

const getTemplates = () => TEMPLATES;

export const TEMPLATE_CATEGORIES = Object.values(CATEGORY);

const FREE_COUNT = TEMPLATES.filter((tpl) => !tpl.isPremium).length;
const PREMIUM_COUNT = TEMPLATES.filter((tpl) => tpl.isPremium).length;

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "popular", label: "Most popular" },
  { id: "ats", label: "Best ATS score" },
  { id: "newest", label: "Newest" },
  { id: "az", label: "A → Z" },
];
