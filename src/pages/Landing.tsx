import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Utensils, Sparkles, ShoppingCart, Heart, Leaf, LogOut, User, Calendar, Search, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const Landing = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/preferences');
    }
  };

  const trendingTags = ["High Protein", "Plant Based", "Quick Meals", "Low Carb", "Mediterranean"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">NutriChef</span>
          </div>
          {!loading && (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{user?.email}</span>
                    <span className="sm:hidden">Profile</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
            )
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <p className="text-sm font-medium text-primary tracking-wide uppercase mb-4">
            AI-Powered Recipe Generation
          </p>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-foreground mb-6 tracking-tight leading-tight">
            Personalized recipes for{" "}
            <span className="text-primary">healthier living</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Generate custom recipes tailored to your dietary preferences, 
            nutritional goals, and available ingredients.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
            <div className="flex items-center bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-shadow focus-within:shadow-md focus-within:border-primary/50">
              <Search className="w-5 h-5 text-muted-foreground ml-4" />
              <Input
                type="text"
                placeholder="Search for recipes... e.g., high protein breakfast"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 text-base py-6 px-3 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
              />
              <Button 
                type="submit"
                className="mr-2 px-6 rounded-lg"
              >
                Generate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          {/* Trending Tags */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1.5 rounded-full bg-secondary text-sm text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/preferences">
              <Button size="lg" variant="outline" className="rounded-lg">
                <Utensils className="w-4 h-4 mr-2" />
                Set Preferences
              </Button>
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/meal-planning">
                  <Button size="lg" variant="outline" className="rounded-lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Meal Plan
                  </Button>
                </Link>
                <Link to="/shopping-list">
                  <Button size="lg" variant="outline" className="rounded-lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Shopping List
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-28 max-w-4xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="w-5 h-5" />}
            title="Smart Recommendations"
            description="AI learns your preferences and suggests recipes you'll actually enjoy."
          />
          <FeatureCard
            icon={<ShoppingCart className="w-5 h-5" />}
            title="Automated Shopping"
            description="Generate shopping lists automatically from your selected recipes."
          />
          <FeatureCard
            icon={<Heart className="w-5 h-5" />}
            title="Nutrition Focused"
            description="Track macros and nutritional information for every recipe."
          />
        </div>

        {/* How It Works */}
        <div className="mt-28 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-foreground mb-3 tracking-tight">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Three simple steps to your perfect meal
          </p>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Set Preferences"
              description="Share your dietary needs, allergies, and taste preferences"
            />
            <StepCard
              number={2}
              title="Generate Recipes"
              description="Our AI creates personalized recipes matching your criteria"
            />
            <StepCard
              number={3}
              title="Cook and Enjoy"
              description="Follow easy instructions and enjoy delicious, healthy meals"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">NutriChef</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 NutriChef. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
    <CardContent className="pt-6">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

const StepCard = ({ number, title, description }: StepCardProps) => (
  <div className="text-center">
    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

export default Landing;
