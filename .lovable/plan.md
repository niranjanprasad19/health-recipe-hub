

# Add Indian Cuisine Section to NutriCheff

## What We're Building

A dedicated **Indian cuisine section** that adds Indian-specific food options, regional cuisines, spice preferences, and dietary styles throughout the existing preference form and recipe generation system. This gives users who enjoy Indian food a much richer, more authentic experience.

## Changes

### 1. Expand `src/data/formOptions.ts` with Indian-specific data

Add new exported arrays:

- **`indianFoodLikes`** -- Popular Indian ingredients: Paneer, Dal (Lentils), Basmati Rice, Roti/Naan, Ghee, Curd/Raita, Biryani, Samosa, Idli/Dosa, Chana, Rajma, Palak, Methi, Aloo, Gobi, Tandoori Chicken, Butter Chicken, Chole, Poha, Upma
- **`indianSpicePreferences`** -- Spice options with heat levels: Turmeric, Cumin, Coriander, Garam Masala, Cardamom, Mustard Seeds, Red Chilli, Black Pepper, Fenugreek, Asafoetida (Hing), Curry Leaves, Saffron
- **`indianRegionalCuisines`** -- Regional sub-cuisines with emojis: North Indian, South Indian, Bengali, Gujarati, Rajasthani, Punjabi, Hyderabadi, Kerala, Maharashtrian, Chettinad, Goan, Awadhi
- **`indianDietaryStyles`** -- Jain (no root vegetables), Sattvic (pure/yogic diet), Ayurvedic
- **`indianMealTypes`** -- Breakfast (Nashta), Lunch (Thali), Dinner, Snacks (Chaat/Tiffin), Festive/Special

Also add Indian items to existing `foodLikes` array (e.g., Paneer, Dal, Basmati Rice, Ghee, Naan).

Update the existing `cuisines` array to replace the single "Indian" entry with a note, or keep it and let the regional picker appear when "Indian" is selected.

### 2. Add new form step: `src/components/recipe-form/StepIndianPreferences.tsx`

A dedicated step that appears as **Step 6** (after Cuisine) when the user selects "Indian" in the cuisine step, or is always visible as an optional section. Contains:

- **Regional Cuisine Picker** -- grid of Indian regional cuisines (same style as existing cuisine buttons with emojis)
- **Spice Level Selector** -- Mild / Medium / Spicy / Extra Spicy (radio-style cards)
- **Indian Spice Preferences** -- multi-select tags for specific spices they enjoy
- **Indian Meal Type** -- what type of Indian meal (Thali, Snack, Breakfast, etc.)
- **Indian Dietary Styles** -- Jain, Sattvic, Ayurvedic checkboxes (in addition to existing dietary)

### 3. Update `src/hooks/useRecipeForm.ts`

- Add new fields to `RecipeFormData`: `indianRegion: string[]`, `spiceLevel: string`, `indianSpices: string[]`, `indianMealType: string`, `indianDietaryStyles: string[]`
- Increase `totalSteps` to 6
- Update `initialFormData` with defaults

### 4. Update `src/pages/Preferences.tsx`

- Add step 6 definition: `{ title: "Indian", description: "Regional flavors" }`
- Conditionally show Step 6 only when "indian" is in `formData.cuisines` (dynamic step count)
- Render `StepIndianPreferences` for step 6
- Import the new component

### 5. Update `supabase/functions/generate-recipe/index.ts`

- Add new fields to the Zod schema: `indianRegion`, `spiceLevel`, `indianSpices`, `indianMealType`, `indianDietaryStyles`
- Add Indian-specific context to the AI prompt:
  ```
  **Indian Regional Cuisine:** {region}
  **Spice Level:** {spiceLevel}
  **Preferred Indian Spices:** {spices}
  **Indian Meal Type:** {mealType}
  **Indian Dietary Style:** {indianDietary}
  ```
- Add system prompt guidance: "When Indian cuisine is selected, use authentic Indian cooking techniques, traditional spice combinations, and regional specialties."

### 6. Update Landing page trending tags

Add Indian-specific quick tags: "Paneer Recipes", "South Indian Breakfast", "Biryani"

## Technical Notes

- The Indian step is **conditionally shown** -- only appears when user selects "Indian" in the cuisine step. The total steps dynamically adjusts (5 or 6).
- No database changes needed -- all Indian preferences flow through the existing `formData` object to the edge function.
- The edge function Zod schema uses `.optional().default()` for all new fields so existing flows don't break.

