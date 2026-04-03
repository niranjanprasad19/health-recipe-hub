import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Utensils, Sparkles, Calendar, ShoppingCart, BarChart3, X, ArrowRight, ChefHat } from "lucide-react";

const STORAGE_KEY = "nutrichef-onboarding-done";

interface Step {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  gradient: string;
}

const STEPS: Step[] = [
  { icon: <ChefHat className="w-10 h-10" />, titleKey: "onboarding.welcome", descKey: "onboarding.welcomeDesc", gradient: "from-primary to-accent" },
  { icon: <Utensils className="w-10 h-10" />, titleKey: "onboarding.preferences", descKey: "onboarding.preferencesDesc", gradient: "from-emerald-500 to-teal-500" },
  { icon: <Sparkles className="w-10 h-10" />, titleKey: "onboarding.aiRecipes", descKey: "onboarding.aiRecipesDesc", gradient: "from-violet-500 to-purple-500" },
  { icon: <Calendar className="w-10 h-10" />, titleKey: "onboarding.mealPlan", descKey: "onboarding.mealPlanDesc", gradient: "from-orange-500 to-amber-500" },
  { icon: <BarChart3 className="w-10 h-10" />, titleKey: "onboarding.nutrition", descKey: "onboarding.nutritionDesc", gradient: "from-blue-500 to-cyan-500" },
];

export const OnboardingWalkthrough = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setShow(true);
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  if (!show) return null;

  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
      >
        <Button variant="ghost" size="icon" onClick={finish} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
          <X className="w-5 h-5" />
        </Button>

        <div className="max-w-md w-full text-center">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-muted"}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${current.gradient} flex items-center justify-center text-white shadow-lg`}
              >
                {current.icon}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-2xl font-bold text-foreground"
              >
                {t(current.titleKey)}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground leading-relaxed max-w-sm mx-auto"
              >
                {t(current.descKey)}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-muted-foreground">
                {t("cooking.previous")}
              </Button>
            )}
            <Button onClick={next} className="gradient-primary text-primary-foreground px-8">
              {step === STEPS.length - 1 ? t("onboarding.getStarted") : t("cooking.next")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {step === 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={finish}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("onboarding.skip")}
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
