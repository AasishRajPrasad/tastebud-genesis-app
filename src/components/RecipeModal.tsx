
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/types/recipe";
import { storageService } from "@/services/storageService";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RecipeModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeModal = ({ recipe, isOpen, onClose }: RecipeModalProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        setCheckingStatus(true);
        const saved = await storageService.isRecipeSaved(recipe.id);
        setIsSaved(saved);
      } catch (error) {
        console.error('Error checking saved status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    if (isOpen) {
      checkSavedStatus();
    }
  }, [recipe.id, isOpen]);

  const handleSaveToggle = async () => {
    try {
      setLoading(true);
      if (isSaved) {
        await storageService.unsaveRecipe(recipe.id);
        setIsSaved(false);
        toast({
          title: "Recipe removed from saved recipes",
        });
      } else {
        await storageService.saveRecipe(recipe);
        setIsSaved(true);
        toast({
          title: "Recipe saved successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save/unsave recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546548970-71785318a17b";
              }}
            />
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">{recipe.cuisine}</Badge>
              <Badge variant={recipe.diet === "Veg" ? "default" : "destructive"}>
                {recipe.diet}
              </Badge>
              <Badge variant="outline">{recipe.difficulty}</Badge>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.split(',').map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    {ingredient.trim()}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <div className="prose prose-sm">
                {recipe.steps.split('.').filter(step => step.trim()).map((step, index) => (
                  <p key={index} className="mb-2">
                    <span className="font-medium text-orange-600">Step {index + 1}:</span> {step.trim()}.
                  </p>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleSaveToggle}
              className="w-full"
              variant={isSaved ? "destructive" : "default"}
              disabled={loading || checkingStatus}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {checkingStatus ? "Checking..." : isSaved ? "Remove from Saved" : "Save Recipe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
 
