
CREATE TABLE public.nutrition_goals (
  user_id uuid PRIMARY KEY,
  daily_calories integer NOT NULL DEFAULT 2000,
  daily_protein integer NOT NULL DEFAULT 100,
  daily_carbs integer NOT NULL DEFAULT 250,
  daily_fat integer NOT NULL DEFAULT 65,
  reminder_enabled boolean NOT NULL DEFAULT false,
  reminder_times text[] NOT NULL DEFAULT ARRAY['08:00','13:00','19:00'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own goals" ON public.nutrition_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  food_name text NOT NULL,
  serving text,
  calories integer NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  fiber numeric DEFAULT 0,
  image_url text,
  source text NOT NULL DEFAULT 'manual',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own food logs" ON public.food_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX food_logs_user_date_idx ON public.food_logs (user_id, logged_at DESC);
