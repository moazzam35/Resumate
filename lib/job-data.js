// ============================================================
// Job Title Intelligence — Local Database & Matching Engine
// ============================================================

// --- Normalization helpers ------------------------------------------------

const SYNONYMS = {
  developer: "developer",
  dev: "developer",
  engineer: "engineer",
  eng: "engineer",
  designer: "designer",
  manager: "manager",
  mgr: "manager",
  administrator: "administrator",
  admin: "administrator",
  analyst: "analyst",
  associate: "associate",
  assistant: "assistant",
  executive: "executive",
  exec: "executive",
  representative: "representative",
  rep: "representative",
  specialist: "specialist",
  consultant: "consultant",
  coordinator: "coordinator",
  officer: "officer",
  director: "director",
  lead: "lead",
  senior: "senior",
  sr: "senior",
  junior: "junior",
  jr: "junior",
  intern: "intern",
  trainee: "trainee",
  architect: "architect",
  scientist: "scientist",
  writer: "writer",
  editor: "editor",
  photographer: "photographer",
  videographer: "photographer",
  lecturer: "lecturer",
  instructor: "instructor",
  teacher: "teacher",
  professor: "professor",
  tutor: "tutor",
  nurse: "nurse",
  doctor: "doctor",
  physician: "doctor",
  lawyer: "lawyer",
  attorney: "lawyer",
  chef: "chef",
  cook: "chef",
  electrician: "electrician",
  plumber: "plumber",
  carpenter: "carpenter",
  driver: "driver",
  nurse: "nurse",
  accountant: "accountant",
  bookkeeper: "accountant",
};

const ABBREVIATIONS = {
  "fe": "frontend",
  "be": "backend",
  "fs": "fullstack",
  "devops": "devops",
  "sre": "site reliability",
  "ml": "machine learning",
  "ai": "artificial intelligence",
  "ux": "user experience",
  "ui": "user interface",
  "pm": "project manager",
  "hr": "human resources",
  "qa": "quality assurance",
  "qa": "quality assurance",
  "cto": "chief technology officer",
  "ceo": "chief executive officer",
  "cfo": "chief financial officer",
  "coo": "chief operating officer",
  "dba": "database administrator",
  "seo": "search engine optimization",
  "smm": "social media marketing",
  "ppc": "pay per click",
  "crm": "customer relationship management",
  "rn": "registered nurse",
  "np": "nurse practitioner",
  "pa": "physician assistant",
  "rn": "registered nurse",
  "cpa": "certified public accountant",
};

