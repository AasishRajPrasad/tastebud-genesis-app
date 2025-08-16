
import { Recipe, GeneratedRecipe } from "@/types/recipe";
import { authService } from "./authService";

class StorageService {
  private baseUrl = 'http://localhost:3001/api';

  private getAuthHeaders() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async saveRecipe(recipe: Recipe): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/recipes/save`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save recipe');
      }
    } catch (error) {
      console.error('Save recipe error:', error);
      throw error;
    }
  }

  async unsaveRecipe(recipeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/recipes/saved/${recipeId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unsave recipe');
      }
    } catch (error) {
      console.error('Unsave recipe error:', error);
      throw error;
    }
  }

  async getSavedRecipes(): Promise<Recipe[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recipes/saved`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get saved recipes');
      }

      const recipes = await response.json();
      console.log('Fetched saved recipes:', recipes);
      return recipes;
    } catch (error) {
      console.error('Get saved recipes error:', error);
      throw error;
    }
  }

  async isRecipeSaved(recipeId: string): Promise<boolean> {
    try {
      const savedRecipes = await this.getSavedRecipes();
      return savedRecipes.some(r => r.id === recipeId);
    } catch (error) {
      console.error('Check recipe saved error:', error);
      return false;
    }
  }

  async saveGeneratedRecipe(recipe: GeneratedRecipe): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/recipes/generated`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save generated recipe');
      }
    } catch (error) {
      console.error('Save generated recipe error:', error);
      throw error;
    }
  }

  async deleteGeneratedRecipe(recipeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/recipes/generated/${recipeId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete generated recipe');
      }
    } catch (error) {
      console.error('Delete generated recipe error:', error);
      throw error;
    }
  }

  async getGeneratedRecipes(): Promise<GeneratedRecipe[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recipes/generated`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get generated recipes');
      }

      const recipes = await response.json();
      console.log('Fetched generated recipes:', recipes);
      
      return recipes.map((recipe: any) => ({
        ...recipe,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        steps: Array.isArray(recipe.steps) ? recipe.steps : [],
        nutritionalInfo: recipe.nutritionalInfo || {
          calories: "Not available",
          protein: "Not available",
          carbs: "Not available",
          fat: "Not available",
          fiber: "Not available",
          sodium: "Not available"
        },
        createdAt: recipe.createdAt ? new Date(recipe.createdAt) : new Date()
      }));
    } catch (error) {
      console.error('Get generated recipes error:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
