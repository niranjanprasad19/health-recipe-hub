

# Feature Plan: Cooking Timer + Leftover Recipe Generator

## Feature 1: Cooking Timer & Step-by-Step Mode

Add a "Start Cooking" button on recipe pages that opens a full-screen cooking mode with one step at a time, navigation arrows, and built-in countdown timers.

### Changes

**New component: `src/components/CookingMode.tsx`**
- Full-screen overlay/dialog that takes a `Recipe` as prop
- Shows one instruction step at a time with large text for kitchen readability
- Previous/Next navigation buttons + step counter (e.g., "Step 3 of 8")
- Auto-detect time mentions in instructions (e.g., "cook for 5 minutes") and show a "Start Timer" button
- Countdown timer with audio beep when complete (using `new Audio()` with a simple tone)
- Progress bar across the top showing completion
- "Keep screen awake" using Wake Lock API where supported
- Large tap targets for greasy-finger-friendly interaction
- Close/exit button to return to normal view

**Update `src/pages/QuickRecipe.tsx` and `src/pages/RecipeResult.tsx`**
- Add a prominent "Start Cooking" button (with a Play icon) next to existing action buttons
- Import and render `CookingMode` as a dialog/overlay when activated

**Update `src/i18n/locales/*.json` (all 11 files)**
- Add keys: `cooking.startCooking`, `cooking.step`, `cooking.of`, `cooking.startTimer`, `cooking.timerDone`, `cooking.previous`, `cooking.next`, `cooking.finish`, `cooking.exitCooking`

---

## Feature 2: Leftover Recipe Generator

A new page where users input ingredients they already have and get AI-generated recipes using only those ingredients.

### Changes

**New page: `src/pages/LeftoverRecipe.tsx`**
- Input area with tag-style ingredient entry (type + Enter to add, click X to remove)
- Common ingredient quick-add chips (Onion, Tomato, Rice, Eggs, Potato, Bread, Chicken, Paneer, etc.)
- "Generate Recipe" button that calls the existing `generate-recipe` edge function with a specialized prompt like "Create a recipe using ONLY these ingredients: [list]. Suggest minimal additional pantry staples if needed."
- Shows the generated recipe in the same card format as QuickRecipe
- Same save/share functionality as QuickRecipe

**Update `src/App.tsx`**
- Add route: `/leftover-recipe` -> `LeftoverRecipe`

**Update `src/pages/Landing.tsx`**
- Add a new quick action button: "Use Leftovers" with a Refrigerator icon
- Add "Leftover Recipe" to trending tags

**Update `src/components/Header.tsx`**
- Add navigation link to leftover recipe page

**Update `supabase/functions/generate-recipe/index.ts`**
- Add optional `mode` field to Zod schema (`"standard" | "leftover"`)
- When mode is "leftover", modify the AI prompt to emphasize using only the provided ingredients and suggest minimal extras

**Update `src/i18n/locales/*.json` (all 11 files)**
- Add keys: `leftover.title`, `leftover.subtitle`, `leftover.addIngredient`, `leftover.placeholder`, `leftover.commonIngredients`, `leftover.generate`, `leftover.usingOnly`

### No database changes needed -- both features use existing tables and edge functions.

