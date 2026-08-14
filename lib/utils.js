import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export {
  checkResumeCompletion,
  getResumeSectionStatus,
  getStepStatus,
  hasMeaningfulValue,
  PHONE_PATTERN,
} from "./resume-completion";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str, length = 100) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function serializeResume(resume) {
  if (!resume) return null;
  const out = {};
  const keys = [
    "title",
    "template",
    "colorTheme",
    "design",
    "isPublic",
    "summary",
    "personalInfo",
    "experiences",
    "educations",
    "skills",
    "projects",
    "certificates",
    "languages",
    "achievements",
    "sectionOrder",
  ];
  for (const key of keys) {
    if (resume[key] !== undefined) out[key] = resume[key];
  }
  return out;
}

export async function downloadResumePDF(resumeId, filename) {
  const doFetch = async (tokenOverride) => {
    const token = tokenOverride || localStorage.getItem("token");
    return fetch(`/api/resumes/${resumeId}/download`, {
      credentials: "same-origin",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  };

  let res = await doFetch();

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    });
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      localStorage.setItem("token", refreshData.accessToken);
      res = await doFetch(refreshData.accessToken);
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate PDF");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(filename || "resume").replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_").substring(0, 50)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
