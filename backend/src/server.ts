import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Request, Response, RequestHandler } from 'express';
import { connectDB } from './config/database.ts';
import { Recipe } from './models/Recipe.ts';
import { processUrl } from './services/urlProcessor.ts';

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

// Test endpoint to add a recipe
app.post('/api/recipes/test', (async (_req: Request, res: Response) => {
  try {
    const testRecipe = new Recipe({
      title: "Test Spaghetti Carbonara",
      description: "A classic Italian pasta dish",
      ingredients: ["400g spaghetti", "200g pancetta", "4 eggs", "100g parmesan"],
      instructions: ["Boil pasta", "Fry pancetta", "Mix eggs and cheese", "Combine all"],
      cookTime: "20 mins",
      imageUrl: "https://placehold.co/400x200",
      macros: {
        calories: 800,
        protein: 30,
        carbs: 90,
        fat: 35
      }
    });

    await testRecipe.save();
    console.log('Test recipe saved:', testRecipe);
    res.json(testRecipe);
  } catch (error) {
    console.error('Error adding test recipe:', error);
    res.status(500).json({ error: 'Failed to add test recipe' });
  }
}) as RequestHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 