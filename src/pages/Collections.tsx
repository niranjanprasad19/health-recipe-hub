import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FolderPlus, Plus, Trash2, BookOpen, Loader2, Clock, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  recipe_count?: number;
}

interface CollectionRecipe {
  id: string;
  recipe_id: string;
  title: string;
  cuisine: string | null;
  prep_time: number | null;
  cook_time: number | null;
  image_url: string | null;
}

const EMOJI_OPTIONS = ["📁", "🍽️", "🌮", "🍝", "🥗", "🍜", "🎉", "❤️", "⭐", "🔥", "🌿", "🍰", "☀️", "🌙"];

const Collections = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEmoji, setNewEmoji] = useState("📁");
  const [creating, setCreating] = useState(false);

  // Detail view
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionRecipes, setCollectionRecipes] = useState<CollectionRecipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/auth");
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (user) fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("recipe_collections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      // Get counts
      const withCounts = await Promise.all(
        data.map(async (c) => {
          const { count } = await supabase
            .from("collection_items")
            .select("*", { count: "exact", head: true })
            .eq("collection_id", c.id);
          return { ...c, recipe_count: count || 0 };
        })
      );
      setCollections(withCounts);
    }
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    const { error } = await supabase.from("recipe_collections").insert({
      user_id: user.id,
      name: newName.trim(),
      description: newDesc.trim() || null,
      emoji: newEmoji,
    });
    if (!error) {
      toast({ title: t("collections.created") });
      setNewName(""); setNewDesc(""); setNewEmoji("📁"); setShowCreate(false);
      fetchCollections();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("recipe_collections").delete().eq("id", id);
    if (!error) {
      setCollections((prev) => prev.filter((c) => c.id !== id));
      if (selectedCollection?.id === id) setSelectedCollection(null);
      toast({ title: t("collections.deleted") });
    }
  };

  const openCollection = async (collection: Collection) => {
    setSelectedCollection(collection);
    setLoadingRecipes(true);
    const { data } = await supabase
      .from("collection_items")
      .select("id, recipe_id, saved_recipes(title, cuisine, prep_time, cook_time, image_url)")
      .eq("collection_id", collection.id);

    if (data) {
      setCollectionRecipes(
        data.map((d: any) => ({
          id: d.id,
          recipe_id: d.recipe_id,
          title: d.saved_recipes?.title || "Untitled",
          cuisine: d.saved_recipes?.cuisine,
          prep_time: d.saved_recipes?.prep_time,
          cook_time: d.saved_recipes?.cook_time,
          image_url: d.saved_recipes?.image_url,
        }))
      );
    }
    setLoadingRecipes(false);
  };

  const removeFromCollection = async (itemId: string) => {
    await supabase.from("collection_items").delete().eq("id", itemId);
    setCollectionRecipes((prev) => prev.filter((r) => r.id !== itemId));
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen gradient-hero flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header showBackButton backTo="/profile" backLabel={t("profile.yourProfile")} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {t("collections.title")}
          </h1>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />{t("collections.create")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("collections.createNew")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button key={e} onClick={() => setNewEmoji(e)} className={`text-2xl p-2 rounded-lg transition-colors ${newEmoji === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-secondary"}`}>{e}</button>
                  ))}
                </div>
                <Input placeholder={t("collections.namePlaceholder")} value={newName} onChange={(e) => setNewName(e.target.value)} />
                <Input placeholder={t("collections.descPlaceholder")} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="gradient-primary text-primary-foreground">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("collections.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {selectedCollection ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="ghost" onClick={() => setSelectedCollection(null)} className="mb-4 text-muted-foreground">{t("common.back")}</Button>
            <Card className="shadow-elevated mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCollection.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedCollection.name}</h2>
                    {selectedCollection.description && <p className="text-sm text-muted-foreground font-normal">{selectedCollection.description}</p>}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecipes ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : collectionRecipes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">{t("collections.empty")}</p>
                    <Link to="/profile"><Button variant="outline">{t("collections.addFromSaved")}</Button></Link>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {collectionRecipes.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                        <Link to={`/recipe/${r.recipe_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0 shadow-soft">
                            {r.image_url ? (
                              <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full gradient-primary flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-primary-foreground/80" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-foreground text-sm truncate hover:text-primary transition-colors">{r.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              {r.cuisine && <span>{r.cuisine}</span>}
                              {(r.prep_time || r.cook_time) && (
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{(r.prep_time || 0) + (r.cook_time || 0)} min</span>
                              )}
                            </div>
                          </div>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => removeFromCollection(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : collections.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <FolderPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{t("collections.noCollections")}</h3>
                  <p className="text-muted-foreground mb-4">{t("collections.noCollectionsDesc")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {collections.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="shadow-card hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer group h-full" onClick={() => openCollection(c)}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-3xl">{c.emoji}</span>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={(e) => e.stopPropagation()}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("collections.deleteConfirm")}</AlertDialogTitle>
                                  <AlertDialogDescription>{t("collections.deleteDesc", { name: c.name })}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-destructive text-destructive-foreground">{t("common.delete")}</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          <h3 className="font-semibold text-foreground mb-1">{c.name}</h3>
                          {c.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{c.description}</p>}
                          <Badge variant="secondary" className="text-xs">{c.recipe_count} {t("collections.recipes")}</Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Collections;
