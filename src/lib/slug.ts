export const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/** Build a URL-safe, collision-resistant slug for a public recipe page. */
export const buildRecipeSlug = (title: string) => {
  const base = slugify(title) || "recipe";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
};

export const publicRecipeUrl = (slug: string) =>
  `${window.location.origin}/r/${slug}`;
