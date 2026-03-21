import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Recipe } from "@/types/recipe";
import {
  X, ChevronLeft, ChevronRight, Timer, Play, Pause, RotateCcw,
  Check, Volume2,
} from "lucide-react";

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

function extractMinutes(text: string): number | null {
  const patterns = [
    /(\d+)\s*minutes?/i,
    /(\d+)\s*mins?/i,
    /(\d+)\s*मिनट/i,
    /(\d+)\s*நிமிடம்/i,
    /(\d+)\s*నిమిషాలు/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

export const CookingMode = ({ recipe, onClose }: CookingModeProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const steps = recipe.instructions;
  const total = steps.length;
  const step = steps[currentStep];
  const detectedMinutes = step ? extractMinutes(step.instruction) : null;
  const progress = ((currentStep + 1) / total) * 100;

  // Wake Lock
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {}
    };
    requestWakeLock();
    return () => { wakeLockRef.current?.release(); };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerRunning && timerSeconds !== null && timerSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setTimerRunning(false);
            setTimerDone(true);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        osc2.connect(gain);
        osc2.frequency.value = 1000;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      }, 600);
    } catch {}
  }, []);

  const startTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
    setTimerDone(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(null);
    setTimerDone(false);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    resetTimer();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground truncate pr-4">
            {recipe.title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {t("cooking.step")} {currentStep + 1} {t("cooking.of")} {total}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-auto">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-6">
          {step.step}
        </div>

        <p className="text-xl sm:text-2xl text-center text-foreground leading-relaxed max-w-2xl mb-4">
          {step.instruction}
        </p>

        {step.tip && (
          <p className="text-sm text-muted-foreground text-center italic max-w-xl mb-6">
            💡 {step.tip}
          </p>
        )}

        {/* Timer section */}
        {(detectedMinutes || timerSeconds !== null) && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {timerSeconds !== null ? (
              <>
                <div className={`text-5xl font-mono font-bold tabular-nums ${timerDone ? "text-destructive animate-pulse" : "text-primary"}`}>
                  {formatTime(timerSeconds)}
                </div>
                {timerDone && (
                  <div className="flex items-center gap-2 text-destructive font-medium">
                    <Volume2 className="w-5 h-5" />
                    {t("cooking.timerDone")}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setTimerRunning(!timerRunning)}
                    disabled={timerDone}
                  >
                    {timerRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                    {timerRunning ? "Pause" : "Resume"}
                  </Button>
                  <Button variant="ghost" size="lg" onClick={resetTimer}>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </>
            ) : detectedMinutes ? (
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground"
                onClick={() => startTimer(detectedMinutes)}
              >
                <Timer className="w-5 h-5 mr-2" />
                {t("cooking.startTimer")} ({detectedMinutes} min)
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="min-w-[120px]"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {t("cooking.previous")}
          </Button>

          {currentStep === total - 1 ? (
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground min-w-[120px]"
              onClick={onClose}
            >
              <Check className="w-5 h-5 mr-1" />
              {t("cooking.finish")}
            </Button>
          ) : (
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground min-w-[120px]"
              onClick={() => goToStep(currentStep + 1)}
            >
              {t("cooking.next")}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
