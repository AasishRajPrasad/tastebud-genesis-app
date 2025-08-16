
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get saved recipes for user
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [recipes] = await pool.execute(
      'SELECT recipe_id as id, title, ingredients, steps, cuisine, diet, difficulty, image_url FROM saved_recipes WHERE user_id = ? ORDER BY saved_at DESC',
      [userId]
    );

    res.json(recipes);
  } catch (error) {
    console.error('Get saved recipes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save a recipe
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id, title, ingredients, steps, cuisine, diet, difficulty, image_url } = req.body;

    // Check if recipe is already saved
    const [existing] = await pool.execute(
      'SELECT id FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Recipe already saved' });
    }

    await pool.execute(
      'INSERT INTO saved_recipes (user_id, recipe_id, title, ingredients, steps, cuisine, diet, difficulty, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, id, title, ingredients, steps, cuisine, diet, difficulty, image_url]
    );

    res.status(201).json({ message: 'Recipe saved successfully' });
  } catch (error) {
    console.error('Save recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove saved recipe
router.delete('/saved/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
      [userId, recipeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({ message: 'Recipe removed successfully' });
  } catch (error) {
    console.error('Remove saved recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get generated recipes for user
router.get('/generated', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [recipes] = await pool.execute(
      `SELECT recipe_id as id, title, description, ingredients, steps, cuisine, diet, 
       difficulty, meal_type as mealType, nutritional_info as nutritionalInfo, 
       prep_time as prepTime, cook_time as cookTime, total_time as totalTime, 
       image_url as imageUrl, created_at as createdAt 
       FROM generated_recipes WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Parse JSON fields safely
    const parsedRecipes = recipes.map(recipe => {
      try {
        return {
          ...recipe,
          ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients,
          steps: typeof recipe.steps === 'string' ? JSON.parse(recipe.steps) : recipe.steps,
          nutritionalInfo: typeof recipe.nutritionalInfo === 'string' ? JSON.parse(recipe.nutritionalInfo) : recipe.nutritionalInfo,
          createdAt: new Date(recipe.createdAt)
        };
      } catch (parseError) {
        console.error('Error parsing recipe data:', parseError, 'Recipe ID:', recipe.id);
        // Return recipe with default values if parsing fails
        return {
          ...recipe,
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [recipe.ingredients || 'No ingredients'],
          steps: Array.isArray(recipe.steps) ? recipe.steps : [recipe.steps || 'No steps'],
          nutritionalInfo: typeof recipe.nutritionalInfo === 'object' ? recipe.nutritionalInfo : {
            calories: "Not available",
            protein: "Not available",
            carbs: "Not available",
            fat: "Not available",
            fiber: "Not available",
            sodium: "Not available"
          },
          createdAt: new Date(recipe.createdAt)
        };
      }
    });

    res.json(parsedRecipes);
  } catch (error) {
    console.error('Get generated recipes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save generated recipe
router.post('/generated', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      id,
      title,
      description,
      ingredients,
      steps,
      cuisine,
      diet,
      difficulty,
      mealType,
      nutritionalInfo,
      prepTime,
      cookTime,
      totalTime,
      imageUrl
    } = req.body;

    // Check if recipe already exists
    const [existing] = await pool.execute(
      'SELECT id FROM generated_recipes WHERE user_id = ? AND recipe_id = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Recipe already saved' });
    }

    await pool.execute(
      `INSERT INTO generated_recipes 
       (user_id, recipe_id, title, description, ingredients, steps, cuisine, diet, 
        difficulty, meal_type, nutritional_info, prep_time, cook_time, total_time, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, id, title, description || '', 
        JSON.stringify(ingredients), 
        JSON.stringify(steps), 
        cuisine, diet, difficulty, mealType, 
        JSON.stringify(nutritionalInfo), 
        prepTime, cookTime, totalTime, imageUrl || null
      ]
    );

    res.status(201).json({ message: 'Generated recipe saved successfully' });
  } catch (error) {
    console.error('Save generated recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete generated recipe
router.delete('/generated/:recipeId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM generated_recipes WHERE user_id = ? AND recipe_id = ?',
      [userId, recipeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({ message: 'Generated recipe deleted successfully' });
  } catch (error) {
    console.error('Delete generated recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
 
