-- Drop database if exists (use with caution in production)
-- DROP DATABASE IF EXISTS tastebud_ai;

-- Create the database
CREATE DATABASE IF NOT EXISTS tastebud_ai;
USE tastebud_ai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT,
    location VARCHAR(255),
    phone_number VARCHAR(20),
    cooking_experience ENUM('Beginner', 'Intermediate', 'Advanced', 'Professional'),
    favorite_ingredients TEXT,
    allergies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User dietary preferences (many-to-many)
CREATE TABLE IF NOT EXISTS dietary_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    preference ENUM(
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo',
        'Low-Carb', 'High-Protein', 'Diabetic-Friendly'
    ),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Saved recipes
CREATE TABLE IF NOT EXISTS saved_recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    recipe_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    ingredients TEXT,
    steps TEXT,
    cuisine VARCHAR(100),
    diet VARCHAR(100),
    difficulty VARCHAR(100),
    image_url TEXT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Generated recipes
CREATE TABLE IF NOT EXISTS generated_recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    recipe_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    ingredients JSON,
    steps JSON,
    cuisine VARCHAR(100),
    diet VARCHAR(100),
    difficulty VARCHAR(100),
    meal_type VARCHAR(100),
    nutritional_info JSON,
    prep_time VARCHAR(50),
    cook_time VARCHAR(50),
    total_time VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes (remove "IF NOT EXISTS" - not valid in MySQL)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX idx_saved_recipes_recipe_id ON saved_recipes(recipe_id);
CREATE INDEX idx_generated_recipes_user_id ON generated_recipes(user_id);
CREATE INDEX idx_generated_recipes_recipe_id ON generated_recipes(recipe_id);
CREATE INDEX idx_dietary_preferences_user_id ON dietary_preferences(user_id);

-- Optional: Insert sample user
INSERT IGNORE INTO users (email, password_hash, name, cooking_experience) VALUES 
('test@example.com', '$2a$10$example_hash_here', 'Test User', 'Intermediate');

-- Success message
SELECT 'Database setup completed successfully!' AS message;
