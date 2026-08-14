import { getTemplate } from "./registry";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 4);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function emptyResumeData() {
  return {
    personal: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certificates: [],
    languages: [],
    achievements: [],
    references: [],
  };
}

const STR = (v) => (v == null ? "" : String(v));

function mapSkill(s) {
  if (typeof s === "string") return { id: s, name: s, level: "", category: "" };
  return {
    id: s.id || s.name,
    name: STR(s.name),
    level: STR(s.level),
    category: STR(s.category),
  };
}

function mapExperience(e) {
  return {
    id: e.id,
    company: STR(e.company),
    position: STR(e.position),
    location: STR(e.location),
    startDate: e.startDate,
    endDate: e.isCurrent ? null : e.endDate,
    isCurrent: Boolean(e.isCurrent),
    highlights: Array.isArray(e.highlights) ? e.highlights.map(STR) : [],
  };
}

function mapEducation(e) {
  return {
    id: e.id,
    institution: STR(e.institution),
    degree: STR(e.degree),
    field: STR(e.field),
    location: STR(e.location),
    startDate: e.startDate,
    endDate: e.endDate,
    gpa: STR(e.gpa),
  };
}

function mapProject(p) {
  return {
    id: p.id,
    name: STR(p.name),
    description: STR(p.description),
    url: STR(p.url),
    github: STR(p.github),
    technologies: Array.isArray(p.technologies) ? p.technologies.map(STR) : [],
    highlights: Array.isArray(p.highlights) ? p.highlights.map(STR) : [],
  };
}

function mapCertificate(c) {
  return { id: c.id, name: STR(c.name), issuer: STR(c.issuer), url: STR(c.url), date: c.date };
}

function mapAchievement(a) {
  return { id: a.id, title: STR(a.title), description: STR(a.description), date: a.date, url: STR(a.url) };
}

/**
 * Normalizes any resume shape (DB record, store state, raw payload) into a
 * stable contract consumed by the template engine.
 */
export function normalizeResume(raw = {}) {
  const data = emptyResumeData();
  if (!raw) return data;

  const pi = raw.personalInfo && typeof raw.personalInfo === "object" ? raw.personalInfo : {};
  data.personal = {
    name: STR(raw.name || pi.name),
    title: STR(raw.title || pi.jobTitle || pi.title),
    email: STR(raw.email || pi.email),
    phone: STR(raw.phone || pi.phone),
    location: STR(raw.location || pi.location),
    linkedin: STR(raw.linkedin || pi.linkedin),
    github: STR(raw.github || pi.github),
    portfolio: STR(raw.portfolio || pi.portfolio),
    website: STR(pi.website),
  };
  data.summary = STR(raw.summary || pi.summary);

  const pick = (arr) => (Array.isArray(arr) ? arr : []);
  data.experience = pick(raw.experiences || raw.experience).map(mapExperience);
  data.education = pick(raw.educations || raw.education).map(mapEducation);
  data.skills = pick(raw.skills).map(mapSkill);
  data.projects = pick(raw.projects).map(mapProject);
  data.certificates = pick(raw.certificates).map(mapCertificate);
  data.achievements = pick(raw.achievements).map(mapAchievement);
  data.languages = pick(raw.languages).map((l) =>
    typeof l === "string"
      ? { id: l, name: l, proficiency: "" }
      : { id: l.id, name: STR(l.name), proficiency: STR(l.proficiency) }
  );
  data.references = pick(raw.references).map((r) => ({
    id: r.id,
    name: STR(r.name),
    title: STR(r.title),
    company: STR(r.company),
    email: STR(r.email),
    phone: STR(r.phone),
  }));

  return data;
}

