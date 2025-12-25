-- Add UPDATE policy for saved_recipes table
CREATE POLICY "Users can update their own recipes"
ON public.saved_recipes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);