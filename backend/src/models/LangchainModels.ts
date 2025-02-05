import { z } from "npm:zod";

export const LangchainRecipe = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  cookTime: z.string(),
  rating: z.number(),
  numReviews: z.number(),
  recipeUrl: z.string(),
  macros: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number()
  })
});

export const LangchainImage = z.object({
  imageUrl: z.string()
});

export const LangchainIngredients = z.object({
  ingredients: z.array(z.object({
    ingredientName: z.string(),
    quantity: z.string(),
    conversions: z.array(z.string())
  }))
});