const PERSONAS = {
  engineer: {
    name: "Priya Sharma",
    title: "Senior Software Engineer",
    email: "priya.sharma@email.com",
    phone: "+1 (415) 555-0173",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/priyasharma",
    github: "github.com/priyasharma",
    summary:
      "Full-stack engineer with 8 years of experience shipping products used by millions. I lead platform teams, cut p95 latency by 62%, and champion pragmatic engineering that moves revenue. I care about clean architecture, fast feedback loops, and teams that ship.",
    experience: [
      {
        id: "e1",
        company: "Nimbus Cloud",
        position: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: new Date(2021, 5, 1),
        isCurrent: true,
        highlights: [
          "Led a 6-person team rebuilding the billing platform, reducing charge failures by 48%.",
          "Cut API p95 latency from 320ms to 120ms by introducing edge caching and async pipelines.",
          "Drove migration to Kubernetes, cutting infrastructure costs by $210k/yr.",
        ],
      },
      {
        id: "e2",
        company: "BrightLabs",
        position: "Software Engineer",
        location: "Seattle, WA",
        startDate: new Date(2018, 2, 1),
        endDate: new Date(2021, 4, 1),
        highlights: [
          "Shipped a real-time collaboration editor used by 40k daily active users.",
          "Designed the event-sourcing core that powers undo across 1M+ concurrent sessions.",
        ],
      },
      {
        id: "e3",
        company: "CodeCraft",
        position: "Junior Developer",
        location: "Austin, TX",
        startDate: new Date(2016, 6, 1),
        endDate: new Date(2018, 1, 1),
        highlights: [
          "Built internal tooling that saved engineers 12 hours of manual work each week.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "University of Washington",
        degree: "B.S.",
        field: "Computer Science",
        location: "Seattle, WA",
        startDate: new Date(2012, 8, 1),
        endDate: new Date(2016, 5, 1),
        gpa: "3.8",
      },
    ],
    skills: [
      { name: "TypeScript", level: "Expert", category: "Languages" },
      { name: "React", level: "Expert", category: "Frontend" },
      { name: "Node.js", level: "Advanced", category: "Backend" },
      { name: "GraphQL", level: "Advanced", category: "Backend" },
      { name: "PostgreSQL", level: "Advanced", category: "Data" },
      { name: "Kubernetes", level: "Intermediate", category: "DevOps" },
      { name: "Python", level: "Advanced", category: "Languages" },
      { name: "AWS", level: "Advanced", category: "DevOps" },
    ],
    projects: [
      {
        id: "p1",
        name: "RelayBoard",
        description: "Open-source incident command platform for engineering teams.",
        technologies: ["TypeScript", "React", "Postgres"],
        url: "github.com/priyasharma/relayboard",
      },
      {
        id: "p2",
        name: "QueryKit",
        description: "Type-safe SQL builder used by 1,200+ repositories.",
        technologies: ["TypeScript", "SQL"],
      },
    ],
    certificates: [
      { id: "c1", name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: new Date(2022, 2, 1) },
    ],
    languages: [
      { name: "English", proficiency: "Native" },
      { name: "Hindi", proficiency: "Fluent" },
    ],
    achievements: [
      { id: "a1", title: "Speaker, ReactConf 2023", description: "Gave a talk on real-time collaboration at scale." },
    ],
  },
  product: {
    name: "Marcus Chen",
    title: "Senior Product Manager",
    email: "marcus.chen@email.com",
    phone: "+1 (212) 555-0182",
    location: "New York, NY",
    linkedin: "linkedin.com/in/marcuschen",
    summary:
      "Product leader with 7 years shipping SaaS used by enterprise teams. Owned a $12M ARR roadmap, ran 40+ discovery sprints, and moved activation from 22% to 41%. Equally comfortable with strategy decks and SQL.",
    experience: [
      {
        id: "e1",
        company: "Lumen Analytics",
        position: "Senior Product Manager",
        location: "New York, NY",
        startDate: new Date(2020, 2, 1),
        isCurrent: true,
        highlights: [
          "Owned the analytics platform roadmap that grew ARR from $6M to $12M in 18 months.",
          "Launched a self-serve onboarding flow that lifted 30-day activation from 22% to 41%.",
          "Shipped 4 major features in a year with 96% customer satisfaction.",
        ],
      },
      {
        id: "e2",
        company: "Peak HR",
        position: "Product Manager",
        location: "Boston, MA",
        startDate: new Date(2017, 3, 1),
        endDate: new Date(2020, 1, 1),
        highlights: [
          "Delivered a benefits comparison tool that increased retention 12%.",
          "Cut support tickets 30% with an in-app help center.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "Cornell University",
        degree: "B.A.",
        field: "Economics",
        location: "Ithaca, NY",
        startDate: new Date(2012, 8, 1),
        endDate: new Date(2016, 5, 1),
      },
    ],
    skills: [
      { name: "Roadmapping", level: "Expert", category: "Strategy" },
      { name: "User Research", level: "Expert", category: "Discovery" },
      { name: "SQL", level: "Advanced", category: "Data" },
      { name: "A/B Testing", level: "Advanced", category: "Data" },
      { name: "Figma", level: "Intermediate", category: "Design" },
      { name: "GTM Strategy", level: "Advanced", category: "Strategy" },
    ],
    projects: [
      {
        id: "p1",
        name: "Activation Playbook",
        description: "Company-wide onboarding framework now used by 3 product teams.",
        technologies: ["Analytics", "Figma"],
      },
    ],
    languages: [{ name: "English", proficiency: "Native" }, { name: "Mandarin", proficiency: "Conversational" }],
    certificates: [{ id: "c1", name: "Pragmatic Institute Certified", issuer: "Pragmatic Institute", date: new Date(2021, 6, 1) }],
    achievements: [
      { id: "a1", title: "Product Leader of the Year", description: "Company award for the self-serve onboarding launch." },
    ],
  },
  designer: {
    name: "Amara Okafor",
    title: "Product Designer",
    email: "amara@email.com",
    phone: "+1 (310) 555-0165",
    location: "Los Angeles, CA",
    linkedin: "linkedin.com/in/amaraokafor",
    portfolio: "amaraokafor.design",
    summary:
      "Product designer with 6 years crafting interfaces that feel effortless. Led redesigns across fintech and media that lifted engagement 35%+. I blend systems thinking with bold visual storytelling.",
    experience: [
      {
        id: "e1",
        company: "Finch",
        position: "Senior Product Designer",
        location: "Los Angeles, CA",
        startDate: new Date(2021, 1, 1),
        isCurrent: true,
        highlights: [
          "Led the mobile app redesign, boosting DAU retention 18%.",
          "Built a 42-component design system adopted across 4 product squads.",
          "Ran 25+ usability sessions that de-risked 3 major launches.",
        ],
      },
      {
        id: "e2",
        company: "Studio North",
        position: "Product Designer",
        location: "Portland, OR",
        startDate: new Date(2018, 6, 1),
        endDate: new Date(2020, 12, 1),
        highlights: [
          "Shipped brand systems for 8 clients across retail and hospitality.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "California College of the Arts",
        degree: "B.F.A.",
        field: "Interaction Design",
        location: "San Francisco, CA",
        startDate: new Date(2013, 8, 1),
        endDate: new Date(2017, 5, 1),
      },
    ],
    skills: [
      { name: "Figma", level: "Expert", category: "Tools" },
      { name: "Prototyping", level: "Expert", category: "Craft" },
      { name: "Design Systems", level: "Expert", category: "Craft" },
      { name: "User Research", level: "Advanced", category: "Discovery" },
      { name: "Motion Design", level: "Advanced", category: "Tools" },
      { name: "HTML/CSS", level: "Intermediate", category: "Tools" },
    ],
    projects: [
      {
        id: "p1",
        name: "Harbor",
        description: "Concept design for a calm banking app — featured on Dribbble.",
        technologies: ["Figma", "After Effects"],
      },
    ],
    languages: [{ name: "English", proficiency: "Native" }, { name: "French", proficiency: "Conversational" }],
    achievements: [{ id: "a1", title: "Awwwards Honorable Mention", description: "For the Finch fintech onboarding flow." }],
  },
  executive: {
    name: "Victoria Sterling",
    title: "Chief Operating Officer",
    email: "v.sterling@email.com",
    phone: "+1 (646) 555-0119",
    location: "New York, NY",
    linkedin: "linkedin.com/in/victoriasterling",
    summary:
      "COO with 15 years scaling operations across SaaS and consumer technology. Grew revenue from $18M to $84M, led a 500-person org through three acquisitions, and built the operating cadence that made it repeatable.",
    experience: [
      {
        id: "e1",
        company: "Meridian Group",
        position: "Chief Operating Officer",
        location: "New York, NY",
        startDate: new Date(2019, 3, 1),
        isCurrent: true,
        highlights: [
          "Scaled the organization from 120 to 500 people across 6 countries.",
          "Drove EBITDA margin from 4% to 17% through vendor consolidation and process redesign.",
          "Led diligence for 3 acquisitions, completing integration 2 quarters ahead of plan.",
        ],
      },
      {
        id: "e2",
        company: "Halcyon Logistics",
        position: "VP, Operations",
        location: "Chicago, IL",
        startDate: new Date(2014, 1, 1),
        endDate: new Date(2019, 2, 1),
        highlights: [
          "Built the fulfillment network that cut delivery windows from 5 days to 2.",
          "Launched a 24/7 operations center that reduced incident response to 4 minutes.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "Northwestern University",
        degree: "MBA",
        field: "Strategy",
        location: "Evanston, IL",
        startDate: new Date(2012, 8, 1),
        endDate: new Date(2014, 5, 1),
      },
      {
        id: "edu2",
        institution: "University of Michigan",
        degree: "B.A.",
        field: "Economics",
        location: "Ann Arbor, MI",
        startDate: new Date(2006, 8, 1),
        endDate: new Date(2010, 5, 1),
      },
    ],
    skills: [
      { name: "Strategy", level: "Expert", category: "Leadership" },
      { name: "M&A Integration", level: "Expert", category: "Leadership" },
      { name: "Financial Planning", level: "Advanced", category: "Finance" },
      { name: "Org Design", level: "Expert", category: "Leadership" },
      { name: "Board Reporting", level: "Advanced", category: "Leadership" },
    ],
    languages: [{ name: "English", proficiency: "Native" }, { name: "Spanish", proficiency: "Professional" }],
    achievements: [{ id: "a1", title: "Board Member", description: "Advisor, Two Rivers Ventures (2022–present)." }],
  },
  marketing: {
    name: "Elena Vasquez",
    title: "Head of Growth Marketing",
    email: "elena.vasquez@email.com",
    phone: "+1 (305) 555-0142",
    location: "Miami, FL",
    linkedin: "linkedin.com/in/elenavasquez",
    summary:
      "Growth marketer with 8 years building channels that compound. Scaled a consumer brand from 20k to 900k users, mastered the full-funnel playbook, and obsess over unit economics over vanity metrics.",
    experience: [
      {
        id: "e1",
        company: "Kinetic Fitness",
        position: "Head of Growth",
        location: "Miami, FL",
        startDate: new Date(2021, 6, 1),
        isCurrent: true,
        highlights: [
          "Scaled monthly active users from 20k to 900k with a blended CAC under $4.",
          "Built a 9-channel acquisition engine spanning paid, content, and referral.",
          "Improved LTV:CAC from 2.1x to 5.3x by revamping the retention loop.",
        ],
      },
      {
        id: "e2",
        company: "Loop Coffee Co.",
        position: "Senior Marketing Manager",
        location: "Denver, CO",
        startDate: new Date(2018, 3, 1),
        endDate: new Date(2021, 5, 1),
        highlights: [
          "Launched a subscription program that reached 60k subscribers in 14 months.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "University of Colorado",
        degree: "B.A.",
        field: "Marketing & Communications",
        location: "Boulder, CO",
        startDate: new Date(2012, 8, 1),
        endDate: new Date(2016, 5, 1),
      },
    ],
    skills: [
      { name: "Performance Marketing", level: "Expert", category: "Acquisition" },
      { name: "SEO & Content", level: "Advanced", category: "Acquisition" },
      { name: "Lifecycle Email", level: "Advanced", category: "Retention" },
      { name: "Analytics", level: "Advanced", category: "Data" },
      { name: "Brand Strategy", level: "Advanced", category: "Brand" },
    ],
    projects: [
      {
        id: "p1",
        name: "The Fitness Flywheel",
        description: "Content engine producing 120 articles/mo ranking in top 5 for 40 target keywords.",
        technologies: ["SEO", "Ahrefs", "GA4"],
      },
    ],
    languages: [{ name: "English", proficiency: "Native" }, { name: "Spanish", proficiency: "Fluent" }],
    achievements: [{ id: "a1", title: "Growth Forum Speaker", description: "Spoke on retention-led growth at SaaS Summit 2024." }],
  },
  researcher: {
    name: "Dr. Jonas Weber",
    title: "Research Scientist",
    email: "j.weber@email.com",
    phone: "+1 (617) 555-0137",
    location: "Cambridge, MA",
    linkedin: "linkedin.com/in/jonasweber",
    summary:
      "Computational biologist with a Ph.D. and 20+ peer-reviewed publications. Design machine-learning models that predict protein interactions, with two methods adopted in clinical pipelines.",
    experience: [
      {
        id: "e1",
        company: "Helix Institute",
        position: "Principal Research Scientist",
        location: "Cambridge, MA",
        startDate: new Date(2019, 6, 1),
        isCurrent: true,
        highlights: [
          "Lead a 5-person lab studying protein–protein interaction prediction.",
          "Secured $2.1M in NIH grant funding as co-PI.",
          "Published 9 first-author papers in Nature Methods and eLife.",
        ],
      },
      {
        id: "e2",
        company: "BioCore Labs",
        position: "Postdoctoral Fellow",
        location: "Boston, MA",
        startDate: new Date(2016, 8, 1),
        endDate: new Date(2019, 5, 1),
        highlights: [
          "Built a graph-neural-network model achieving state-of-the-art docking accuracy.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "ETH Zürich",
        degree: "Ph.D.",
        field: "Computational Biology",
        location: "Zürich, Switzerland",
        startDate: new Date(2012, 8, 1),
        endDate: new Date(2016, 7, 1),
      },
      {
        id: "edu2",
        institution: "University of Vienna",
        degree: "M.S.",
        field: "Bioinformatics",
        location: "Vienna, Austria",
        startDate: new Date(2010, 8, 1),
        endDate: new Date(2012, 6, 1),
      },
    ],
    skills: [
      { name: "Machine Learning", level: "Expert", category: "Methods" },
      { name: "Python", level: "Expert", category: "Tools" },
      { name: "PyTorch", level: "Advanced", category: "Tools" },
      { name: "Bioinformatics", level: "Expert", category: "Domain" },
      { name: "Grant Writing", level: "Advanced", category: "Academic" },
    ],
    projects: [
      {
        id: "p1",
        name: "FoldNet",
        description: "Open-source protein structure prediction toolkit with 3k GitHub stars.",
        technologies: ["PyTorch", "Python"],
        url: "github.com/weberlab/foldnet",
      },
    ],
    certificates: [],
    languages: [{ name: "English", proficiency: "Professional" }, { name: "German", proficiency: "Native" }],
    achievements: [{ id: "a1", title: "Reviewer", description: "Nature Methods, ICML (2022–present)." }],
  },
  teacher: {
    name: "Sarah Lindqvist",
    title: "High School Mathematics Teacher",
    email: "s.lindqvist@email.com",
    phone: "+1 (312) 555-0151",
    location: "Chicago, IL",
    linkedin: "linkedin.com/in/sarahlindqvist",
    summary:
      "Licensed secondary math educator with 9 years raising AP pass rates from 61% to 89%. Build student-centered classrooms where data drives instruction and every learner gets a path to mastery.",
    experience: [
      {
        id: "e1",
        company: "Riverside High School",
        position: "Mathematics Teacher",
        location: "Chicago, IL",
        startDate: new Date(2018, 8, 1),
        isCurrent: true,
        highlights: [
          "Grew AP Calculus pass rate from 61% to 89% over three years.",
          "Introduced a mastery-based grading model adopted department-wide.",
          "Mentored 4 new teachers through a district induction program.",
        ],
      },
      {
        id: "e2",
        company: "Lincoln Middle School",
        position: "Math & Science Teacher",
        location: "Evanston, IL",
        startDate: new Date(2016, 8, 1),
        endDate: new Date(2018, 6, 1),
        highlights: [
          "Led after-school robotics club to a state championship.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "DePaul University",
        degree: "M.Ed.",
        field: "Secondary Education",
        location: "Chicago, IL",
        startDate: new Date(2015, 8, 1),
        endDate: new Date(2016, 6, 1),
      },
      {
        id: "edu2",
        institution: "University of Illinois",
        degree: "B.S.",
        field: "Mathematics",
        location: "Urbana-Champaign, IL",
        startDate: new Date(2011, 8, 1),
        endDate: new Date(2015, 5, 1),
      },
    ],
    skills: [
      { name: "Curriculum Design", level: "Expert", category: "Instruction" },
      { name: "Data-Driven Instruction", level: "Expert", category: "Instruction" },
      { name: "Classroom Management", level: "Expert", category: "Instruction" },
      { name: "Differentiation", level: "Advanced", category: "Instruction" },
    ],
    languages: [{ name: "English", proficiency: "Native" }, { name: "Swedish", proficiency: "Conversational" }],
    certificates: [{ id: "c1", name: "Professional Educator License", issuer: "Illinois State Board", date: new Date(2016, 8, 1) }],
    achievements: [{ id: "a1", title: "Teacher of the Year", description: "Riverside High School, 2022." }],
  },
  medical: {
    name: "Dr. Rachel Osei",
    title: "Registered Nurse",
    email: "r.osei@email.com",
    phone: "+1 (713) 555-0126",
    location: "Houston, TX",
    linkedin: "linkedin.com/in/rachelosei",
    summary:
      "Critical-care RN with 7 years in level-1 trauma centers. Certified in CCRN and TNCC, with a record of improving patient outcomes through evidence-based protocols and calm leadership in high-acuity settings.",
    experience: [
      {
        id: "e1",
        company: "Memorial Health System",
        position: "ICU Registered Nurse",
        location: "Houston, TX",
        startDate: new Date(2019, 1, 1),
        isCurrent: true,
        highlights: [
          "Manage a 12-bed ICU, coordinating care for 90+ patients monthly.",
          "Championed a sepsis protocol that reduced 30-day mortality 14%.",
          "Precept 3 new grads per year through a 12-week residency.",
        ],
      },
      {
        id: "e2",
        company: "Bayou Regional Medical Center",
        position: "Step-Down Unit Nurse",
        location: "Houston, TX",
        startDate: new Date(2017, 6, 1),
        endDate: new Date(2019, 1, 1),
        highlights: [
          "Received DAISY Award nomination for exceptional patient care.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "University of Texas",
        degree: "B.S.N.",
        field: "Nursing",
        location: "Houston, TX",
        startDate: new Date(2014, 8, 1),
        endDate: new Date(2017, 5, 1),
        gpa: "3.9",
      },
    ],
    skills: [
      { name: "Critical Care", level: "Expert", category: "Clinical" },
      { name: "ECG Interpretation", level: "Advanced", category: "Clinical" },
      { name: "Ventilator Management", level: "Advanced", category: "Clinical" },
      { name: "Patient Education", level: "Expert", category: "Care" },
    ],
    languages: [{ name: "English", proficiency: "Native" }, { name: "Twi", proficiency: "Fluent" }],
    certificates: [
      { id: "c1", name: "CCRN", issuer: "AACN", date: new Date(2020, 3, 1) },
      { id: "c2", name: "TNCC", issuer: "ENA", date: new Date(2021, 9, 1) },
    ],
    achievements: [{ id: "a1", title: "BLS/ACLS Instructor", description: "Certified instructor for 50+ staff per year." }],
  },
  finance: {
    name: "Daniel Kim",
    title: "Senior Financial Analyst",
    email: "d.kim@email.com",
    phone: "+1 (206) 555-0194",
    location: "Seattle, WA",
    linkedin: "linkedin.com/in/danielkim",
    summary:
      "Chartered Financial Analyst with 6 years in FP&A and investment analysis. Built the budgeting model for a $400M business unit and cut forecast variance by half. Detail-obsessed, model-first, and fluent in the story behind the numbers.",
    experience: [
      {
        id: "e1",
        company: "Cascade Technologies",
        position: "Senior Financial Analyst",
        location: "Seattle, WA",
        startDate: new Date(2021, 2, 1),
        isCurrent: true,
        highlights: [
          "Owned the $400M BU forecast; cut monthly variance from 9% to 4%.",
          "Built a driver-based model that saved 20 hours of month-end work.",
          "Presented quarterly results to the CFO and board.",
        ],
      },
      {
        id: "e2",
        company: "Meridian Bank",
        position: "Financial Analyst",
        location: "Portland, OR",
        startDate: new Date(2019, 5, 1),
        endDate: new Date(2021, 1, 1),
        highlights: [
          "Supported a $120M portfolio with stress-testing and risk analysis.",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "University of Washington",
        degree: "B.A.",
        field: "Finance",
        location: "Seattle, WA",
        startDate: new Date(2015, 8, 1),
        endDate: new Date(2019, 5, 1),
        gpa: "3.7",
      },
    ],
    skills: [
      { name: "Financial Modeling", level: "Expert", category: "Core" },
      { name: "Excel", level: "Expert", category: "Core" },
      { name: "SQL", level: "Advanced", category: "Data" },
      { name: "FP&A", level: "Expert", category: "Core" },
      { name: "Power BI", level: "Advanced", category: "Data" },
    ],
    languages: [{ name: "English", proficiency: "Native" }, { name: "Korean", proficiency: "Conversational" }],
    certificates: [{ id: "c1", name: "CFA Level III", issuer: "CFA Institute", date: new Date(2023, 8, 1) }],
    achievements: [{ id: "a1", title: "Finance Excellence Award", description: "Cascade Technologies, 2023." }],
  },
};

const FALLBACK_PERSONA = PERSONAS.engineer;

const ROLE_PERSONA = {
  "Software Engineer": "engineer",
  "Full Stack Developer": "engineer",
  "Backend Engineer": "engineer",
  "Product Manager": "product",
  "Program Manager": "product",
  "Marketing Manager": "marketing",
  "Growth Marketer": "marketing",
  "Product Designer": "designer",
  "UX Designer": "designer",
  "Creative Director": "designer",
  Executive: "executive",
  "Chief Executive": "executive",
  Researcher: "researcher",
  "Research Scientist": "researcher",
  Teacher: "teacher",
  "Registered Nurse": "medical",
  Physician: "medical",
  "Financial Analyst": "finance",
  Analyst: "finance",
  Consultant: "executive",
};

export function sampleResumeFor(template) {
  const personaKey = ROLE_PERSONA[template?.jobTitles?.[0]] || "engineer";
  const persona = PERSONAS[personaKey] || FALLBACK_PERSONA;
  return {
    ...persona,
    personal: {
      ...persona.personal,
      title: template?.jobTitles?.[0] || persona.title,
    },
  };
}
