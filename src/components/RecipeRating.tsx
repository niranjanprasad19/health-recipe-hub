import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RecipeRatingProps {
  recipeId: string;
}

export const RecipeRating = ({ recipeId }: RecipeRatingProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && recipeId) fetchRating();
  }, [user, recipeId]);

  const fetchRating = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("recipe_ratings")
      .select("*")
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId)
      .maybeSingle();
    if (data) {
      setRating(data.rating || 0);
      setNotes(data.notes || "");
      setExistingId(data.id);
    }
    setLoaded(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (existingId) {
        await supabase.from("recipe_ratings").update({ rating, notes, updated_at: new Date().toISOString() }).eq("id", existingId);
      } else {
        const { data } = await supabase.from("recipe_ratings").insert({ user_id: user.id, recipe_id: recipeId, rating, notes }).select().single();
        if (data) setExistingId(data.id);
      }
      toast({ title: t("rating.saved") });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
    setSaving(false);
  };

  if (!user || !loaded) return null;

  return (
    <Card className="mt-8 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          {t("rating.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4" />
            {t("rating.notesLabel")}
          </label>
          <Textarea
            placeholder={t("rating.notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
};
