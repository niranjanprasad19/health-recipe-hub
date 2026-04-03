import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FolderPlus, Plus, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AddToCollectionDialogProps {
  recipeId: string;
  trigger?: React.ReactNode;
}

interface CollectionOption {
  id: string;
  name: string;
  emoji: string;
  hasRecipe: boolean;
}

export const AddToCollectionDialog = ({ recipeId, trigger }: AddToCollectionDialogProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open && user) fetchCollections();
  }, [open, user]);

  const fetchCollections = async () => {
    if (!user) return;
    setLoading(true);
    const { data: cols } = await supabase
      .from("recipe_collections")
      .select("id, name, emoji")
      .eq("user_id", user.id)
      .order("name");

    if (cols) {
      const { data: items } = await supabase
        .from("collection_items")
        .select("collection_id")
        .eq("recipe_id", recipeId);

      const existingIds = new Set((items || []).map((i) => i.collection_id));
      setCollections(cols.map((c) => ({ ...c, hasRecipe: existingIds.has(c.id) })));
    }
    setLoading(false);
  };

  const toggleCollection = async (collectionId: string, hasRecipe: boolean) => {
    if (hasRecipe) {
      await supabase.from("collection_items").delete().eq("collection_id", collectionId).eq("recipe_id", recipeId);
    } else {
      await supabase.from("collection_items").insert({ collection_id: collectionId, recipe_id: recipeId });
    }
    setCollections((prev) => prev.map((c) => c.id === collectionId ? { ...c, hasRecipe: !hasRecipe } : c));
  };

  const createAndAdd = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    const { data } = await supabase
      .from("recipe_collections")
      .insert({ user_id: user.id, name: newName.trim() })
      .select()
      .single();
    if (data) {
      await supabase.from("collection_items").insert({ collection_id: data.id, recipe_id: recipeId });
      setCollections((prev) => [...prev, { id: data.id, name: data.name, emoji: data.emoji || "📁", hasRecipe: true }]);
      setNewName("");
      toast({ title: t("collections.addedTo", { name: data.name }) });
    }
    setCreating(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon"><FolderPlus className="w-4 h-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{t("collections.addTo")}</DialogTitle></DialogHeader>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => toggleCollection(c.id, c.hasRecipe)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  c.hasRecipe ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{c.name}</span>
                {c.hasRecipe && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Input placeholder={t("collections.newQuick")} value={newName} onChange={(e) => setNewName(e.target.value)} className="text-sm" />
          <Button size="sm" onClick={createAndAdd} disabled={creating || !newName.trim()} className="gradient-primary text-primary-foreground shrink-0">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
