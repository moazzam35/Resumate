"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  FileText,
  Command,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  User,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CommandPalette } from "@/components/shared/command-palette";
import { useAuthStore } from "@/store";
import { SITE_CONFIG } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";

const GUEST_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/#templates" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
  { label: "ATS Checker", href: "/dashboard/ats-checker" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, role, logout } = useAuthStore();
  const isAdmin = role === "ADMIN";
  const isPremium = user?.subscription?.plan === "PRO" || user?.subscription?.plan === "ENTERPRISE";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const scrollToHash = (e, href) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;
    const path = href.slice(0, hashIndex);
    const hash = href.slice(hashIndex + 1);
    if (!(path === "" || path === "/" || pathname === path)) return;
    e.preventDefault();
    setMobileOpen(false);
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-paper/80 backdrop-blur-xl",
          scrolled
            ? "border-b border-border py-3 shadow-[0_10px_30px_-18px_oklch(0_0_0/0.25)]"
            : "border-b border-transparent py-4"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-stamp text-paper shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--stamp)_60%,transparent)] transition-transform duration-200 group-hover:scale-[1.04]">
                <FileText className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <span className="text-[15px] font-heading font-semibold tracking-tight text-ink flex items-center gap-1.5">
                {SITE_CONFIG.name}
                <span className="rounded-[5px] border border-border bg-paper-alt px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-muted">
                  v2.0
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5 rounded-[10px] border border-border bg-paper-alt/90 p-1 backdrop-blur-sm shadow-[0_1px_2px_oklch(0_0_0/0.03)]">
              {!isAuthenticated && GUEST_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToHash(e, link.href)}
                    className={cn(
                      "relative px-3 py-1.5 text-xs font-medium rounded-[7px] transition-colors",
                      isActive
                        ? "text-ink bg-popover border border-border shadow-[0_1px_2px_oklch(0_0_0/0.04)]"
                        : "text-muted hover:text-ink"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated && (
                <Link
                  href="/blog"
                  className={cn(
                    "relative px-3 py-1.5 text-xs font-medium rounded-[7px] transition-colors",
                    pathname.startsWith("/blog")
                      ? "text-ink bg-popover border border-border shadow-[0_1px_2px_oklch(0_0_0/0.04)]"
                      : "text-muted hover:text-ink"
                  )}
                >
                  Blog
                </Link>
              )}
              {isAuthenticated && isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "relative px-3 py-1.5 text-xs font-medium rounded-[7px] transition-colors flex items-center gap-1.5",
                    pathname.startsWith("/admin")
                      ? "text-ink bg-popover border border-border shadow-[0_1px_2px_oklch(0_0_0/0.04)]"
                      : "text-muted hover:text-ink"
                  )}
                >
                  <Shield className="h-3 w-3" />
                  Admin
                </Link>
              )}
              {isAuthenticated && !isAdmin && (
                <Link
                  href="/dashboard"
                  className={cn(
                    "relative px-3 py-1.5 text-xs font-medium rounded-[7px] transition-colors",
                    pathname.startsWith("/dashboard")
                      ? "text-ink bg-popover border border-border shadow-[0_1px_2px_oklch(0_0_0/0.04)]"
                      : "text-muted hover:text-ink"
                  )}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setCmdPaletteOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-border bg-paper-alt/90 px-3.5 text-sm text-muted hover:text-ink hover:bg-paper transition-colors cursor-pointer shadow-[0_1px_2px_oklch(0_0_0/0.03)]"
                title="Search commands (Cmd+K)"
              >
                <Command className="h-4 w-4 shrink-0" />
                <span className="text-[13px] font-medium leading-none">Search...</span>
                <kbd className="inline-flex items-center rounded-[6px] border border-border bg-paper px-1.5 py-0.5 text-[9px] font-mono-data leading-none">
                  ⌘K
                </kbd>
              </button>

              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  {!isAdmin && !isPremium && (
                    <Link href="/dashboard/upgrade">
                      <Button size="sm" variant="primary" leftIcon={Sparkles}>
                        Upgrade
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full border border-border bg-paper-alt/90 shadow-[0_1px_2px_oklch(0_0_0/0.03)] hover:border-border-strong" aria-label="Open user menu">
<Avatar className="h-8 w-8">
                       {user?.avatar && <AvatarImage src={user.avatar} alt={user.name || "Avatar"} />}
                       <AvatarFallback className="bg-stamp text-paper text-[11px] font-bold">
                         {user ? getInitials(user.name) : "?"}
                       </AvatarFallback>
                     </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-1">
                      <div className="p-2">
                        <p className="text-xs font-semibold truncate text-ink">{user?.name}</p>
                        <p className="text-[11px] text-muted truncate font-mono-data">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {isAdmin ? (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer text-xs">
                            <Shield className="mr-2 h-3.5 w-3.5" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="cursor-pointer text-xs">
                              <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile" className="cursor-pointer text-xs">
                              <User className="mr-2 h-3.5 w-3.5" />
                              Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="cursor-pointer text-xs">
                              <Settings className="mr-2 h-3.5 w-3.5" />
                              Settings
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs text-flag focus:text-flag">
                        <LogOut className="mr-2 h-3.5 w-3.5" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" variant="primary" rightIcon={ChevronRight}>
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-paper-alt/90 text-muted hover:bg-paper hover:text-ink transition-colors cursor-pointer"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-[18px] w-[18px] shrink-0" /> : <Menu className="h-[18px] w-[18px] shrink-0" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden border-b border-border bg-paper"
            >
              <div className="px-4 py-4 space-y-1">
                {!isAuthenticated && GUEST_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToHash(e, link.href)}
                    className={cn(
                      "block px-3 py-2 text-xs font-medium rounded-md transition-colors",
                      pathname === link.href
                        ? "bg-paper-alt text-ink border border-border"
                        : "text-muted hover:text-ink"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-border flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/blog"
                        className={cn(
                          "block px-3 py-2 text-xs font-medium rounded-md transition-colors",
                          pathname.startsWith("/blog")
                            ? "bg-paper-alt text-ink border border-border"
                            : "text-muted hover:text-ink"
                        )}
                      >
                        Blog
                      </Link>
                      {isAdmin ? (
                        <Link href="/admin">
                          <Button className="w-full" leftIcon={Shield}>Admin Dashboard</Button>
                        </Link>
                      ) : (
                        <Link href="/dashboard">
                          <Button className="w-full" leftIcon={LayoutDashboard}>Dashboard</Button>
                        </Link>
                      )}
                      {!isAdmin && !isPremium && (
                        <Link href="/dashboard/upgrade">
                          <Button className="w-full" leftIcon={Sparkles}>Upgrade to Pro</Button>
                        </Link>
                      )}
                      <Button variant="outline" className="w-full" onClick={handleLogout} leftIcon={LogOut}>
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button variant="outline" className="w-full">Sign in</Button>
                      </Link>
                      <Link href="/register">
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CommandPalette open={cmdPaletteOpen} setOpen={setCmdPaletteOpen} />
    </>
  );
}
