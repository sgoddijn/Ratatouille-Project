import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Request, Response, RequestHandler } from 'express';
import { connectDB } from './config/database.ts';
import { Recipe } from './models/Recipe.ts';
import { processUrl } from './services/urlProcessor.ts';
import process from 'node:process';
import { generateMealPlan } from './services/planBuilder.ts';
import { Recipe as RecipeType } from "../../shared/Recipe.ts";
import { MealPlan } from './models/MealPlan.ts';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Get all recipes
app.get('/api/recipes', (async (_req: Request, res: Response) => {
  try {
    console.log('Fetching recipes from MongoDB...');
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    console.log('Found recipes:', recipes);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}) as RequestHandler);

// Process recipe from URL
app.post('/api/recipes/url', (async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }
    const recipeData = await processUrl(url);
    const recipe = new Recipe(recipeData);
    await recipe.save();
    res.json(recipe);
  } catch (error) {
    console.error('Error processing URL:', error);
    res.status(500).json({ error: 'Failed to process recipe URL' });
  }
}) as RequestHandler);

// Delete a recipe
app.delete('/api/recipes/:id', (async (req: Request, res: Response) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
}) as RequestHandler);

// Process recipe from PDF
app.post('/api/recipes/pdf', upload.single('file'), (async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }

    const recipeData = await processPdf(req.file.path);
    const recipe = new Recipe(recipeData);
    await recipe.save();
    res.json(recipe);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process recipe PDF' });
  }
}) as RequestHandler);

// Create a meal plan from the existing recipes
// TODO: Figure out how to grab a representative subset of recipes from BE 
app.post('/api/mealplan/generate', (async (_req: Request, res: Response) => {
  try {
    // Fetch all recipes from DB
    const recipes = await Recipe.find().lean().exec();

    // Generate initial plan with recipe IDs
    const mealPlanWithIds = await generateMealPlan(recipes);

    // Create a map of recipe IDs to full recipe objects
    const recipeMap = new Map(recipes.map((recipe: RecipeType) => [recipe.id, recipe]));

    // Replace IDs with full recipe objects
    const fullMealPlan = Object.entries(mealPlanWithIds).reduce((acc, [day, meals]) => {
      acc[day] = {
        breakfast: recipeMap.get(meals.breakfast),
        lunch: recipeMap.get(meals.lunch),
        dinner: recipeMap.get(meals.dinner)
      };
      return acc;
    }, {} as Record<string, { breakfast: RecipeType, lunch: RecipeType, dinner: RecipeType }>);

    res.json(fullMealPlan);

  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ error: 'Failed to generate meal plan' });
  }
}) as RequestHandler);

// Save a meal plan to the database
app.post('/api/mealplan/save', (async (req: Request, res: Response) => {
  try {
    const { weekPlan } = req.body;
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 8);

    const mealPlan = new MealPlan({
      weekPlan,
      startDate: startOfWeek,
      endDate: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
    });

    await mealPlan.save();
    res.json(mealPlan);
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(500).json({ error: 'Failed to save meal plan' });
  }
}) as RequestHandler);

// Get the current meal plan from the database
app.get('/api/mealplan/current', (async (_req: Request, res: Response) => {
  try {
    // Figure out the Monday of the next week
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 8);

    const mealPlan = await MealPlan.findOne({
      startDate: { $lte: startOfWeek },
      endDate: { $gte: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    res.json(mealPlan?.startDate.getTime() === startOfWeek.getTime() ? mealPlan?.weekPlan : {});
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ error: 'Failed to fetch meal plan' });
  }
}) as RequestHandler);
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 