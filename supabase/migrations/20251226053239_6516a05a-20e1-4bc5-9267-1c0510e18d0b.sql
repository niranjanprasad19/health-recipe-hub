-- Add unique constraint to prevent duplicate meal plans for same user and week
ALTER TABLE public.meal_plans 
ADD CONSTRAINT meal_plans_user_week_unique UNIQUE (user_id, start_date);