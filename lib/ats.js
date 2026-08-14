const STOPWORDS = new Set([
  "a","an","the","and","or","but","if","then","else","for","nor","of","to","in","on","at","by","with",
  "as","from","is","are","was","were","be","been","being","have","has","had","do","does","did","will",
  "would","can","could","should","may","might","must","shall","this","that","these","those","it","its",
  "we","our","ours","you","your","yours","they","them","their","he","she","his","her","i","me","my",
  "who","whom","which","what","where","when","why","how","all","any","both","each","few","more","most",
  "other","some","such","no","nor","not","only","own","same","so","than","too","very","just","also",
  "well","per","via","etc","including","including","about","into","over","after","before","between",
  "under","again","further","once","here","there","up","down","out","off","above","below","during",
  "through","among","across","along","around","within","without","because","while","since","until",
  "job","jobs","role","roles","position","positions","work","working","experience","years","year",
  "required","requirements","requirement","preferred","must","plus","etc","team","company","responsibilities",
  "responsibility","duties","qualifications","qualification","will","ability","able","knowledge","understanding",
  "experiencewith","looking","seeking","new","great","strong","good","excellent","related","etc","use","using",
  "developer","developers","engineer","engineers","engineering","senior","junior","candidate","candidates",
  "manager","management","technical","proficiency","passionate","skilled","experienced","software","full",
  "stack","frontend","backend","position","apply","please","linkedin","indeed","glassdoor",
]);

const ACTION_VERBS = new Set([
  "achieved","accelerated","accomplished","administered","advised","analyzed","architected","authored",
  "automated","built","collaborated","communicated","coordinated","created","cut","delivered","designed",
  "developed","directed","drove","enhanced","engineered","established","evaluated","executed","expanded",
  "facilitated","fixed","generated","grew","guided","implemented","improved","increased","influenced",
  "initiated","launched","led","managed","mentored","negotiated","optimized","organized","oversaw","performed",
  "pioneered","planned","produced","reduced","reorganized","resolved","revamped","saved","scaled","shipped",
  "spearheaded","streamlined","strengthened","supervised","trained","transformed","upgraded","wrote",
  "owned","built","led","delivered","shipped","launched","migrated","modernized","refactored","automated",
  "implemented","designed","developed","engineered","integrated","maintained","monitored","reduced",
  "increased","improved","optimized","achieved","drove","established","created","founded","grew",
]);

const TECH_KEYWORDS = new Set([
  "react","react.js","reactjs","react native","next.js","nextjs","typescript","javascript","node.js",
  "nodejs","express","express.js","python","java","c++","c#","dotnet","php","ruby","ruby on rails","go",
  "golang","sql","mysql","postgresql","postgres","mongodb","redis","dynamodb","aws","azure","gcp",
  "google cloud","docker","kubernetes","k8s","ci/cd","github actions","jenkins","git","html","css",
  "tailwind","bootstrap","graphql","rest","restful","api","microservices","terraform","ansible","kafka",
  "hadoop","spark","airflow","snowflake","databricks","django","flask","spring","spring boot","vue",
  "vue.js","angular","angularjs","svelte","flutter","swift","kotlin","objective-c","machine learning",
  "deep learning","nlp","natural language processing","pandas","numpy","tensorflow","pytorch","scikit-learn",
  "llm","prompt engineering","excel","power bi","tableau","salesforce","agile","scrum","jira","figma",
  "adobe photoshop","photoshop","linux","unix","bash","powershell","selenium","playwright","jest","cypress",
  "webpack","vite","redux","zustand","grpc","websocket","oauth","jwt","security","cybersecurity","etl",
  "data pipeline","sql server","oracle","elasticsearch","solr","rabbitmq","celery","redis","nginx",
  "ai","ml","fastapi","nestjs","k8s","sass","scss","gitlab ci","circleci","mocha","vitest","graphql",
  "grafana","prometheus","datadog","newrelic","cassandra","pulsar","sqlite","hibernate","fastify",
]);

const BONUS_KEYWORDS = [
  "team collaboration","cross-functional","stakeholder management","mentorship","leadership","product roadmap",
  "ownership","scalability","automation","performance optimization","data-driven","kpis","okrs","agile delivery",
  "continuous improvement","customer-facing","problem solving","communication","time management","high-volume",
];

const STANDARD_HEADINGS = [
  { key: "contact", label: "Contact", matches: ["contact","contact information","personal information","personal details"] },
  { key: "summary", label: "Professional Summary", matches: ["professional summary","career summary","summary","profile","professional profile","objective","career objective","about me","about"] },
  { key: "experience", label: "Work Experience", matches: ["work experience","professional experience","experience","employment history","employment","work history","career history"] },
  { key: "education", label: "Education", matches: ["education","academic background","education background","academic history"] },
  { key: "skills", label: "Skills", matches: ["skills","technical skills","core competencies","competencies","expertise","technologies","technical expertise","tech stack"] },
  { key: "projects", label: "Projects", matches: ["projects","personal projects","key projects","featured projects","selected projects"] },
  { key: "certificates", label: "Certifications", matches: ["certifications","certificates","licenses","certifications & licenses","certifications and licenses"] },
  { key: "languages", label: "Languages", matches: ["languages","spoken languages","language"] },
  { key: "achievements", label: "Achievements", matches: ["achievements","awards","honors","accomplishments","awards & honors","awards and honors"] },
  { key: "references", label: "References", matches: ["references","available upon request"] },
];

const DEGREE_KEYWORDS = [
  "bachelor","b.sc","b.s","bs","bsc","b.a","ba","master","m.sc","m.s","ms","msc","mba","ph.d","phd",
  "doctorate","associate","b.eng","beng","m.eng","meng","btech","mtech","llb","llm","high school","diploma",
];

const INSTITUTION_KEYWORDS = ["university","college","institute","school","academy","polytechnic"];

const FIELD_KEYWORDS = [
  "computer science","software engineering","information technology","data science","business administration",
  "engineering","mathematics","physics","economics","finance","marketing","communication","psychology",
  "design","management","accounting","statistics","chemistry","biology","law","english","history",
];

