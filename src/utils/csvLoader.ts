import { Recipe } from "@/types/recipe";

export const loadRecipesFromCSV = async (): Promise<Recipe[]> => {
  try {
    console.log('Loading recipes from CSV...');
    const response = await fetch('/recipes.csv');
    
    if (!response.ok) {
      console.error('Failed to fetch CSV file:', response.status, response.statusText);
      return [];
    }
    
    const csvText = await response.text();
    console.log('CSV file loaded, length:', csvText.length);
    
    // Check if we got HTML instead of CSV (common when file doesn't exist)
    if (csvText.trim().startsWith('<!DOCTYPE html>') || csvText.trim().startsWith('<html')) {
      console.error('Received HTML instead of CSV - the recipes.csv file probably doesn\'t exist');
      return [];
    }
    
    if (!csvText.trim()) {
      console.error('CSV file is empty');
      return [];
    }
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('Number of lines:', lines.length);
    
    if (lines.length < 2) {
      console.error('CSV file must have at least header and one data row');
      return [];
    }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    console.log('CSV headers:', headers);

    const recipes: Recipe[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      try {
        const values = parseCSVLine(line);
        console.log(`Recipe ${i}:`, values);
        
        // Validate that we have enough columns
        if (values.length < 7) {
          console.warn(`Recipe ${i} has insufficient data, skipping`);
          continue;
        }
        
        const recipe: Recipe = {
          id: i.toString(),
          title: values[0] || `Recipe ${i}`,
          ingredients: values[1] || 'No ingredients listed',
          steps: values[2] || 'No steps provided',
          cuisine: values[3] || 'Unknown',
          diet: values[4] || 'Unknown',
          difficulty: values[5] || 'Medium',
          image_url: values[6] ? `/${values[6]}` : 'https://images.unsplash.com/photo-1546548970-71785318a17b'
        };
        
        // Only add recipes with valid titles
        if (recipe.title && recipe.title.trim() && recipe.title !== `Recipe ${i}`) {
          recipes.push(recipe);
        }
      } catch (error) {
        console.error(`Error parsing recipe ${i}:`, error);
      }
    }

    console.log('Successfully parsed recipes:', recipes.length);
    console.log('Sample recipe:', recipes[0]);
    return recipes;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
};

// Helper function to properly parse CSV lines with quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Handle escaped quotes
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  // Remove surrounding quotes if present and clean up
  return result.map(field => {
    let cleaned = field.replace(/^"|"$/g, '').trim();
    return cleaned;
  });
};
 
