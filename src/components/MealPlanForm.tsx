import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MealPlanFormData } from "@/types/mealPlan";
import { User, Ruler, Weight, Heart, Utensils, Clock, DollarSign } from "lucide-react";

interface MealPlanFormProps {
  onSubmit: (data: MealPlanFormData) => void;
  loading: boolean;
}

export const MealPlanForm = ({ onSubmit, loading }: MealPlanFormProps) => {
  const [formData, setFormData] = useState<MealPlanFormData>({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    dietaryPreference: "",
    cuisinePreference: "",
    healthGoal: "",
    dailyCalorieTarget: "",
    proteinPreference: "",
    allergies: "",
    mealsPerDay: "3",
    duration: "3",
    budgetPreference: "",
    cookingTimePreference: "",
  });

  const update = (field: keyof MealPlanFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectClass = "mt-1 w-full px-4 py-3 border rounded-lg bg-white text-sm";

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Utensils className="w-6 h-6" />
          AI Meal Planner
        </CardTitle>
        <p className="opacity-90">Enter your details to generate a personalized multi-day meal plan</p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <User className="w-5 h-5" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => update("name", e.target.value)} required placeholder="Your name" className="mt-1" />
              </div>
              <div>
                <Label>Age</Label>
                <Input type="number" min="1" max="120" value={formData.age} onChange={(e) => update("age", e.target.value)} required placeholder="25" className="mt-1" />
              </div>
              <div>
                <Label>Gender</Label>
                <select className={selectClass} value={formData.gender} onChange={(e) => update("gender", e.target.value)} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Body Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Ruler className="w-5 h-5" /> Body Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Height (cm)</Label>
                <Input type="number" min="50" max="300" value={formData.height} onChange={(e) => update("height", e.target.value)} required placeholder="170" className="mt-1" />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input type="number" min="20" max="500" value={formData.weight} onChange={(e) => update("weight", e.target.value)} required placeholder="70" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Diet & Cuisine */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Utensils className="w-5 h-5" /> Diet & Cuisine Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Dietary Preference</Label>
                <select className={selectClass} value={formData.dietaryPreference} onChange={(e) => update("dietaryPreference", e.target.value)} required>
                  <option value="">Select</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Eggetarian">Eggetarian</option>
                  <option value="Jain">Jain</option>
                </select>
              </div>
              <div>
                <Label>Cuisine Preference</Label>
                <select className={selectClass} value={formData.cuisinePreference} onChange={(e) => update("cuisinePreference", e.target.value)} required>
                  <option value="">Select</option>
                  <option value="Indian">Indian</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Italian">Italian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Thai">Thai</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Health & Nutrition */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Heart className="w-5 h-5" /> Health & Nutrition Goals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Health Goal</Label>
                <select className={selectClass} value={formData.healthGoal} onChange={(e) => update("healthGoal", e.target.value)} required>
                  <option value="">Select</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Weight Gain">Weight Gain</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                </select>
              </div>
              <div>
                <Label>Daily Calorie Target</Label>
                <Input type="number" min="800" max="5000" value={formData.dailyCalorieTarget} onChange={(e) => update("dailyCalorieTarget", e.target.value)} required placeholder="2000" className="mt-1" />
              </div>
              <div>
                <Label>Protein Preference</Label>
                <select className={selectClass} value={formData.proteinPreference} onChange={(e) => update("proteinPreference", e.target.value)} required>
                  <option value="">Select</option>
                  <option value="High Protein">High Protein</option>
                  <option value="Low Carb">Low Carb</option>
                  <option value="Balanced">Balanced</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Label>Allergies / Restricted Ingredients</Label>
              <Input value={formData.allergies} onChange={(e) => update("allergies", e.target.value)} placeholder="e.g., nuts, dairy, gluten" className="mt-1" />
            </div>
          </div>

          {/* Plan Configuration */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Clock className="w-5 h-5" /> Plan Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Meals Per Day</Label>
                <select className={selectClass} value={formData.mealsPerDay} onChange={(e) => update("mealsPerDay", e.target.value)} required>
                  <option value="2">2 meals</option>
                  <option value="3">3 meals</option>
                  <option value="4">4 meals (with snack)</option>
                </select>
              </div>
              <div>
                <Label>Duration (days)</Label>
                <select className={selectClass} value={formData.duration} onChange={(e) => update("duration", e.target.value)} required>
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </div>
              <div>
                <Label className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> Budget</Label>
                <select className={selectClass} value={formData.budgetPreference} onChange={(e) => update("budgetPreference", e.target.value)}>
                  <option value="">Any</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <Label>Cooking Time</Label>
                <select className={selectClass} value={formData.cookingTimePreference} onChange={(e) => update("cookingTimePreference", e.target.value)}>
                  <option value="">Any</option>
                  <option value="Quick (under 15 min)">Quick</option>
                  <option value="Moderate (15-45 min)">Moderate</option>
                  <option value="Any">Any duration</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-4 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Generating Your Meal Plan...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Generate AI Meal Plan
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
