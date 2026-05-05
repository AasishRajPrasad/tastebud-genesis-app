# SmartChef AI — AI-Based Recipe Generation and Recommendation System
## Complete End-to-End Technical Documentation (Viva & Presentation Study Guide)

> A single, exhaustive reference covering frontend, backend, APIs, AI logic, database, workflows, and architecture of the project. Written assuming the reader has **no prior knowledge** — every layer is explained both conceptually and practically with examples.

---

## Table of Contents
1. Project Overview
2. Complete Tech Stack Breakdown
3. System Architecture
4. Frontend Deep Dive
5. Backend Deep Dive
6. API Integration
7. Core Logic & Functions
8. Workflow / Execution Flow
9. Dataset / Database Design
10. AI / Model Explanation
11. Libraries & Dependencies
12. Key Features
13. Challenges & Solutions
14. Future Enhancements
15. Conclusion
16. Quick Viva Cheat Sheet

---

## 1. Project Overview

### Title
**SmartChef AI** — An AI-Based Recipe Generation and Recommendation System (also referred to in the codebase as *TasteBud AI*).

### Objective
To build an intelligent web application that:
- Generates **personalized recipes** on-demand using a Large Language Model (LLM).
- **Recommends** recipes from a curated dataset based on user preferences (cuisine, diet, difficulty).
- Provides an **AI Meal Planner Service** that designs full multi-day meal plans tailored to a user's body metrics, dietary needs, and health goals.
- Allows users to **save**, **share**, and **export** recipes/meal plans (PDF).

### Problem Statement
People often struggle with:
- *"What should I cook today with what I already have?"*
- *"Which meals fit my diet (Keto, Vegan, Diabetic-friendly)?"*
- *"How do I plan a balanced 7-day meal plan for my goals?"*

Traditional recipe websites are static — you search, scroll, and adapt. SmartChef AI flips this: the user describes **ingredients, preferences, and goals**, and the AI generates a **bespoke recipe or full meal plan** instantly.

### Real-World Relevance
- **Reduces food waste** — uses ingredients already at home.
- **Promotes healthy eating** — diet-aware recommendations.
- **Saves time** — eliminates manual meal planning.
- **Personalized** — adapts to allergies, equipment, budget, spice level.

### Target Users
- Home cooks & beginners learning to cook
- Fitness enthusiasts following macro/calorie goals
- People with dietary restrictions (diabetic, gluten-free, vegan)
- Busy professionals needing weekly meal plans
- Students managing budgets and limited equipment

---

## 2. Complete Tech Stack Breakdown

### Frontend Layer
| Item | Technology | Why |
|---|---|---|
| Framework | **React 18** | Component-based, fast rendering with Virtual DOM |
| Build tool | **Vite 5** | Lightning-fast HMR (Hot Module Replacement) |
| Language | **TypeScript** | Compile-time type safety, fewer runtime bugs |
| Routing | **React Router v6** | Declarative client-side routing (SPA navigation) |
| Styling | **Tailwind CSS v3** | Utility-first CSS, design tokens via `index.css` |
| UI Library | **shadcn/ui + Radix UI** | Accessible, customizable headless components |
| Icons | **lucide-react** | Lightweight SVG icon set |
| State | **React Hooks** (`useState`, `useEffect`, `useContext`) | Local + cross-component state |
| Forms | Controlled components + custom validation | Simple, no extra dependency |
| Notifications | **sonner / shadcn toast** | Non-blocking user feedback |
| HTTP | **fetch API** | Native, no axios needed |
| PDF Export | **jsPDF** | Client-side PDF generation for meal plans |

**Components built:**
- `Navbar.tsx` — top navigation, links to Dashboard / Generator / Meal Planner / Profile
- `RecipeCard.tsx` — displays a recipe summary (title, cuisine, diet, image)
- `RecipeModal.tsx` — full-screen recipe details
- `GeneratedRecipeModal.tsx` — modal for AI-generated recipes (with nutrition)
- `MealPlanForm.tsx` — multi-step form collecting user metrics & preferences
- `MealPlanDisplay.tsx` — shows generated multi-day plan (expandable cards)
- `ShareModal.tsx` — social/share link sharing
- `ProtectedRoute.tsx` — guards routes that require login
- `ErrorBoundary.tsx` — catches React render errors gracefully

