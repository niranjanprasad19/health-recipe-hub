// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://nutricheff.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/preferences", changefreq: "monthly", priority: "0.9" },
  { path: "/quick-recipe", changefreq: "monthly", priority: "0.8" },
  { path: "/leftover-recipe", changefreq: "monthly", priority: "0.8" },
  { path: "/festival-recipes", changefreq: "weekly", priority: "0.8" },
  { path: "/food-tracker", changefreq: "monthly", priority: "0.8" },
  { path: "/meal-planning", changefreq: "monthly", priority: "0.7" },
  { path: "/shopping-list", changefreq: "monthly", priority: "0.6" },
  { path: "/search", changefreq: "weekly", priority: "0.7" },
  { path: "/nutrition", changefreq: "monthly", priority: "0.6" },
  { path: "/collections", changefreq: "monthly", priority: "0.6" },
  { path: "/family-profiles", changefreq: "monthly", priority: "0.5" },
];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
