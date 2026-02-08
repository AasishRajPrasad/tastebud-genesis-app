import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealPlan, MealItem, DayPlan } from "@/types/mealPlan";
import { mealPlanService } from "@/services/mealPlanService";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw, ChevronDown, ChevronUp, UtensilsCrossed, Coffee, Soup, Moon, Cookie } from "lucide-react";

interface MealPlanDisplayProps {
  mealPlan: MealPlan;
  onRegenerate: () => void;
  regenerating: boolean;
}

const MealIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Breakfast": return <Coffee className="w-5 h-5 text-amber-500" />;
    case "Lunch": return <Soup className="w-5 h-5 text-green-500" />;
    case "Dinner": return <Moon className="w-5 h-5 text-indigo-500" />;
    case "Snack": return <Cookie className="w-5 h-5 text-pink-500" />;
    default: return <UtensilsCrossed className="w-5 h-5" />;
  }
};

const MealCard = ({ meal, type }: { meal: MealItem; type: string }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <MealIcon type={type} />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{type}</p>
            <h4 className="font-semibold text-foreground">{meal.name}</h4>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">{meal.calories}</span>
          <span className="text-sm text-muted-foreground">{meal.prepTime}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {meal.description && <p className="text-sm text-muted-foreground">{meal.description}</p>}
          <div>
            <p className="text-sm font-semibold mb-1">Ingredients:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              {meal.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Instructions:</p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              {meal.instructions.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

const DayCard = ({ dayPlan }: { dayPlan: DayPlan }) => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {dayPlan.day}
          </span>
          Day {dayPlan.day}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <MealCard meal={dayPlan.breakfast} type="Breakfast" />
        <MealCard meal={dayPlan.lunch} type="Lunch" />
        <MealCard meal={dayPlan.dinner} type="Dinner" />
        {dayPlan.snack && <MealCard meal={dayPlan.snack} type="Snack" />}
      </CardContent>
    </Card>
  );
};

export const MealPlanDisplay = ({ mealPlan, onRegenerate, regenerating }: MealPlanDisplayProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    try {
      await mealPlanService.exportMealPlanToPDF(mealPlan);
      toast({ title: "PDF Downloaded!", description: "Your meal plan has been exported." });
    } catch {
      toast({ title: "Export Failed", description: "Could not download PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Your {mealPlan.days.length}-Day Meal Plan</h2>
              <p className="opacity-90 mt-1">
                {mealPlan.formData.dietaryPreference} • {mealPlan.formData.cuisinePreference} • {mealPlan.formData.healthGoal} • {mealPlan.formData.dailyCalorieTarget} kcal/day
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadPDF}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button
                onClick={onRegenerate}
                variant="secondary"
                className="flex items-center gap-2"
                disabled={regenerating}
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mealPlan.days.map((dayPlan) => (
          <DayCard key={dayPlan.day} dayPlan={dayPlan} />
        ))}
      </div>
    </div>
  );
};
