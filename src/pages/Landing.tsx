import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Utensils, Sparkles, ShoppingCart, Heart, Leaf, LogOut, User, Calendar, Search, Zap, ArrowRight } from "lucide-react";
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

  const trendingTags = ["High Protein 💪", "Vegan Gains 🌱", "Quick & Dirty 🔥", "Zero Sugar 🚫", "Keto Life ⚡"];

  return (
    <div className="min-h-screen gradient-hero overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-neon flex items-center justify-center shadow-soft glow-effect">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">NutriChef</span>
          </div>
          {!loading && (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{user?.email}</span>
                    <span className="sm:hidden">Profile</span>
                  </Button>
                </Link>
                <Button variant="ghost" onClick={signOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-semibold">
                  Sign In
                </Button>
              </Link>
            )
          )}
        </nav>
      </header>

      {/* Hero Section with Search Bar */}
      <main className="container mx-auto px-4 pt-8 pb-24">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          {/* Punchy Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-neon text-primary-foreground text-sm font-bold mb-8 shadow-elevated glow-effect">
            <Zap className="w-4 h-4" />
            FUEL YOUR BODY RIGHT
            <Zap className="w-4 h-4" />
          </div>
          
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-foreground mb-4 text-balance leading-tight">
            Healthy Eating,{" "}
            <span className="relative">
              <span className="bg-clip-text text-transparent gradient-neon">Zero Effort</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 gradient-neon rounded-full"></span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Drop your cravings, we'll handle the rest. AI-powered recipes that actually slap. 🔥
          </p>

          {/* Big Horizontal Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 gradient-neon rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300 pulse-glow"></div>
              <div className="relative flex items-center bg-card rounded-2xl border-2 border-primary/20 shadow-elevated overflow-hidden">
                <Search className="w-6 h-6 text-muted-foreground ml-5" />
                <Input
                  type="text"
                  placeholder="What are you craving? Try 'high protein breakfast' or 'vegan pasta'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 text-lg py-7 px-4 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/60"
                />
                <Button 
                  type="submit"
                  size="lg" 
                  className="gradient-neon text-primary-foreground mr-2 px-8 py-6 h-auto rounded-xl font-bold text-base shadow-soft hover:scale-105 transition-transform duration-200"
                >
                  Generate
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </form>

          {/* Trending Tags */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <span className="text-sm text-muted-foreground font-medium">Trending:</span>
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag.replace(/[^\w\s]/g, '').trim())}
                className="px-4 py-1.5 rounded-full bg-secondary/80 hover:bg-primary/20 text-sm font-medium text-secondary-foreground hover:text-primary transition-all duration-200 border border-border/50 hover:border-primary/30"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/preferences">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                <Utensils className="w-5 h-5 mr-2" />
                Set Preferences
              </Button>
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/meal-planning">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5">
                    <Calendar className="w-5 h-5 mr-2" />
                    Meal Plan
                  </Button>
                </Link>
                <Link to="/shopping-list">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Shopping
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI That Gets You"
            description="No generic recipes. Our AI learns what you actually like and delivers bangers every time."
            emoji="🧠"
          />
          <FeatureCard
            icon={<ShoppingCart className="w-6 h-6" />}
            title="One-Tap Shopping"
            description="Auto-generated shopping lists. Just grab and go. No more forgetting ingredients."
            emoji="🛒"
          />
          <FeatureCard
            icon={<Heart className="w-6 h-6" />}
            title="Gains Focused"
            description="Whether you're bulking, cutting, or just tryna eat clean — we got you covered."
            emoji="💪"
          />
        </div>

        {/* How It Works */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">Three steps to meal prep domination 🎯</p>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Drop Your Vibes"
              description="Tell us your dietary goals, allergies, and what flavors you're feeling"
            />
            <StepCard
              number={2}
              title="AI Does Its Thing"
              description="Our AI cooks up personalized recipes that match your exact needs"
            />
            <StepCard
              number={3}
              title="Eat. Repeat. Flex."
              description="Follow easy steps, hit your macros, and enjoy meals that actually taste good"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-foreground">NutriChef</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 NutriChef. Eat clean, live mean. 🥗
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
  emoji: string;
}

const FeatureCard = ({ icon, title, description, emoji }: FeatureCardProps) => (
  <Card className="border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 bg-card group hover:-translate-y-1">
    <CardContent className="pt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:gradient-neon group-hover:text-primary-foreground transition-all duration-300">
          {icon}
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </CardContent>
  </Card>
);

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

const StepCard = ({ number, title, description }: StepCardProps) => (
  <div className="text-center group">
    <div className="w-16 h-16 rounded-full gradient-neon flex items-center justify-center text-primary-foreground font-heading font-bold text-2xl mx-auto mb-4 shadow-soft group-hover:glow-effect transition-all duration-300 float-animation" style={{ animationDelay: `${number * 0.2}s` }}>
      {number}
    </div>
    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Landing;
