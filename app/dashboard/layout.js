"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  PenTool,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  ScanSearch,
  GitCompareArrows,
  BarChart3,
  MessageSquareText,
  Bell,
  Sparkles,
  Menu,
  X,
  BookOpen,
  CircleHelp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/store";
import { cn, getInitials } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Resumes", href: "/dashboard/resumes", icon: FileText },
  { label: "Cover Letters", href: "/dashboard/cover-letters", icon: PenTool },
  { label: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { label: "ATS Checker", href: "/dashboard/ats-checker", icon: ScanSearch },
  { label: "Job Match", href: "/dashboard/job-match", icon: GitCompareArrows },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Interview Prep", href: "/dashboard/interview", icon: MessageSquareText },
  { label: "Blog", href: "/dashboard/blog", icon: BookOpen },
  { label: "Help & Support", href: "/dashboard/support", icon: CircleHelp },
];

const bottomLinks = [
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function isLinkActive(pathname, href) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

function NavLink({ link, pathname, collapsed, onNavigate }) {
  const isActive = isLinkActive(pathname, link.href);
  const Icon = link.icon;
  return (
    <Link
      key={link.href}
      href={link.href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5",
        collapsed && "justify-center"
      )}
      title={collapsed ? link.label : undefined}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive && "text-primary-foreground")} />
      {!collapsed && <span className="flex-1 truncate">{link.label}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed, isPremium, pathname, onNavigate, onLogout }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <nav className="space-y-0.5">
          {sidebarLinks.map((link) => (
            <NavLink key={link.href} link={link} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </nav>

        {!isPremium && (
          <div className="mt-2">
            <Link
              href="/dashboard/upgrade"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                pathname === "/dashboard/upgrade"
                  ? "bg-stamp text-paper"
                  : "text-stamp border border-stamp/30 hover:bg-stamp/10",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Upgrade to Pro" : undefined}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span className="flex-1 truncate">Upgrade to Pro</span>}
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-0.5 border-t border-border px-2 py-2">
        {bottomLinks.map((link) => (
          <NavLink key={link.href} link={link} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
        <button
          onClick={onLogout}
          className={cn(
            "inline-flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs font-medium text-muted hover:text-flag hover:bg-flag/5 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Log out" : undefined}
          aria-label="Log out"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading, role, logout } = useAuthStore();
  const isAdmin = role === "ADMIN";
  const isPremium = user?.subscription?.plan === "PRO" || user?.subscription?.plan === "ENTERPRISE";

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (isAdmin) {
        router.push("/admin");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => e.key === "Escape" && setSidebarOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-stamp" />
          <p className="text-xs font-mono text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || isAdmin) {
    return null;
  }

  const currentTitle = sidebarLinks.find(
    (l) => l.href === pathname || (l.href !== "/dashboard" && pathname.startsWith(l.href))
  )?.label || bottomLinks.find((l) => l.href === pathname)?.label || (pathname.startsWith("/dashboard/upgrade") ? "Upgrade" : "Dashboard");

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-full flex-col border-r border-border bg-paper-alt transition-all duration-150 lg:flex",
          collapsed ? "w-[64px]" : "w-60"
        )}
      >
        <div className={cn("flex h-12 items-center border-b border-border px-3", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-stamp text-paper">
                <FileText className="h-3 w-3" />
              </div>
              <span className="font-semibold text-xs tracking-tight text-ink">{SITE_CONFIG.name}</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="inline-flex items-center justify-center rounded-sm p-1 text-muted hover:text-ink hover:bg-paper transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5 shrink-0" /> : <ChevronLeft className="h-3.5 w-3.5 shrink-0" />}
          </button>
        </div>

        <SidebarContent collapsed={collapsed} isPremium={isPremium} pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile slide-out drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-[60] bg-overlay lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed left-0 top-0 z-[70] flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-paper-alt lg:hidden"
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-stamp text-paper">
                    <FileText className="h-3 w-3" />
                  </div>
                  <span className="font-semibold text-xs tracking-tight text-ink">{SITE_CONFIG.name}</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-paper hover:text-ink transition-colors"
                  title="Close menu"
                  aria-label="Close menu"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5">
                <div className="flex-1" />
                <ThemeToggle />
                <Link
                  href="/dashboard/notifications"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-paper text-muted hover:text-ink transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="h-3.5 w-3.5" />
                </Link>
              </div>

              <SidebarContent collapsed={false} isPremium={isPremium} pathname={pathname} onNavigate={() => setSidebarOpen(false)} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main
        className={cn(
          "flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-150",
          collapsed ? "lg:ml-[64px]" : "lg:ml-60"
        )}
      >
        <div className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-border bg-paper/90 px-3 backdrop-blur-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-paper-alt hover:text-ink transition-colors lg:hidden"
              title="Open menu"
              aria-label="Open menu"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
            <h1 className="truncate text-sm font-semibold tracking-tight text-ink">{currentTitle}</h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <ThemeToggle />

                <Link
                  href="/dashboard/notifications"
                  className="relative inline-flex items-center justify-center rounded-md border border-border bg-paper-alt p-1.5 text-muted hover:text-ink hover:bg-paper transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="h-3.5 w-3.5 shrink-0" />
                </Link>

              <div className="w-px h-4 bg-border mx-1" />

              <Link href="/dashboard/upgrade" title="Manage your plan">
                <Badge variant={user.subscription?.plan === "PRO" ? "pro" : user.subscription?.plan === "ENTERPRISE" ? "primary" : "outline"}>
                  {user.subscription?.plan?.toLowerCase() || "free"}
                </Badge>
              </Link>
            </div>

            {user && (
              <Link href="/dashboard/profile" title="Profile" className="lg:ml-1">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-stamp text-paper text-[10px] font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
