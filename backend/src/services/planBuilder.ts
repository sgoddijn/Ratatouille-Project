import Anthropic from '@anthropic-ai/sdk';
import process from 'node:process';
import { Recipe, createEmptyRecipe } from '../../../shared/Recipe.ts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function generateMealPlan(recipes: Recipe[]): Promise<Recipe[]> {
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            temperature: 0.7,
            system: "You are a nutritionist and meal planning expert. Your goal is to create balanced weekly meal plans that are easy to prepare and delicious.",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Create a meal plan for one week (breakfast, lunch, dinner) using these recipes. 
                    Consider what types of recipes make sense for each meal, for example a meal that makes sense for breakfast is not a salad.
                    Try to avoid repeating recipes too often. 
                    Consider nutritional balance and variety. Return only a JSON object with the structure:
                    {
                      "monday": { "breakfast": recipeId, "lunch": recipeId, "dinner": recipeId },
                    }
                    
                    Available recipes:
                    ${JSON.stringify(recipes.map(r => ({
                      id: r.id,
                      title: r.title,
                      macros: r.macros
                    })))}`
                  }
                ]
              }
            ]
          });
      
        const parsedMealPlan = msg.content[0].type === 'text' ? JSON.parse(msg.content[0].text) : {};
        return parsedMealPlan;
    } catch (error) {
        console.error('Error generating meal plan:', error);
        throw new Error('Failed to generate meal plan');
    }
  
}