import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Share2 } from "lucide-react";
import { GeneratedRecipe } from "@/types/recipe";
import { toast } from "sonner";

interface ShareModalProps {
  recipe: GeneratedRecipe;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal = ({ recipe, isOpen, onClose }: ShareModalProps) => {
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (isOpen && recipe) {
      shareRecipeAsPDF();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const generatePDF = async (): Promise<Blob> => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(20);
    pdf.text(recipe.title, 20, 30);

    // Description
    pdf.setFontSize(12);
    const splitDescription = pdf.splitTextToSize(recipe.description, 170);
    pdf.text(splitDescription, 20, 50);

    // Recipe Info
    let y = 70;
    pdf.setFontSize(14);
    pdf.text("Details:", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text(`Cuisine: ${recipe.cuisine}`, 20, y); y += 7;
    pdf.text(`Diet: ${recipe.diet}`, 20, y); y += 7;
    pdf.text(`Difficulty: ${recipe.difficulty}`, 20, y); y += 7;
    pdf.text(`Prep Time: ${recipe.prepTime}`, 20, y); y += 7;
    pdf.text(`Cook Time: ${recipe.cookTime}`, 20, y); y += 15;

    // Ingredients
    pdf.setFontSize(14);
    pdf.text("Ingredients:", 20, y); y += 10;
    pdf.setFontSize(10);
    recipe.ingredients.forEach((ing, i) => {
      const lines = pdf.splitTextToSize(`${i + 1}. ${ing}`, 170);
      pdf.text(lines, 20, y);
      y += lines.length * 5;
    });

    y += 10;

    // Instructions
    pdf.setFontSize(14);
    pdf.text("Instructions:", 20, y); y += 10;
    pdf.setFontSize(10);
    recipe.steps.forEach((step, i) => {
      const lines = pdf.splitTextToSize(`${i + 1}. ${step}`, 170);
      if (y > 250) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(lines, 20, y);
      y += lines.length * 5;
    });

    return pdf.output("blob");
  };

  const shareRecipeAsPDF = async () => {
    setIsSharing(true);
    try {
      const pdfBlob = await generatePDF();
      const fileName = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          files: [file]
        });
        toast.success("Recipe shared successfully!");
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded. Share manually from your device.");
      }

      onClose();
    } catch (error) {
      console.error("Error sharing recipe:", error);
      toast.error("Failed to share recipe. Please try again.");
      onClose();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-5 h-5" />
            Sharing Recipe...
          </DialogTitle>
        </DialogHeader>

        <p className="text-center text-muted-foreground py-6">
          {isSharing
            ? "Preparing your PDF for sharing..."
            : "Sharing completed!"}
        </p>
      </DialogContent>
    </Dialog>
  );
};
