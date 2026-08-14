"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";

export function AuthInitializer({ children }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return children;
}