const TITLE_SYNONYMS = {
  "frontend developer": "frontend developer",
  "front end developer": "frontend developer",
  "front-end developer": "frontend developer",
  "front end dev": "frontend developer",
  "frontend dev": "frontend developer",
  "react developer": "frontend developer",
  "react dev": "frontend developer",
  "react engineer": "frontend developer",
  "vue developer": "frontend developer",
  "angular developer": "frontend developer",
  "web developer": "frontend developer",
  "web dev": "frontend developer",
  "ui developer": "frontend developer",
  "ui engineer": "frontend developer",
  "javascript developer": "frontend developer",
  "typescript developer": "frontend developer",
  "css developer": "frontend developer",
  "html developer": "frontend developer",

  "backend developer": "backend developer",
  "back end developer": "backend developer",
  "back-end developer": "backend developer",
  "back end dev": "backend developer",
  "backend dev": "backend developer",
  "server side developer": "backend developer",
  "node developer": "backend developer",
  "nodejs developer": "backend developer",
  "node.js developer": "backend developer",
  "python developer": "backend developer",
  "java developer": "backend developer",
  "php developer": "backend developer",
  "ruby developer": "backend developer",
  "golang developer": "backend developer",
  "go developer": "backend developer",
  "c# developer": "backend developer",
  "dotnet developer": "backend developer",
  ".net developer": "backend developer",
  "api developer": "backend developer",

  "full stack developer": "full stack developer",
  "fullstack developer": "full stack developer",
  "full-stack developer": "full stack developer",
  "full stack dev": "full stack developer",
  "fullstack dev": "full stack developer",
  "full-stack dev": "full stack developer",
  "mern stack developer": "full stack developer",
  "mern developer": "full stack developer",
  "mean stack developer": "full stack developer",
  "mean developer": "full stack developer",
  "full stack engineer": "full stack developer",
  "fullstack engineer": "full stack developer",

  "software engineer": "software engineer",
  "software developer": "software engineer",
  "software dev": "software engineer",
  "programmer": "software engineer",
  "coder": "software engineer",
  "applications developer": "software engineer",
  "systems developer": "software engineer",

  "devops engineer": "devops engineer",
  "devops": "devops engineer",
  "devops specialist": "devops engineer",
  "infrastructure engineer": "devops engineer",
  "platform engineer": "devops engineer",
  "site reliability engineer": "devops engineer",
  "sre": "devops engineer",
  "cloud engineer": "devops engineer",
  "aws engineer": "devops engineer",
  "azure engineer": "devops engineer",
  "gcp engineer": "devops engineer",
  "ci cd engineer": "devops engineer",
  "release engineer": "devops engineer",

  "data analyst": "data analyst",
  "data analytics": "data analyst",
  "business analyst": "data analyst",
  "bi analyst": "data analyst",
  "reporting analyst": "data analyst",
  "analytics analyst": "data analyst",

  "data scientist": "data scientist",
  "machine learning engineer": "data scientist",
  "ml engineer": "data scientist",
  "ai engineer": "data scientist",
  "deep learning engineer": "data scientist",
  "nlp engineer": "data scientist",

  "data engineer": "data engineer",
  "etl developer": "data engineer",
  "big data engineer": "data engineer",
  "data architect": "data engineer",

  "cybersecurity analyst": "cybersecurity analyst",
  "cyber security analyst": "cybersecurity analyst",
  "security analyst": "cybersecurity analyst",
  "information security analyst": "cybersecurity analyst",
  "infosec analyst": "cybersecurity analyst",
  "security engineer": "cybersecurity analyst",
  "penetration tester": "cybersecurity analyst",
  "security specialist": "cybersecurity analyst",

  "project manager": "project manager",
  "project coordinator": "project manager",
  "program manager": "project manager",
  "scrum master": "project manager",
  "agile coach": "project manager",
  "delivery manager": "project manager",

  "product manager": "product manager",
  "product owner": "product manager",
  "technical product manager": "product manager",
  "tpm": "product manager",

  "ux designer": "ux designer",
  "user experience designer": "ux designer",
  "ux researcher": "ux designer",
  "ux/ui designer": "ux designer",
  "interaction designer": "ux designer",
  "product designer": "ux designer",

  "ui designer": "ui designer",
  "user interface designer": "ui designer",
  "visual designer": "ui designer",
  "web designer": "ui designer",
  "interface designer": "ui designer",

  "graphic designer": "graphic designer",
  "visual communication designer": "graphic designer",
  "print designer": "graphic designer",
  "layout designer": "graphic designer",

  "teacher": "teacher",
  "school teacher": "teacher",
  "high school teacher": "teacher",
  "elementary teacher": "teacher",
  "primary teacher": "teacher",
  "secondary teacher": "teacher",
  "classroom teacher": "teacher",
  "subject teacher": "teacher",
  "amazon teacher": "teacher",
  "special education teacher": "teacher",
  "esl teacher": "teacher",
  "english teacher": "teacher",
  "math teacher": "teacher",
  "science teacher": "teacher",

  "university lecturer": "university lecturer",
  "college lecturer": "university lecturer",
  "lecturer": "university lecturer",
  "adjunct professor": "university lecturer",
  "assistant professor": "university lecturer",
  "associate professor": "university lecturer",
  "professor": "university lecturer",
  "academic lecturer": "university lecturer",

  "accountant": "accountant",
  "senior accountant": "accountant",
  "junior accountant": "accountant",
  "staff accountant": "accountant",
  "management accountant": "accountant",
  "financial accountant": "accountant",
  "tax accountant": "accountant",
  "cost accountant": "accountant",
  "bookkeeper": "accountant",
  "accounts payable": "accountant",
  "accounts receivable": "accountant",
  "cpa": "accountant",
  "chartered accountant": "accountant",

  "nurse": "nurse",
  "registered nurse": "nurse",
  "rn": "nurse",
  "staff nurse": "nurse",
  "clinical nurse": "nurse",
  "nurse practitioner": "nurse",
  "np": "nurse",
  "licensed practical nurse": "nurse",
  "lpn": "nurse",
  "registered nurse": "nurse",
  "pediatric nurse": "nurse",
  "icu nurse": "nurse",
  "emergency room nurse": "nurse",
  "er nurse": "nurse",
  "operating room nurse": "nurse",
  "surgical nurse": "nurse",
  "cardiac nurse": "nurse",
  "oncology nurse": "nurse",

  "doctor": "doctor",
  "physician": "doctor",
  "general practitioner": "doctor",
  "gp": "doctor",
  "medical doctor": "doctor",
  "md": "doctor",
  "attending physician": "doctor",
  "resident doctor": "doctor",
  "medical officer": "doctor",
  "clinical officer": "doctor",

  "lawyer": "lawyer",
  "attorney": "lawyer",
  "solicitor": "lawyer",
  "legal counsel": "lawyer",
  "legal advisor": "lawyer",
  "corporate lawyer": "lawyer",
  "criminal lawyer": "lawyer",
  "family lawyer": "lawyer",
  "paralegal": "lawyer",

  "architect": "architect",
  "building architect": "architect",
  "landscape architect": "architect",
  "interior architect": "architect",
  "architectural designer": "architect",

  "chef": "chef",
  "head chef": "chef",
  "sous chef": "chef",
  "executive chef": "chef",
  "line cook": "chef",
  "pastry chef": "chef",
  "cook": "chef",
  "kitchen chef": "chef",

  "hotel manager": "hotel manager",
  "hospitality manager": "hotel manager",
  "front office manager": "hotel manager",
  "operations manager hospitality": "hotel manager",
  "resort manager": "hotel manager",
  "innkeeper": "hotel manager",

  "digital marketer": "digital marketer",
  "digital marketing specialist": "digital marketer",
  "digital marketing manager": "digital marketer",
  "online marketer": "digital marketer",
  "internet marketer": "digital marketer",
  "growth marketer": "digital marketer",
  "performance marketer": "digital marketer",
  "sem specialist": "digital marketer",
  "ppc specialist": "digital marketer",

  "marketing manager": "marketing manager",
  "marketing coordinator": "marketing manager",
  "marketing specialist": "marketing manager",
  "brand manager": "marketing manager",
  "content marketing": "marketing manager",
  "marketing director": "marketing manager",
  "chief marketing officer": "marketing manager",
  "cmo": "marketing manager",

  "seo specialist": "seo specialist",
  "seo analyst": "seo specialist",
  "search engine optimizer": "seo specialist",
  "seo manager": "seo specialist",
  "seo expert": "seo specialist",

  "content writer": "content writer",
  "copywriter": "content writer",
  "content creator": "content writer",
  "blog writer": "content writer",
  "technical writer": "content writer",
  "creative writer": "content writer",
  "freelance writer": "content writer",
  "article writer": "content writer",

  "sales executive": "sales executive",
  "sales representative": "sales executive",
  "sales rep": "sales executive",
  "sales associate": "sales executive",
  "account executive": "sales executive",
  "account manager": "sales executive",
  "business development": "sales executive",
  "business development manager": "sales executive",
  "sales manager": "sales executive",
  "sales director": "sales executive",
  "sales consultant": "sales executive",

  "hr manager": "hr manager",
  "human resources manager": "hr manager",
  "hr coordinator": "hr manager",
  "hr specialist": "hr manager",
  "hr generalist": "hr manager",
  "hr business partner": "hr manager",
  "recruiter": "hr manager",
  "talent acquisition": "hr manager",
  "recruitment specialist": "hr manager",
  "people manager": "hr manager",
  "chief people officer": "hr manager",
  "cpo": "hr manager",

  "civil engineer": "civil engineer",
  "structural engineer": "civil engineer",
  "geotechnical engineer": "civil engineer",
  "transportation engineer": "civil engineer",
  "construction engineer": "civil engineer",
  "site engineer": "civil engineer",

  "electrical engineer": "electrical engineer",
  "electronics engineer": "electrical engineer",
  "power engineer": "electrical engineer",
  "control systems engineer": "electrical engineer",

  "mechanical engineer": "mechanical engineer",
  "design engineer": "mechanical engineer",
  "manufacturing engineer": "mechanical engineer",
  "production engineer": "mechanical engineer",
  "quality engineer": "mechanical engineer",
  "automotive engineer": "mechanical engineer",

  "customer support representative": "customer support representative",
  "customer service representative": "customer support representative",
  "customer support agent": "customer support representative",
  "customer service agent": "customer support representative",
  "call center agent": "customer support representative",
  "help desk specialist": "customer support representative",
  "technical support specialist": "customer support representative",
  "support engineer": "customer support representative",
  "client support specialist": "customer support representative",

  "photographer": "photographer",
  "professional photographer": "photographer",
  "photojournalist": "photographer",
  "commercial photographer": "photographer",
  "portrait photographer": "photographer",
  "wedding photographer": "photographer",

  "video editor": "video editor",
  "film editor": "video editor",
  "video producer": "video editor",
  "multimedia editor": "video editor",
  "post production editor": "video editor",
  "motion graphics designer": "video editor",

  "retail associate": "retail associate",
  "sales associate": "retail associate",
  "store associate": "retail associate",
  "shop assistant": "retail associate",
  "customer service associate": "retail associate",
  "retail sales associate": "retail associate",
  "store clerk": "retail associate",

  "warehouse worker": "warehouse worker",
  "warehouse associate": "warehouse worker",
  "warehouse operator": "warehouse worker",
  "stock clerk": "warehouse worker",
  "material handler": "warehouse worker",
  "forklift operator": "warehouse worker",
  "logistics associate": "warehouse worker",
  "fulfillment associate": "warehouse worker",

  "electrician": "electrician",
  "licensed electrician": "electrician",
  "journeyman electrician": "electrician",
  "master electrician": "electrician",
  "maintenance electrician": "electrician",
  "industrial electrician": "electrician",

  "plumber": "plumber",
  "licensed plumber": "plumber",
  "journeyman plumber": "plumber",
  "master plumber": "plumber",
  "pipefitter": "plumber",

  "driver": "driver",
  "delivery driver": "driver",
  "truck driver": "driver",
  "taxi driver": "driver",
  "chauffeur": "driver",
  "bus driver": "driver",
  "courier": "driver",

  "freelancer": "freelancer",
  "freelance": "freelancer",
  "independent contractor": "freelancer",
  "self employed": "freelancer",
  "self-employed": "freelancer",
  "consultant": "freelancer",

  "entrepreneur": "entrepreneur",
  "founder": "entrepreneur",
  "startup founder": "entrepreneur",
  "business owner": "entrepreneur",
  "co founder": "entrepreneur",
  "co-founder": "entrepreneur",

  "graphic designer": "graphic designer",

  "registered nurse": "nurse",

  "software architect": "software engineer",

  "marketing specialist": "marketing manager",

  "financial analyst": "data analyst",

  "social media manager": "digital marketer",
  "social media specialist": "digital marketer",

  "operations manager": "project manager",
  "office manager": "project manager",
  "administrative assistant": "project manager",
  "executive assistant": "project manager",

  "web developer": "frontend developer",
  "mobile developer": "software engineer",
  "android developer": "software engineer",
  "ios developer": "software engineer",
  "flutter developer": "software engineer",
  "react native developer": "software engineer",
};

