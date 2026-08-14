"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ variant = "dropdown", className = "" }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-[8px] border border-border ${className}`}
        aria-label="Toggle theme"
      >
        <Sun className="h-[18px] w-[18px] text-muted opacity-50" />
      </Button>
    );
  }

  if (variant === "pill") {
    return (
      <div className={`inline-flex items-center gap-0.5 rounded-md border border-border bg-paper-alt p-0.5 ${className}`}>
        <button
          onClick={() => setTheme("light")}
          aria-label="Light theme"
          aria-pressed={theme === "light"}
          className={`flex h-6 w-6 items-center justify-center rounded-sm transition-colors ${
            theme === "light"
              ? "bg-popover text-stamp border border-border"
              : "text-muted hover:text-ink"
          }`}
          title="Light theme"
        >
          <Sun className="h-3 w-3" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          aria-label="Dark theme"
          aria-pressed={theme === "dark"}
          className={`flex h-6 w-6 items-center justify-center rounded-sm transition-colors ${
            theme === "dark"
              ? "bg-popover text-stamp border border-border"
              : "text-muted hover:text-ink"
          }`}
          title="Dark theme"
        >
          <Moon className="h-3 w-3" />
        </button>
        <button
          onClick={() => setTheme("system")}
          aria-label="System theme"
          aria-pressed={theme === "system"}
          className={`flex h-6 w-6 items-center justify-center rounded-sm transition-colors ${
            theme === "system"
              ? "bg-popover text-stamp border border-border"
              : "text-muted hover:text-ink"
          }`}
          title="System theme"
        >
          <Laptop className="h-3 w-3" />
        </button>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-8 w-8 rounded-[8px] border border-border hover:bg-paper-alt transition-colors ${className}`}
          aria-label="Theme selector"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex items-center justify-center"
              >
                <Moon className="h-[18px] w-[18px] text-stamp" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex items-center justify-center"
              >
                <Sun className="h-[18px] w-[18px] text-seal" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 p-1">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-3 w-3" />
            Light
          </span>
          {theme === "light" && <Check className="h-3 w-3 text-stamp" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-3 w-3" />
            Dark
          </span>
          {theme === "dark" && <Check className="h-3 w-3 text-stamp" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs"
        >
          <span className="flex items-center gap-2">
            <Laptop className="h-3 w-3" />
            System
          </span>
          {theme === "system" && <Check className="h-3 w-3 text-stamp" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;
