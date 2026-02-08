export interface MealPlanFormData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  dietaryPreference: string;
  cuisinePreference: string;
  healthGoal: string;
  dailyCalorieTarget: string;
  proteinPreference: string;
  allergies: string;
  mealsPerDay: string;
  duration: string;
  budgetPreference: string;
  cookingTimePreference: string;
}

export interface MealItem {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  calories: string;
  prepTime: string;
  imageUrl?: string;
}

export interface DayPlan {
  day: number;
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
}

export interface MealPlan {
  id: string;
  formData: MealPlanFormData;
  days: DayPlan[];
  createdAt: Date;
  totalCaloriesPerDay: string;
}
