"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Palette,
  BrainCircuit,
  CreditCard,
  BarChart3,
  FileBarChart,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  History,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { useAuthStore } from "@/store";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Resumes", href: "/admin/resumes", icon: FileText },
  { label: "Templates", href: "/admin/templates", icon: Palette },
  { label: "AI Usage", href: "/admin/ai-usage", icon: BrainCircuit },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Audit Log", href: "/admin/audit-log", icon: History },
];

function isLinkActive(pathname, href) {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

function AdminSidebarContent({ collapsed, pathname, onNavigate, onLogout }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <nav className="space-y-0.5">
          {sidebarLinks.map((link) => {
            const isActive = isLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-black/5 text-ink dark:bg-white/10 font-semibold"
                    : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5",
                  collapsed && "justify-center"
                )}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border px-2 py-2">
        <button
          onClick={onLogout}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted hover:text-flag hover:bg-flag/5 transition-colors",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, role, logout } = useAuthStore();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
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
        <div className="w-full max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const currentLink = sidebarLinks.find(
    (l) =>
      pathname === l.href ||
      (l.href !== "/admin" && pathname.startsWith(l.href))
  );

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-border bg-paper-alt transition-all duration-150 lg:flex",
          collapsed ? "w-[64px]" : "w-60"
        )}
      >
        <div className={cn("flex h-12 items-center border-b border-border px-3", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-stamp text-paper">
                <FileText className="h-3 w-3" />
              </div>
              <span className="font-semibold text-xs tracking-tight text-ink">{SITE_CONFIG.name}</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-sm p-1 text-muted hover:text-ink hover:bg-paper transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="border-b border-border px-2 py-1.5">
          {!collapsed ? (
            <Badge variant="danger" className="gap-1 w-fit text-[9px]">
              <Shield className="h-2.5 w-2.5" />
              Admin Panel
            </Badge>
          ) : (
            <div className="flex justify-center">
              <Badge variant="danger" className="p-1">
                <Shield className="h-2.5 w-2.5" />
              </Badge>
            </div>
          )}
        </div>

        <AdminSidebarContent collapsed={collapsed} pathname={pathname} onLogout={handleLogout} />
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
              className="fixed inset-0 z-50 bg-overlay lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed left-0 top-0 z-[60] flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-paper-alt lg:hidden"
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
                <Link href="/admin" className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-stamp text-paper">
                    <FileText className="h-3 w-3" />
                  </div>
                  <span className="font-semibold text-xs tracking-tight text-ink">{SITE_CONFIG.name}</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-paper hover:text-ink transition-colors"
                  title="Close menu"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>

              <div className="shrink-0 border-b border-border px-2 py-1.5">
                <Badge variant="danger" className="gap-1 w-fit text-[9px]">
                  <Shield className="h-2.5 w-2.5" />
                  Admin Panel
                </Badge>
              </div>

              <AdminSidebarContent collapsed={false} pathname={pathname} onNavigate={() => setSidebarOpen(false)} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-all duration-150",
          collapsed ? "lg:ml-[64px]" : "lg:ml-60"
        )}
      >
        <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-paper/90 px-3 backdrop-blur-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-paper-alt hover:text-ink transition-colors lg:hidden"
              title="Open menu"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
            <h1 className="truncate text-sm font-semibold tracking-tight text-ink">
              {currentLink?.label || "Admin"}
            </h1>
          </div>
          <div className="hidden shrink-0 items-center gap-4 sm:flex">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-2.5 w-2.5" />
              Administrator
            </Badge>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
