import { create } from "zustand";
import { refreshAccessToken as apiRefreshAccessToken } from "@/lib/api";
import { computeUsage } from "@/lib/usage-client";

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function setStoredToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  usage: null,

  setUser: (user) =>
    set({
      user,
      usage: computeUsage(user),
      isAuthenticated: !!user,
      isLoading: false,
      role: user?.role || null,
    }),
  setToken: (token) => {
    setStoredToken(token);
    set({ token });
  },

  login: async (email, password, rememberMe = false) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setStoredToken(data.accessToken);
    set({
      user: data.user,
      usage: computeUsage(data.user),
      token: data.accessToken,
      isAuthenticated: true,
      isLoading: false,
      role: data.user?.role || "USER",
    });
    return data;
  },

  register: async (name, email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setStoredToken(data.accessToken);
    set({
      user: data.user,
      usage: computeUsage(data.user),
      token: data.accessToken,
      isAuthenticated: true,
      isLoading: false,
      role: data.user?.role || "USER",
    });
    return data;
  },

  logout: async () => {
    setStoredToken(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
      usage: null,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  refreshUser: async () => {
    const token = get().token || getStoredToken();
    try {
      const res = await fetch("/api/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          usage: computeUsage(data.user),
          isAuthenticated: true,
          isLoading: false,
          role: data.user?.role || "USER",
        });
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  },

  refreshAccessToken: async () => {
    try {
      const data = await apiRefreshAccessToken();
      if (data) {
        set({
          user: data.user,
          usage: computeUsage(data.user),
          token: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          role: data.user?.role || "USER",
        });
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  },

  initialize: async () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }
    const token = getStoredToken();
    try {
      const res = await fetch("/api/auth/me", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          usage: computeUsage(data.user),
          token,
          isAuthenticated: true,
          isLoading: false,
          role: data.user?.role || "USER",
        });
        if (token) {
          const payload = decodeToken(token);
          if (payload) {
            const expiresIn = payload.exp * 1000 - Date.now();
            if (expiresIn < 5 * 60 * 1000 && expiresIn > 0) {
              const newToken = await get().refreshAccessToken();
              if (newToken) {
                const meRes = await fetch("/api/auth/me", {
                  headers: { Authorization: `Bearer ${newToken}` },
                });
                if (meRes.ok) {
                  const meData = await meRes.json();
                  set({
                    user: meData.user,
                    usage: computeUsage(meData.user),
                    token: newToken,
                    isAuthenticated: true,
                    isLoading: false,
                    role: meData.user?.role || "USER",
                  });
                }
              }
            }
          }
        }
      } else {
        const refreshed = await get().refreshAccessToken();
        if (!refreshed) {
          setStoredToken(null);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            role: null,
            usage: null,
          });
        }
      }
    } catch {
      setStoredToken(null);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, role: null, usage: null });
    }
  },
}));

export const useResumeStore = create((set, get) => ({
  currentResume: null,
  resumes: [],
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  currentStep: 0,

  setResumes: (resumes) => set({ resumes }),
  setCurrentResume: (resume) => set({ currentResume: resume }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setLastSaved: (lastSaved) => set({ lastSaved }),

  updateResume: (data) => {
    const current = get().currentResume;
    if (current) {
      set({ currentResume: { ...current, ...data } });
    }
  },

  updateExperience: (updated) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          experiences: (current.experiences || []).map((e) => (e.id === updated.id ? { ...e, ...updated } : e)),
        },
      });
    }
  },

  addExperience: (experience) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          experiences: [...(current.experiences || []), experience],
        },
      });
    }
  },

  removeExperience: (id) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          experiences: (current.experiences || []).filter((e) => e.id !== id),
        },
      });
    }
  },

  updateEducation: (updated) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          educations: (current.educations || []).map((e) => (e.id === updated.id ? { ...e, ...updated } : e)),
        },
      });
    }
  },

  addEducation: (education) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          educations: [...(current.educations || []), education],
        },
      });
    }
  },

  removeEducation: (id) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          educations: (current.educations || []).filter((e) => e.id !== id),
        },
      });
    }
  },

  updateSkill: (updated) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          skills: (current.skills || []).map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
        },
      });
    }
  },

  addSkill: (skill) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          skills: [...(current.skills || []), skill],
        },
      });
    }
  },

  removeSkill: (id) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          skills: (current.skills || []).filter((s) => s.id !== id),
        },
      });
    }
  },

  updateProject: (updated) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          projects: (current.projects || []).map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
        },
      });
    }
  },

  addProject: (project) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          projects: [...(current.projects || []), project],
        },
      });
    }
  },

  removeProject: (id) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          projects: (current.projects || []).filter((p) => p.id !== id),
        },
      });
    }
  },

  updateLanguage: (updated) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          languages: (current.languages || []).map((l) => (l.id === updated.id ? { ...l, ...updated } : l)),
        },
      });
    }
  },

  addLanguage: (language) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          languages: [...(current.languages || []), language],
        },
      });
    }
  },

  removeLanguage: (id) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          languages: (current.languages || []).filter((l) => l.id !== id),
        },
      });
    }
  },

  updateAchievement: (updated) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          achievements: (current.achievements || []).map((a) => (a.id === updated.id ? { ...a, ...updated } : a)),
        },
      });
    }
  },

  addAchievement: (achievement) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          achievements: [...(current.achievements || []), achievement],
        },
      });
    }
  },

  removeAchievement: (id) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          achievements: (current.achievements || []).filter((a) => a.id !== id),
        },
      });
    }
  },

  updateCertificate: (updated) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          certificates: (current.certificates || []).map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
        },
      });
    }
  },

  addCertificate: (certificate) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          certificates: [...(current.certificates || []), certificate],
        },
      });
    }
  },

  removeCertificate: (id) => {
    const current = get().currentResume;
    if (current) {
      set({
        currentResume: {
          ...current,
          certificates: (current.certificates || []).filter((c) => c.id !== id),
        },
      });
    }
  },

  reset: () =>
    set({
      currentResume: null,
      currentStep: 0,
      isSaving: false,
      lastSaved: null,
    }),
}));

let toastTimer = null;

export const useUIStore = create((set) => ({
  theme: "system",
  sidebarOpen: true,
  modalOpen: null,
  toastMessage: null,

  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modal) => set({ modalOpen: modal }),
  closeModal: () => set({ modalOpen: null }),
  showToast: (message) => {
    set({ toastMessage: message });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toastMessage: null }), 3000);
  },
  setToastMessage: (message) => set({ toastMessage: message }),
}));
