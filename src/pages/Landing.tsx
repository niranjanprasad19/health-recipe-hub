import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Sparkles, ShoppingCart, Heart, Leaf, LogOut, User, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user, isAuthenticated, signOut, loading } = useAuth();

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
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
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
            )
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-12 pb-24">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Recipe Generation
          </div>
          
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
            Personalized Healthy Recipes{" "}
            <span className="text-primary">in Seconds!</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
            Tell us your preferences, allergies, and nutritional goals. Our AI creates 
            custom recipes with step-by-step instructions, shopping lists, and nutrition info.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/preferences">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-elevated hover:shadow-soft transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl">
                <Utensils className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
            {isAuthenticated && (
              <Link to="/meal-planning">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto rounded-xl">
                  <Calendar className="w-5 h-5 mr-2" />
                  Meal Planning
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI-Powered"
            description="Smart recipes tailored to your unique dietary needs and taste preferences"
          />
          <FeatureCard
            icon={<ShoppingCart className="w-6 h-6" />}
            title="Shopping Lists"
            description="Automatically generated ingredient lists ready for your next grocery trip"
          />
          <FeatureCard
            icon={<Heart className="w-6 h-6" />}
            title="Nutrition Focused"
            description="Address deficiencies and meet your health goals with every meal"
          />
        </div>

        {/* How It Works */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Share Preferences"
              description="Tell us what you like, allergies, and nutritional needs"
            />
            <StepCard
              number={2}
              title="AI Creates Recipe"
              description="Our AI generates a personalized recipe just for you"
            />
            <StepCard
              number={3}
              title="Cook & Enjoy"
              description="Follow easy steps, shop ingredients, and enjoy healthy meals"
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
              © 2024 NutriChef. Eat healthy, live better.
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
  <Card className="border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 bg-card">
    <CardContent className="pt-6">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
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
  <div className="text-center">
    <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-xl mx-auto mb-4 shadow-soft">
      {number}
    </div>
    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Landing;
