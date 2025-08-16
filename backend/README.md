
# TasteBud AI Backend

Backend API server for the TasteBud AI recipe application using Node.js, Express, and MySQL.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   - Copy `.env` file and update with your MySQL credentials
   - Make sure MySQL server is running

3. **Create Database**
   - Run the SQL schema provided in `database_schema.sql`

4. **Start Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Test Connection**
   - Visit: http://localhost:3001/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/profile` - Update user profile

### Recipes
- `GET /api/recipes/saved` - Get user's saved recipes
- `POST /api/recipes/save` - Save a recipe
- `DELETE /api/recipes/saved/:id` - Remove saved recipe
- `GET /api/recipes/generated` - Get user's generated recipes
- `POST /api/recipes/generated` - Save generated recipe
- `DELETE /api/recipes/generated/:id` - Delete generated recipe

## Environment Variables

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=tastebud_ai
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
```
 
