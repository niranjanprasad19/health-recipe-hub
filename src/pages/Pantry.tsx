import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChefHat, Loader2, Plus, ScanBarcode, Trash2, Refrigerator, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarcodeScannerDialog } from "@/components/BarcodeScannerDialog";
import { lookupBarcode } from "@/lib/openFoodFacts";
import { toast } from "sonner";

interface PantryItem {
  id: string;
  name: string;
  quantity: string | null;
  category: string;
  expires_on: string | null;
  barcode: string | null;
}

const CATEGORIES = [
  { value: "produce", label: "Produce", emoji: "🥬" },
  { value: "grains", label: "Grains & Pulses", emoji: "🌾" },
  { value: "dairy", label: "Dairy & Eggs", emoji: "🥛" },
  { value: "protein", label: "Meat & Protein", emoji: "🍗" },
  { value: "spices", label: "Spices & Condiments", emoji: "🧂" },
  { value: "snacks", label: "Packaged & Snacks", emoji: "🍪" },
  { value: "other", label: "Other", emoji: "🧺" },
];

const categoryMeta = (value: string) =>
  CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];

const daysUntil = (date: string | null) => {
  if (!date) return null;
  const diff = new Date(date).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / 86400000);
};

const Pantry = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("produce");
  const [expiresOn, setExpiresOn] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanBusy, setScanBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("pantry_items")
      .select("id, name, quantity, category, expires_on, barcode")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Failed to load pantry:", error);
        setItems((data as PantryItem[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const addItem = async (item: {
    name: string; quantity?: string | null; category: string; expires_on?: string | null; barcode?: string | null;
  }) => {
    if (!user || !item.name.trim()) return;
    const { data, error } = await supabase
      .from("pantry_items")
      .insert({
        user_id: user.id,
        name: item.name.trim(),
        quantity: item.quantity?.trim() || null,
        category: item.category,
        expires_on: item.expires_on || null,
        barcode: item.barcode || null,
      })
      .select("id, name, quantity, category, expires_on, barcode")
      .single();
    if (error) {
      console.error("Failed to add pantry item:", error);
      toast.error("Couldn't add that item.");
      return;
    }
    setItems((prev) => [data as PantryItem, ...prev]);
    toast.success(`${data.name} added to pantry`);
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem({ name, quantity, category, expires_on: expiresOn });
    setName(""); setQuantity(""); setExpiresOn("");
  };

  const handleBarcode = async (barcode: string) => {
    setScanBusy(true);
    try {
      const product = await lookupBarcode(barcode);
      if (!product) {
        toast.error("Product not found — add it manually.");
        return;
      }
      await addItem({
        name: [product.brand, product.name].filter(Boolean).join(" ").trim(),
        quantity: product.serving ?? null,
        category: "snacks",
        barcode: product.barcode,
      });
      setScanOpen(false);
    } catch (err) {
      console.error("Barcode lookup failed:", err);
      toast.error("Lookup failed. Please try again.");
    } finally {
      setScanBusy(false);
    }
  };

  const removeItem = async (id: string) => {
    await supabase.from("pantry_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => prev.filter((s) => s !== id));
  };

  const grouped = useMemo(() => {
    const map = new Map<string, PantryItem[]>();
    for (const item of items) {
      map.set(item.category, [...(map.get(item.category) ?? []), item]);
    }
    return CATEGORIES.map((c) => ({ ...c, items: map.get(c.value) ?? [] })).filter(
      (g) => g.items.length > 0
    );
  }, [items]);

  const expiringSoon = items.filter((i) => {
    const d = daysUntil(i.expires_on);
    return d !== null && d <= 3;
  });

  const cookFromPantry = () => {
    const names = (selected.length > 0 ? items.filter((i) => selected.includes(i.id)) : items).map(
      (i) => i.name
    );
    if (names.length === 0) {
      toast.error("Add a few pantry items first.");
      return;
    }
    navigate("/leftover-recipe", { state: { ingredients: names.slice(0, 15) } });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-semibold mb-4">Sign in to use your pantry</h1>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
                <Refrigerator className="w-6 h-6 text-primary" /> My Pantry
              </h1>
              <p className="text-muted-foreground text-sm">
                Track what you have, cut waste, and cook without shopping.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setScanOpen(true)}>
              <ScanBarcode className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Scan</span>
            </Button>
          </div>

          {expiringSoon.length > 0 && (
            <Card className="glass-card border-fun-orange/40 mb-5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-fun-orange flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Use these up soon</p>
                  <p className="text-muted-foreground">
                    {expiringSoon.map((i) => i.name).join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card mb-6">
            <CardContent className="p-4">
              <form className="space-y-3" onSubmit={handleManualAdd}>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Item name *"
                    aria-label="Pantry item name"
                    required
                  />
                  <Input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Qty (e.g. 500 g)"
                    aria-label="Quantity"
                    className="sm:max-w-[150px]"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger aria-label="Category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.emoji} {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={expiresOn}
                    onChange={(e) => setExpiresOn(e.target.value)}
                    aria-label="Expiry date"
                    className="sm:max-w-[170px]"
                  />
                  <Button type="submit" className="gradient-primary text-primary-foreground">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Button
            onClick={cookFromPantry}
            className="w-full h-14 rounded-2xl gradient-fun text-primary-foreground font-bold shadow-fun mb-6"
          >
            <ChefHat className="w-5 h-5 mr-2" />
            {selected.length > 0
              ? `Cook with ${selected.length} selected item${selected.length > 1 ? "s" : ""}`
              : "Cook from my pantry"}
          </Button>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Refrigerator className="w-8 h-8 mx-auto mb-2 text-fun-orange" />
                Your pantry is empty. Add items above or scan a barcode.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div key={group.value}>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                    {group.emoji} {group.label}
                  </h2>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {group.items.map((item) => {
                        const days = daysUntil(item.expires_on);
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                          >
                            <Card className="glass-card">
                              <CardContent className="p-3 flex items-center gap-3">
                                <Checkbox
                                  checked={selected.includes(item.id)}
                                  onCheckedChange={(v) =>
                                    setSelected((prev) =>
                                      v ? [...prev, item.id] : prev.filter((s) => s !== item.id)
                                    )
                                  }
                                  aria-label={`Select ${item.name}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.quantity || categoryMeta(item.category).label}
                                  </p>
                                </div>
                                {days !== null && (
                                  <Badge
                                    variant={days <= 3 ? "destructive" : "outline"}
                                    className="text-[10px] whitespace-nowrap"
                                  >
                                    {days < 0 ? "expired" : days === 0 ? "today" : `${days}d`}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Remove ${item.name} from pantry`}
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <BarcodeScannerDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onDetected={handleBarcode}
        busy={scanBusy}
      />
    </div>
  );
};

export default Pantry;
