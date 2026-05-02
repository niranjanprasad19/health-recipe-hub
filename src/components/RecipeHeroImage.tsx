import { useEffect, useState, useCallback } from "react";
import { ImageIcon, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface RecipeHeroImageProps {
  title: string;
  cuisine: string;
  description?: string;
  initialImage?: string | null;
  onImageGenerated?: (url: string) => void;
  autoGenerate?: boolean;
  showTextOverlay?: boolean;
}

export const RecipeHeroImage = ({
  title,
  cuisine,
  description,
  initialImage,
  onImageGenerated,
  autoGenerate = true,
  showTextOverlay = false,
}: RecipeHeroImageProps) => {
  const { t } = useTranslation();
  const [heroImage, setHeroImage] = useState<string | null>(initialImage || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supabase.functions.invoke("generate-recipe-image", {
        body: { title, cuisine },
      });
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      const url = response.data?.imageUrl;
      if (!url) throw new Error("No image generated");
      setHeroImage(url);
      onImageGenerated?.(url);
    } catch (err) {
      console.error("Hero image generation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  }, [title, cuisine, onImageGenerated]);

  useEffect(() => {
    if (!heroImage && autoGenerate && !loading && !error) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  if (heroImage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden mb-8 shadow-fun"
      >
        <div className="relative aspect-[16/7]">
          <img src={heroImage} alt={title} className="w-full h-full object-cover" />
          {showTextOverlay && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-2 drop-shadow-lg">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm sm:text-base text-primary-foreground/85 max-w-2xl">{description}</p>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="relative rounded-3xl overflow-hidden mb-8 shadow-fun aspect-[16/7] skeleton-brand flex flex-col items-center justify-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <ImageIcon className="w-10 h-10 text-muted-foreground/60" />
        </motion.div>
        <p className="text-sm text-muted-foreground font-medium">
          ✨ {t("recipe.generatingImage", "Generating food photo...")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative rounded-3xl overflow-hidden mb-8 shadow-card aspect-[16/7] gradient-primary flex flex-col items-center justify-center gap-3 p-6">
        <AlertCircle className="w-10 h-10 text-primary-foreground/90" />
        <p className="text-sm text-primary-foreground/90 text-center max-w-md">
          {t("recipe.imageGenFailed", "Couldn't generate a food photo right now.")}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={generate}
          className="shadow-soft"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("common.tryAgain", "Try Again")}
        </Button>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-primary-foreground drop-shadow-lg">{title}</h1>
        </div>
      </div>
    );
  }

  // Idle (no auto-generate or just constructed) - show placeholder with manual trigger
  return (
    <div className="relative rounded-3xl overflow-hidden mb-8 shadow-card aspect-[16/7] gradient-primary flex flex-col items-center justify-center gap-3 p-6">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary-foreground text-center">{title}</h1>
      {description && <p className="text-sm text-primary-foreground/85 text-center max-w-2xl">{description}</p>}
      <Button variant="secondary" size="sm" onClick={generate} className="mt-2">
        <ImageIcon className="w-4 h-4 mr-2" />
        {t("recipe.generateImage", "Generate Photo")}
      </Button>
    </div>
  );
};
