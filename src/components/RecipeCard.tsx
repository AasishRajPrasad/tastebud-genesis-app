
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546548970-71785318a17b";
          }}
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 line-clamp-2">{recipe.title}</CardTitle>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary">{recipe.cuisine}</Badge>
          <Badge variant={recipe.diet === "Veg" ? "default" : "destructive"}>
            {recipe.diet}
          </Badge>
          <Badge variant="outline">{recipe.difficulty}</Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {recipe.ingredients.split(',').slice(0, 3).join(', ')}...
        </p>
      </CardContent>
    </Card>
  );
};

 
