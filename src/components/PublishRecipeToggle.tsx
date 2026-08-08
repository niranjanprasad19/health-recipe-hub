import { useEffect, useState } from "react";
import { Globe, Link2, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { buildRecipeSlug, publicRecipeUrl } from "@/lib/slug";
import { toast } from "sonner";

interface PublishRecipeToggleProps {
  recipeId: string;
  title: string;
}

/**
 * Opt-in publishing control. A recipe stays private until the owner flips
 * this switch, at which point it gets a permanent, indexable /r/:slug page.
 */
export const PublishRecipeToggle = ({ recipeId, title }: PublishRecipeToggleProps) => {
  const [isPublic, setIsPublic] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("saved_recipes")
      .select("is_public, slug")
      .eq("id", recipeId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        setIsPublic(Boolean(data.is_public));
        setSlug(data.slug ?? null);
      });
    return () => {
      active = false;
    };
  }, [recipeId]);

  const toggle = async (next: boolean) => {
    setBusy(true);
    const nextSlug = next ? slug ?? buildRecipeSlug(title) : slug;
    const { error } = await supabase
      .from("saved_recipes")
      .update({
        is_public: next,
        slug: nextSlug,
        published_at: next ? new Date().toISOString() : null,
      })
      .eq("id", recipeId);
    setBusy(false);

    if (error) {
      console.error("Failed to update recipe visibility:", error);
      toast.error("Couldn't update visibility. Please try again.");
      return;
    }
    setIsPublic(next);
    setSlug(nextSlug ?? null);
    toast.success(next ? "Recipe is live on the web" : "Recipe is private again");
  };

  const copyLink = async () => {
    if (!slug) return;
    await navigator.clipboard.writeText(publicRecipeUrl(slug));
    toast.success("Public link copied");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Recipe visibility settings"
          className="ripple-container"
        >
          {isPublic ? <Globe className="w-4 h-4 text-success" /> : <Lock className="w-4 h-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Publish to the web</p>
            <p className="text-xs text-muted-foreground">
              Creates a public page anyone can open — great for sharing and search.
            </p>
          </div>
          <Switch
            checked={isPublic}
            disabled={busy}
            onCheckedChange={toggle}
            aria-label="Publish recipe to the web"
          />
        </div>
        {busy && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        {isPublic && slug && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-mono break-all text-muted-foreground">/r/{slug}</p>
            <Button size="sm" variant="secondary" className="w-full" onClick={copyLink}>
              <Link2 className="w-3.5 h-3.5 mr-1.5" />
              Copy public link
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
