import { MealPlanFormData, MealItem, DayPlan, MealPlan } from "@/types/mealPlan";
import { openAIService } from "./openAIService";

class MealPlanService {
  private generatedDishNames: Set<string> = new Set();

  async generateMealPlan(formData: MealPlanFormData): Promise<MealPlan> {
    this.generatedDishNames.clear();
    const duration = parseInt(formData.duration) || 3;
    const mealsPerDay = parseInt(formData.mealsPerDay) || 3;
    const days: DayPlan[] = [];

    for (let day = 1; day <= duration; day++) {
      const dayPlan = await this.generateDayPlan(day, formData, mealsPerDay);
      days.push(dayPlan);
    }

    return {
      id: Date.now().toString(),
      formData,
      days,
      createdAt: new Date(),
      totalCaloriesPerDay: formData.dailyCalorieTarget || "2000",
    };
  }

  private async generateDayPlan(
    day: number,
    formData: MealPlanFormData,
    mealsPerDay: number
  ): Promise<DayPlan> {
    const [breakfast, lunch, dinner] = await Promise.all([
      this.generateMeal("Breakfast", formData, day),
      this.generateMeal("Lunch", formData, day),
      this.generateMeal("Dinner", formData, day),
    ]);

    const dayPlan: DayPlan = { day, breakfast, lunch, dinner };

    if (mealsPerDay >= 4) {
      dayPlan.snack = await this.generateMeal("Snack", formData, day);
    }

    return dayPlan;
  }

  private async generateMeal(
    mealType: string,
    formData: MealPlanFormData,
    day: number
  ): Promise<MealItem> {
    const caloriePerMeal = Math.round(
      (parseInt(formData.dailyCalorieTarget) || 2000) /
        (parseInt(formData.mealsPerDay) || 3)
    );

    const previousDishes = Array.from(this.generatedDishNames).join(", ");

    const prompt = `Generate a unique ${mealType} recipe for Day ${day} of a meal plan.

User Profile:
- Diet: ${formData.dietaryPreference}
- Cuisine: ${formData.cuisinePreference}
- Health Goal: ${formData.healthGoal}
- Target Calories per meal: ~${caloriePerMeal} kcal
- Protein preference: ${formData.proteinPreference}
- Allergies/Restrictions: ${formData.allergies || "None"}
- Budget: ${formData.budgetPreference || "Any"}
- Cooking time: ${formData.cookingTimePreference || "Any"}

IMPORTANT: Do NOT repeat these dishes: ${previousDishes || "None yet"}

Return ONLY valid JSON:
{
  "name": "Dish Name",
  "description": "Brief description",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "calories": "${caloriePerMeal} kcal",
  "prepTime": "XX minutes",
  "instructions": ["step 1", "step 2"]
}`;

    try {
      const response = await openAIService.generateText(prompt);
      let jsonContent = response;
      const jsonStart = response.indexOf("{");
      const jsonEnd = response.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonContent = response.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(jsonContent);
      this.generatedDishNames.add(parsed.name);

      return {
        name: parsed.name || `${mealType} Dish`,
        description: parsed.description || "",
        ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
        instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
        calories: parsed.calories || `${caloriePerMeal} kcal`,
        prepTime: parsed.prepTime || "20 minutes",
      };
    } catch (error) {
      console.error(`Failed to generate ${mealType} for day ${day}:`, error);
      return this.getFallbackMeal(mealType, caloriePerMeal);
    }
  }

  private getFallbackMeal(mealType: string, calories: number): MealItem {
    const fallbacks: Record<string, MealItem> = {
      Breakfast: {
        name: "Healthy Oatmeal Bowl",
        description: "A nutritious start to your day",
        ingredients: ["1 cup oats", "1 cup milk", "1 banana", "1 tbsp honey", "Handful of nuts"],
        instructions: ["Cook oats with milk", "Top with sliced banana", "Drizzle honey and add nuts"],
        calories: `${calories} kcal`,
        prepTime: "10 minutes",
      },
      Lunch: {
        name: "Garden Fresh Salad Bowl",
        description: "A light and refreshing midday meal",
        ingredients: ["Mixed greens", "Cherry tomatoes", "Cucumber", "Grilled chicken/tofu", "Olive oil dressing"],
        instructions: ["Wash and chop vegetables", "Grill protein", "Combine in bowl", "Add dressing"],
        calories: `${calories} kcal`,
        prepTime: "15 minutes",
      },
      Dinner: {
        name: "Balanced Power Bowl",
        description: "A satisfying evening meal",
        ingredients: ["1 cup brown rice", "Grilled vegetables", "Protein of choice", "Tahini sauce"],
        instructions: ["Cook rice", "Grill vegetables", "Cook protein", "Assemble and add sauce"],
        calories: `${calories} kcal`,
        prepTime: "30 minutes",
      },
      Snack: {
        name: "Energy Bites",
        description: "Quick energy boost",
        ingredients: ["Oats", "Peanut butter", "Honey", "Dark chocolate chips"],
        instructions: ["Mix all ingredients", "Roll into balls", "Refrigerate for 30 min"],
        calories: `${calories} kcal`,
        prepTime: "10 minutes",
      },
    };
    return fallbacks[mealType] || fallbacks["Lunch"];
  }

  async exportMealPlanToPDF(mealPlan: MealPlan): Promise<void> {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(22);
    pdf.text("AI Meal Plan", 20, 20);

    pdf.setFontSize(10);
    pdf.text(`Generated for: ${mealPlan.formData.name}`, 20, 30);
    pdf.text(`Diet: ${mealPlan.formData.dietaryPreference} | Cuisine: ${mealPlan.formData.cuisinePreference}`, 20, 36);
    pdf.text(`Health Goal: ${mealPlan.formData.healthGoal} | Daily Calories: ${mealPlan.formData.dailyCalorieTarget}`, 20, 42);

    let y = 55;

    for (const day of mealPlan.days) {
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFontSize(14);
      pdf.text(`Day ${day.day}`, 20, y);
      y += 8;

      const meals: [string, MealItem][] = [
        ["Breakfast", day.breakfast],
        ["Lunch", day.lunch],
        ["Dinner", day.dinner],
      ];
      if (day.snack) meals.push(["Snack", day.snack]);

      for (const [label, meal] of meals) {
        if (y > 260) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFontSize(11);
        pdf.text(`${label}: ${meal.name} (${meal.calories})`, 25, y);
        y += 6;

        pdf.setFontSize(9);
        const ingredients = `  Ingredients: ${meal.ingredients.join(", ")}`;
        const split = pdf.splitTextToSize(ingredients, 160);
        pdf.text(split, 30, y);
        y += split.length * 4 + 4;
      }

      y += 6;
    }

    pdf.save(`meal-plan-${mealPlan.formData.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }
}

export const mealPlanService = new MealPlanService();
