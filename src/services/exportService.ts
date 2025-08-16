import { GeneratedRecipe } from "@/types/recipe";

class ExportService {
  async exportRecipeToPDF(recipe: GeneratedRecipe): Promise<void> {
    try {
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
      
      // Save the PDF
      pdf.save(`${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export recipe to PDF');
    }
  }

  generateShareableLink(recipe: GeneratedRecipe): string {
    // Use a proper domain instead of localhost for sharing
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'https://yourapp.com' // Replace with your actual domain
      : window.location.origin;
    
    const recipeData = {
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cuisine: recipe.cuisine,
      diet: recipe.diet,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime
    };
    
    const encodedData = btoa(JSON.stringify(recipeData));
    return `${baseUrl}/shared-recipe?data=${encodedData}`;
  }

  async shareOnSocialMedia(recipe: GeneratedRecipe, platform: 'twitter' | 'facebook' | 'whatsapp'): Promise<void> {
    const shareText = `Check out this amazing ${recipe.cuisine} recipe: ${recipe.title}! 🍽️`;
    const shareUrl = this.generateShareableLink(recipe);
    
    let socialUrl = '';
    
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        // For WhatsApp, create a clickable link format
        const whatsappText = `${shareText}\n\nClick here to view the recipe: ${shareUrl}`;
        socialUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        break;
    }
    
    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400');
    }
  }

  async copyToClipboard(recipe: GeneratedRecipe): Promise<void> {
    const shareUrl = this.generateShareableLink(recipe);
    const shareText = `${recipe.title}\n\n${recipe.description}\n\nIngredients:\n${recipe.ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}\n\nInstructions:\n${recipe.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nView full recipe: ${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}

export const exportService = new ExportService();