const EXPERIENCE_MARKERS = [" at ", " @ ", "—", "–"];

const COMMON_TYPOS = [
  "teh","recieve","seperate","definately","occured","untill","wich","thier","adress",
  "alot","acheive","experiance","accomodate","wierd","grammer","goverment","neccessary",
  "posession","existance","priveledge",
];

const JD_FLUFF = new Set([
  "experience","communication","written","verbal","interpersonal","skills","ability","understanding",
  "familiarity","working","environment","looking","candidate","candidates","hiring","collaborate",
  "collaborative","ownership","attention","detail","deadline","prioritize","paced","startup","exciting",
  "passionate","learn","learning","quick","adapt","adaptable","preferred","required","qualifications",
  "qualification","responsibilities","responsibility","duties","expectations","company","mission","values",
  "benefits","salary","strong","excellent","good","great","best","top","global","remote","hybrid","office",
  "onsite","contract","opportunity","growth","develop","developing","development","product","products",
  "design","designing","build","building","builds","deliver","delivering","support","supporting",
  "maintain","maintaining","manage","managing","lead","leading","own","owning","drive","driving",
  "create","creating","shipping","ship","deploy","deploying","monitor","monitoring","review","reviews",
  "along","within","without","across","through","during","based","related","including","software",
  "engineer","engineering","knowledge","solid","deep","proven","track","record","nice","etc","plus",
  "years","year","experiencewith","senior","junior","mid","level","fast","growing","incredible","amazing",
  "dynamic","collaboration","stakeholder","stakeholders","productivity","efficiency","reliability",
  "performance","quality","high","modern","cutting","edge","latest","technologies","technology","tools",
  "stacks","engineering","teams","team","cross","functional",
]);

// Synonym groups: first entry is the canonical (normalized) term, the rest are
// alternative spellings/names that should count as the same technology.
const SYNONYM_GROUPS = [
  ["reactjs", ["react", "react js"]],
  ["react native", ["reactnative"]],
  ["nodejs", ["node", "node js"]],
  ["nextjs", ["next js"]],
  ["typescript", ["ts"]],
  ["javascript", ["js"]],
  ["rest", ["restful", "rest api", "rest apis", "restful api", "restful apis"]],
  ["aws", ["amazon web services", "aws cloud"]],
  ["gcp", ["google cloud", "google cloud platform"]],
  ["azure", ["microsoft azure"]],
  ["kubernetes", ["k8s"]],
  ["cicd", ["ci cd", "ci/cd", "continuous integration", "continuous delivery", "continuous deployment", "cicd"]],
  ["fullstack", ["full stack", "full-stack", "fullstack"]],
  ["frontend", ["front end", "front-end", "frontend"]],
  ["backend", ["back end", "back-end", "backend"]],
  ["machine learning", ["ml", "machinelearning"]],
  ["artificial intelligence", ["ai"]],
  ["natural language processing", ["nlp"]],
  ["angular", ["angularjs", "angular js"]],
  ["postgresql", ["postgres"]],
  ["mongodb", ["mongo"]],
  ["sql", ["structured query language"]],
  ["vuejs", ["vue", "vue js"]],
  ["express", ["expressjs", "express js"]],
  ["sqlite", []],
  ["go", ["golang"]],
  ["kotlin", []],
];

// Related technology families: skills in the same family are related but not
// identical, so matching one gives partial credit toward another.
const RELATED_FAMILIES = [
  ["javascript","typescript","reactjs","nodejs","nextjs","angular","vuejs","svelte","redux","express","graphql","jest","webpack","vite","react native"],
  ["python","django","flask","pandas","numpy","tensorflow","pytorch","scikit-learn","fastapi"],
  ["sql","mysql","postgresql","sqlite","oracle","sql server"],
  ["mongodb","redis","dynamodb","cassandra","elasticsearch","solr"],
  ["aws","azure","gcp"],
  ["docker","kubernetes","terraform","ansible"],
  ["jenkins","github actions","gitlab ci","circleci"],
  ["css","tailwind","bootstrap","sass","scss"],
  ["jest","cypress","playwright","selenium","mocha","vitest"],
  ["grafana","prometheus","datadog","newrelic"],
  ["kafka","rabbitmq","celery","pulsar"],
  ["agile","scrum","kanban"],
  ["c++","c#","java","go","rust"],
  ["spring","spring boot","hibernate"],
  ["express","fastify","nestjs"],
  ["grpc","rest","graphql"],
];

const DISPLAY_OVERRIDES = {
  reactjs: "React",
  "react native": "React Native",
  nodejs: "Node.js",
  nextjs: "Next.js",
  typescript: "TypeScript",
  javascript: "JavaScript",
  rest: "REST",
  aws: "AWS",
  gcp: "Google Cloud",
  azure: "Azure",
  kubernetes: "Kubernetes",
  cicd: "CI/CD",
  fullstack: "Full-stack",
  frontend: "Frontend",
  backend: "Backend",
  "machine learning": "Machine Learning",
  "artificial intelligence": "AI",
  "natural language processing": "NLP",
  angular: "Angular",
  postgresql: "PostgreSQL",
  mongodb: "MongoDB",
  sql: "SQL",
  vuejs: "Vue.js",
  express: "Express",
  sqlite: "SQLite",
  go: "Go",
  kotlin: "Kotlin",
  api: "API",
  "ci/cd": "CI/CD",
};

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TECH_KEYWORDS_NORM = new Set([...TECH_KEYWORDS].map((t) => normalize(t)));
const DEGREE_KEYWORDS_NORM = new Set(DEGREE_KEYWORDS.map((d) => normalize(d)));
const INSTITUTION_KEYWORDS_NORM = new Set(INSTITUTION_KEYWORDS.map((i) => normalize(i)));

const TECH_DISPLAY = new Map([...TECH_KEYWORDS].map((t) => [normalize(t), t]));

