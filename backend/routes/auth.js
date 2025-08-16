const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      age,
      location,
      phoneNumber,
      dietaryPreferences,
      cookingExperience,
      favoriteIngredients,
      allergies
    } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, name, age, location, phone_number, 
       cooking_experience, favorite_ingredients, allergies) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, name, age || null, location || null, phoneNumber || null,
       cookingExperience || null, favoriteIngredients || null, allergies || null]
    );

    const userId = result.insertId;

    // Insert dietary preferences - fixed the bulk insert syntax
    if (dietaryPreferences && dietaryPreferences.length > 0) {
      for (const preference of dietaryPreferences) {
        await pool.execute(
          'INSERT INTO dietary_preferences (user_id, preference) VALUES (?, ?)',
          [userId, preference]
        );
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: userId, email: email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    // Get complete user data with proper field mapping
    const [userData] = await pool.execute(
      'SELECT id, email, name, age, location, phone_number as phoneNumber, cooking_experience as cookingExperience, favorite_ingredients as favoriteIngredients, allergies FROM users WHERE id = ?',
      [userId]
    );

    const [preferences] = await pool.execute(
      'SELECT preference FROM dietary_preferences WHERE user_id = ?',
      [userId]
    );

    const user = {
      ...userData[0],
      dietaryPreferences: preferences.map(p => p.preference)
    };

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Get user by email with proper field mapping
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, name, age, location, phone_number as phoneNumber, cooking_experience as cookingExperience, favorite_ingredients as favoriteIngredients, allergies FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get dietary preferences
    const [preferences] = await pool.execute(
      'SELECT preference FROM dietary_preferences WHERE user_id = ?',
      [user.id]
    );

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password_hash from response
    delete user.password_hash;
    user.dietaryPreferences = preferences.map(p => p.preference);

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      age,
      location,
      phoneNumber,
      cookingExperience,
      favoriteIngredients,
      allergies,
      dietaryPreferences
    } = req.body;

    console.log('Updating profile for user:', userId, 'with data:', req.body);

    // Update user data
    await pool.execute(
      `UPDATE users SET name = ?, age = ?, location = ?, phone_number = ?, 
       cooking_experience = ?, favorite_ingredients = ?, allergies = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, age || null, location || null, phoneNumber || null,
       cookingExperience || null, favoriteIngredients || null, allergies || null, userId]
    );

    // Update dietary preferences
    await pool.execute('DELETE FROM dietary_preferences WHERE user_id = ?', [userId]);
    
    if (dietaryPreferences && dietaryPreferences.length > 0) {
      for (const preference of dietaryPreferences) {
        await pool.execute(
          'INSERT INTO dietary_preferences (user_id, preference) VALUES (?, ?)',
          [userId, preference]
        );
      }
    }
    // Get updated user data with proper field mapping
    const [userData] = await pool.execute(
      'SELECT id, email, name, age, location, phone_number as phoneNumber, cooking_experience as cookingExperience, favorite_ingredients as favoriteIngredients, allergies FROM users WHERE id = ?',
      [userId]
    );

    const [preferences] = await pool.execute(
      'SELECT preference FROM dietary_preferences WHERE user_id = ?',
      [userId]
    );

    const user = {
      ...userData[0],
      dietaryPreferences: preferences.map(p => p.preference)
    };

    console.log('Profile updated successfully for user:', userId);
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
