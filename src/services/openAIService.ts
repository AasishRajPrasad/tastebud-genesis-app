import { RecipeGenerationParams, GeneratedRecipe } from "@/types/recipe";

class OpenRouterService {
  private apiKey: string;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 3000; // 3 seconds between requests

  constructor() {
    // Load from environment variable for security
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found, using fallback response');
      // Return a structured fallback for meal planning
      if (prompt.includes('meal plan') || prompt.includes('Generate a unique')) {
        return JSON.stringify({
          name: "Healthy Power Bowl",
          description: "A nutritious and balanced meal with fresh ingredients",
          ingredients: [
            "1 cup quinoa, cooked",
            "1/2 cup black beans",
            "1/4 avocado, sliced",
            "1/2 cup cherry tomatoes",
            "2 tbsp olive oil",
            "1 tbsp lemon juice",
            "Salt and pepper to taste"
          ],
          calories: "450 kcal",
          prepTime: "15 minutes",
          instructions: [
            "Cook quinoa according to package instructions",
            "Rinse and heat black beans",
            "Slice avocado and tomatoes",
            "Combine all ingredients in a bowl",
            "Drizzle with olive oil and lemon juice",
            "Season with salt and pepper"
          ]
        });
      }
      throw new Error('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in .env.local');
    }

