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
  { path: "/recipes", changefreq: "daily", priority: "0.8" },
  { path: "/guides", changefreq: "weekly", priority: "0.8" },
  ...[
    "10-minute-hostel-recipes",
    "indian-recipes-with-us-grocery-ingredients",
    "budget-indian-student-meals",
    "high-protein-vegetarian-indian",
    "jain-and-satvik-recipes",
    "south-indian-breakfast-recipes",
  ].map((s) => ({ path: `/guides/${s}`, changefreq: "monthly" as const, priority: "0.8" })),
];

async function publicRecipeEntries(): Promise<SitemapEntry[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/saved_recipes?select=slug&is_public=eq.true&slug=not.is.null&limit=5000`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return [];
    const rows: { slug: string }[] = await res.json();
    return rows.map((r) => ({ path: `/r/${r.slug}`, changefreq: "monthly", priority: "0.6" }));
  } catch {
    return [];
  }
}

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

const all = [...entries, ...(await publicRecipeEntries())];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(all));
console.log(`sitemap.xml written (${all.length} entries)`);
