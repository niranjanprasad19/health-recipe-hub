# 🍳 RecipeAI - AI-Powered Recipe & Meal Planning Platform

An intelligent recipe generation and meal planning application that creates personalized recipes based on your dietary preferences, allergies, and nutritional goals.

![RecipeAI Banner](screenshots/banner-placeholder.png)

## ✨ Features

### 🤖 AI Recipe Generation
- Generate custom recipes using natural language prompts
- Personalized recommendations based on dietary preferences
- Support for multiple cuisines and cooking styles
- Nutritional information included with each recipe

### 📅 Drag-and-Drop Meal Planning
- Visual weekly meal planner with intuitive drag-and-drop interface
- Organize breakfast, lunch, dinner, and snacks
- Easy meal rearrangement across days
- Automatic meal plan persistence

### 🛒 Smart Shopping Lists
- Auto-categorized ingredients (Produce, Dairy, Meat, Pantry, etc.)
- Generate shopping lists from meal plans
- Check off items as you shop
- Collapsible category sections for easy navigation

### 👤 User Profiles & Preferences
- Comprehensive dietary preference settings
- Allergy and intolerance tracking
- Nutritional goals and health objectives
- Avatar upload support

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark/Light mode toggle
- Beautiful animations and transitions
- Accessible navigation with breadcrumbs


## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State Management** | TanStack Query, React Hooks |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Backend** | Lovable Cloud (Supabase) |
| **Authentication** | Supabase Auth |
| **Database** | PostgreSQL |
| **AI Integration** | Lovable AI (Gemini/GPT models) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/niranjanprasad19/health-recipe-hub.git
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Variables

The project uses Lovable Cloud for backend services. Environment variables are automatically configured when connected to Lovable.

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── meal-planning/         # Drag-and-drop meal components
│   ├── recipe-form/           # Multi-step recipe form
│   ├── Header.tsx             # Main navigation header
│   ├── Breadcrumb.tsx         # Navigation breadcrumbs
│   └── ThemeToggle.tsx        # Dark/Light mode toggle
├── pages/
│   ├── Landing.tsx            # Home page
│   ├── QuickRecipe.tsx        # Recipe generation
│   ├── RecipeResult.tsx       # Generated recipe display
│   ├── MealPlanning.tsx       # Weekly meal planner
│   ├── ShoppingList.tsx       # Categorized shopping lists
│   ├── Preferences.tsx        # User dietary preferences
│   ├── Profile.tsx            # User profile & saved recipes
│   └── Auth.tsx               # Authentication page
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   ├── useRecipeForm.ts       # Recipe form state
│   └── use-toast.ts           # Toast notifications
├── data/
│   └── formOptions.ts         # Form configuration data
├── types/
│   └── recipe.ts              # TypeScript interfaces
└── integrations/
    └── supabase/              # Backend client & types
```

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profile information |
| `saved_recipes` | User's saved/generated recipes |
| `meal_plans` | Weekly meal plan containers |
| `meal_plan_items` | Individual meals in a plan |
| `shopping_lists` | Shopping list containers |
| `shopping_list_items` | Individual shopping items |

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication with email/password
- Protected API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lovable](https://lovable.dev) for the development platform
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [@dnd-kit](https://dndkit.com/) for drag-and-drop functionality

---

<p align="center">
  Built with ❤️ using <a href="https://lovable.dev">Lovable</a>
</p>
