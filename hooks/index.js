"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store";
import { computeUsage } from "@/lib/usage-client";

export function useSubscription() {
  const user = useAuthStore((s) => s.user);
  const storeUsage = useAuthStore((s) => s.usage);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const usage = storeUsage || computeUsage(user);
  const plan = usage?.plan || "FREE";

  return {
    user,
    plan,
    isFree: plan === "FREE",
    isPro: plan === "PRO",
    isEnterprise: plan === "ENTERPRISE",
    usage,
    resumeCount: usage?.resumeCount ?? 0,
    resumeLimit: usage?.resumeLimit,
    resumeRemaining: usage?.resumeRemaining,
    aiCreditsUsed: usage?.aiCreditsUsed ?? 0,
    aiCreditsTotal: usage?.aiCreditsTotal,
    aiCreditsRemaining: usage?.aiCreditsRemaining,
    aiResetDate: usage?.aiResetDate,
    atResumeLimit: usage?.resumeRemaining === 0,
    atAiLimit: usage?.aiCreditsRemaining === 0,
    refresh: refreshUser,
  };
}

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useIsKeyboardOpen() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const check = () => {
      const open = window.innerHeight - vv.height > 150;
      setIsKeyboardOpen(open);
    };

    vv.addEventListener("resize", check);
    vv.addEventListener("scroll", check);
    check();
    return () => {
      vv.removeEventListener("resize", check);
      vv.removeEventListener("scroll", check);
    };
  }, []);

  return isKeyboardOpen;
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting];
}

export function useJobIntelligence() {
  const [isLooking, setIsLooking] = useState(false);
  const [jobResult, setJobResult] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const lookup = async (title) => {
    if (!title || typeof title !== "string" || !title.trim()) {
      setJobResult(null);
      setError(null);
      return null;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLooking(true);
    setError(null);

    try {
      const res = await fetch("/api/job-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to get job intelligence");
      }

      if (data.success && data.result) {
        setJobResult(data.result);
        setIsLooking(false);
        return data.result;
      }

      setJobResult(null);
      setIsLooking(false);
      return null;
    } catch (err) {
      if (err.name === "AbortError") return null;
      console.error("Job intelligence error:", err);
      setError(err.message || "Failed to look up job");
      setIsLooking(false);
      return null;
    }
  };

  const reset = () => {
    setJobResult(null);
    setError(null);
    setIsLooking(false);
  };

  return { lookup, jobResult, isLooking, error, reset };
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