    try {
      await this.waitForRateLimit();
      console.log('Generating text with OpenRouter API');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'TasteBud AI'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
               content: 'You are a professional chef and nutritionist. Provide detailed, creative responses in the requested format. Always respond with valid JSON when JSON format is requested.'
            },
            {
              role: 'user',
              content: prompt,
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error response:', response.status, errorText);
        
        // Provide fallback for meal planning
        if (prompt.includes('meal plan') || prompt.includes('Generate a unique')) {
          console.log('Using fallback response for meal planning');
          return JSON.stringify({
            name: "Mediterranean Delight",
            description: "A healthy Mediterranean-inspired meal",
            ingredients: [
              "1 cup cooked brown rice",
              "1/2 cup chickpeas",
              "1/4 cup feta cheese",
              "1/2 cucumber, diced",
              "2 tbsp olive oil",
              "1 tbsp balsamic vinegar",
              "Fresh herbs (parsley, mint)"
            ],
            calories: "420 kcal",
            prepTime: "20 minutes",
            instructions: [
              "Cook brown rice according to package instructions",
              "Rinse and drain chickpeas",
              "Dice cucumber and crumble feta",
              "Combine rice, chickpeas, cucumber in a bowl",
              "Top with feta and fresh herbs",
              "Drizzle with olive oil and balsamic vinegar"
            ]
          });
        }
        
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid OpenRouter response structure:', data);
        throw new Error('Invalid response from OpenRouter API');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenRouter API error:', error);
      // Provide fallback for meal planning requests
      if (prompt.includes('meal plan') || prompt.includes('Generate a unique')) {
        console.log('Using fallback response due to error');
        return JSON.stringify({
          name: "Simple Veggie Bowl",
          description: "A quick and healthy vegetable bowl",
          ingredients: [
            "1 cup mixed greens",
            "1/2 cup roasted vegetables",
            "1/4 cup nuts or seeds",
            "2 tbsp dressing of choice"
          ],
          calories: "350 kcal",
          prepTime: "15 minutes",
          instructions: [
            "Prepare mixed greens in a bowl",
            "Add roasted vegetables",
            "Top with nuts or seeds",
            "Drizzle with dressing"
          ]
        });
      }
      
      throw error;
    }
  }

  async generateRecipe(params: RecipeGenerationParams): Promise<GeneratedRecipe> {
    try {
      console.log('Generating recipe with params:', params);

      const recipeData = await this.generateRecipeText(params);
      console.log('Recipe data generated successfully');

      // Use a fallback image from Unsplash related to food
      const imageUrl = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400';

      return {
        ...recipeData,
        imageUrl,
        createdAt: new Date(),
        id: Date.now().toString(),
      };
    } catch (error) {
      console.error('Recipe generation error:', error);

      if (error instanceof Error) {
        if (error.message.includes('429')) {
          throw new Error('Too many requests. Please wait a few seconds and try again.');
        }
        if (error.message.includes('401')) {
          throw new Error('Invalid API key. Please check your OpenRouter API key.');
        }
        if (error.message.includes('quota')) {
          throw new Error('API quota exceeded. Please check your OpenRouter billing.');
        }
      }

      throw new Error('Failed to generate recipe. Please try again.');
    }
  }

  private async generateRecipeText(params: RecipeGenerationParams): Promise<Omit<GeneratedRecipe, 'imageUrl' | 'createdAt' | 'id'>> {
    const prompt = `Create a detailed and creative ${params.cuisine} ${params.mealType} recipe that is ${params.diet} and ${params.difficulty} difficulty.

Recipe Requirements:
- Ingredients to use: ${params.ingredients}
${params.servings ? `- Servings: ${params.servings}` : ''}
${params.cookingTime ? `- Cooking time preference: ${params.cookingTime}` : ''}
${params.allergens ? `- Avoid allergens: ${params.allergens}` : ''}
${params.spiceLevel ? `- Spice level: ${params.spiceLevel}` : ''}
${params.healthGoals ? `- Health goals: ${params.healthGoals}` : ''}
${params.equipmentAvailable ? `- Available equipment: ${params.equipmentAvailable}` : ''}
${params.budgetLevel ? `- Budget level: ${params.budgetLevel}` : ''}

Please create a comprehensive recipe with:
1. A creative and appetizing title
2. A brief, enticing description
3. Detailed ingredients list with precise measurements
4. Clear, step-by-step cooking instructions
5. Nutritional information (approximate values)
6. Cooking times (prep, cook, total)

Please return ONLY a valid JSON object with this exact structure:
{
  "title": "Creative Recipe Name",
  "description": "A brief, appetizing description of the dish",
  "ingredients": ["ingredient 1 with precise measurements", "ingredient 2 with measurements"],
  "steps": ["detailed step 1", "detailed step 2", "detailed step 3"],
  "cuisine": "${params.cuisine}",
  "diet": "${params.diet}",
  "difficulty": "${params.difficulty}",
  "mealType": "${params.mealType}",
  "nutritionalInfo": {
    "calories": "XXX kcal per serving",
    "protein": "XX g",
    "carbs": "XX g",
    "fat": "XX g",
    "fiber": "XX g",
    "sodium": "XXX mg"
  },
  "prepTime": "XX minutes",
  "cookTime": "XX minutes",
  "totalTime": "XX minutes"
}

Make the recipe creative, detailed, and ensure all nutritional values are realistic estimates based on the ingredients used.`;

    console.log('Sending request to OpenRouter with enhanced prompt');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TasteBud AI'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef and nutritionist. Create detailed, creative recipes with accurate nutritional information. Always respond with valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
      }),
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error response:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response data:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenRouter response structure:', data);
      throw new Error('Invalid response from OpenRouter API');
    }

    try {
      const content = data.choices[0].message.content.trim();
      console.log('Raw OpenRouter content:', content);

      // Extract JSON from the response
      let jsonContent = content;
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonContent = content.substring(jsonStart, jsonEnd + 1);
      }

      console.log('Extracted JSON:', jsonContent);
      const parsedRecipe = JSON.parse(jsonContent);

      // Validate required fields
      if (!parsedRecipe.title || !parsedRecipe.ingredients || !parsedRecipe.steps || !parsedRecipe.description) {
        throw new Error('Invalid recipe format - missing required fields');
      }

      // Ensure arrays
      if (!Array.isArray(parsedRecipe.ingredients)) {
        parsedRecipe.ingredients = [parsedRecipe.ingredients];
      }
      if (!Array.isArray(parsedRecipe.steps)) {
        parsedRecipe.steps = [parsedRecipe.steps];
      }

      // Ensure nutritional info exists
      if (!parsedRecipe.nutritionalInfo) {
        parsedRecipe.nutritionalInfo = {
          calories: "Not calculated",
          protein: "Not calculated",
          carbs: "Not calculated",
          fat: "Not calculated",
          fiber: "Not calculated",
          sodium: "Not calculated"
        };
      }

      // Ensure timing info exists
      if (!parsedRecipe.prepTime) parsedRecipe.prepTime = "15 minutes";
      if (!parsedRecipe.cookTime) parsedRecipe.cookTime = "30 minutes";
      if (!parsedRecipe.totalTime) parsedRecipe.totalTime = "45 minutes";

      console.log('Successfully parsed enhanced recipe:', parsedRecipe);
      return parsedRecipe;
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response:', parseError);
      console.error('Content was:', data.choices[0].message.content);
      throw new Error('Failed to parse recipe data from OpenRouter');
    }
  }
}

export const openAIService = new OpenRouterService();
