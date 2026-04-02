import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Leaf, LogOut, User, ArrowLeft, Menu, Home, Calendar, ShoppingCart, Search, Heart, Upload, Refrigerator, PartyPopper, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  backLabel,
  actions,
  minimal = false
}: HeaderProps) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const navigate = useNavigate();

  const resolvedBackLabel = backLabel || t('common.backToHome');

  useEffect(() => {
    if (user) { fetchProfile(); }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("avatar_url, display_name").eq("user_id", user.id).maybeSingle();
    if (data) { setAvatarUrl(data.avatar_url); setDisplayName(data.display_name); }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error(t('common.error')); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error(t('common.error')); return; }
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const { error } = await supabase.from("profiles").update({ avatar_url: base64 }).eq("user_id", user.id);
        if (error) throw error;
        setAvatarUrl(base64);
        toast.success(t('common.success'));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast.error(t('common.error'));
    }
  };

  const navLinks = [
    { to: "/", label: t('nav.home'), icon: Home },
    { to: "/search", label: t('nav.search'), icon: Search },
    { to: "/leftover-recipe", label: t('nav.leftoverRecipe'), icon: Refrigerator },
    { to: "/festival-recipes", label: t('nav.festivalRecipes'), icon: PartyPopper },
    { to: "/nutrition", label: t('nav.nutrition'), icon: TrendingUp },
    { to: "/profile", label: t('nav.savedRecipes'), icon: Heart },
    { to: "/meal-planning", label: t('nav.mealPlanning'), icon: Calendar },
    { to: "/shopping-list", label: t('nav.shoppingList'), icon: ShoppingCart },
  ];

  const getInitials = () => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

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
          <LanguageSelector />
          <ThemeToggle />
          
          {showBackButton && (
            <Link to={backTo}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {resolvedBackLabel}
              </Button>
            </Link>
          )}
          
          {actions}
          
          {!loading && !minimal && (
            isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 p-1 pr-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm text-muted-foreground">{displayName || user?.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{displayName || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {t('profile.updateAvatar')}
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    {t('common.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Heart className="w-4 h-4 mr-2" />
                    {t('nav.savedRecipes')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('common.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  {t('common.signIn')}
                </Button>
              </Link>
            )
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-1 overflow-hidden">
          <LanguageSelector />
          <ThemeToggle />
          <div className="flex items-center gap-1 overflow-hidden shrink min-w-0">{actions}</div>
          
          {!minimal && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  {isAuthenticated && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg mb-2">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={avatarUrl || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{displayName || "User"}</p>
                        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                  )}

                  {showBackButton && (
                    <Link to={backTo} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start"><ArrowLeft className="w-4 h-4 mr-2" />{resolvedBackLabel}</Button>
                    </Link>
                  )}
                  
                  {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start"><link.icon className="w-4 h-4 mr-2" />{link.label}</Button>
                    </Link>
                  ))}
                  
                  <div className="border-t border-border pt-4 mt-2">
                    {!loading && (
                      isAuthenticated ? (
                        <>
                          <label className="w-full">
                            <Button variant="ghost" className="w-full justify-start mb-2 cursor-pointer" asChild>
                              <span><Upload className="w-4 h-4 mr-2" />{t('profile.updateAvatar')}</span>
                            </Button>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleAvatarUpload(e); setMobileMenuOpen(false); }} />
                          </label>
                          <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start mb-2"><User className="w-4 h-4 mr-2" />{t('common.profile')}</Button>
                          </Link>
                          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive"
                            onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                            <LogOut className="w-4 h-4 mr-2" />{t('common.signOut')}
                          </Button>
                        </>
                      ) : (
                        <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="default" className="w-full">{t('common.signIn')}</Button>
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
