import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecipeFormData {
  likes: string[];
  dislikes: string[];
  allergies: string[];
  dietaryStyles: string[];
  ageRange: string;
  activityLevel: string;
  servings: string;
  deficiencies: string[];
  healthGoals: string[];
  cuisines: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json() as { formData: RecipeFormData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating recipe with preferences:", formData);

    const systemPrompt = `You are a professional nutritionist and chef who creates personalized, healthy recipes. 
Generate a complete, detailed recipe based on the user's preferences, dietary restrictions, and health goals.
Always provide accurate nutritional information and clear cooking instructions.`;

    const userPrompt = `Create a personalized healthy recipe based on these preferences:

**Liked Foods:** ${formData.likes.length > 0 ? formData.likes.join(", ") : "No specific preferences"}
**Disliked Foods:** ${formData.dislikes.length > 0 ? formData.dislikes.join(", ") : "None"}
**Allergies/Intolerances:** ${formData.allergies.length > 0 ? formData.allergies.join(", ") : "None"}
**Dietary Style:** ${formData.dietaryStyles.length > 0 ? formData.dietaryStyles.join(", ") : "No restrictions"}
**Age Range:** ${formData.ageRange || "Adult"}
**Activity Level:** ${formData.activityLevel || "Moderate"}
**Servings:** ${formData.servings || "2"}
**Nutritional Deficiencies to Address:** ${formData.deficiencies.length > 0 ? formData.deficiencies.join(", ") : "None specified"}
**Health Goals:** ${formData.healthGoals.length > 0 ? formData.healthGoals.join(", ") : "General wellness"}
**Cuisine Preferences:** ${formData.cuisines.length > 0 ? formData.cuisines.join(", ") : "Any cuisine"}

Please respond with a JSON object in this exact format:
{
  "title": "Recipe Name",
  "description": "A brief appetizing description of the dish",
  "prepTime": 15,
  "cookTime": 30,
  "servings": ${formData.servings || 2},
  "cuisine": "Cuisine type",
  "ingredients": [
    {"item": "ingredient name", "amount": "1 cup", "notes": "optional preparation notes"}
  ],
  "instructions": [
    {"step": 1, "instruction": "Step description", "tip": "optional helpful tip"}
  ],
  "nutritionInfo": {
    "calories": 350,
    "protein": "25g",
    "carbs": "30g",
    "fat": "12g",
    "fiber": "5g",
    "sodium": "400mg"
  },
  "tags": ["healthy", "quick", "protein-rich"],
  "healthBenefits": ["benefit 1", "benefit 2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", data);
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response:", content);

    // Parse the JSON from the response
    let recipe;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      recipe = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse recipe JSON:", parseError, "Content:", content);
      throw new Error("Failed to parse recipe from AI response");
    }

    console.log("Generated recipe:", recipe.title);

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate recipe" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
