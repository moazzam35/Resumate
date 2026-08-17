"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  FileText,
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
import { useAuthStore } from "@/store";
import { SITE_CONFIG } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";

const GUEST_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/#template" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog", matchPrefix: "/blog" },
  // Secondary destinations — shown at desktop width only, so the tablet nav
  // keeps a comfortable pace instead of crowding the auth actions.
  { label: "FAQ", href: "/#faq", desktopOnly: true },
  { label: "ATS Checker", href: "/dashboard/ats-checker", matchPrefix: "/dashboard/ats-checker", desktopOnly: true },
];

// Signed-in users get an app-first nav: their workspace + the key product
// destinations. All links are always visible (like the dashboard sidebar) —
// the nav container scrolls internally on the tightest widths instead of
// hiding any link.
const AUTH_LINKS = [
  { label: "Templates", href: "/#template" },
  { label: "ATS Checker", href: "/dashboard/ats-checker", matchPrefix: "/dashboard/ats-checker" },
  { label: "Blog", href: "/dashboard/blog", matchPrefix: "/dashboard/blog" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    const path = href.slice(0, hashIndex) || "/";
    const hash = href.slice(hashIndex + 1);
    if (pathname !== path) return;
    e.preventDefault();
    setMobileOpen(false);
    setActiveHash(`#${hash}`);
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Full nav for the current auth state. The first link is the user's primary
  // destination (Dashboard, or Admin for admins); the rest are shared across
  // states. `desktopOnly` links drop out at tablet width to keep the pace.
  const navLinks = useMemo(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        return [
          { label: "Admin", href: "/admin", matchPrefix: "/admin", icon: Shield },
          ...AUTH_LINKS,
        ];
      }
      return [{ label: "Dashboard", href: "/dashboard" }, ...AUTH_LINKS];
    }
    return GUEST_LINKS;
  }, [isAuthenticated, isAdmin]);

  const [activeHash, setActiveHash] = useState("");

  // Scroll-spy: track which homepage section is in view via IntersectionObserver.
  // Falls back to URL hash on direct navigation (/#template, etc.).
  useEffect(() => {
    if (pathname !== "/") return;

    // On direct navigation with a hash, set it immediately.
    const initHash = window.location.hash;
    if (initHash) setActiveHash(initHash);

    const hashLinks = navLinks.filter((l) => l.href.includes("#"));
    const sectionIds = hashLinks.map((l) => l.href.slice(l.href.indexOf("#") + 1));

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible section.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const hash = `#${visible[0].target.id}`;
          setActiveHash((prev) => (prev === hash ? prev : hash));
          if (window.location.hash !== hash) {
            history.replaceState(null, "", hash);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    // Observe after a tick so DOM sections are mounted.
    const timer = setTimeout(() => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname, navLinks]);

  // Reset hash state on route change (leaving home page).
  useEffect(() => {
    if (pathname !== "/") setActiveHash("");
  }, [pathname]);

  const isLinkActive = (link) => {
    if (link.matchPrefix) return pathname.startsWith(link.matchPrefix);
    if (link.href.includes("#")) {
      if (pathname !== "/") return false;
      return activeHash === link.href.slice(link.href.indexOf("#"));
    }
    return pathname === link.href;
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-5 lg:px-8">
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

            <nav className="hidden md:flex w-fit min-w-0 items-center justify-center gap-0.5 overflow-x-auto rounded-[10px] border border-border bg-paper-alt/90 p-1 backdrop-blur-sm shadow-[0_1px_2px_oklch(0_0_0/0.03)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToHash(e, link.href)}
                  className={cn(
                    "relative whitespace-nowrap px-1.5 py-1.5 text-[11px] font-medium rounded-[7px] transition-colors lg:px-3 lg:text-xs",
                    link.icon && "flex items-center gap-1.5",
                    link.desktopOnly && "hidden lg:inline-flex",
                    isLinkActive(link)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted hover:text-ink hover:bg-paper-alt/60"
                  )}
                >
                  {link.icon && <link.icon className="h-3 w-3" />}
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
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
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full border border-border bg-paper-alt/90 shadow-[0_1px_2px_oklch(0_0_0/0.03)] hover:border-border-strong md:h-8 md:w-8 lg:h-9 lg:w-9" aria-label="Open user menu">
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
                        <DropdownMenuItem onClick={() => router.push("/admin")} className="cursor-pointer text-xs">
                          <Shield className="mr-2 h-3.5 w-3.5" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer text-xs">
                            <LayoutDashboard className="mr-2 h-3.5 w-3.5" />
                            Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer text-xs">
                            <User className="mr-2 h-3.5 w-3.5" />
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="cursor-pointer text-xs">
                            <Settings className="mr-2 h-3.5 w-3.5" />
                            Settings
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
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => scrollToHash(e, link.href)}
                    className={cn(
                      "block px-3 py-2 text-xs font-medium rounded-md transition-colors",
                      isLinkActive(link)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted hover:text-ink hover:bg-paper-alt/60"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2 border-t border-border flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
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
    </>
  );
}
