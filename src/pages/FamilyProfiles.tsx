import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Trash2, Loader2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";

interface FamilyProfile {
  id: string;
  name: string;
  avatar_emoji: string;
  age_range: string | null;
  dietary_preferences: string[];
  allergies: string[];
  favorite_cuisines: string[];
}

const AVATAR_EMOJIS = ["👤", "👦", "👧", "👨", "👩", "👶", "🧓", "👴", "👵", "🐱", "🐶", "🦊"];
const AGE_RANGES = ["Toddler (1-3)", "Child (4-12)", "Teen (13-17)", "Adult (18-64)", "Senior (65+)"];

const FamilyProfiles = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("👤");
  const [formAge, setFormAge] = useState("");
  const [formDiet, setFormDiet] = useState("");
  const [formAllergy, setFormAllergy] = useState("");
  const [formCuisine, setFormCuisine] = useState("");
  const [dietList, setDietList] = useState<string[]>([]);
  const [allergyList, setAllergyList] = useState<string[]>([]);
  const [cuisineList, setCuisineList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/auth");
  }, [authLoading, isAuthenticated]);

  useEffect(() => { if (user) fetchProfiles(); }, [user]);

  const fetchProfiles = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from("family_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");
    if (data) setProfiles(data);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormName(""); setFormEmoji("👤"); setFormAge(""); setDietList([]); setAllergyList([]); setCuisineList([]);
    setFormDiet(""); setFormAllergy(""); setFormCuisine(""); setEditingProfile(null);
  };

  const openEdit = (p: FamilyProfile) => {
    setEditingProfile(p);
    setFormName(p.name); setFormEmoji(p.avatar_emoji); setFormAge(p.age_range || "");
    setDietList(p.dietary_preferences); setAllergyList(p.allergies); setCuisineList(p.favorite_cuisines);
    setShowForm(true);
  };

  const addTag = (value: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setInput("");
    }
  };

  const handleSave = async () => {
    if (!user || !formName.trim()) return;
    setSaving(true);
    const payload = {
      user_id: user.id, name: formName.trim(), avatar_emoji: formEmoji,
      age_range: formAge || null, dietary_preferences: dietList, allergies: allergyList, favorite_cuisines: cuisineList,
    };
    if (editingProfile) {
      await supabase.from("family_profiles").update(payload).eq("id", editingProfile.id);
    } else {
      await supabase.from("family_profiles").insert(payload);
    }
    toast({ title: editingProfile ? t("family.updated") : t("family.added") });
    resetForm(); setShowForm(false); fetchProfiles();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("family_profiles").delete().eq("id", id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    toast({ title: t("family.removed") });
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
            <Users className="w-6 h-6 text-primary" />
            {t("family.title")}
          </h1>
          <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />{t("family.addMember")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{editingProfile ? t("family.editMember") : t("family.addMember")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {AVATAR_EMOJIS.map((e) => (
                    <button key={e} onClick={() => setFormEmoji(e)} className={`text-2xl p-2 rounded-lg transition-colors ${formEmoji === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-secondary"}`}>{e}</button>
                  ))}
                </div>
                <Input placeholder={t("family.namePlaceholder")} value={formName} onChange={(e) => setFormName(e.target.value)} />
                <Select value={formAge} onValueChange={setFormAge}>
                  <SelectTrigger><SelectValue placeholder={t("family.ageRange")} /></SelectTrigger>
                  <SelectContent>{AGE_RANGES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>

                {/* Diet tags */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">{t("family.dietaryPrefs")}</label>
                  <div className="flex gap-2">
                    <Input placeholder={t("family.addPref")} value={formDiet} onChange={(e) => setFormDiet(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(formDiet, dietList, setDietList, setFormDiet))} />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dietList.map((d) => (
                      <Badge key={d} variant="secondary" className="cursor-pointer" onClick={() => setDietList(dietList.filter((x) => x !== d))}>{d} ×</Badge>
                    ))}
                  </div>
                </div>

                {/* Allergy tags */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">{t("family.allergiesLabel")}</label>
                  <div className="flex gap-2">
                    <Input placeholder={t("family.addAllergy")} value={formAllergy} onChange={(e) => setFormAllergy(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(formAllergy, allergyList, setAllergyList, setFormAllergy))} />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {allergyList.map((a) => (
                      <Badge key={a} variant="secondary" className="cursor-pointer" onClick={() => setAllergyList(allergyList.filter((x) => x !== a))}>{a} ×</Badge>
                    ))}
                  </div>
                </div>

                {/* Cuisine tags */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">{t("family.favCuisines")}</label>
                  <div className="flex gap-2">
                    <Input placeholder={t("family.addCuisine")} value={formCuisine} onChange={(e) => setFormCuisine(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(formCuisine, cuisineList, setCuisineList, setFormCuisine))} />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cuisineList.map((c) => (
                      <Badge key={c} variant="secondary" className="cursor-pointer" onClick={() => setCuisineList(cuisineList.filter((x) => x !== c))}>{c} ×</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} disabled={saving || !formName.trim()} className="gradient-primary text-primary-foreground">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-muted-foreground mb-6">{t("family.subtitle")}</p>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : profiles.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{t("family.noMembers")}</h3>
              <p className="text-muted-foreground">{t("family.noMembersDesc")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {profiles.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="shadow-card hover:shadow-elevated transition-all h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{p.avatar_emoji}</span>
                          <div>
                            <h3 className="font-semibold text-foreground">{p.name}</h3>
                            {p.age_range && <p className="text-xs text-muted-foreground">{p.age_range}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("family.deleteConfirm")}</AlertDialogTitle>
                                <AlertDialogDescription>{t("family.deleteDesc", { name: p.name })}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground">{t("common.delete")}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {p.dietary_preferences.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">{t("family.dietaryPrefs")}</p>
                          <div className="flex flex-wrap gap-1">{p.dietary_preferences.map((d) => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}</div>
                        </div>
                      )}
                      {p.allergies.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">{t("family.allergiesLabel")}</p>
                          <div className="flex flex-wrap gap-1">{p.allergies.map((a) => <Badge key={a} variant="outline" className="text-xs text-destructive border-destructive/30">{a}</Badge>)}</div>
                        </div>
                      )}
                      {p.favorite_cuisines.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">{t("family.favCuisines")}</p>
                          <div className="flex flex-wrap gap-1">{p.favorite_cuisines.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default FamilyProfiles;
