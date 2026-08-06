import { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type ColorTheme = "fresh" | "sunset" | "ocean" | "berry" | "earth" | "candy";

interface ThemeOption {
  id: ColorTheme;
  label: string;
  emoji: string;
  preview: string; // CSS gradient for preview swatch
}

const themes: ThemeOption[] = [
  { id: "fresh", label: "Fresh Green", emoji: "🌿", preview: "linear-gradient(135deg, #2d9a5e, #2e9da1)" },
  { id: "sunset", label: "Sunset Orange", emoji: "🌅", preview: "linear-gradient(135deg, #e06030, #f0a030)" },
  { id: "ocean", label: "Ocean Blue", emoji: "🌊", preview: "linear-gradient(135deg, #2563eb, #06b6d4)" },
  { id: "berry", label: "Berry Purple", emoji: "🫐", preview: "linear-gradient(135deg, #7c3aed, #ec4899)" },
  { id: "earth", label: "Earth Tone", emoji: "🍂", preview: "linear-gradient(135deg, #92400e, #b45309)" },
  { id: "candy", label: "Candy Pop", emoji: "🍭", preview: "linear-gradient(135deg, #e11d48, #f59e0b)" },
];

export const ThemeSelector = () => {
  const [activeTheme, setActiveTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem("nutrichef-color-theme") as ColorTheme) || "fresh";
  });

  useEffect(() => {
    applyTheme(activeTheme);
  }, []);

  const applyTheme = (themeId: ColorTheme) => {
    document.documentElement.setAttribute("data-color-theme", themeId);
    localStorage.setItem("nutrichef-color-theme", themeId);
    setActiveTheme(themeId);
  };

  const current = themes.find(t => t.id === activeTheme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5" aria-label="Change color theme">
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{current.emoji}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Color Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className={`gap-3 ${activeTheme === theme.id ? "bg-primary/10 text-primary" : ""}`}
          >
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 ring-1 ring-border"
              style={{ background: theme.preview }}
            />
            <span className="text-sm font-medium">{theme.emoji} {theme.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
