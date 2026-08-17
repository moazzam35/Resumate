import Link from "next/link";
import { FileText } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const PORTFOLIO_URL = "https://moazzam35.github.io/portfolio/";

const productLinks = [
  { label: "CV Builder", href: "/" },
  { label: "Templates", href: "/#template" },
  { label: "Pricing", href: "/pricing" },
  { label: "Features", href: "/features" },
  { label: "ATS Checker", href: "/dashboard/ats-checker" },
  { label: "Cover Letters", href: "/dashboard/cover-letters" },
];

const resourceLinks = [
  { label: "Career Blog", href: "/blog" },
  { label: "Help Center", href: "/help" },
  { label: "FAQ", href: "/faq" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Security", href: "/security" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const developerLinks = [
  { label: "Moazzam Pasha", href: PORTFOLIO_URL, external: true },
];

function FooterColumn({ title, links }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-ink font-mono">{title}</h4>
      <ul className="space-y-2 text-xs text-muted">
        {links.map((link) => (
          <li key={link.href + link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="hover:text-ink transition-colors">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-paper-alt py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 mb-10 md:grid-cols-3 lg:grid-cols-7">
          {/* BRAND COLUMN */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-stamp text-paper">
                <FileText className="h-3 w-3" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-ink">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-xs text-muted max-w-sm leading-relaxed">
              Craft ATS-optimized, high-converting resumes with intelligent AI suggestions and modern templates designed for senior professionals.
            </p>
            <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-paper px-2.5 py-1 text-[10px] font-mono-data text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-verified" />
              All Systems Operational
            </div>
          </div>

          {/* PRODUCT */}
          <FooterColumn title="Product" links={productLinks} />

          {/* RESOURCES */}
          <FooterColumn title="Resources" links={resourceLinks} />

          {/* COMPANY */}
          <FooterColumn title="Company" links={companyLinks} />

          {/* LEGAL */}
          <FooterColumn title="Legal" links={legalLinks} />

          {/* DEVELOPER */}
          <FooterColumn title="Developer" links={developerLinks} />
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} Resumate Inc.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-paper px-3 py-1.5 text-xs font-medium text-muted hover:text-ink hover:border-border-strong transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
