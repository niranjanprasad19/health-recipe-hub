

# Award-Winning Visual Redesign for NutriCheff

## What We're Building

A complete visual overhaul inspired by award-winning website patterns: immersive hero with scroll animations, glassmorphism cards, micro-interactions on every element, AI-generated food photography, storytelling scroll sections, conversion-focused CTAs, and polished typography throughout. The goal is to make NutriCheff feel like a premium, magazine-quality food platform.

## Changes

### 1. Landing Page -- Immersive Hero Redesign
**File: `src/pages/Landing.tsx`**
- Replace static hero with a full-viewport cinematic hero featuring animated text reveal (word-by-word), floating food elements, and a pulsing CTA button with glow effect
- Add a smooth scroll-triggered storytelling section: as user scrolls, content fades/slides in with staggered timing -- stats counter ("10,000+ recipes generated"), testimonial-style quote blocks, and feature showcases with parallax food images
- Replace flat feature cards with glassmorphism cards (backdrop-blur, semi-transparent backgrounds, subtle borders) with hover lift + glow animations
- Add an animated "How it Works" section with a connecting line/path between steps (SVG animated on scroll)
- Horizontal auto-scrolling recipe inspiration ticker/marquee
- Conversion-focused CTA section at bottom with gradient background and animated arrow

### 2. Global Design System Upgrade
**File: `src/index.css`**
- Add glassmorphism utility classes (`.glass-card`, `.glass-dark`)
- Add text gradient utilities for headings
- Add shimmer/skeleton loading animation
- Add smooth page transition classes
- Enhance glow effects and add hover-lift utility

**File: `tailwind.config.ts`**
- Add new keyframes: `shimmer`, `float-slow`, `text-reveal`, `marquee`, `counter-up`
- Add backdrop-blur utilities and glass effect presets

### 3. Header -- Sticky with Blur Effect
**File: `src/components/Header.tsx`**
- Make header sticky with `backdrop-blur-xl` glassmorphism effect on scroll
- Add scroll-aware background opacity (transparent at top, blurred when scrolled)
- Subtle bottom border that appears on scroll

### 4. Recipe Cards -- Visual Upgrade
**File: `src/pages/Landing.tsx` (RecipeCard component)**
- Add gradient overlay on hover
- Animated icon transitions
- Subtle scale + shadow on hover with spring animation

### 5. Auth Page -- Premium Feel
**File: `src/pages/Auth.tsx`**
- Add decorative food illustration/pattern in background
- Glassmorphism card for the login form
- Animated form field focus states with glow borders

### 6. Page Transitions
**File: `src/App.tsx`**
- Wrap routes with framer-motion `AnimatePresence` for smooth page enter/exit transitions (fade + slight slide up)

### 7. AI-Generated Food Hero Images
**File: `supabase/functions/generate-recipe/index.ts`** (or new edge function)
- Use Lovable AI image generation (Nano banana) to generate a dish photo when a recipe is created
- Display generated image at top of recipe result pages

### 8. Interactive Elements Throughout
- Animated counters on landing page stats
- Hover-reveal descriptions on feature cards
- Smooth accordion animations on recipe instructions
- Button ripple effects on click
- Loading states with branded skeleton screens instead of spinners

## Technical Notes
- All animations use `framer-motion` (already installed) for performance
- Glassmorphism uses CSS `backdrop-filter: blur()` with fallbacks
- No new dependencies needed beyond what's already installed
- AI image generation uses the existing Lovable AI gateway
- All new classes follow the existing design token system (CSS variables)
- Dark mode support maintained for every new visual element

