ALTER TABLE public.recipe_ratings
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cooked_at timestamptz,
  ADD COLUMN IF NOT EXISTS public_review text;

GRANT SELECT (id, recipe_id, rating, public_review, cooked_at, created_at) ON public.recipe_ratings TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view opted-in public recipe reviews" ON public.recipe_ratings;
CREATE POLICY "Anyone can view opted-in public recipe reviews"
  ON public.recipe_ratings
  FOR SELECT
  TO anon, authenticated
  USING (
    is_public = true
    AND cooked_at IS NOT NULL
    AND nullif(trim(public_review), '') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.saved_recipes
      WHERE saved_recipes.id = recipe_ratings.recipe_id
        AND saved_recipes.is_public = true
        AND saved_recipes.slug IS NOT NULL
    )
  );