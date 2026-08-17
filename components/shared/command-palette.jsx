"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Plus,
  LayoutDashboard,
  PenTool,
  ScanSearch,
  Settings,
  User,
  Moon,
  Sun,
  X,
  Command,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function CommandPalette({ open, setOpen }) {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { id: "new-resume", title: "Create New Resume", icon: Plus, category: "Actions", action: () => router.push("/resume/new") },
    { id: "dashboard", title: "Go to Dashboard", icon: LayoutDashboard, category: "Navigation", action: () => router.push("/dashboard") },
    { id: "resumes", title: "View My Resumes", icon: FileText, category: "Navigation", action: () => router.push("/dashboard/resumes") },
    { id: "ats-checker", title: "ATS Score Checker", icon: ScanSearch, category: "AI Tools", action: () => router.push("/dashboard/ats-checker") },
    { id: "cover-letters", title: "Cover Letter Generator", icon: PenTool, category: "AI Tools", action: () => router.push("/dashboard/cover-letters") },
    { id: "profile", title: "User Profile", icon: User, category: "Account", action: () => router.push("/dashboard/profile") },
    { id: "settings", title: "Settings & Billing", icon: Settings, category: "Account", action: () => router.push("/dashboard/settings") },
    { id: "toggle-theme", title: `Switch Theme (Current: ${theme})`, icon: resolvedTheme === "dark" ? Sun : Moon, category: "Preferences", action: () => setTheme(theme === "dark" ? "light" : "dark") },
  ];

  const filteredActions = actions.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (index) => {
    const item = filteredActions[index];
    if (!item) return;
    item.action();
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredActions.length ? (prev + 1) % filteredActions.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredActions.length
            ? (prev - 1 + filteredActions.length) % filteredActions.length
            : 0
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelect(selectedIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredActions, selectedIndex, setOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-xl overflow-hidden rounded-md border border-border bg-popover shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* SEARCH INPUT HEADER */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              aria-label="Search commands"
              role="combobox"
              aria-expanded={open}
              aria-activedescendant={
                filteredActions[selectedIndex]
                  ? `command-${filteredActions[selectedIndex].id}`
                  : undefined
              }
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none font-sans"
              autoFocus
            />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close command palette"
              className="rounded-lg p-1 text-muted hover:bg-paper-alt hover:text-ink transition-colors cursor-pointer"
            >
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>

          {/* RESULTS LIST */}
          <div className="max-h-80 overflow-y-auto p-1.5">
            {filteredActions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                No matching commands found.
              </div>
            ) : (
              <div className="space-y-0.5" role="listbox" aria-label="Available commands">
                {filteredActions.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      id={`command-${item.id}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(index)}
                      onMouseMove={() => setSelectedIndex(index)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs font-medium text-ink hover:bg-paper-alt transition-colors group cursor-pointer",
                        isSelected && "bg-paper-alt"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-paper-alt text-muted group-hover:text-ink">
                          <Icon className="h-3 w-3" aria-hidden="true" />
                        </div>
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[10px] text-muted uppercase font-mono tracking-wider opacity-60 group-hover:opacity-100">
                        {item.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FOOTER SHORTCUT HINT */}
          <div className="flex items-center justify-between border-t border-border bg-paper-alt/50 px-4 py-1.5 text-[10px] text-muted">
            <div className="flex items-center gap-1.5">
              <kbd className="rounded-sm border border-border bg-paper px-1 py-0.5 text-[9px] font-mono-data">
                ↑↓
              </kbd>
              <span>Navigate</span>
              <kbd className="rounded-sm border border-border bg-paper px-1 py-0.5 text-[9px] font-mono-data ml-2">
                ↵
              </kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="h-2.5 w-2.5" />
              <span>Resumate</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CommandPalette;
