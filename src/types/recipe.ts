export interface Recipe {
  id: string;
  title: string;
  ingredients: string;
  steps: string;
  cuisine: string;
  diet: string;
  difficulty: string;
  image_url: string;
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cuisine: string;
  diet: string;
  difficulty: string;
  mealType: string;
  nutritionalInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sodium: string;
  };
  prepTime: string;
  cookTime: string;
  totalTime: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface RecipeGenerationParams {
  ingredients: string;
  cuisine: string;
  mealType: string;
  diet: string;
  difficulty: string;
  servings?: string;
  cookingTime?: string;
  allergens?: string;
  spiceLevel?: string;
  healthGoals?: string;
  equipmentAvailable?: string;
  budgetLevel?: string;
}
 
