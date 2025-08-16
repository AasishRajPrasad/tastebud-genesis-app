
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedRecipe } from "@/types/recipe";
import { storageService } from "@/services/storageService";
import { exportService } from "@/services/exportService";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, ChefHat, Flame, Share, FileText } from "lucide-react";
import { useState } from "react";

interface GeneratedRecipeModalProps {
  recipe: GeneratedRecipe;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const GeneratedRecipeModal = ({ recipe, isOpen, onClose, onSave }: GeneratedRecipeModalProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleSave = async () => {
    try {
      await storageService.saveGeneratedRecipe(recipe);
      toast({
        title: "Recipe saved successfully!",
        description: "You can find it in your profile under Generated Recipes.",
      });
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportService.exportRecipeToPDF(recipe);
      toast({
        title: "PDF exported successfully!",
        description: "Your recipe has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to export recipe to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Generate PDF blob
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text(recipe.title, 20, 30);
      
      // Add description
      pdf.setFontSize(12);
      const splitDescription = pdf.splitTextToSize(recipe.description, 170);
      pdf.text(splitDescription, 20, 50);
      
      // Add recipe details
      let yPosition = 70;
      pdf.setFontSize(14);
      pdf.text('Recipe Details:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.text(`Cuisine: ${recipe.cuisine}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Diet: ${recipe.diet}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Difficulty: ${recipe.difficulty}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Prep Time: ${recipe.prepTime}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Cook Time: ${recipe.cookTime}`, 20, yPosition);
      yPosition += 15;
      
      // Add ingredients
      pdf.setFontSize(14);
      pdf.text('Ingredients:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      recipe.ingredients.forEach((ingredient, index) => {
        const text = `${index + 1}. ${ingredient}`;
        const splitText = pdf.splitTextToSize(text, 170);
        pdf.text(splitText, 20, yPosition);
        yPosition += splitText.length * 5;
      });
      
      yPosition += 10;
      
      // Add instructions
      pdf.setFontSize(14);
      pdf.text('Instructions:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      recipe.steps.forEach((step, index) => {
        const text = `${index + 1}. ${step}`;
        const splitText = pdf.splitTextToSize(text, 170);
        pdf.text(splitText, 20, yPosition);
        yPosition += splitText.length * 5;
        
        // Add new page if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      });
      
      // Convert to blob
      const pdfBlob = pdf.output('blob');
      const fileName = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      
      // Create file for sharing
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      // Check if Web Share API is supported and can share files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: recipe.title,
          text: `Check out this amazing ${recipe.cuisine} recipe: ${recipe.title}!`,
          files: [file]
        });
        toast({
          title: "Recipe shared successfully!",
          description: "Your recipe PDF has been shared.",
        });
      } else {
        // Fallback: download the PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "PDF downloaded",
          description: "Your recipe PDF has been downloaded. You can now share it manually.",
        });
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
      toast({
        title: "Share failed",
        description: "Failed to share recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await exportService.copyToClipboard(recipe);
      toast({
        title: "Recipe copied!",
        description: "Recipe details have been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Error copying recipe:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Ensure arrays exist
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {recipe.title}
          </DialogTitle>
          <p className="text-lg text-gray-600 text-center mt-2">{recipe.description}</p>
        </DialogHeader>
         <div className="space-y-6">
          {/* Recipe Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <Clock className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                <p className="text-sm text-gray-500">Prep Time</p>
                <p className="font-semibold">{recipe.prepTime}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Clock className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-gray-500">Cook Time</p>
                <p className="font-semibold">{recipe.cookTime}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Users className="w-6 h-6 mx-auto text-orange-600 mb-2" />
                <p className="text-sm text-gray-500">Total Time</p>
                <p className="font-semibold">{recipe.totalTime}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Flame className="w-6 h-6 mx-auto text-red-600 mb-2" />
                <p className="text-sm text-gray-500">Difficulty</p>
                <p className="font-semibold">{recipe.difficulty}</p>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">{recipe.cuisine}</Badge>
            <Badge variant={recipe.diet === "Vegetarian" || recipe.diet === "Vegan" ? "default" : "destructive"}>
              {recipe.diet}
            </Badge>
            <Badge variant="outline">{recipe.mealType}</Badge>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ingredients */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="text-xl text-orange-700 flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-3 group hover:bg-white/50 p-2 rounded-lg transition-colors">
                      <span className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="group hover:bg-white/50 p-3 rounded-lg transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nutritional Information */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50">
               <CardHeader>
                <CardTitle className="text-xl text-green-700">Nutritional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-semibold">{recipe.nutritionalInfo?.calories || "Not available"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-semibold">{recipe.nutritionalInfo?.protein || "Not available"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carbs:</span>
                    <span className="font-semibold">{recipe.nutritionalInfo?.carbs || "Not available"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fat:</span>
                    <span className="font-semibold">{recipe.nutritionalInfo?.fat || "Not available"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fiber:</span>
                    <span className="font-semibold">{recipe.nutritionalInfo?.fiber || "Not available"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sodium:</span>
                    <span className="font-semibold">{recipe.nutritionalInfo?.sodium || "Not available"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Export, Share and Copy Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export to PDF"}
              </Button>
              
              <Button 
                onClick={handleShare}
                disabled={isSharing}
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100"
              >
                <Share className="w-4 h-4" />
                {isSharing ? "Sharing..." : "Share"}
              </Button>

              <Button 
                onClick={handleCopy}
                variant="outline"
                className="flex items-center gap-2"
              >
                Copy Recipe
              </Button>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              className="w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Save This Amazing Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
