import { useState } from "react";
import { MealPlanForm } from "@/components/MealPlanForm";
import { MealPlanDisplay } from "@/components/MealPlanDisplay";
import { mealPlanService } from "@/services/mealPlanService";
import { MealPlan, MealPlanFormData } from "@/types/mealPlan";
import { useToast } from "@/hooks/use-toast";
import { Utensils } from "lucide-react";

const MealPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [lastFormData, setLastFormData] = useState<MealPlanFormData | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (formData: MealPlanFormData) => {
    setLoading(true);
    setLastFormData(formData);
    try {
      const plan = await mealPlanService.generateMealPlan(formData);
      setMealPlan(plan);
      toast({
        title: "Meal Plan Generated!",
        description: `Your ${formData.duration}-day ${formData.cuisinePreference} meal plan is ready.`,
      });
    } catch (error) {
      console.error("Meal plan generation failed:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate meal plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastFormData) handleGenerate(lastFormData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <Utensils className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Meal Planner</h1>
          <p className="text-muted-foreground text-lg">
            Generate a personalized multi-day meal plan powered by AI
          </p>
        </div>

        {!mealPlan ? (
          <MealPlanForm onSubmit={handleGenerate} loading={loading} />
        ) : (
          <div className="space-y-6">
            <MealPlanDisplay
              mealPlan={mealPlan}
              onRegenerate={handleRegenerate}
              regenerating={loading}
            />
            <div className="text-center">
              <button
                onClick={() => setMealPlan(null)}
                className="text-green-600 hover:text-green-700 underline font-medium"
              >
                ← Edit inputs and create a new plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