// Build canonical synonym maps.
const ALIAS_TO_CANONICAL = new Map();
const CANONICAL_ALIASES = new Map();
for (const [canon, aliases] of SYNONYM_GROUPS) {
  const c = normalize(canon);
  if (!c) continue;
  const list = [...new Set([c, ...aliases.map(normalize)].filter(Boolean))];
  CANONICAL_ALIASES.set(c, list);
  for (const a of list) {
    if (!ALIAS_TO_CANONICAL.has(a)) ALIAS_TO_CANONICAL.set(a, c);
  }
}
for (const t of TECH_KEYWORDS_NORM) {
  if (!ALIAS_TO_CANONICAL.has(t)) ALIAS_TO_CANONICAL.set(t, t);
}
const CANONICALS = [...new Set(ALIAS_TO_CANONICAL.values())];

// Canonical -> list of related canonicals.
const FAMILY_OF = new Map();
for (const fam of RELATED_FAMILIES) {
  const normFam = [...new Set(fam.map(normalize).map((f) => ALIAS_TO_CANONICAL.get(f) || f))];
  for (const m of normFam) {
    const existing = FAMILY_OF.get(m) || [];
    FAMILY_OF.set(m, [...new Set([...existing, ...normFam])]);
  }
}

function getWords(text) {
  return normalize(text).split(" ").filter(Boolean);
}

function countWords(text) {
  return getWords(text).length;
}

function hasContent(line) {
  return getWords(line).length > 1;
}

function isBulletLine(line) {
  return /^\s*[-*•▪◦]\s+|\d+[.)]\s+/.test(line);
}