function normalizeTitle(raw) {
  if (!raw || typeof raw !== "string") return "";
  let t = raw.toLowerCase().trim();
  t = t.replace(/\s+/g, " ");
  t = t.replace(/[^a-z0-9\s\-\.\/#&+]/g, "");
  if (ABBREVIATIONS[t]) t = ABBREVIATIONS[t];
  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    const re = new RegExp("\\b" + abbr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
    t = t.replace(re, full);
  }
  for (const [syn, norm] of Object.entries(SYNONYMS)) {
    const re = new RegExp("\\b" + syn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
    t = t.replace(re, norm);
  }
  if (TITLE_SYNONYMS[t]) t = TITLE_SYNONYMS[t];
  for (const [syn, canonical] of Object.entries(TITLE_SYNONYMS)) {
    const re = new RegExp("\\b" + syn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
    if (re.test(t) && t !== canonical) {
      t = canonical;
      break;
    }
  }
  return t;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// --- Job Database ---------------------------------------------------------

const JOB_DATABASE = [
  // ============ TECHNOLOGY ============
  {
    title: "frontend developer",
    category: "Technology",
    summary: "Frontend developer specializing in building responsive, accessible, and performant user interfaces using modern JavaScript frameworks and CSS techniques.",
    skills: ["JavaScript", "TypeScript", "React", "HTML5", "CSS3", "REST APIs", "Git", "Responsive Design", "Webpack/Vite", "Testing (Jest/Cypress)"],
    responsibilities: [
      "Develop and maintain responsive web applications using modern JavaScript frameworks",
      "Collaborate with designers to implement pixel-perfect UI components",
      "Optimize application performance for speed and scalability",
      "Write clean, maintainable, and well-documented code",
      "Participate in code reviews and mentor junior developers",
      "Ensure cross-browser compatibility and accessibility standards",
    ],
    keywords: ["frontend", "javascript", "react", "html", "css", "responsive design", "web development", "ui", "ux", "single page application", "spa", "component-based"],
  },
  {
    title: "backend developer",
    category: "Technology",
    summary: "Backend developer experienced in designing and implementing server-side logic, APIs, and database architectures to power scalable web applications.",
    skills: ["Node.js", "Python", "Java", "SQL", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL", "Docker", "AWS/GCP", "Git", "CI/CD"],
    responsibilities: [
      "Design and implement scalable server-side applications and RESTful APIs",
      "Develop database schemas and optimize query performance",
      "Build and maintain microservices architecture",
      "Implement authentication, authorization, and security best practices",
      "Write unit and integration tests to ensure code reliability",
      "Collaborate with frontend teams to define API contracts",
    ],
    keywords: ["backend", "api", "server", "database", "node", "python", "java", "rest", "graphql", "microservices", "cloud", "scalability"],
  },
  {
    title: "full stack developer",
    category: "Technology",
    summary: "Full stack developer proficient in both frontend and backend technologies, capable of building end-to-end web applications from database to user interface.",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "SQL/NoSQL", "REST APIs", "Git", "Docker", "AWS", "CI/CD", "Testing"],
    responsibilities: [
      "Build and maintain full-stack web applications across the entire development lifecycle",
      "Design and implement both client-side and server-side components",
      "Develop and optimize database schemas and API endpoints",
      "Integrate third-party services and external APIs",
      "Write comprehensive tests and ensure application reliability",
      "Participate in architecture decisions and code reviews",
    ],
    keywords: ["full stack", "fullstack", "javascript", "react", "node", "api", "database", "mern", "mean", "web development", "end-to-end"],
  },
  {
    title: "software engineer",
    category: "Technology",
    summary: "Software engineer with expertise in designing, developing, and maintaining software systems using industry best practices and modern development methodologies.",
    skills: ["Programming Languages (Python/Java/C++)", "Data Structures", "Algorithms", "System Design", "Git", "CI/CD", "Cloud Services", "Testing", "Agile/Scrum"],
    responsibilities: [
      "Design, develop, and test software applications to meet business requirements",
      "Write clean, scalable, and maintainable code",
      "Participate in architecture design and technical decision-making",
      "Debug and resolve complex technical issues",
      "Collaborate with cross-functional teams using agile methodologies",
      "Contribute to continuous improvement of development processes and tools",
    ],
    keywords: ["software engineer", "software development", "programming", "algorithms", "system design", "engineering", "coding", "problem solving"],
  },
  {
    title: "react developer",
    category: "Technology",
    summary: "React developer specializing in building modern, interactive user interfaces with React ecosystem tools, state management solutions, and performance optimization.",
    skills: ["React", "JavaScript", "TypeScript", "Redux/Zustand", "Next.js", "HTML5", "CSS3", "REST APIs", "Jest/React Testing Library", "Webpack/Vite"],
    responsibilities: [
      "Build and maintain complex React applications with reusable component architectures",
      "Implement state management solutions using Redux, Zustand, or Context API",
      "Optimize React application performance through code splitting and memoization",
      "Integrate RESTful APIs and handle asynchronous data flows",
      "Write unit and integration tests for React components",
      "Collaborate with UX designers to implement accessible and responsive interfaces",
    ],
    keywords: ["react", "javascript", "frontend", "hooks", "components", "state management", "redux", "next.js", "jsx", "virtual dom"],
  },
  {
    title: "devops engineer",
    category: "Technology",
    summary: "DevOps engineer skilled in automating infrastructure, implementing CI/CD pipelines, and ensuring reliable, scalable cloud-based system operations.",
    skills: ["AWS/Azure/GCP", "Docker", "Kubernetes", "Terraform", "Jenkins/GitHub Actions", "Linux", "Monitoring (Grafana/Datadog)", "Ansible", "Bash/Python"],
    responsibilities: [
      "Design and maintain CI/CD pipelines for automated testing and deployment",
      "Manage cloud infrastructure and ensure high availability",
      "Implement infrastructure as code using Terraform or CloudFormation",
      "Monitor system performance and respond to incidents",
      "Automate operational tasks to improve efficiency",
      "Collaborate with development teams to optimize deployment workflows",
    ],
    keywords: ["devops", "ci/cd", "docker", "kubernetes", "aws", "cloud", "infrastructure", "automation", "terraform", "monitoring"],
  },
  {
    title: "data analyst",
    category: "Technology",
    summary: "Data analyst proficient in collecting, analyzing, and interpreting complex datasets to drive data-informed business decisions and operational improvements.",
    skills: ["SQL", "Python/R", "Excel", "Tableau/Power BI", "Statistics", "Data Visualization", "Pandas", "Google Analytics", "Google Sheets", "ETL"],
    responsibilities: [
      "Collect, clean, and analyze large datasets from multiple sources",
      "Create interactive dashboards and reports for stakeholders",
      "Identify trends, patterns, and insights to support business strategy",
      "Develop and maintain automated reporting solutions",
      "Collaborate with teams to define data requirements and KPIs",
      "Present findings and recommendations to non-technical stakeholders",
    ],
    keywords: ["data analysis", "sql", "python", "statistics", "reporting", "dashboards", "analytics", "business intelligence", "etl", "data visualization"],
  },
  {
    title: "data scientist",
    category: "Technology",
    summary: "Data scientist experienced in applying machine learning, statistical modeling, and advanced analytics to extract actionable insights from complex datasets.",
    skills: ["Python", "R", "Machine Learning", "TensorFlow/PyTorch", "SQL", "Statistics", "Deep Learning", "NLP", "Pandas", "Scikit-learn", "Jupyter"],
    responsibilities: [
      "Develop machine learning models to solve business problems",
      "Analyze large datasets to identify patterns and predictive insights",
      "Design and run A/B tests and statistical experiments",
      "Build data pipelines and ETL processes for model training",
      "Communicate findings through visualizations and presentations",
      "Stay current with ML research and implement state-of-the-art techniques",
    ],
    keywords: ["data science", "machine learning", "artificial intelligence", "deep learning", "neural networks", "python", "tensorflow", "statistical modeling", "nlp"],
  },
  {
    title: "cybersecurity analyst",
    category: "Technology",
    summary: "Cybersecurity analyst dedicated to protecting organizational assets through threat detection, vulnerability assessment, and implementation of security best practices.",
    skills: ["Network Security", "SIEM Tools", "Penetration Testing", "Firewall Management", "Incident Response", "Vulnerability Assessment", "Python", "Compliance (ISO/NIST)"],
    responsibilities: [
      "Monitor networks and systems for security breaches and intrusions",
      "Conduct vulnerability assessments and penetration testing",
      "Investigate security incidents and perform root cause analysis",
      "Implement and maintain security policies and procedures",
      "Configure and manage security tools including firewalls and SIEM",
      "Provide security awareness training to organizational staff",
    ],
    keywords: ["cybersecurity", "information security", "network security", "penetration testing", "incident response", "siem", "firewall", "vulnerability", "compliance"],
  },
  {
    title: "mobile developer",
    category: "Technology",
    summary: "Mobile developer experienced in building cross-platform and native mobile applications with focus on performance, usability, and quality user experiences.",
    skills: ["React Native", "Flutter", "Swift", "Kotlin", "JavaScript/TypeScript", "REST APIs", "Firebase", "App Store Deployment", "UI/UX for Mobile"],
    responsibilities: [
      "Design and build mobile applications for iOS and Android platforms",
      "Implement responsive and intuitive mobile user interfaces",
      "Integrate with backend APIs and third-party mobile SDKs",
      "Optimize app performance, battery usage, and memory management",
      "Debug and resolve platform-specific issues",
      "Publish and maintain applications on App Store and Google Play",
    ],
    keywords: ["mobile", "ios", "android", "react native", "flutter", "swift", "kotlin", "app development", "cross-platform", "mobile app"],
  },

  // ============ EDUCATION ============
  {
    title: "teacher",
    category: "Education",
    summary: "Dedicated educator committed to fostering student learning and development through engaging instruction, curriculum design, and differentiated teaching strategies.",
    skills: ["Curriculum Development", "Classroom Management", "Lesson Planning", "Student Assessment", "Differentiated Instruction", "Educational Technology", "Communication", "Patience"],
    responsibilities: [
      "Develop and deliver engaging lesson plans aligned with curriculum standards",
      "Assess student progress through assignments, tests, and evaluations",
      "Create a supportive and inclusive classroom environment",
      "Communicate regularly with parents and guardians regarding student progress",
      "Adapt teaching methods to accommodate diverse learning styles and needs",
      "Participate in professional development and collaborative planning",
    ],
    keywords: ["teaching", "education", "curriculum", "lesson planning", "student assessment", "classroom management", "instruction", "pedagogy"],
  },
  {
    title: "university lecturer",
    category: "Education",
    summary: "University lecturer with expertise in delivering high-quality academic instruction, conducting research, and mentoring students at the post-secondary level.",
    skills: ["Academic Instruction", "Research", "Curriculum Design", "Public Speaking", "Mentoring", "Academic Writing", "Critical Thinking", "Subject Matter Expertise"],
    responsibilities: [
      "Deliver lectures and facilitate discussions for undergraduate and graduate courses",
      "Develop course syllabi, materials, and assessments",
      "Conduct original research and publish academic papers",
      "Mentor and advise students on academic and career matters",
      "Participate in departmental committees and academic governance",
      "Stay current with developments in the field of study",
    ],
    keywords: ["lecturing", "academia", "research", "teaching", "professor", "university", "higher education", "curriculum development", "mentoring"],
  },

  // ============ HEALTHCARE ============
  {
    title: "nurse",
    category: "Healthcare",
    summary: "Compassionate and skilled nurse providing high-quality patient care, medication management, and health education in fast-paced clinical environments.",
    skills: ["Patient Care", "Medication Administration", "Vital Signs Monitoring", "Electronic Health Records (EHR)", "Infection Control", "Patient Education", "CPR/BLS", "Communication"],
    responsibilities: [
      "Provide direct patient care including medication administration and monitoring",
      "Assess patient conditions and document changes in health status",
      "Educate patients and families on health management and treatment plans",
      "Collaborate with physicians and healthcare teams on care plans",
      "Maintain accurate and timely patient records in EHR systems",
      "Ensure compliance with healthcare regulations and safety standards",
    ],
    keywords: ["nursing", "patient care", "clinical", "healthcare", "medical", "hospital", "medication", "vital signs", "ehr", "patient assessment"],
  },
  {
    title: "doctor",
    category: "Healthcare",
    summary: "Medical professional dedicated to diagnosing, treating, and preventing illnesses through evidence-based medicine and compassionate patient-centered care.",
    skills: ["Clinical Diagnosis", "Patient Assessment", "Medical Treatment Planning", "Electronic Health Records", "Medical Procedures", "Communication", "Team Leadership", "Medical Research"],
    responsibilities: [
      "Diagnose and treat acute and chronic medical conditions",
      "Order and interpret diagnostic tests and imaging",
      "Develop comprehensive treatment plans for patients",
      "Perform medical procedures within scope of practice",
      "Educate patients on health maintenance and disease prevention",
      "Collaborate with multidisciplinary healthcare teams",
    ],
    keywords: ["medicine", "clinical", "diagnosis", "treatment", "patient care", "medical", "physician", "healthcare", "hospital", "health"],
  },

  // ============ FINANCE ============
  {
    title: "accountant",
    category: "Finance",
    summary: "Detail-oriented accountant with expertise in financial reporting, tax preparation, and compliance, ensuring accuracy and regulatory adherence in all financial operations.",
    skills: ["Financial Reporting", "Tax Preparation", "GAAP/IFRS", "QuickBooks/SAP", "Accounts Payable/Receivable", "Reconciliation", "Budgeting", "Audit Support", "MS Excel"],
    responsibilities: [
      "Prepare and analyze financial statements and reports",
      "Manage accounts payable and accounts receivable processes",
      "Ensure compliance with tax regulations and prepare tax filings",
      "Perform month-end and year-end closing procedures",
      "Support internal and external audit processes",
      "Maintain accurate financial records and general ledger entries",
    ],
    keywords: ["accounting", "finance", "financial reporting", "tax", "gaap", "bookkeeping", "audit", "ledger", "budgeting", "reconciliation"],
  },
  {
    title: "financial analyst",
    category: "Finance",
    summary: "Financial analyst skilled in evaluating investment opportunities, analyzing market trends, and providing data-driven recommendations to support strategic financial decisions.",
    skills: ["Financial Modeling", "Excel", "SQL", "Data Analysis", "Valuation", "Forecasting", "Power BI/Tableau", "Accounting", "Risk Assessment"],
    responsibilities: [
      "Analyze financial data and prepare detailed reports for management",
      "Build financial models to forecast business performance",
      "Evaluate investment opportunities and assess financial risks",
      "Monitor market trends and competitor activities",
      "Support budgeting and planning processes",
      "Present findings and recommendations to senior leadership",
    ],
    keywords: ["financial analysis", "modeling", "forecasting", "valuation", "investment", "budgeting", "financial planning", "fp&a", "risk analysis"],
  },

  // ============ ENGINEERING ============
  {
    title: "civil engineer",
    category: "Engineering",
    summary: "Civil engineer experienced in planning, designing, and overseeing construction projects including infrastructure, buildings, and transportation systems.",
    skills: ["AutoCAD", "Structural Analysis", "Project Management", "Surveying", "Civil 3D", "MATLAB", "Building Codes", "Construction Management", "MS Project"],
    responsibilities: [
      "Design civil engineering structures and infrastructure projects",
      "Prepare engineering drawings, specifications, and cost estimates",
      "Oversee construction activities to ensure compliance with designs",
      "Conduct site inspections and assess project progress",
      "Collaborate with architects, contractors, and government agencies",
      "Ensure compliance with safety regulations and building codes",
    ],
    keywords: ["civil engineering", "infrastructure", "construction", "structural", "autocad", "building", "design", "project management", "surveying"],
  },
  {
    title: "electrical engineer",
    category: "Engineering",
    summary: "Electrical engineer proficient in designing, developing, and testing electrical systems and components for diverse applications in power, electronics, and control systems.",
    skills: ["Circuit Design", "MATLAB", "AutoCAD Electrical", "PCB Layout", "Power Systems", "Embedded Systems", "PLC Programming", "Signal Processing"],
    responsibilities: [
      "Design electrical systems, circuits, and components",
      "Develop and test prototypes and electrical assemblies",
      "Create detailed technical documentation and schematics",
      "Analyze and resolve electrical engineering problems",
      "Collaborate with multidisciplinary teams on product development",
      "Ensure compliance with electrical safety standards and regulations",
    ],
    keywords: ["electrical engineering", "circuit design", "electronics", "power systems", "embedded systems", "pcb", "schematic", "wiring"],
  },
  {
    title: "mechanical engineer",
    category: "Engineering",
    summary: "Mechanical engineer skilled in designing, analyzing, and manufacturing mechanical systems and components across automotive, aerospace, and industrial sectors.",
    skills: ["SolidWorks", "AutoCAD", "ANSYS", "CAD/CAM", "Thermodynamics", "Fluid Mechanics", "Material Science", "Manufacturing Processes", "GD&T"],
    responsibilities: [
      "Design mechanical components and assemblies using CAD software",
      "Perform engineering analysis including FEA and CFD simulations",
      "Develop and test prototypes to validate design specifications",
      "Create detailed engineering drawings and technical documentation",
      "Collaborate with manufacturing teams on production processes",
      "Resolve engineering issues and implement design improvements",
    ],
    keywords: ["mechanical engineering", "cad", "solidworks", "manufacturing", "design", "thermodynamics", "fabrication", "prototyping", "engineering analysis"],
  },

  // ============ MARKETING ============
  {
    title: "digital marketer",
    category: "Marketing",
    summary: "Results-driven digital marketer experienced in planning and executing online marketing campaigns across multiple channels to drive brand awareness and lead generation.",
    skills: ["SEO/SEM", "Google Ads", "Social Media Marketing", "Content Strategy", "Email Marketing", "Google Analytics", "Marketing Automation", "Copywriting", "PPC"],
    responsibilities: [
      "Plan and execute digital marketing campaigns across multiple channels",
      "Manage paid advertising campaigns on Google Ads and social media platforms",
      "Optimize website content and campaigns for search engine visibility",
      "Analyze campaign performance and prepare detailed marketing reports",
      "Develop content strategies and manage content calendars",
      "Collaborate with design and content teams to create compelling marketing materials",
    ],
    keywords: ["digital marketing", "seo", "sem", "ppc", "social media", "advertising", "content marketing", "email marketing", "analytics", "campaigns"],
  },
  {
    title: "seo specialist",
    category: "Marketing",
    summary: "SEO specialist experienced in improving organic search rankings through technical optimization, content strategy, and comprehensive keyword research.",
    skills: ["Technical SEO", "Keyword Research", "On-Page SEO", "Off-Page SEO", "Google Analytics", "Google Search Console", "Content Optimization", "Link Building", "HTML"],
    responsibilities: [
      "Conduct comprehensive keyword research and competitive analysis",
      "Optimize website content, meta tags, and site architecture for SEO",
      "Perform technical SEO audits and implement fixes",
      "Develop and execute link building strategies",
      "Monitor search engine rankings and algorithm changes",
      "Create detailed SEO performance reports with actionable recommendations",
    ],
    keywords: ["seo", "search engine optimization", "organic search", "keyword research", "on-page seo", "technical seo", "link building", "google analytics"],
  },

  // ============ SALES ============
  {
    title: "sales executive",
    category: "Sales",
    summary: "Dynamic sales executive with a proven track record of exceeding targets, building client relationships, and driving revenue growth through consultative selling.",
    skills: ["Client Relationship Management", "CRM (Salesforce/HubSpot)", "Negotiation", "Lead Generation", "Cold Calling", "Pipeline Management", "Presentation Skills", "Closing"],
    responsibilities: [
      "Identify and pursue new business opportunities through prospecting",
      "Build and maintain strong relationships with existing and potential clients",
      "Present product or service solutions tailored to client needs",
      "Negotiate contracts and close deals to meet or exceed sales targets",
      "Maintain accurate records of sales activities in CRM systems",
      "Collaborate with marketing and product teams on sales strategies",
    ],
    keywords: ["sales", "business development", "revenue", "client relations", "negotiation", "pipeline", "crm", "lead generation", "closing", "account management"],
  },

  // ============ HUMAN RESOURCES ============
  {
    title: "hr manager",
    category: "Human Resources",
    summary: "HR manager experienced in talent acquisition, employee relations, and organizational development, fostering a productive and positive workplace culture.",
    skills: ["Recruitment", "Employee Relations", "HRIS (Workday/BambooHR)", "Compensation & Benefits", "Training & Development", "Labor Law Compliance", "Conflict Resolution", "Performance Management"],
    responsibilities: [
      "Lead end-to-end recruitment and onboarding processes",
      "Manage employee relations and resolve workplace conflicts",
      "Administer compensation, benefits, and payroll programs",
      "Ensure compliance with federal and state employment laws",
      "Develop and implement training and professional development programs",
      "Conduct performance evaluations and manage improvement plans",
    ],
    keywords: ["human resources", "hr", "recruitment", "talent acquisition", "employee relations", "onboarding", "performance management", "compliance", "labor law"],
  },

  // ============ DESIGN ============
  {
    title: "ux designer",
    category: "Design",
    summary: "UX designer passionate about creating intuitive, user-centered digital experiences through research, prototyping, and iterative design processes.",
    skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Usability Testing", "Information Architecture", "Design Systems", "Interaction Design", "HTML/CSS"],
    responsibilities: [
      "Conduct user research including interviews, surveys, and usability testing",
      "Create wireframes, prototypes, and user journey maps",
      "Design intuitive user interfaces that align with business goals",
      "Collaborate closely with product managers and developers",
      "Build and maintain design systems and component libraries",
      "Iterate designs based on user feedback and analytics data",
    ],
    keywords: ["ux", "user experience", "design", "prototyping", "wireframing", "usability", "figma", "research", "user-centered design", "interaction design"],
  },
  {
    title: "ui designer",
    category: "Design",
    summary: "UI designer skilled in crafting visually compelling and consistent user interfaces that enhance brand identity and elevate the user experience.",
    skills: ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "Design Systems", "Typography", "Color Theory", "Responsive Design"],
    responsibilities: [
      "Design visually appealing user interfaces for web and mobile applications",
      "Create UI components, icons, and visual assets",
      "Develop and maintain style guides and design systems",
      "Collaborate with UX designers to implement design solutions",
      "Ensure visual consistency across all digital products",
      "Present design concepts to stakeholders and incorporate feedback",
    ],
    keywords: ["ui", "user interface", "visual design", "figma", "adobe xd", "design systems", "typography", "branding", "graphic design"],
  },
  {
    title: "graphic designer",
    category: "Design",
    summary: "Creative graphic designer with strong visual communication skills, producing compelling designs for print and digital media that align with brand objectives.",
    skills: ["Adobe Photoshop", "Adobe Illustrator", "InDesign", "Typography", "Color Theory", "Layout Design", "Brand Identity", "Print Production"],
    responsibilities: [
      "Design visual content for marketing materials, websites, and social media",
      "Develop brand identity assets including logos, color palettes, and guidelines",
      "Create layouts and compositions for print and digital publications",
      "Collaborate with marketing and content teams on campaign visuals",
      "Prepare print-ready files and manage production processes",
      "Maintain visual consistency across all brand touchpoints",
    ],
    keywords: ["graphic design", "adobe", "photoshop", "illustrator", "branding", "visual communication", "layout", "typography", "print design"],
  },

  // ============ PROJECT MANAGEMENT ============
  {
    title: "project manager",
    category: "Management",
    summary: "Project manager experienced in leading cross-functional teams, managing budgets and timelines, and delivering projects that meet or exceed stakeholder expectations.",
    skills: ["Agile/Scrum", "Jira/Asana", "Budget Management", "Risk Management", "Stakeholder Communication", "Resource Planning", "MS Project", "Leadership", "Problem Solving"],
    responsibilities: [
      "Define project scope, objectives, and deliverables with stakeholders",
      "Develop detailed project plans including timelines and budgets",
      "Lead and coordinate cross-functional teams throughout the project lifecycle",
      "Monitor project progress and proactively address risks and issues",
      "Facilitate daily standups, sprint planning, and retrospectives",
      "Communicate project status to stakeholders and executive leadership",
    ],
    keywords: ["project management", "agile", "scrum", "jira", "stakeholder management", "budget", "timeline", "risk management", "leadership", "delivery"],
  },
  {
    title: "product manager",
    category: "Management",
    summary: "Product manager with expertise in product strategy, roadmapping, and cross-functional leadership to deliver user-centric products that drive business growth.",
    skills: ["Product Strategy", "Agile/Scrum", "User Research", "Data Analysis", "Roadmapping", "Jira", "A/B Testing", "Stakeholder Management", "Market Research"],
    responsibilities: [
      "Define product vision, strategy, and roadmap based on market and user insights",
      "Gather and prioritize product requirements from stakeholders",
      "Work closely with engineering, design, and marketing teams",
      "Analyze product metrics and user behavior to inform decisions",
      "Conduct competitive analysis and identify market opportunities",
      "Launch new features and measure their impact on business goals",
    ],
    keywords: ["product management", "roadmap", "strategy", "agile", "user research", "metrics", "a/b testing", "market analysis", "cross-functional"],
  },

  // ============ CUSTOMER SERVICE ============
  {
    title: "customer support representative",
    category: "Customer Service",
    summary: "Customer support representative skilled in providing exceptional service, resolving issues efficiently, and maintaining high customer satisfaction scores.",
    skills: ["Communication", "Problem Solving", "CRM Software", "Zendesk/Intercom", "Conflict Resolution", "Product Knowledge", "Multitasking", "Empathy", "Active Listening"],
    responsibilities: [
      "Respond to customer inquiries via phone, email, chat, or social media",
      "Resolve customer complaints and escalate complex issues appropriately",
      "Document customer interactions and maintain accurate support records",
      "Provide product or service information to customers",
      "Identify recurring issues and suggest process improvements",
      "Meet or exceed customer satisfaction and response time metrics",
    ],
    keywords: ["customer service", "support", "help desk", "troubleshooting", "communication", "crm", "client satisfaction", "service quality"],
  },

  // ============ HOSPITALITY ============
  {
    title: "chef",
    category: "Hospitality",
    summary: "Skilled chef with expertise in menu planning, food preparation, and kitchen management, delivering exceptional culinary experiences.",
    skills: ["Culinary Arts", "Menu Planning", "Food Safety", "Kitchen Management", "Food Preparation", "Team Leadership", "Inventory Management", "Creativity", "Time Management"],
    responsibilities: [
      "Plan and prepare meals according to menu specifications and recipes",
      "Manage kitchen staff and coordinate food preparation activities",
      "Ensure food quality, presentation, and safety standards are maintained",
      "Order and manage kitchen supplies and food inventory",
      "Develop new menu items and improve existing recipes",
      "Maintain cleanliness and organization of kitchen facilities",
    ],
    keywords: ["chef", "culinary", "cooking", "food preparation", "kitchen management", "menu planning", "food safety", "hospitality"],
  },
  {
    title: "hotel manager",
    category: "Hospitality",
    summary: "Experienced hotel manager overseeing daily operations, guest services, and staff management to ensure exceptional hospitality and profitable business performance.",
    skills: ["Operations Management", "Guest Relations", "Revenue Management", "Staff Training", "Budgeting", "PMS Systems", "Event Planning", "Problem Solving", "Leadership"],
    responsibilities: [
      "Oversee daily hotel operations including front desk, housekeeping, and maintenance",
      "Manage staff recruitment, training, and performance evaluations",
      "Ensure guest satisfaction through proactive service and issue resolution",
      "Develop and manage budgets, pricing strategies, and revenue targets",
      "Coordinate with vendors, suppliers, and contractors",
      "Ensure compliance with health, safety, and hospitality regulations",
    ],
    keywords: ["hotel management", "hospitality", "operations", "guest services", "revenue management", "staff management", "front desk", "housekeeping"],
  },

  // ============ RETAIL ============
  {
    title: "retail associate",
    category: "Retail",
    summary: "Customer-focused retail associate delivering exceptional shopping experiences through product knowledge, sales skills, and attentive customer service.",
    skills: ["Customer Service", "Sales", "POS Systems", "Product Knowledge", "Cash Handling", "Merchandising", "Inventory Management", "Communication"],
    responsibilities: [
      "Assist customers in finding products and provide product recommendations",
      "Process sales transactions accurately using POS systems",
      "Maintain store displays and ensure products are properly merchandised",
      "Handle customer complaints and provide satisfactory resolutions",
      "Monitor inventory levels and assist with stock replenishment",
      "Meet or exceed individual and team sales targets",
    ],
    keywords: ["retail", "customer service", "sales", "cashier", "merchandising", "inventory", "pos", "store operations", "product knowledge"],
  },

  // ============ WAREHOUSE & TRANSPORTATION ============
  {
    title: "warehouse worker",
    category: "Transportation",
    summary: "Reliable warehouse worker experienced in inventory management, order fulfillment, and maintaining safe and organized warehouse operations.",
    skills: ["Inventory Management", "Forklift Operation", "Order Picking", "Shipping & Receiving", "Safety Procedures", "RF Scanners", "Teamwork", "Physical Stamina"],
    responsibilities: [
      "Pick, pack, and ship customer orders accurately and efficiently",
      "Receive and inspect incoming shipments for accuracy and damage",
      "Operate forklifts and material handling equipment safely",
      "Maintain organized warehouse layout and ensure inventory accuracy",
      "Follow safety protocols and report any hazards or incidents",
      "Perform regular inventory counts and reconcile discrepancies",
    ],
    keywords: ["warehouse", "logistics", "inventory", "shipping", "receiving", "forklift", "fulfillment", "supply chain", "order processing"],
  },
  {
    title: "driver",
    category: "Transportation",
    summary: "Dependable driver with a strong safety record, skilled in efficient route planning and timely delivery of goods or passengers.",
    skills: ["Safe Driving", "Route Planning", "Time Management", "Vehicle Maintenance", "Communication", "GPS Navigation", "Customer Service", "Physical Fitness"],
    responsibilities: [
      "Transport goods or passengers safely and efficiently to designated destinations",
      "Plan and follow optimal routes using GPS and mapping tools",
      "Inspect vehicle before and after each trip for maintenance needs",
      "Ensure accurate delivery of packages and obtain required signatures",
      "Maintain a clean driving record and comply with traffic laws",
      "Communicate with dispatch and customers regarding delivery status",
    ],
    keywords: ["driving", "delivery", "transportation", "logistics", "route planning", "logistics", "cdl", "fleet", "last mile delivery"],
  },

  // ============ SKILLED TRADES ============
  {
    title: "electrician",
    category: "Skilled Trades",
    summary: "Licensed electrician skilled in installing, maintaining, and repairing electrical systems in residential, commercial, and industrial settings.",
    skills: ["Electrical Wiring", "Circuit Breakers", "Code Compliance", "Blueprint Reading", "Troubleshooting", "Conduit Bending", "Motor Controls", "OSHA Safety"],
    responsibilities: [
      "Install, maintain, and repair electrical wiring, equipment, and fixtures",
      "Read and interpret electrical blueprints and technical diagrams",
      "Inspect electrical systems for safety hazards and code compliance",
      "Troubleshoot electrical problems and perform necessary repairs",
      "Ensure all work meets National Electrical Code (NEC) standards",
      "Collaborate with contractors and other trades on construction projects",
    ],
    keywords: ["electrical", "wiring", "circuit", "electrician", "nec", "blueprint", "troubleshooting", "maintenance", "installation", "commercial"],
  },
  {
    title: "plumber",
    category: "Skilled Trades",
    summary: "Skilled plumber experienced in installing, repairing, and maintaining plumbing systems including pipes, fixtures, and water heaters in various building types.",
    skills: ["Pipe Fitting", "Water Heaters", "Drain Cleaning", "Fixture Installation", "Blueprint Reading", "Code Compliance", "Soldering", "Problem Solving"],
    responsibilities: [
      "Install and repair water supply lines, drainage systems, and fixtures",
      "Read blueprints and building plans to determine plumbing requirements",
      "Diagnose and resolve plumbing issues including leaks and blockages",
      "Ensure compliance with local plumbing codes and regulations",
      "Install and maintain water heaters, sump pumps, and garbage disposals",
      "Collaborate with general contractors on new construction projects",
    ],
    keywords: ["plumbing", "pipes", "fixtures", "drain", "water heater", "repair", "installation", "maintenance", "commercial plumbing", "residential plumbing"],
  },
  {
    title: "carpenter",
    category: "Skilled Trades",
    summary: "Experienced carpenter skilled in constructing, installing, and repairing structures and fixtures made from wood and other building materials.",
    skills: ["Woodworking", "Blueprint Reading", "Power Tools", "Framing", "Finish Carpentry", "Measurements", "Problem Solving", "Building Codes"],
    responsibilities: [
      "Construct and install wooden structures including frames, walls, and flooring",
      "Read and interpret construction blueprints and specifications",
      "Use hand and power tools to cut, shape, and assemble materials",
      "Install fixtures such as doors, windows, cabinets, and trim",
      "Ensure construction meets building codes and quality standards",
      "Maintain clean and safe work areas following OSHA guidelines",
    ],
    keywords: ["carpentry", "construction", "woodworking", "framing", "finish carpentry", "cabinetry", "building", "renovation", "remodeling"],
  },

  // ============ MEDIA ============
  {
    title: "photographer",
    category: "Media",
    summary: "Creative photographer with expertise in capturing compelling images across commercial, editorial, and portrait photography, using technical proficiency and artistic vision.",
    skills: ["DSLR/Mirrorless Cameras", "Lighting", "Adobe Lightroom", "Photoshop", "Composition", "Retouching", "Client Communication", "Time Management"],
    responsibilities: [
      "Plan and execute photo shoots for commercial, editorial, or portrait sessions",
      "Edit and retouch images to meet creative and brand standards",
      "Manage lighting setups and camera equipment on location or in studio",
      "Collaborate with clients to understand creative requirements and vision",
      "Organize and maintain digital image archives and portfolios",
      "Stay current with photography trends, techniques, and equipment",
    ],
    keywords: ["photography", "camera", "editing", "lightroom", "photoshop", "portrait", "commercial photography", "studio", "visual content"],
  },
  {
    title: "video editor",
    category: "Media",
    summary: "Skilled video editor transforming raw footage into polished, engaging content through expert cutting, color grading, and post-production techniques.",
    skills: ["Adobe Premiere Pro", "Final Cut Pro", "DaVinci Resolve", "After Effects", "Color Grading", "Sound Design", "Storytelling", "Motion Graphics"],
    responsibilities: [
      "Edit and assemble raw video footage into polished final productions",
      "Apply color grading, sound mixing, and visual effects",
      "Collaborate with directors and producers on creative vision",
      "Manage media assets and maintain organized project files",
      "Create motion graphics and titles for video content",
      "Ensure final output meets technical specifications for various platforms",
    ],
    keywords: ["video editing", "premiere pro", "final cut", "davinci resolve", "post-production", "color grading", "motion graphics", "film editing"],
  },
  {
    title: "content writer",
    category: "Media",
    summary: "Versatile content writer creating engaging, SEO-optimized content across blogs, websites, social media, and marketing materials to drive audience engagement.",
    skills: ["SEO Writing", "Content Strategy", "WordPress/CMS", "Copywriting", "Grammar & Editing", "Research", "Social Media", "Google Analytics"],
    responsibilities: [
      "Research industry topics and create well-written, informative content",
      "Optimize content for search engines using SEO best practices",
      "Write blog posts, articles, website copy, and social media content",
      "Edit and proofread content for grammar, clarity, and brand voice",
      "Collaborate with marketing teams on content calendars and campaigns",
      "Analyze content performance metrics and adjust strategies accordingly",
    ],
    keywords: ["writing", "content creation", "seo", "copywriting", "blogging", "editorial", "content marketing", "cms", "proofreading"],
  },

  // ============ ADMINISTRATION ============
  {
    title: "office manager",
    category: "Administration",
    summary: "Organized office manager ensuring smooth daily operations through administrative oversight, vendor management, and efficient coordination of office activities.",
    skills: ["Office Administration", "Microsoft Office", "Scheduling", "Vendor Management", "Budget Tracking", "Communication", "Filing/Records", "Multitasking"],
    responsibilities: [
      "Oversee daily office operations and ensure smooth workflow",
      "Manage office supplies, equipment, and vendor relationships",
      "Coordinate schedules, meetings, and travel arrangements",
      "Handle incoming communications and maintain filing systems",
      "Support management with administrative tasks and reporting",
      "Ensure office environment is organized and welcoming",
    ],
    keywords: ["office management", "administration", "scheduling", "vendor management", "operations", "communication", "organizational", "clerical"],
  },
  {
    title: "executive assistant",
    category: "Administration",
    summary: "Efficient executive assistant providing high-level administrative support to senior leadership, managing complex schedules, and coordinating business operations.",
    skills: ["Calendar Management", "Travel Coordination", "MS Office", "Confidentiality", "Communication", "Event Planning", "Expense Reporting", "Multitasking"],
    responsibilities: [
      "Manage complex calendars and schedule meetings for senior executives",
      "Coordinate travel arrangements including flights, hotels, and itineraries",
      "Prepare correspondence, presentations, and meeting materials",
      "Screen and prioritize incoming communications on behalf of executives",
      "Organize company events, board meetings, and executive retreats",
      "Handle confidential information with discretion and professionalism",
    ],
    keywords: ["executive assistant", "administrative support", "scheduling", "travel", "confidential", "calendar management", "correspondence", "coordination"],
  },
  {
    title: "receptionist",
    category: "Administration",
    summary: "Professional receptionist serving as the first point of contact for visitors and callers, ensuring a welcoming atmosphere and efficient front desk operations.",
    skills: ["Communication", "Customer Service", "Phone Etiquette", "MS Office", "Scheduling", "Multitasking", "Filing", "Problem Solving"],
    responsibilities: [
      "Greet visitors and direct them to appropriate departments or personnel",
      "Answer and route phone calls, taking messages as needed",
      "Manage appointment schedules and conference room bookings",
      "Handle incoming and outgoing mail and deliveries",
      "Maintain reception area and visitor logs",
      "Provide general administrative support to office staff",
    ],
    keywords: ["reception", "front desk", "greeting", "phone", "scheduling", "customer service", "administrative", "office support"],
  },

  // ============ MANUFACTURING ============
  {
    title: "production manager",
    category: "Manufacturing",
    summary: "Production manager experienced in overseeing manufacturing operations, optimizing production processes, and ensuring quality standards are consistently met.",
    skills: ["Production Planning", "Lean Manufacturing", "Quality Control", "Team Leadership", "Inventory Management", "Safety Compliance", "Process Improvement", "ERP Systems"],
    responsibilities: [
      "Plan and manage daily production schedules and workflow",
      "Supervise production staff and ensure adequate training",
      "Monitor production output and quality to meet targets",
      "Implement lean manufacturing principles to reduce waste",
      "Coordinate with supply chain and procurement on material needs",
      "Ensure compliance with safety regulations and quality standards",
    ],
    keywords: ["production", "manufacturing", "lean", "quality control", "operations", "supply chain", "process improvement", "team management"],
  },

  // ============ CONSTRUCTION ============
  {
    title: "construction manager",
    category: "Construction",
    summary: "Experienced construction manager overseeing building projects from planning through completion, ensuring quality, safety, and adherence to budgets and timelines.",
    skills: ["Project Management", "Budget Management", "Blueprint Reading", "OSHA Compliance", "Contractor Management", "Scheduling", "Quality Control", "Communication"],
    responsibilities: [
      "Plan and coordinate all aspects of construction projects from start to finish",
      "Manage budgets, timelines, and resource allocation for projects",
      "Supervise subcontractors and ensure work meets quality standards",
      "Ensure compliance with building codes, safety regulations, and permits",
      "Communicate project progress to clients and stakeholders",
      "Resolve construction issues and implement corrective actions promptly",
    ],
    keywords: ["construction", "project management", "building", "contractor", "budget", "safety", "blueprints", "scheduling", "site management"],
  },

  // ============ GENERAL ============
  {
    title: "freelancer",
    category: "General",
    summary: "Versatile freelancer delivering high-quality work across multiple projects, managing client relationships, and consistently meeting deadlines independently.",
    skills: ["Self-Management", "Time Management", "Client Communication", "Project Management", "Negotiation", "Marketing", "Invoicing", "Adaptability"],
    responsibilities: [
      "Manage multiple client projects independently from start to finish",
      "Communicate regularly with clients to understand requirements and expectations",
      "Deliver high-quality work within agreed timelines and budgets",
      "Market services and acquire new clients through networking and referrals",
      "Handle invoicing, contracts, and business administration",
      "Stay current with industry trends and continuously improve skills",
    ],
    keywords: ["freelance", "independent", "self-employed", "client management", "project delivery", "consulting", "contract work", "remote work"],
  },
  {
    title: "entrepreneur",
    category: "General",
    summary: "Visionary entrepreneur with experience building businesses from the ground up, driving growth through innovation, strategic planning, and effective team leadership.",
    skills: ["Business Strategy", "Leadership", "Financial Planning", "Marketing", "Sales", "Fundraising", "Networking", "Risk Management", "Innovation"],
    responsibilities: [
      "Develop and execute business strategies to achieve growth objectives",
      "Build and lead high-performing teams to drive company success",
      "Manage finances including budgets, fundraising, and investor relations",
      "Identify market opportunities and develop innovative products or services",
      "Build and maintain relationships with partners, investors, and stakeholders",
      "Drive marketing and sales efforts to acquire and retain customers",
    ],
    keywords: ["entrepreneurship", "startup", "business development", "leadership", "innovation", "fundraising", "growth", "strategy", "founder"],
  },
];

// --- Matching Engine ------------------------------------------------------

const _dbMap = new Map();
for (const entry of JOB_DATABASE) {
  _dbMap.set(entry.title, entry);
}

const _dbTokens = new Map();
for (const entry of JOB_DATABASE) {
  _dbTokens.set(entry.title, new Set(tokenize(entry.title)));
}

export function lookupJobLocally(rawTitle) {
  if (!rawTitle || typeof rawTitle !== "string") return null;
  const normalized = normalizeTitle(rawTitle);
  if (!normalized) return null;

  if (_dbMap.has(normalized)) {
    return { ..._dbMap.get(normalized), matchedTitle: rawTitle, matchType: "exact" };
  }

  const normalizedTokens = new Set(tokenize(normalized));
  let bestMatch = null;
  let bestScore = 0;

  for (const [dbTitle, entry] of _dbMap) {
    const dbTokens = _dbTokens.get(dbTitle);
    if (!dbTokens) continue;

    const inputOnly = new Set([...normalizedTokens].filter((t) => !["developer", "engineer", "designer", "manager", "specialist", "analyst", "executive", "associate", "representative", "consultant", "coordinator", "officer", "senior", "junior", "sr", "jr", "lead", "intern", "architect", "specialist"].includes(t)));
    const dbOnly = new Set([...dbTokens].filter((t) => !["developer", "engineer", "designer", "manager", "specialist", "analyst", "executive", "associate", "representative", "consultant", "coordinator", "officer", "senior", "junior", "sr", "jr", "lead", "intern", "architect", "specialist"].includes(t)));

    const intersection = new Set([...inputOnly].filter((t) => dbOnly.has(t)));
    const union = new Set([...inputOnly, ...dbOnly]);

    if (union.size === 0) continue;
    const jaccard = intersection.size / union.size;

    let score = jaccard;
    if (normalized === dbTitle) score = 1.0;
    else if (normalizedTokens.size > 0 && dbTokens.size > 0) {
      const allDbTokens = [...dbTokens];
      const matchCount = allDbTokens.filter((t) => normalizedTokens.has(t)).length;
      const containment = matchCount / Math.max(allDbTokens.length, 1);
      score = Math.max(jaccard, containment * 0.9);
    }

    if (score > bestScore && score >= 0.4) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch) {
    return { ...bestMatch, matchedTitle: rawTitle, matchType: bestScore >= 0.9 ? "exact" : "fuzzy" };
  }

  return null;
}

export function getGenericFallback(rawTitle) {
  const normalized = normalizeTitle(rawTitle);
  const tokens = tokenize(normalized);
  const roleWords = ["developer", "engineer", "designer", "manager", "analyst", "specialist", "coordinator", "representative", "associate", "executive", "consultant", "officer", "director", "lead", "teacher", "nurse", "doctor", "chef", "electrician", "plumber", "driver", "writer", "editor", "photographer"];
  let category = "General";
  let roleLabel = rawTitle;
  for (const token of tokens) {
    for (const rw of roleWords) {
      if (token === rw || rw.includes(token) || token.includes(rw)) {
        const catMap = {
          developer: "Technology",
          engineer: "Engineering",
          designer: "Design",
          manager: "Management",
          analyst: "Technology",
          specialist: "General",
          coordinator: "Administration",
          representative: "Customer Service",
          associate: "Retail",
          executive: "Sales",
          consultant: "General",
          officer: "Administration",
          director: "Management",
          lead: "Management",
          teacher: "Education",
          nurse: "Healthcare",
          doctor: "Healthcare",
          chef: "Hospitality",
          electrician: "Skilled Trades",
          plumber: "Skilled Trades",
          driver: "Transportation",
          writer: "Media",
          editor: "Media",
          photographer: "Media",
        };
        category = catMap[rw] || "General";
        roleLabel = rawTitle;
        break;
      }
    }
    if (category !== "General") break;
  }
  return {
    title: rawTitle,
    category,
    summary: `Professional ${roleLabel} with experience in delivering high-quality results. Dedicated to continuous improvement, collaboration, and achieving organizational goals.`,
    skills: ["Communication", "Problem Solving", "Teamwork", "Time Management", "Adaptability", "Organization", "Attention to Detail", "Professionalism"],
    responsibilities: [
      "Perform core duties and responsibilities associated with the role",
      "Collaborate with team members to achieve departmental objectives",
      "Maintain professional standards and follow organizational policies",
      "Contribute to process improvements and operational efficiency",
      "Communicate effectively with stakeholders at all levels",
      "Stay current with industry trends and professional development",
    ],
    keywords: [rawTitle.toLowerCase(), category.toLowerCase(), "professional", "teamwork", "communication", "problem solving"],
    matchedTitle: rawTitle,
    matchType: "fallback",
  };
}

export { normalizeTitle, JOB_DATABASE };
