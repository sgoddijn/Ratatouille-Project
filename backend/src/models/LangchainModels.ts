import { z } from "npm:zod";

export const LangchainRecipe = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  cookTime: z.string().optional(),
  rating: z.number().default(0),
  numReviews: z.number().default(0),
  recipeUrl: z.string(),
  createdAt: z.date(),
  macros: z.object({
    calories: z.number().default(0),
    protein: z.number().default(0),
    carbs: z.number().default(0),
    fat: z.number().default(0)
  })
});