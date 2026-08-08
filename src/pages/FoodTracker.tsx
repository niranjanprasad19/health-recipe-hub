import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Plus, Trash2, Flame, Beef, Wheat, Droplets, Target, Bell, Loader2, Sparkles, ScanBarcode } from "lucide-react";
import { BarcodeScannerDialog } from "@/components/BarcodeScannerDialog";
import { lookupBarcode } from "@/lib/openFoodFacts";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FoodLog {
  id: string;
  food_name: string;
  serving: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  logged_at: string;
  source: string;
}

interface Goals {
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  reminder_enabled: boolean;
  reminder_times: string[];
}

const DEFAULT_GOALS: Goals = {
  daily_calories: 2000, daily_protein: 100, daily_carbs: 250, daily_fat: 65,
  reminder_enabled: false, reminder_times: ["08:00", "13:00", "19:00"],
};

const FoodTracker = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanBusy, setScanBusy] = useState(false);

  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAll();
    requestNotificationPermission();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!goals.reminder_enabled) return;
    const interval = setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (goals.reminder_times.includes(hhmm) && now.getSeconds() < 30) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("NutriChef", { body: "Time to log your meal! 🍽️" });
        } else {
          toast("Time to log your meal! 🍽️");
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [goals]);

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const [logsRes, goalsRes] = await Promise.all([
      supabase.from("food_logs").select("*").eq("user_id", user.id).gte("logged_at", startOfDay.toISOString()).order("logged_at", { ascending: false }),
      supabase.from("nutrition_goals").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
    if (logsRes.data) setLogs(logsRes.data as FoodLog[]);
    if (goalsRes.data) setGoals(goalsRes.data as Goals);
    setLoading(false);
  };

  const totals = useMemo(() => logs.reduce(
    (acc, l) => ({
      calories: acc.calories + (l.calories || 0),
      protein: acc.protein + Number(l.protein || 0),
      carbs: acc.carbs + Number(l.carbs || 0),
      fat: acc.fat + Number(l.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ), [logs]);

  const handlePhotoSnap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setAnalyzing(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("analyze-food-image", { body: { imageBase64: base64 } });
      if (error || !data || data.error) throw new Error(data?.error || error?.message || "Failed");
      const insert = {
        user_id: user.id,
        food_name: data.food_name || "Unknown food",
        serving: data.serving || null,
        calories: Math.round(data.calories || 0),
        protein: Number(data.protein || 0),
        carbs: Number(data.carbs || 0),
        fat: Number(data.fat || 0),
        fiber: Number(data.fiber || 0),
        image_url: base64,
        source: "photo",
        notes: data.tips || null,
      };
      const { data: row } = await supabase.from("food_logs").insert(insert).select().single();
      if (row) setLogs(prev => [row as FoodLog, ...prev]);
      toast.success(`Logged ${insert.food_name} • ${insert.calories} kcal`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Couldn't analyze photo");
    } finally {
      setAnalyzing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleManualAdd = async (form: FormData) => {
    if (!user) return;
    const insert = {
      user_id: user.id,
      food_name: String(form.get("food_name") || "").trim(),
      serving: String(form.get("serving") || "") || null,
      calories: Number(form.get("calories") || 0),
      protein: Number(form.get("protein") || 0),
      carbs: Number(form.get("carbs") || 0),
      fat: Number(form.get("fat") || 0),
      source: "manual",
    };
    if (!insert.food_name) { toast.error("Name required"); return; }
    const { data } = await supabase.from("food_logs").insert(insert).select().single();
    if (data) setLogs(prev => [data as FoodLog, ...prev]);
    setManualOpen(false);
    toast.success("Logged!");
  };

  const handleBarcode = async (barcode: string) => {
    if (!user) return;
    setScanBusy(true);
    try {
      const product = await lookupBarcode(barcode);
      if (!product) { toast.error("Product not found — add it manually."); return; }
      const insert = {
        user_id: user.id,
        food_name: [product.brand, product.name].filter(Boolean).join(" ").trim(),
        serving: product.serving ?? (product.perServing ? "1 serving" : "100 g"),
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
        fiber: product.fiber,
        image_url: product.imageUrl ?? null,
        source: "barcode",
      };
      const { data, error } = await supabase.from("food_logs").insert(insert).select().single();
      if (error) throw error;
      if (data) setLogs(prev => [data as FoodLog, ...prev]);
      setScanOpen(false);
      toast.success(`${insert.food_name} logged!`);
    } catch (err) {
      console.error("Barcode log failed:", err);
      toast.error("Couldn't log that item. Please try again.");
    } finally {
      setScanBusy(false);
    }
  };

  const deleteLog = async (id: string) => {

    await supabase.from("food_logs").delete().eq("id", id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const saveGoals = async () => {
    if (!user) return;
    await supabase.from("nutrition_goals").upsert({ user_id: user.id, ...goals, updated_at: new Date().toISOString() });
    setGoalsOpen(false);
    toast.success("Goals saved");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to track your food</h2>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const macros = [
    { label: "Calories", val: totals.calories, goal: goals.daily_calories, icon: Flame, unit: "kcal", color: "text-fun-orange" },
    { label: "Protein", val: Math.round(totals.protein), goal: goals.daily_protein, icon: Beef, unit: "g", color: "text-green-500" },
    { label: "Carbs", val: Math.round(totals.carbs), goal: goals.daily_carbs, icon: Wheat, unit: "g", color: "text-fun-yellow" },
    { label: "Fat", val: Math.round(totals.fat), goal: goals.daily_fat, icon: Droplets, unit: "g", color: "text-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">Food Tracker</h1>
              <p className="text-muted-foreground text-sm">Snap a photo to log instantly with AI.</p>
            </div>
            <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Target className="w-4 h-4 mr-1" />Goals</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Daily Goals & Reminders</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  {(["daily_calories", "daily_protein", "daily_carbs", "daily_fat"] as const).map(k => (
                    <div key={k}>
                      <Label className="capitalize">{k.replace("daily_", "")}</Label>
                      <Input type="number" value={goals[k]} onChange={e => setGoals({ ...goals, [k]: Number(e.target.value) })} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Label className="flex items-center gap-2"><Bell className="w-4 h-4" />Meal reminders</Label>
                    <Switch checked={goals.reminder_enabled} onCheckedChange={v => setGoals({ ...goals, reminder_enabled: v })} />
                  </div>
                  {goals.reminder_enabled && (
                    <Input value={goals.reminder_times.join(", ")} onChange={e => setGoals({ ...goals, reminder_times: e.target.value.split(",").map(s => s.trim()) })} placeholder="08:00, 13:00, 19:00" />
                  )}
                  <Button onClick={saveGoals} className="w-full">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Macro rings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {macros.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <m.icon className={`w-5 h-5 mx-auto mb-1 ${m.color}`} />
                    <p className="text-xl font-black text-foreground">{m.val}</p>
                    <p className="text-xs text-muted-foreground mb-2">/ {m.goal} {m.unit}</p>
                    <Progress value={Math.min(100, (m.val / m.goal) * 100)} className="h-1.5" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <Button onClick={() => fileRef.current?.click()} disabled={analyzing} className="flex-1 h-14 gradient-fun text-primary-foreground font-bold rounded-2xl shadow-fun">
              {analyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing…</> : <><Camera className="w-5 h-5 mr-2" />Snap a Photo</>}
            </Button>
            <Button variant="outline" className="h-14 rounded-2xl" aria-label="Scan a barcode" onClick={() => setScanOpen(true)}><ScanBarcode className="w-5 h-5" /></Button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSnap} />

            <Dialog open={manualOpen} onOpenChange={setManualOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-14 rounded-2xl"><Plus className="w-5 h-5" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add manually</DialogTitle></DialogHeader>
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleManualAdd(new FormData(e.currentTarget)); }}>
                  <Input name="food_name" placeholder="Food name *" required />
                  <Input name="serving" placeholder="Serving (e.g. 1 cup)" />
                  <div className="grid grid-cols-4 gap-2">
                    <Input name="calories" type="number" placeholder="kcal" />
                    <Input name="protein" type="number" step="0.1" placeholder="P (g)" />
                    <Input name="carbs" type="number" step="0.1" placeholder="C (g)" />
                    <Input name="fat" type="number" step="0.1" placeholder="F (g)" />
                  </div>
                  <Button type="submit" className="w-full">Log</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Today's log */}
          <h2 className="text-lg font-bold mb-3">Today’s Diary</h2>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : logs.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-fun-orange" />
                Snap your first meal to start tracking.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {logs.map(l => (
                  <motion.div key={l.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="glass-card">
                      <CardContent className="p-3 flex items-center gap-3">
                        {l.image_url ? (
                          <img src={l.image_url} alt={l.food_name} className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl gradient-fun flex items-center justify-center text-2xl">🍽️</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{l.food_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {l.serving ? `${l.serving} • ` : ""}{l.calories} kcal · P {Math.round(Number(l.protein))}g · C {Math.round(Number(l.carbs))}g · F {Math.round(Number(l.fat))}g
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" aria-label={`Delete food log ${l.food_name ?? ""}`} onClick={() => deleteLog(l.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>

      <BarcodeScannerDialog open={scanOpen} onOpenChange={setScanOpen} onDetected={handleBarcode} busy={scanBusy} />
    </div>

  );
};

export default FoodTracker;
