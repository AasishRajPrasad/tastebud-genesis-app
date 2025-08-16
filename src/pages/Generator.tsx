import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { GeneratedRecipeModal } from "@/components/GeneratedRecipeModal";
import { openAIService } from "@/services/openAIService";
import { GeneratedRecipe } from "@/types/recipe";
import { ChefHat, Clock, Users, AlertTriangle, Flame } from "lucide-react";

const Generator = () => {
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [diet, setDiet] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [servings, setServings] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [allergens, setAllergens] = useState("");
  const [spiceLevel, setSpiceLevel] = useState("");
  const [healthGoals, setHealthGoals] = useState("");
  const [equipmentAvailable, setEquipmentAvailable] = useState("");
  const [budgetLevel, setBudgetLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting enhanced recipe generation...');
      const recipe = await openAIService.generateRecipe({
        ingredients,
        cuisine,
        mealType,
        diet,
        difficulty,
        servings,
        cookingTime,
        allergens,
        spiceLevel,
        healthGoals,
        equipmentAvailable,
        budgetLevel,
      });
      console.log('Enhanced recipe generated successfully:', recipe);
      setGeneratedRecipe(recipe);
      toast({
        title: "Recipe Generated!",
        description: "Your personalized AI-powered recipe with nutritional info is ready.",
      });
    } catch (error) {
      console.error('Recipe generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate recipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
       <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <ChefHat className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Recipe Generator</h1>
          <p className="text-gray-600 text-lg">Create personalized recipes with nutritional insights using advanced AI</p>
        </div>

        <Card className="mb-8 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Enhanced Recipe Parameters</CardTitle>
            <p className="opacity-90">Fill in the details to generate your perfect recipe with nutritional information</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleGenerate} className="space-y-8">
              {/* Basic Parameters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="ingredients" className="text-lg font-semibold flex items-center gap-2">
                      <ChefHat className="w-5 h-5" />
                      Ingredients
                    </Label>
                    <Textarea
                      id="ingredients"
                      placeholder="e.g., chicken breast, tomatoes, onions, garlic, basil, olive oil"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      required
                      className="mt-2 min-h-[100px]"
                    />
                    <p className="text-sm text-gray-500 mt-1">List ingredients you have or want to use</p>
                  </div>

                  <div>
                    <Label htmlFor="cuisine" className="text-lg font-semibold">Cuisine</Label>
                    <select
                      id="cuisine"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      required
                    >
                      <option value="">Select cuisine</option>
                      <option value="Italian">Italian</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Indian">Indian</option>
                      <option value="Mexican">Mexican</option>
                      <option value="Japanese">Japanese</option>
                      <option value="French">French</option>
                      <option value="Mediterranean">Mediterranean</option>
                      <option value="Thai">Thai</option>
                      <option value="Korean">Korean</option>
                      <option value="American">American</option>
                      <option value="Middle Eastern">Middle Eastern</option>
                      <option value="Greek">Greek</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="mealType" className="text-lg font-semibold">Meal Type</Label>
                    <select
                      id="mealType"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                      required
                    >
                      <option value="">Select meal type</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Appetizer">Appetizer</option>
                      <option value="Brunch">Brunch</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="diet" className="text-lg font-semibold">Diet</Label>
                    <select
                      id="diet"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      required
                    >
                      <option value="">Select diet</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Keto">Keto</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Paleo">Paleo</option>
                      <option value="Low-Carb">Low-Carb</option>
                      <option value="High-Protein">High-Protein</option>
                      <option value="Diabetic-Friendly">Diabetic-Friendly</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty" className="text-lg font-semibold">Difficulty</Label>
                    <select
                      id="difficulty"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      required
                    >
                      <option value="">Select difficulty</option>
                      <option value="Easy">Easy (15-30 min)</option>
                      <option value="Medium">Medium (30-60 min)</option>
                      <option value="Hard">Hard (60+ min)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="spiceLevel" className="text-lg font-semibold flex items-center gap-2">
                      <Flame className="w-5 h-5" />
                      Spice Level
                    </Label>
                    <select
                      id="spiceLevel"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={spiceLevel}
                      onChange={(e) => setSpiceLevel(e.target.value)}
                    >
                      <option value="">Select spice level</option>
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Hot">Hot</option>
                      <option value="Very Hot">Very Hot</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Parameters */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Additional Preferences (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="servings" className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Servings
                    </Label>
                    <Input
                      id="servings"
                      type="number"
                      placeholder="e.g., 4"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="mt-2"
                      min="1"
                      max="20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cookingTime" className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Cooking Time
                    </Label>
                    <select
                      id="cookingTime"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={cookingTime}
                      onChange={(e) => setCookingTime(e.target.value)}
                    >
                      <option value="">Any time</option>
                      <option value="Quick (under 15 min)">Quick (under 15 min)</option>
                      <option value="Fast (15-30 min)">Fast (15-30 min)</option>
                      <option value="Medium (30-60 min)">Medium (30-60 min)</option>
                      <option value="Slow (over 1 hour)">Slow (over 1 hour)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="allergens" className="text-lg font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Avoid Allergens
                    </Label>
                    <Input
                      id="allergens"
                      placeholder="e.g., nuts, dairy, eggs"
                      value={allergens}
                      onChange={(e) => setAllergens(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="healthGoals" className="text-lg font-semibold">Health Goals</Label>
                    <select
                      id="healthGoals"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={healthGoals}
                      onChange={(e) => setHealthGoals(e.target.value)}
                    >
                      <option value="">Select health goal</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Heart Healthy">Heart Healthy</option>
                      <option value="Energy Boost">Energy Boost</option>
                      <option value="Immune Support">Immune Support</option>
                      <option value="Anti-Inflammatory">Anti-Inflammatory</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="equipmentAvailable" className="text-lg font-semibold">Available Equipment</Label>
                    <select
                      id="equipmentAvailable"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={equipmentAvailable}
                      onChange={(e) => setEquipmentAvailable(e.target.value)}
                    >
                      <option value="">Select equipment</option>
                      <option value="Basic (stovetop, oven)">Basic (stovetop, oven)</option>
                      <option value="Advanced (blender, food processor)">Advanced (blender, food processor)</option>
                      <option value="Minimal (microwave only)">Minimal (microwave only)</option>
                      <option value="Professional (all equipment)">Professional (all equipment)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="budgetLevel" className="text-lg font-semibold">Budget Level</Label>
                    <select
                      id="budgetLevel"
                      className="mt-2 w-full px-4 py-3 border rounded-lg bg-white"
                      value={budgetLevel}
                      onChange={(e) => setBudgetLevel(e.target.value)}
                    >
                      <option value="">Select budget</option>
                      <option value="Budget-Friendly">Budget-Friendly</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Your Perfect Recipe with Nutrition...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    Generate Enhanced Recipe with AI
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {generatedRecipe && (
          <GeneratedRecipeModal
            recipe={generatedRecipe}
            isOpen={!!generatedRecipe}
            onClose={() => setGeneratedRecipe(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Generator;
 
