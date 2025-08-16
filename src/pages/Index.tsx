
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Sparkles, Users, Clock, Target, TrendingUp, Calendar, PieChart, ArrowRight, Star, Coffee, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { loadRecipesFromCSV } from "@/utils/csvLoader";
import { RecipeCard } from "@/components/RecipeCard";
import { useState } from "react";
import { RecipeModal } from "@/components/RecipeModal";
import { Recipe } from "@/types/recipe";

const Index = () => {
  const user = authService.getCurrentUser();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: loadRecipesFromCSV,
  });

  // Get first 3 recipes for featured section
  const featuredRecipes = recipes.slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Hero Section - Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="w-full">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="flex justify-center mb-8">
  <img 
    src="/chef.png" 
    alt="Culinary Dream Maker" 
    className="w-24 h-24 object-contain"
    onError={(e) => {
      // Fallback logic if image fails to load
      e.currentTarget.style.display = 'none';
    }}
  />
</div>

              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="text-gray-800">Culinary Magic</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Transform your cooking with AI-generated recipes, and smart kitchen insights. 
              Create amazing dishes tailored to your taste and dietary needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <>
                  <Link to="/generator">
                    <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all">
                      <Sparkles className="w-6 h-6 mr-3" />
                      Generate Recipe Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  
                </>
              ) : (
                <Link to="/login">
                  <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-12 py-4 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all">
                    Start Cooking Smarter
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Recipes Section - Full Width */}
      {featuredRecipes.length > 0 && (
        <div className="w-full bg-white py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Featured <span className="text-orange-600">Recipes</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover amazing recipes from our collection, perfect for your next cooking adventure
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                    <div className="p-4 bg-white rounded-b-lg border">
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="flex gap-2 mb-3">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-12 bg-gray-200 rounded"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto">
                {featuredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => setSelectedRecipe(recipe)}
                  />
                ))}
              </div>
            )}

            <div className="text-center">
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-full shadow-lg">
                  View All Recipes
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      

      {/* CTA Section - Full Width */}
      <div className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Coffee className="w-16 h-16 text-white mx-auto mb-6" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Kitchen?
            </h2>
            <p className="text-xl text-orange-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of home cooks who are already creating amazing meals with AI assistance. 
              Start your culinary journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {user ? (
                <>
                  <Link to="/generator">
                    <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-xl transform hover:scale-105 transition-all">
                      <Sparkles className="w-6 h-6 mr-3" />
                      Generate Recipe
                    </Button>
                  </Link>
                 
                </>
              ) : (
                <Link to="/login">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-12 py-4 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all">
                    Start Cooking Smarter
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
};

export default Index;