### Backend Layer
| Item | Technology |
|---|---|
| Runtime | **Node.js** |
| Framework | **Express.js** |
| Auth | **JWT (JSON Web Tokens)** + **bcrypt** for password hashing |
| Database driver | `mysql2` |
| Env config | `dotenv` |
| CORS | `cors` middleware |

**Backend folder structure (`/backend`):**
```
backend/
├── server.js              # Entry point — starts Express server
├── config/
│   └── database.js        # MySQL connection pool
├── middleware/
│   └── auth.js            # JWT verification middleware
├── routes/
│   ├── auth.js            # /api/auth/* — register, login, profile
│   └── recipes.js         # /api/recipes/* — save, list, generated recipes
├── setup_database.sql     # MySQL schema
└── package.json
```

### Database / Dataset Layer
- **MySQL** (`tastebud_ai` database) — for users, saved recipes, generated recipes, dietary preferences.
- **CSV file** (`public/recipes.csv`) — static recipe dataset loaded into the dashboard for **recommendation/search**.

### AI / ML Layer
- **OpenRouter API** (gateway to OpenAI's `gpt-4o-mini` model).
- Used in `src/services/openAIService.ts` for:
  - Generating individual recipes (Recipe Generator).
  - Generating each meal in a multi-day Meal Plan.
- **Prompt engineering** — structured prompts force the model to return clean JSON containing title, ingredients, steps, nutrition, timing.
- **Fallback responses** — if API fails or rate limit hits, hardcoded sensible recipes are returned so UX never breaks.

---

## 3. System Architecture (Very Important)

### High-Level Diagram (textual)
```
┌────────────────┐    HTTPS/JSON    ┌────────────────┐    HTTPS/JSON    ┌────────────────────┐
│                │ ───────────────► │                │ ───────────────► │  OpenRouter LLM    │
│  React Client  │                  │ Express Server │                  │  (gpt-4o-mini)     │
│  (Browser SPA) │ ◄─────────────── │ (Node.js API)  │ ◄─────────────── │                    │
└───────┬────────┘    JSON          └───────┬────────┘     JSON         └────────────────────┘
        │                                   │
        │ fetch /recipes.csv                │ mysql2
        ▼                                   ▼
┌────────────────┐                  ┌────────────────┐
│ Static dataset │                  │ MySQL Database │
│ (recipes.csv)  │                  │ (tastebud_ai)  │
└────────────────┘                  └────────────────┘
```

### Step-by-Step Interaction Flow
1. **User opens app** → React mounts in browser, React Router decides which page to render.
2. **User logs in** → POST `/api/auth/login` → backend verifies password (bcrypt) → returns JWT.
3. **Dashboard loads** → frontend `fetch('/recipes.csv')` → `csvLoader.ts` parses to objects → cards render.
4. **User opens Generator** → fills form → frontend calls `openAIService.generateRecipe(params)`.
5. **AI service** builds a structured prompt → POSTs to `https://openrouter.ai/api/v1/chat/completions`.
6. **Model returns JSON** → service parses, validates, fills missing fields → React state updates → modal shows recipe.
7. **User clicks Save** → POST `/api/recipes/save` (with JWT) → row inserted into `saved_recipes` table.
8. **Meal Planner** → loops over N days × meal slots → calls AI per slot in parallel/sequence → assembles `DayPlan[]` → renders → optional **PDF export** via `jsPDF`.

### Communication Layers
- **Browser ↔ Backend**: REST over HTTPS, JSON payloads, JWT in `Authorization: Bearer <token>` header.
- **Backend ↔ MySQL**: connection pool from `config/database.js` using `mysql2/promise`.
- **Browser/Service ↔ OpenRouter**: HTTPS POST with `Bearer <API_KEY>`, OpenAI-compatible JSON schema.
- **Browser ↔ CSV**: simple `fetch('/recipes.csv')` (Vite serves `public/` statically).

---

## 4. Frontend Deep Dive

### Folder Structure
```
src/
├── App.tsx                     # Root — sets up Router + global providers
├── main.tsx                    # ReactDOM.createRoot — bootstraps app
├── index.css                   # Tailwind base + design tokens (HSL vars)
├── pages/
│   ├── Index.tsx               # Landing page
│   ├── Login.tsx               # Login + Register
│   ├── Dashboard.tsx           # Recommendation grid (CSV-driven)
│   ├── Generator.tsx           # AI Recipe Generator form + results
│   ├── MealPlanner.tsx         # AI Meal Planner page (form + display)
│   ├── Profile.tsx             # User profile + saved recipes
│   └── NotFound.tsx            # 404 page
├── components/                 # Reusable UI components
├── services/                   # Business logic & API calls
├── types/                      # TypeScript interfaces
├── utils/                      # csvLoader and helpers
└── hooks/                      # use-toast, use-mobile
```

### Key Components — Roles, Props, State
| Component | Role | Key Props/State |
|---|---|---|
| `Navbar` | Top nav bar with auth-aware links | reads user from auth context |
| `RecipeCard` | Shows summary card | `recipe: Recipe`, `onClick` |
| `RecipeModal` | Full recipe popup | `recipe`, `open`, `onClose` |
| `GeneratedRecipeModal` | Same but for AI recipe with nutrition | `recipe: GeneratedRecipe` |
| `MealPlanForm` | Collects metrics & prefs | local form state, `onSubmit(data)` |
| `MealPlanDisplay` | Renders DayPlan[] | `plan`, `onRegenerate`, `onExportPDF` |
| `ProtectedRoute` | Wraps routes; redirects to /login if no JWT | `children` |
| `ErrorBoundary` | Catches render errors | `children` |

### Hooks Used
- `useState` — form fields, modal open state, loading flags.
- `useEffect` — load CSV on Dashboard mount, attach token on login change.
- `useNavigate` — programmatic routing post-login.
- `useToast` — show success/error notifications.

### API Calls (frontend)
Two patterns:
1. **Direct fetch from service files** (e.g. `openAIService.ts`, `authService.ts`).
2. Components import service functions; never call `fetch` directly inside JSX.

Example:
```ts
const recipe = await openAIService.generateRecipe({
  ingredients: 'chicken, rice, lemon',
  cuisine: 'Mediterranean',
  diet: 'High-Protein',
  mealType: 'dinner',
  difficulty: 'Easy'
});
setGenerated(recipe);
```

### How UI Updates Dynamically
- React's reconciliation: `setState` → component re-renders → DOM diff applied.
- Loading states show spinners; success shows modal; failure triggers toast.

### Form Handling & Validation
- Controlled inputs (`value` + `onChange`).
- Validation done inline (required fields, numeric ranges for age/weight).
- Submission disabled while `isLoading === true` to prevent double calls.

---

## 5. Backend Deep Dive

### server.js (Entry Point)
```js
const express = require('express');
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.get('/api/health', ...);   // health check
app.listen(3001);
```

### Folder Roles
- `routes/` — defines URL → handler mapping.
- `controllers/` (collapsed inside routes) — actual business logic.
- `middleware/auth.js` — verifies JWT, attaches `req.user`.
- `config/database.js` — exports a MySQL connection pool.

### API Endpoints Reference
| Method | URL | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create user (hash pwd, insert into `users`) |
| POST | `/api/auth/login` | No | Verify creds, return JWT |
| GET  | `/api/auth/profile` | Yes | Return current user details |
| PUT  | `/api/auth/profile` | Yes | Update profile fields |
| POST | `/api/recipes/save` | Yes | Save a recipe to `saved_recipes` |
| GET  | `/api/recipes/saved` | Yes | List user's saved recipes |
| POST | `/api/recipes/generated` | Yes | Persist AI-generated recipe to DB |
| GET  | `/api/recipes/generated` | Yes | List AI-generated history |
| DELETE | `/api/recipes/saved/:id` | Yes | Remove a saved recipe |
| GET  | `/api/health` | No | Health check |

### Request → Response Cycle (example: save recipe)
```
Client                 Express                   Auth MW                MySQL
  │ POST /api/recipes/save │                         │                    │
  │ + JWT header           │                         │                    │
  │───────────────────────►│ ──── verifyToken ──────►│                    │
  │                        │ ◄──── req.user.id ──────│                    │
  │                        │ INSERT INTO saved_recipes ───────────────────►│
  │                        │ ◄────── insertId ─────────────────────────────│
  │ ◄──── 201 {id} ────────│                         │                    │
```

### Error Handling
- Try/catch in every async handler.
- `res.status(4xx/5xx).json({ message })` for client errors.
- Global error middleware in `server.js` for uncaught errors.

### Authentication
- Password stored as **bcrypt hash** (cost 10).
- JWT signed with `JWT_SECRET` from `.env`, 7-day expiry.
- `auth.js` middleware:
  ```js
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
  ```

---

## 6. API Integration (Critical)

### Frontend → Backend
```ts
const res = await fetch(`${API_URL}/api/recipes/save`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(recipe)
});
const data = await res.json();
```

### Frontend → AI Provider (OpenRouter)
```ts
await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'TasteBud AI'
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a professional chef and nutritionist...' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 4000,
    temperature: 0.8
  })
});
```

### Example AI Response (parsed)
```json
{
  "title": "Lemon-Herb Mediterranean Chicken Bowl",
  "description": "Bright, protein-packed bowl with fluffy rice...",
  "ingredients": ["2 chicken breasts", "1 cup rice", "1 lemon"],
  "steps": ["Marinate chicken...", "Cook rice..."],
  "nutritionalInfo": { "calories": "520 kcal", "protein": "42 g" },
  "prepTime": "15 minutes",
  "cookTime": "25 minutes",
  "totalTime": "40 minutes"
}
```

---

## 7. Core Logic & Functions

### Frontend
- `csvLoader.loadRecipesFromCSV()` — fetches & parses `recipes.csv` into typed `Recipe[]`. Handles quoted commas, escaped quotes, malformed rows.
- `openAIService.generateRecipe(params)` — orchestrates prompt + parse + validation + fallback.
- `openAIService.generateText(prompt)` — generic text gen used by Meal Planner.
- `mealPlanService.generateMealPlan(form)` — loops over days × meals, calls AI per slot.
- `exportService` / `mealPlanService.exportToPDF(plan)` — uses jsPDF to create downloadable PDF.

### Backend
- Auth controllers (`register`, `login`, `getProfile`).
- Recipe controllers (`save`, `list`, `delete`, `saveGenerated`).
- `auth` middleware shared across protected routes.

### Recommendation Logic (Dashboard)
Pure client-side filter chain on the loaded CSV array:
```ts
const filtered = recipes.filter(r =>
  (!cuisine || r.cuisine === cuisine) &&
  (!diet || r.diet === diet) &&
  (!q || r.title.toLowerCase().includes(q.toLowerCase()) ||
         r.ingredients.toLowerCase().includes(q.toLowerCase()))
);
```
- Fast (O(n) over a few hundred rows).
- No backend round-trip needed.

### Recipe Generation Logic
1. Build prompt with all user inputs (cuisine, diet, allergens, equipment, etc.).
2. Send to LLM with `temperature: 0.8` for creativity.
3. Extract substring between first `{` and last `}` (defensive JSON extraction).
4. `JSON.parse` → validate required fields → fill defaults if missing.

### Meal Plan Generation Logic
```ts
for (const day of days) {
  for (const slot of mealsPerDay) {
    const meal = await generateMeal(slot, calorieTarget/n, prefs);
    day.meals.push(meal);
  }
}
```
- Each meal slot gets a tailored prompt (calories, slot type, diet).
- Failures fall back to safe template meals (no broken UI).

---

## 8. Workflow / Execution Flow (Step-by-Step) — *Use this in viva!*

### Scenario: User generates a recipe
1. **User opens** `/generator` (route guarded by `ProtectedRoute`).
2. Fills form: ingredients = "paneer, spinach, garlic", cuisine = Indian, diet = Vegetarian, difficulty = Easy.
3. Clicks **Generate**.
4. `Generator.tsx` calls `openAIService.generateRecipe(params)`.
5. Service waits for rate-limit window (3s min interval) → builds the prompt.
6. POST → OpenRouter → `gpt-4o-mini` returns a JSON recipe.
7. Service parses, validates, attaches an Unsplash image and timestamp.
8. Component sets state → `<GeneratedRecipeModal>` opens with full details.
9. User clicks **Save** → POST `/api/recipes/generated` with JWT → row inserted in `generated_recipes`.
10. Toast shows "Recipe saved!".

### Scenario: User generates a Meal Plan
1. User opens `/meal-planner`.
2. Enters age, weight, height, activity level, goal (e.g., weight loss), allergies, meals/day=3, days=7.
3. `MealPlanForm` calls `mealPlanService.generateMealPlan(form)`.
4. Service computes daily calorie target (Mifflin–St Jeor) → splits per meal.
5. Loops through 7 days × 3 slots = 21 AI calls (rate-limited, sequential or batched).
6. Each AI response normalized to a `MealItem` object.
7. Final `DayPlan[]` returned → `MealPlanDisplay` renders expandable cards per day.
8. User can: **Regenerate** (re-run flow), **Edit & Regenerate**, **Download PDF** (`jsPDF`), or **Save**.

---

## 9. Dataset / Database Design

### CSV Dataset (`public/recipes.csv`)
Columns:
| Column | Type | Example |
|---|---|---|
| title | string | "Spaghetti Carbonara" |
| ingredients | string (semicolon list) | "spaghetti; eggs; pancetta" |
| steps | string (numbered) | "1. Boil pasta. 2. Whisk eggs..." |
| cuisine | string | "Italian" |
| diet | string | "Non-Vegetarian" |
| difficulty | string | "Medium" |
| image_url | string | "carbonara.jpg" |

Parsed by `csvLoader.ts` which:
- Splits on newlines.
- Custom CSV-line parser handling quotes & escaped commas.
- Skips malformed rows.
- Returns `Recipe[]`.

### MySQL Schema (`backend/setup_database.sql`)
- `users` — id, email (unique), password_hash, name, age, location, cooking_experience, allergies, etc.
- `dietary_preferences` — many-to-many with users.
- `saved_recipes` — saved CSV recipes per user.
- `generated_recipes` — full AI-generated recipes (JSON columns for ingredients/steps/nutrition).
- Indexed on `user_id`, `email`, `recipe_id` for fast lookup.
- Foreign keys with `ON DELETE CASCADE` for clean deletion.

---

## 10. AI / Model Explanation (Very Important)

### Model
- `openai/gpt-4o-mini` accessed via **OpenRouter** (a unified gateway to many LLMs).
- Cost-efficient, fast, strong instruction following.

### Why an LLM (not a trained ML model)?
- Recipes require **creative open-ended generation** + **structured output**.
- Training a custom seq2seq model would need huge curated data and compute.
- LLMs already encode broad culinary knowledge → near-zero engineering for high quality.

### Prompt Engineering — Two-Layer Strategy
1. **System message**: assigns persona — *"You are a professional chef and nutritionist. Always respond with valid JSON."*
2. **User message**: structured prompt with clearly labelled fields and an explicit JSON schema example.

#### Recipe Prompt Skeleton
```
Create a detailed and creative {cuisine} {mealType} recipe that is {diet} and {difficulty} difficulty.
Ingredients to use: {ingredients}
Allergens to avoid: {allergens}
Health goals: {healthGoals}
...
Return ONLY valid JSON with this exact structure: { ... }
```

### Input → Processing → Output
```
Form inputs → Prompt builder → LLM (OpenRouter) → Raw text
                                                → JSON extractor + validator
                                                → GeneratedRecipe object → React state
```

### Pre-processing
- Trim/normalize ingredient list.
- Inject defaults for empty optional fields.

### Post-processing
- Substring extraction between `{ ... }` (handles model preamble/footer).
- Coerce ingredients/steps to arrays if returned as strings.
- Inject default nutrition/timing if model omits them.
- Attach Unsplash placeholder image.
- Add `id` (timestamp) + `createdAt`.

### Reliability Mechanisms
- **Rate limiter**: 3s min between calls.
- **Fallback recipes**: hardcoded safe responses returned on 429/quota errors.
- **Defensive parsing**: never crashes on malformed JSON.

---

## 11. Libraries & Dependencies

### Frontend
| Library | Purpose |
|---|---|
| `react`, `react-dom` | Core UI library |
| `react-router-dom` | SPA routing |
| `vite` | Dev server + build |
| `typescript` | Static typing |
| `tailwindcss` | Utility CSS |
| `@radix-ui/*` + `shadcn/ui` | Accessible UI primitives |
| `lucide-react` | Icons |
| `sonner` / toast | Notifications |
| `jspdf` | Client-side PDF export of meal plans |
| `clsx`, `tailwind-merge` | Conditional class utilities |

### Backend
| Library | Purpose |
|---|---|
| `express` | HTTP server framework |
| `mysql2` | MySQL driver (promise-based) |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT issue/verify |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |

### External Services
- **OpenRouter** → LLM gateway (gpt-4o-mini).
- **Unsplash** (image URLs) → recipe imagery.

---

## 12. Key Features

1. **AI Recipe Generator** — bespoke recipes from ingredients + preferences.
2. **Recommendation System** — search/filter the curated CSV by cuisine/diet/keyword.
3. **AI Meal Planner Service** — multi-day plans tailored to body metrics & goals; PDF export.
4. **User Authentication** — register/login/JWT-protected routes.
5. **Save & Manage Recipes** — persistent saved recipes per user.
6. **Profile Management** — update preferences, allergies, cooking experience.
7. **Responsive UI** — works on mobile, tablet, desktop.
8. **Graceful Fallbacks** — never breaks even if AI is down.
9. **Share Modal** — share recipes via link.
10. **Error Boundary** — catches render-time errors safely.

---

## 13. Challenges & Solutions

| Challenge | Solution |
|---|---|
| LLM occasionally returns prose around JSON | Substring extraction between first `{` and last `}` |
| API rate limits / quota errors | 3-second client-side throttle + fallback recipes |
| CSV with commas inside quoted fields | Custom CSV parser handling quotes and escapes |
| Long Meal Plan generation (21 calls) | Sequential calls with throttling + per-meal fallback |
| Sensitive API keys in frontend | Use Vite env (`VITE_OPENROUTER_API_KEY`); for production move to backend proxy |
| JWT expiry causing silent failures | 401 response intercepted → toast → redirect to /login |
| PDF formatting for meal plan | Carefully iterating jsPDF coordinates per day/meal |
| State sync between form and results | Lifting state into the page component (`MealPlanner.tsx`) |

---

## 14. Future Enhancements

- **Voice input** — Web Speech API to dictate ingredients hands-free.
- **Image-based input** — upload fridge photo, run vision model to detect ingredients.
- **Personalization engine** — learn from saved recipes, recommend smarter.
- **Nutrition tracking** — daily intake dashboard with charts.
- **Mobile app** — React Native version sharing the same backend.
- **Grocery list auto-export** — combine meal plan into a shopping list.
- **Multi-language support** — i18n for global reach.
- **Move AI calls to backend** — secure key + caching + cost control.
- **Vector search** for similar recipes (pgvector or Pinecone).

---

## 15. Conclusion

SmartChef AI demonstrates the practical fusion of **modern web engineering** (React + Express + MySQL) with **generative AI** (LLM via OpenRouter) to solve a relatable everyday problem — *deciding what to cook*. Beyond a simple recipe app, it personalizes nutrition, plans full weeks of meals, and adapts to each user's lifestyle.

### Project Impact
- Showcases full-stack proficiency (frontend, backend, DB, AI).
- Demonstrates prompt engineering and resilient AI integration.
- Solves real problems: food waste, meal planning, dietary needs.

### Learning Outcomes
- Designing scalable React + TypeScript apps.
- Building secure REST APIs with JWT auth.
- Working with MySQL, schema design, indexing.
- Integrating LLMs with structured-output prompting.
- Handling failure modes (rate limits, parse errors) gracefully.
- Generating client-side PDFs.

---

## 16. Quick Viva Cheat Sheet

**Q: What does your project do?**
> SmartChef AI generates personalized recipes and full meal plans using an LLM, and recommends recipes from a curated dataset based on user preferences.

**Q: Tech stack in one line?**
> React + TypeScript + Vite + Tailwind on the frontend; Node.js + Express + MySQL on the backend; OpenAI gpt-4o-mini via OpenRouter for AI.

**Q: How does the AI generate a recipe?**
> A structured prompt with the user's inputs is sent to gpt-4o-mini. The model returns JSON, which we parse, validate, and render. Rate limiting and fallback recipes ensure reliability.

**Q: How is data stored?**
> Static recipes in `public/recipes.csv` for recommendations; user accounts, saved recipes, and AI-generated recipes in MySQL with JWT-protected APIs.

**Q: How is the meal plan generated?**
> The form's metrics drive a calorie target. We loop over days × meal slots, calling the AI per slot, then assemble a DayPlan array. Users can regenerate or export to PDF via jsPDF.

**Q: How is security handled?**
> Passwords are bcrypt-hashed; sessions are JWTs in `Authorization: Bearer` headers; protected routes use middleware to verify tokens.

**Q: Biggest challenges?**
> Robust JSON parsing from LLM, rate limits, and CSV edge cases — all handled with defensive code and fallbacks.

---
*End of Document — Good luck with your viva!*
