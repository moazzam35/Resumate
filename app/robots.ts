import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/", "/_next/"],
      },
    ],
    sitemap: `${SITE_CONFIG.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}