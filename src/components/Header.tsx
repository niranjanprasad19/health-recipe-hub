import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Leaf, LogOut, User, ArrowLeft, Menu, Home, Calendar, ShoppingCart, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  minimal?: boolean;
}

export const Header = ({ 
  showBackButton = false, 
  backTo = "/", 
  backLabel = "Back to Home",
  actions,
  minimal = false
}: HeaderProps) => {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/recipe-search", label: "Search", icon: Search },
    { to: "/meal-planning", label: "Meal Planning", icon: Calendar },
    { to: "/shopping-list", label: "Shopping List", icon: ShoppingCart },
  ];

  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground tracking-tight">NutriChef</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          
          {showBackButton && (
            <Link to={backTo}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
          )}
          
          {actions}
          
          {!loading && !minimal && (
            isAuthenticated ? (
              <>
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
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
            )
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          {actions}
          
          {!minimal && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  {showBackButton && (
                    <Link to={backTo} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {backLabel}
                      </Button>
                    </Link>
                  )}
                  
                  {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <link.icon className="w-4 h-4 mr-2" />
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                  
                  <div className="border-t border-border pt-4 mt-2">
                    {!loading && (
                      isAuthenticated ? (
                        <>
                          <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start mb-2">
                              <User className="w-4 h-4 mr-2" />
                              Profile
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive"
                            onClick={() => {
                              signOut();
                              setMobileMenuOpen(false);
                            }}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="default" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </nav>
    </header>
  );
};
