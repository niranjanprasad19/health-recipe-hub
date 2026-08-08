-- 1. Public recipe pages
ALTER TABLE public.saved_recipes
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS saved_recipes_slug_key ON public.saved_recipes (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS saved_recipes_public_idx ON public.saved_recipes (is_public, published_at DESC);

GRANT SELECT ON public.saved_recipes TO anon;

DROP POLICY IF EXISTS "Anyone can view published recipes" ON public.saved_recipes;
CREATE POLICY "Anyone can view published recipes"
  ON public.saved_recipes FOR SELECT
  TO anon, authenticated
  USING (is_public = true AND slug IS NOT NULL);

-- 2. Pantry
CREATE TABLE IF NOT EXISTS public.pantry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  quantity text,
  category text NOT NULL DEFAULT 'other',
  expires_on date,
  barcode text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pantry_items TO authenticated;
GRANT ALL ON public.pantry_items TO service_role;

ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own pantry" ON public.pantry_items;
CREATE POLICY "Users manage own pantry"
  ON public.pantry_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_pantry_items_updated_at ON public.pantry_items;
CREATE TRIGGER update_pantry_items_updated_at
  BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();