import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeModal } from "@/components/RecipeModal";
import { Recipe } from "@/types/recipe";
import { loadRecipesFromCSV } from "@/utils/csvLoader";

const Dashboard = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [dietFilter, setDietFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        console.log('Dashboard: Starting to load recipes...');
        setLoading(true);
        setError(null);
        const loadedRecipes = await loadRecipesFromCSV();
        console.log('Dashboard: Loaded recipes:', loadedRecipes.length);
        
        if (loadedRecipes.length === 0) {
          setError('No recipes found. Please make sure recipes.csv exists in the public folder.');
        } else {
          setRecipes(loadedRecipes);
          setFilteredRecipes(loadedRecipes);
        }
      } catch (err) {
        console.error('Dashboard: Error loading recipes:', err);
        setError('Failed to load recipes. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };
    loadRecipes();
  }, []);

  useEffect(() => {
      console.log('Filtering recipes...');
    console.log('Search term:', searchTerm);
    console.log('Cuisine filter:', cuisineFilter);
    console.log('Diet filter:', dietFilter);
    console.log('Difficulty filter:', difficultyFilter);
    
    let filtered = recipes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply cuisine filter
    if (cuisineFilter) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine && recipe.cuisine.toLowerCase() === cuisineFilter.toLowerCase()
      );
    }

    // Apply diet filter
    if (dietFilter) {
      filtered = filtered.filter(recipe => 
        recipe.diet && recipe.diet.toLowerCase() === dietFilter.toLowerCase()
      );
    }

    // Apply difficulty filter
    if (difficultyFilter) {
      filtered = filtered.filter(recipe => 
        recipe.difficulty && recipe.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
      );
    }

    console.log('Filtered recipes count:', filtered.length);
    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, cuisineFilter, dietFilter, difficultyFilter]);
  // Get unique values for filters - properly clean and validate
  const cuisines = [...new Set(recipes
    .map(r => r.cuisine)
    .filter(c => c && c.trim() && c !== 'Unknown' && c !== '')
    .map(c => c.trim())
  )].sort();
  
  const diets = [...new Set(recipes
    .map(r => r.diet)
    .filter(d => d && d.trim() && d !== 'Unknown' && d !== '')
    .map(d => d.trim())
  )].sort();
  
  const difficulties = [...new Set(recipes
    .map(r => r.difficulty)
    .filter(d => d && d.trim() && d !== '')
    .map(d => d.trim())
  )].sort();

  console.log('Available cuisines:', cuisines);
  console.log('Available diets:', diets);
  console.log('Available difficulties:', difficulties);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Recipes</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Recipe Dashboard</h1>
          <p className="text-gray-600">Discover amazing recipes from around the world ({recipes.length} recipes loaded)</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="px-3 py-2 border rounded-md bg-white"
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value)}
              >
                <option value="">All Cuisines</option>
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
              <select 
                className="px-3 py-2 border rounded-md bg-white"
                value={dietFilter}
                onChange={(e) => setDietFilter(e.target.value)}
              >
                <option value="">All Diets</option>
                {diets.map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
              </select>
              <select 
                className="px-3 py-2 border rounded-md bg-white"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
            
            {/* Clear filters button */}
            {(searchTerm || cuisineFilter || dietFilter || difficultyFilter) && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setCuisineFilter("");
                    setDietFilter("");
                    setDifficultyFilter("");
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>

        {filteredRecipes.length === 0 && recipes.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No recipes found matching your criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setCuisineFilter("");
                setDietFilter("");
                setDifficultyFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Recipe Modal */}
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            isOpen={!!selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
 