function splitSentences(text) {
  return String(text || "")
    .split(/[.!?]+\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => countWords(s) > 2);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Match a normalized term inside normalized text using word boundaries so that
 * "sql" does not match "nosql" and "js" does not match "json".
 */
function containsTerm(normText, term) {
  const t = String(term || "").trim();
  if (!t) return false;
  const re = new RegExp("(^|[^a-z0-9+#])" + escapeRegExp(t) + "([^a-z0-9+#]|$)");
  return re.test(normText);
}

/**
 * How strongly a skill canonical appears on the resume: 1 = exact/synonym
 * match, 0.6 = related technology in the same family, 0 = no match.
 */
function matchSkillStrength(resumeNorm, canonical) {
  const aliases = CANONICAL_ALIASES.get(canonical) || [canonical];
  for (const a of aliases) {
    if (containsTerm(resumeNorm, a)) return 1;
  }
  const fam = FAMILY_OF.get(canonical);
  if (fam) {
    for (const other of fam) {
      if (other === canonical) continue;
      const oa = CANONICAL_ALIASES.get(other) || [other];
      for (const a of oa) {
        if (containsTerm(resumeNorm, a)) return 0.6;
      }
    }
  }
  return 0;
}

function countTechMentions(normText) {
  let n = 0;
  for (const c of CANONICALS) {
    if (matchSkillStrength(normText, c) > 0) n++;
  }
  return n;
}

const TECH_ACRONYMS = new Set([
  "aws","gcp","api","sql","css","html","http","https","jwt","oauth","grpc","rest","ci","cd",
  "ml","ai","nlp","llm","json","etl","kpi","k8s","cms","sdk","ui","ux","db","cli","devops",
]);

function titleTech(s) {
  return String(s || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => (TECH_ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function displayOf(canonical, fallback) {
  const d = DISPLAY_OVERRIDES[canonical];
  if (d) return d;
  const raw = TECH_DISPLAY.get(canonical) || fallback || canonical;
  return titleTech(raw);
}

function metricCount(raw) {
  const s = String(raw || "");
  const patterns = [
    /\d+(\.\d+)?\s*(%|percent)/gi,
    /\$\s?\d[\d,.]*/g,
    /\b\d[\d,]*\s*(users|clients|customers|orders|requests|rpm|qps|ms|seconds|minutes|hours|days|weeks|months|revenue|sales|conversions|tickets|bugs|defects|downtime|uptime|countries|teams|people|employees|reviews|downloads|searches|queries|transactions)\b/gi,
    /\b(increased|decreased|reduced|improved|grew|saved|cut|boosted|doubled|tripled|accelerated|raised|lowered|eliminated|slashed|shortened|expanded)\b/gi,
  ];
  let n = 0;
  for (const p of patterns) n += (s.match(p) || []).length;
  return n;
}

/**
 * A line is treated as a section heading when it is the heading itself, or the
 * heading plus a short qualifier (e.g. "Relevant Work Experience"). Lines like
 * "Languages: JavaScript, TypeScript" inside a skills block must NOT be treated
 * as headings.
 */
function headingMatch(low, match) {
  if (low === match || low === match.replace(/\s/g, "")) return true;
  if (low.includes(match)) {
    return countWords(low) <= countWords(match) + 1;
  }
  return false;
}

function detectSections(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections = [];
  lines.forEach((line, i) => {
    const low = normalize(line).replace(/:$/, "");
    for (const heading of STANDARD_HEADINGS) {
      const hit = heading.matches.some((m) => headingMatch(low, m));
      if (hit) {
        sections.push({ key: heading.key, label: heading.label, line: line, index: i });
        break;
      }
    }
  });
  return sections;
}

function sectionContentMap(text, sections) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const map = {};
  sections.forEach((section, i) => {
    const start = section.index + 1;
    const end = i + 1 < sections.length ? sections[i + 1].index : lines.length;
    const body = lines.slice(start, end).join("\n");
    map[section.key] = body;
  });
  return map;
}

/**
 * Locate section spans on RAW lines (blank lines preserved) so we can
 * extract and replace sections without corrupting the resume text.
 * @returns {Array<{key: string, start: number}>} start = raw line index of the heading
 */
function findSectionSpans(text) {
  const rawLines = String(text || "").split(/\r?\n/);
  const spans = [];
  rawLines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const low = normalize(trimmed).replace(/:$/, "");
    for (const heading of STANDARD_HEADINGS) {
      if (heading.matches.some((m) => headingMatch(low, m))) {
        spans.push({ key: heading.key, start: i });
        break;
      }
    }
  });
  return spans;
}

/**
 * Extract the raw content of a section (everything after its heading until the
 * next heading). Returns "" when the section is missing.
 */
export function getSectionContent(text, key) {
  const spans = findSectionSpans(text);
  const rawLines = String(text || "").split(/\r?\n/);
  const idx = spans.findIndex((s) => s.key === key);
  if (idx === -1) return "";
  const start = spans[idx].start + 1;
  const end = idx + 1 < spans.length ? spans[idx + 1].start : rawLines.length;
  return rawLines.slice(start, end).join("\n").trim();
}

/**
 * Replace a section's content in place, preserving everything else.
 * Appends a new section (with a proper heading) when the section is missing.
 */
function replaceSection(text, key, newContent) {
  const spans = findSectionSpans(text);
  const rawLines = String(text || "").split(/\r?\n/);
  const contentLines = String(newContent || "").split(/\r?\n/).map((l) => l.trimEnd());

  const idx = spans.findIndex((s) => s.key === key);
  if (idx === -1) {
    const trimmed = String(newContent || "").trim();
    if (!trimmed) return text;
    const label = STANDARD_HEADINGS.find((h) => h.key === key)?.label || key[0].toUpperCase() + key.slice(1);
    const prefix = rawLines.join("\n").trimEnd();
    return `${prefix}\n\n${label}\n${trimmed}\n`;
  }

  const start = spans[idx].start + 1;
  const end = idx + 1 < spans.length ? spans[idx + 1].start : rawLines.length;
  return [...rawLines.slice(0, start), ...contentLines, ...rawLines.slice(end)].join("\n");
}

/**
 * Extract the technologies and role-relevant keywords that a job description
 * emphasizes. Tech terms are weighted more heavily; role keywords only count
 * when they appear at least twice so one-off fluff never tanks the score.
 */
function extractJdTerms(jobDescription) {
  const words = getWords(jobDescription);
  const techCounts = new Map(); // canonical -> { count, label }
  const addTech = (term) => {
    if (!ALIAS_TO_CANONICAL.has(term)) return;
    const canon = ALIAS_TO_CANONICAL.get(term);
    const existing = techCounts.get(canon) || { count: 0, label: term };
    existing.count += 1;
    if (term.length > existing.label.length) existing.label = term;
    techCounts.set(canon, existing);
  };

  for (let i = 0; i < words.length; i++) {
    addTech(words[i]);
    if (i + 1 < words.length) addTech(words[i] + " " + words[i + 1]);
    if (i + 2 < words.length) addTech(words[i] + " " + words[i + 1] + " " + words[i + 2]);
  }

  const tech = [...techCounts.entries()]
    .map(([canonical, { count, label }]) => ({
      canonical,
      label: displayOf(canonical, label),
      count,
      weight: 1.5 + Math.min(count, 3) * 0.5,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 20);

  const roleFreq = new Map();
  for (const w of words) {
    if (w.length < 4) continue;
    if (!/[a-z]/.test(w)) continue;
    if (STOPWORDS.has(w)) continue;
    if (JD_FLUFF.has(w)) continue;
    if (ALIAS_TO_CANONICAL.has(w)) continue;
    roleFreq.set(w, (roleFreq.get(w) || 0) + 1);
  }

  const role = [...roleFreq.entries()]
    .filter(([, c]) => c >= 2)
    .map(([term, count]) => ({ term, count, weight: 1 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return { tech, role };
}

function keywordGroups(resumeNorm, jobDescription) {
  const { tech, role } = extractJdTerms(jobDescription);
  const matched = [];
  const missing = [];
  for (const t of tech) {
    if (matchSkillStrength(resumeNorm, t.canonical) >= 1) matched.push(t.label);
    else missing.push(t.label);
  }
  for (const r of role) {
    if (containsTerm(resumeNorm, r.term)) matched.push(r.term);
    else missing.push(r.term);
  }

  const jdWords = getWords(jobDescription).filter(
    (w) => w.length >= 4 && /[a-z]/.test(w) && !STOPWORDS.has(w) && !JD_FLUFF.has(w)
  );
  const jdFreq = new Map();
  jdWords.forEach((w) => jdFreq.set(w, (jdFreq.get(w) || 0) + 1));
  const recommended = [];
  const missingSet = new Set(missing);
  for (const [w, c] of [...jdFreq.entries()].sort((a, b) => b[1] - a[1])) {
    if (recommended.length >= 8) break;
    if (c < 2) continue;
    if (missingSet.has(w) || matched.includes(w)) continue;
    if (containsTerm(resumeNorm, w)) continue;
    recommended.push(w);
  }

  const bonus = BONUS_KEYWORDS.filter((bw) => !containsTerm(resumeNorm, bw)).slice(0, 6);

  return { matched, missing, recommended, bonus };
}

function missingSkills(resumeNorm, jobDescription) {
  const { tech } = extractJdTerms(jobDescription);
  const out = [];
  for (const t of tech) {
    if (matchSkillStrength(resumeNorm, t.canonical) < 1) out.push(t.label);
  }
  return out.slice(0, 8);
}

function computeContact(text) {
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const hasLinkedin = /linkedin\.com|linkedin/i.test(text);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || "";
  const hasName = countWords(firstLine) >= 2 && countWords(firstLine) <= 5 && !/^(summary|experience|education|skills|work)/i.test(firstLine);
  const hasLocation = /\b(\d{5})\b|,\s*[A-Z]{2}\b|united states|remote|hybrid|on[- ]site/i.test(text);
  return {
    value: Math.round((hasEmail ? 30 : 0) + (hasPhone ? 25 : 0) + (hasLinkedin ? 20 : 0) + (hasName ? 15 : 0) + (hasLocation ? 10 : 0)),
    flags: { hasEmail, hasPhone, hasLinkedin, hasName, hasLocation },
  };
}

function computeSections(text) {
  const sections = detectSections(text);
  const contentMap = sectionContentMap(text, sections);
  const keys = new Set(sections.map((s) => s.key));

  const present = {
    summary: keys.has("summary") && countWords(contentMap.summary || "") > 8,
    experience: keys.has("experience") && countWords(contentMap.experience || "") > 30,
    education: keys.has("education") && countWords(contentMap.education || "") > 3,
    skills: keys.has("skills") && countWords(contentMap.skills || "") > 2,
    projects: keys.has("projects") && countWords(contentMap.projects || "") > 5,
    certificates: keys.has("certificates") && countWords(contentMap.certificates || "") > 1,
    achievements: keys.has("achievements") && countWords(contentMap.achievements || "") > 1,
    languages: keys.has("languages") && countWords(contentMap.languages || "") > 1,
  };

  const weak = [];
  if (keys.has("summary") && countWords(contentMap.summary || "") < 20) weak.push("Summary is too short — expand it into a 2-3 sentence professional summary.");
  if (keys.has("experience") && countWords(contentMap.experience || "") < 60) weak.push("Experience section is thin — add more detail and achievements.");
  if (keys.has("skills") && countWords(contentMap.skills || "") < 8) weak.push("Skills section is thin — list your core technical and soft skills.");
  if (!keys.has("summary")) weak.push("Missing a professional summary section.");
  if (!keys.has("experience")) weak.push("Missing a work experience section.");
  if (!keys.has("education")) weak.push("Missing an education section.");
  if (!keys.has("skills")) weak.push("Missing a skills section.");

  const value = Math.min(
    100,
    (present.summary ? 20 : 0) +
      (present.experience ? 20 : 0) +
      (present.education ? 20 : 0) +
      (present.skills ? 20 : 0) +
      (present.projects ? 10 : 0) +
      (present.certificates ? 5 : 0) +
      (present.achievements ? 5 : 0) +
      (present.languages ? 5 : 0)
  );

  return { value, present, weak, sections };
}

function computeFormatting(text, sectionInfo) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter(isBulletLine);
  const longLines = lines.filter((l) => l.length > 160).length;
  const paragraphs = String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => countWords(p) > 10).length;

  let score = 0;
  if (sectionInfo.sections.length >= 3) score += 20;
  else if (sectionInfo.sections.length >= 2) score += 10;

  if (bulletLines.length >= 3) score += 20;
  else if (bulletLines.length >= 1) score += 10;

  if (longLines === 0) score += 15;
  else if (longLines <= 2) score += 8;

  if (paragraphs >= 2) score += 10;
  else if (paragraphs === 1) score += 5;

  const core = ["summary", "experience", "education", "skills"].filter((k) => sectionInfo.present[k]).length;
  score += core * 7;

  return { value: clamp(score), bulletCount: bulletLines.length, sectionCount: sectionInfo.sections.length, longLines };
}

function computeExperience(text, sectionSet, sectionMap) {
  const scope = sectionSet.has("experience") ? sectionMap.experience || text : text;
  const lines = scope.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const headers = lines.filter(
    (l) => countWords(l) >= 3 && (EXPERIENCE_MARKERS.some((m) => l.includes(m)) || /\b(19|20)\d{2}\b/.test(l))
  );
  const yearCount = (String(text).match(/\b(19|20)\d{2}\b/g) || []).length;
  const entries = Math.max(headers.length, Math.min(2, Math.floor(yearCount / 2)));
  const hasDateRange = /\b(19|20)\d{2}\b\s*(–|-|—|to|through)\s*(\b(19|20)\d{2}\b|present|current)/i.test(text);
  const bullets = lines.filter(isBulletLine);
  const hasBullets = bullets.length >= 2;
  const actionRatio = bullets.length
    ? bullets.filter((b) => ACTION_VERBS.has(getWords(b)[0])).length / bullets.length
    : 0;

  let score = 0;
  if (sectionSet.has("experience")) score += 15;
  if (entries >= 2) score += 35;
  else if (entries >= 1) score += 20;
  if (hasDateRange) score += 15;
  if (hasBullets) score += 15;
  if (bullets.length >= 4) score += 10;
  score += Math.round(actionRatio * 10);

  if (!sectionSet.has("experience")) score = Math.min(score, 60);
  return { value: clamp(score), entries, hasDateRange, hasBullets, bullets: bullets.length, actionRatio };
}

function computeEducation(text, sectionSet) {
  const low = normalize(text);
  const hasHeading = sectionSet.has("education");
  const hasDegree = [...DEGREE_KEYWORDS_NORM].some((d) => containsTerm(low, d));
  const hasInstitution = [...INSTITUTION_KEYWORDS_NORM].some((i) => containsTerm(low, i));
  const hasField = FIELD_KEYWORDS.some((f) => low.includes(f));
  const hasDates = /\b(19|20)\d{2}\b/.test(low);

  let score = 0;
  if (hasHeading) score += 20;
  if (hasDegree) score += 35;
  if (hasInstitution) score += 20;
  if (hasField) score += 10;
  if (hasDates) score += 15;
  return { value: clamp(score), hasDegree, hasInstitution, hasField, hasHeading };
}

function computeProjects(text, sectionSet, sectionMap) {
  const hasSection = sectionSet.has("projects");
  const projContent = hasSection ? sectionMap.projects || "" : "";
  const projLow = normalize(projContent);
  const wholeLow = normalize(text);
  const scopeLow = projLow || (sectionSet.has("experience") ? normalize(sectionMap.experience || "") : wholeLow);

  const tech = countTechMentions(scopeLow);
  let score = 0;

  if (hasSection) score += 30;
  else if (/\bprojects?\b/.test(wholeLow)) score += 8;

  if (hasSection && countWords(projContent) >= 8) score += 12;

  if (tech >= 3) score += 22;
  else if (tech >= 1) score += 12;

  if (/built|developed|designed|created|launched|shipped|deployed|engineered/.test(scopeLow)) score += 20;
  if (metricCount(scopeLow) >= 1) score += 16;

  if (!hasSection) score = Math.min(score, 60);
  return { value: clamp(score), hasSection, tech };
}

function bulletAnalysis(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter(isBulletLine).map((l) => l.replace(/^\s*[-*•▪◦]\s+|\d+[.)]\s+/, ""));
  if (!bullets.length) {
    return { actionVerbValue: 20, quantifiedValue: 15, bullets: 0, actionBullets: 0, quantifiedBullets: 0 };
  }
  let actionBullets = 0;
  let quantifiedBullets = 0;
  for (const b of bullets) {
    const first = getWords(b)[0];
    if (first && ACTION_VERBS.has(first)) actionBullets++;
    if (/\d|%|k\b|million|billion|increase|decrease|reduce|improve/i.test(b)) quantifiedBullets++;
  }
  return {
    actionVerbValue: Math.round((actionBullets / bullets.length) * 100),
    quantifiedValue: Math.round((quantifiedBullets / bullets.length) * 100),
    bullets: bullets.length,
    actionBullets,
    quantifiedBullets,
  };
}

function computeReadability(text) {
  const sentences = splitSentences(text);
  if (!sentences.length) return { value: 70, avgSentenceWords: 0 };
  const avgSentenceWords = sentences.reduce((sum, s) => sum + countWords(s), 0) / sentences.length;
  let score = 100 - Math.abs(avgSentenceWords - 15) * 3.5;
  return { value: clamp(score), avgSentenceWords };
}

function computeGrammar(text, sectionInfo) {
  const raw = String(text || "");
  const words = getWords(raw);
  let issues = 0;

  if (/\bi\b/.test(raw) && !/\bI\b/.test(raw.replace(/\bI'm\b/g, ""))) issues += 1;
  if (COMMON_TYPOS.some((t) => words.includes(t))) issues += 1;
  if (/ {2,}/.test(raw)) issues += 1;
  if (/[?!]{2,}/.test(raw)) issues += 1;

  const bullets = raw.split(/\r?\n/).map((l) => l.trim()).filter(isBulletLine);
  if (bullets.length >= 3) {
    const ended = bullets.filter((b) => /[.!?]$/.test(b)).length;
    if (ended > 0 && ended < bullets.length) issues += 1;
  }

  // ALL-CAPS lines are only a problem when they are NOT standard section
  // headings (caps headings are a normal, ATS-friendly practice).
  const headingNorm = new Set(sectionInfo.sections.map((s) => normalize(s.line).replace(/:$/, "")));
  const capsLines = raw.split(/\r?\n/).filter((l) => {
    const t = l.trim();
    if (t.length <= 12 || t !== t.toUpperCase()) return false;
    return !headingNorm.has(normalize(t).replace(/:$/, ""));
  });
  if (capsLines.length >= 2) issues += 1;

  const value = Math.max(30, 100 - issues * 12);
  return { value, issues };
}

function computeAchievements(text, bullet) {
  const mentions = metricCount(String(text || ""));
  let value;
  if (bullet.bullets > 0) {
    value = bullet.quantifiedValue;
    if (mentions >= 6) value = Math.max(value, 85);
    else if (mentions >= 3) value = Math.max(value, 70);
  } else {
    if (mentions >= 5) value = 75;
    else if (mentions >= 2) value = 55;
    else value = 15;
  }
  return { value: clamp(value), mentions, quantifiedRatio: bullet.quantifiedValue };
}

function computeLength(text) {
  const words = countWords(text);
  let value;
  if (words < 100) value = 35;
  else if (words < 250) value = Math.round(35 + ((words - 100) / 150) * 50);
  else if (words <= 900) value = 100;
  else if (words <= 1300) value = Math.round(90 - ((words - 900) / 400) * 20);
  else value = Math.round(70 - Math.min(30, (words - 1300) / 50));
  return { value, words };
}

function computeDuplicates(text) {
  const words = getWords(text).filter((w) => !STOPWORDS.has(w) && w.length >= 3 && /[a-z]/.test(w));
  const freq = new Map();
  words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  const counts = [...freq.values()];
  const maxCount = Math.max(0, ...counts);
  const repeatedPhrases = /([a-z0-9+#.\-\s]{15,}?)\1/i.test(String(text || "").toLowerCase());
  let value = 100;
  if (maxCount > 12 || repeatedPhrases) value = 45;
  else if (maxCount > 9) value = 70;
  else if (maxCount > 7) value = 85;
  return { value, maxCount };
}

function computeSkillsMatch(resumeNorm, jobDescription) {
  const { tech } = extractJdTerms(jobDescription);
  if (!tech.length) {
    const distinct = countTechMentions(resumeNorm);
    const value = distinct >= 5 ? 90 : distinct >= 3 ? 72 : distinct >= 1 ? 55 : 35;
    return { value, matched: [], partial: [], missing: [], required: 0, techCount: distinct };
  }
  const matched = [];
  const partial = [];
  const missing = [];
  let earned = 0;
  let total = 0;
  for (const t of tech) {
    total += t.weight;
    const strength = matchSkillStrength(resumeNorm, t.canonical);
    earned += t.weight * strength;
    if (strength >= 1) matched.push(t.label);
    else if (strength > 0) partial.push(t.label);
    else missing.push(t.label);
  }
  const coverage = total ? earned / total : 1;
  return {
    value: coverageToScore(coverage),
    matched,
    partial,
    missing,
    required: tech.length,
    coverage,
    techCount: countTechMentions(resumeNorm),
  };
}

function computeJobMatch(resumeNorm, jobDescription) {
  const { tech, role } = extractJdTerms(jobDescription);
  let techEarned = 0;
  let techTotal = 0;
  let matchedTech = 0;
  for (const t of tech) {
    techTotal += t.weight;
    const s = matchSkillStrength(resumeNorm, t.canonical);
    techEarned += t.weight * s;
    if (s >= 1) matchedTech++;
  }
  let roleEarned = 0;
  let roleTotal = 0;
  let matchedRole = 0;
  for (const r of role) {
    roleTotal += r.weight;
    if (containsTerm(resumeNorm, r.term)) {
      roleEarned += r.weight;
      matchedRole++;
    }
  }

  let coverage;
  if (techTotal && roleTotal) coverage = 0.75 * (techEarned / techTotal) + 0.25 * (roleEarned / roleTotal);
  else if (techTotal) coverage = techEarned / techTotal;
  else if (roleTotal) coverage = roleEarned / roleTotal;
  else coverage = 1;

  return {
    coverage,
    tech: { matched: matchedTech, total: tech.length },
    role: { matched: matchedRole, total: role.length },
  };
}

/**
 * Convert a raw coverage percentage (0-1) into a forgiving component score.
 * Missing a handful of keywords no longer tanks the score: 50% coverage still
 * earns ~70/100 and 100% earns 100. Strong resumes stay in the 80-95 band.
 */
function coverageToScore(cov) {
  const c = Math.max(0, Math.min(1, cov));
  return clamp(100 * (0.3 + 0.7 * Math.pow(c, 0.8)));
}

function getVerdict(score) {
  if (score >= 93) return { label: "Excellent", tone: "success", pass: true };
  if (score >= 85) return { label: "Strong", tone: "success", pass: true };
  if (score >= 70) return { label: "Good", tone: "success", pass: true };
  if (score >= 50) return { label: "Average", tone: "warning", pass: false };
  if (score >= 35) return { label: "Needs Improvement", tone: "danger", pass: false };
  return { label: "Needs Work", tone: "danger", pass: false };
}

function strengthLabel(score) {
  if (score >= 93) return "Excellent";
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Average";
  if (score >= 35) return "Needs Improvement";
  return "Needs Work";
}

function buildExplanations({ hasJd, jobMatch, skills, experience, projects, formatting, education, grammar, achievements }) {
  const e = {};
  if (hasJd && jobMatch) {
    e.jobMatch =
      `Matched ${jobMatch.tech.matched} of ${jobMatch.tech.total} requested skills and ${jobMatch.role.matched} of ${jobMatch.role.total} key role terms — ` +
      `approximately ${Math.round(jobMatch.coverage * 100)}% coverage. Synonyms and related technologies count toward this factor.`;
  } else {
    e.jobMatch =
      "No job description provided — this factor reflects the overall quality and relevance of your resume instead of a specific job match.";
  }

  if (skills.required > 0) {
    const extra = skills.partial.length
      ? ` (plus ${skills.partial.length} related technologie${skills.partial.length === 1 ? "y" : "s"} contributing partial credit)`
      : "";
    e.skills = `Matched ${skills.matched.length} of ${skills.required} technologies named in the job description${extra}.`;
  } else {
    e.skills = `The job description did not name specific technologies, so this factor scores the breadth of technologies on your resume (${skills.techCount} found).`;
  }

  e.experience =
    `Detected ${experience.entries} position entr${experience.entries === 1 ? "y" : "ies"}` +
    `${experience.hasDateRange ? " with clear date ranges" : ""}` +
    `${experience.hasBullets ? " and achievement-style bullets" : ""}.`;

  e.projects = projects.hasSection
    ? "A dedicated projects section with technical depth and outcomes was found."
    : "No dedicated projects section was detected; project-like work inside experience earned partial credit.";

  e.formatting = `Found ${formatting.sectionCount} clearly labelled sections${formatting.bulletCount ? ` and ${formatting.bulletCount} bullet points` : ""}.`;

  e.education = education.hasDegree
    ? "Degree and institution identified."
    : education.hasInstitution
    ? "Institution identified, but no explicit degree was recognized."
    : "No degree or institution was identified.";

  e.grammar = grammar.issues > 0
    ? `${grammar.issues} grammar/readability issue${grammar.issues === 1 ? "" : "s"} detected.`
    : "No grammar or readability issues detected.";

  e.achievements = achievements.quantifiedRatio > 0
    ? `${achievements.quantifiedRatio}% of your bullet points quantify results.`
    : `${achievements.mentions} quantified achievement${achievements.mentions === 1 ? "" : "s"} detected across the resume.`;

  return e;
}

function generatePriorityImprovements({ keywords, contact, sections, bullet, grammar, projects, missingSkillsList, matchPercentage, hasJd }) {
  const items = [];
  if (contact.value < 80) {
    items.push({
      priority: "high",
      category: "Contact Information",
      problem: "Missing contact details.",
      reason: "Recruiters and ATS can't reach you if your email, phone, LinkedIn, or location are missing.",
      example: "Add name, phone, email, LinkedIn URL, and location to the top of your resume.",
      expectedImprovement: "+5 to +8 points",
    });
  }
  if (!sections.present.summary) {
    items.push({
      priority: "high",
      category: "Weak Summary",
      problem: "No professional summary found.",
      reason: "ATS and recruiters use the summary to quickly assess fit for the role.",
      example: "Write a 2-3 sentence summary that names your role, years of experience, core strengths, and the value you deliver.",
      expectedImprovement: "+4 to +7 points",
    });
  }
  if (hasJd && matchPercentage < 55) {
    items.push({
      priority: "critical",
      category: "Job Match",
      problem: `Your resume only covers ${matchPercentage}% of the skills and keywords in the job description.`,
      reason: "Recruiters and ATS platforms look for a clear overlap between your resume and the role's requirements.",
      example: `Naturally add these where relevant: ${keywords.missing.slice(0, 6).join(", ") || "the terms listed below"}.`,
      expectedImprovement: "+8 to +15 points",
    });
  }
  if (bullet.quantifiedValue < 50) {
    items.push({
      priority: "high",
      category: "Weak Bullet Points",
      problem: "Few achievements include numbers or results.",
      reason: "Quantified results prove impact and are a strong signal of seniority and delivery.",
      example: "Rewrite 'Improved performance' as 'Improved API response times by 40%, reducing p95 latency from 800ms to 480ms'.",
      expectedImprovement: "+5 to +10 points",
    });
  }
  if (bullet.actionVerbValue < 60) {
    items.push({
      priority: "medium",
      category: "Weak Bullet Points",
      problem: "Bullet points don't consistently start with strong action verbs.",
      reason: "Action verbs make your experience sound proactive and measurable.",
      example: "Start each bullet with verbs like 'built', 'led', 'designed', 'reduced', or 'shipped'.",
      expectedImprovement: "+3 to +6 points",
    });
  }
  if (missingSkillsList.length > 0) {
    items.push({
      priority: "critical",
      category: "Missing Skills",
      problem: `The job description calls for skills not on your resume (${missingSkillsList.slice(0, 4).join(", ") || "multiple skills"}).`,
      reason: "Missing required technologies is the most common reason resumes are filtered out.",
      example: "Add these skills to your skills section and demonstrate them in experience/project bullets.",
      expectedImprovement: "+6 to +12 points",
    });
  }
  if (!sections.present.projects) {
    items.push({
      priority: "medium",
      category: "Projects",
      problem: "No dedicated projects section was found.",
      reason: "Projects show applied, hands-on ability and are a strong differentiator, especially for early-career and engineering roles.",
      example: "Add a Projects section with 2-3 projects: what you built, the stack, and the measurable outcome.",
      expectedImprovement: "+3 to +7 points",
    });
  }
  if (grammar.issues > 0) {
    items.push({
      priority: "medium",
      category: "Grammar & Readability",
      problem: `${grammar.issues} grammar/readability issue${grammar.issues === 1 ? "" : "s"} detected.`,
      reason: "Typos and inconsistent formatting look unpolished and can distract from strong content.",
      example: "Fix typos, keep bullet punctuation consistent, and break up very long sentences.",
      expectedImprovement: "+2 to +4 points",
    });
  }
  if (items.length < 3) {
    items.push({
      priority: "low",
      category: "Recruiter Tip",
      problem: "Polish your resume for a premium impression.",
      reason: "Small refinements add up to a stronger overall score and impression.",
      example: "Review spelling, alignment, and consistency of dates and formatting.",
      expectedImprovement: "+2 to +4 points",
    });
  }
  return items;
}

/**
 * Deterministic ATS analysis of resume text against a job description.
 *
 * Scoring model (weights sum to 100%):
 *   Job Description Match 30% | Skills Match 20% | Experience Quality 15% |
 *   Projects 10% | ATS Formatting 10% | Education 5% |
 *   Grammar & Readability 5% | Quantified Achievements 5%
 *
 * Length and repetition are applied as small modifiers so concise, polished
 * resumes are never crushed, and the result stays explainable.
 */
export function analyzeATS(resumeText, jobDescription) {
  const text = String(resumeText || "");
  const jd = String(jobDescription || "");
  const resumeNorm = normalize(text);
  const hasJd = jd.trim().length > 0;

  const contact = computeContact(text);
  const sectionInfo = computeSections(text);
  const sectionSet = new Set(sectionInfo.sections.map((s) => s.key));
  const sectionMap = sectionContentMap(text, sectionInfo.sections);
  const formatting = computeFormatting(text, sectionInfo);
  const experience = computeExperience(text, sectionSet, sectionMap);
  const education = computeEducation(text, sectionSet);
  const projects = computeProjects(text, sectionSet, sectionMap);
  const bullet = bulletAnalysis(text);
  const achievements = computeAchievements(text, bullet);
  const grammar = computeGrammar(text, sectionInfo);
  const readability = computeReadability(text);
  const length = computeLength(text);
  const duplicates = computeDuplicates(text);

  const jobMatch = hasJd ? computeJobMatch(resumeNorm, jd) : null;
  const skills = computeSkillsMatch(resumeNorm, jd);
  const keywords = keywordGroups(resumeNorm, jd);
  const missingSkillsList = missingSkills(resumeNorm, jd);

  const grammarComponent = clamp(grammar.value * 0.6 + readability.value * 0.4);

  const noJdTech = countTechMentions(resumeNorm);
  const components = {
    jobMatch: hasJd ? coverageToScore(jobMatch.coverage) : noJdTech >= 5 ? 88 : noJdTech >= 3 ? 74 : 60,
    skills: skills.value,
    experience: experience.value,
    projects: projects.value,
    formatting: formatting.value,
    education: education.value,
    grammar: grammarComponent,
    achievements: achievements.value,
  };

  const weights = {
    jobMatch: 0.3,
    skills: 0.2,
    experience: 0.15,
    projects: 0.1,
    formatting: 0.1,
    education: 0.05,
    grammar: 0.05,
    achievements: 0.05,
  };

  let base = 0;
  for (const [key, w] of Object.entries(weights)) {
    base += (components[key] || 0) * w;
  }

  const modifiers = [];
  if (length.words < 150) {
    modifiers.push({ key: "length", label: "Resume Length", impact: -3, reason: "Resume is under 150 words; add concrete detail to demonstrate your experience." });
  } else if (length.words > 1200) {
    modifiers.push({ key: "length", label: "Resume Length", impact: -2, reason: "Resume exceeds 1,200 words; consider tightening it to stay scannable." });
  }
  if (duplicates.value < 70) {
    modifiers.push({ key: "duplicates", label: "Repetition", impact: -2, reason: "Some words or phrases are repeated too frequently." });
  }

  const totalAdjust = modifiers.reduce((sum, m) => sum + m.impact, 0);
  const score = clamp(base + totalAdjust);
  const baseScore = clamp(base);
  const matchPercentage = hasJd ? Math.round(jobMatch.coverage * 100) : null;

  const criticalCount = [
    !contact.flags.hasEmail,
    !contact.flags.hasPhone,
    hasJd && jobMatch.coverage < 0.45,
    !sectionInfo.present.summary,
    !sectionInfo.present.experience,
    missingSkillsList.length >= 2,
  ].filter(Boolean).length;

  const priorityImprovements = generatePriorityImprovements({
    keywords,
    contact,
    sections: sectionInfo,
    bullet,
    grammar,
    projects,
    missingSkillsList,
    matchPercentage,
    hasJd,
  });

  const explanations = buildExplanations({
    hasJd,
    jobMatch,
    skills,
    experience,
    projects,
    formatting,
    education,
    grammar,
    achievements,
  });

  return {
    score,
    baseScore,
    verdict: getVerdict(score),
    strength: strengthLabel(score),
    matchPercentage,
    components,
    weights,
    modifiers,
    explanations,
    keywords,
    missingSkills: missingSkillsList,
    weakSections: sectionInfo.weak,
    priorityImprovements,
    issues: { critical: criticalCount },
    metrics: {
      wordCount: length.words,
      bulletCount: bullet.bullets,
      actionVerbBullets: bullet.actionBullets,
      quantifiedBullets: bullet.quantifiedBullets,
      sections: sectionInfo.present,
      contact: contact.flags,
      grammarIssues: grammar.issues,
      jobMatchCoverage: hasJd ? Math.round(jobMatch.coverage * 100) : null,
      matchedSkills: skills.matched.length,
      totalSkills: skills.required,
      experienceEntries: experience.entries,
      hasProjects: projects.hasSection,
    },
  };
}
