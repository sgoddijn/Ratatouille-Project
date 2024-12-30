import Anthropic from '@anthropic-ai/sdk';
import { Recipe, createEmptyRecipe } from '../../../shared/Recipe';
import { create } from 'domain';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const model = "claude-3-5-sonnet-20241022";
const max_tokens = 1024;
const temperature = 0;
const systemPrompt = "You are a culinary analyst, who's goal is to transfer recipes from the internet into a database that can be used by amateur chefs";

export async function processUrl(url: string): Promise<Recipe> {
  try {
    const msg = await anthropic.messages.create({
      model: model,
      max_tokens: max_tokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Take information from the following URL ${url} and convert its content into the following JSON object. Return only that json object and nothing else. 
              Note that the macro information about calories, protein, carbs and fat can often be found explicitly either in a dedicated section or in the text of the recipe.
              Recipes may come in different languages and formats so be aware of that.
              We want the calories to be representative of a single serving, so if the macros represent multiple servings please divide them appropraitely.
                    
                    id: string;
                    title: string;
                    description: string;
                    ingredients: string[];
                    instructions: string[];
                    cookTime?: string;
                    imageUrl?: string;
                    macros: {
                        calories: number;
                        protein: number;
                        carbs: number;
                        fat: number;
                    };`
            }
          ]
        }
      ]
    });

    const parsedRecipe = msg.content[0].type === 'text' ? JSON.parse(msg.content[0].text) : createEmptyRecipe();
    console.log('Claude response:', parsedRecipe);
    
    try {      
      // Create a valid Recipe object
      const recipe: Recipe = {
        id: parsedRecipe.id || String(Date.now()), // Generate ID if none provided
        title: parsedRecipe.title || 'Untitled Recipe',
        description: parsedRecipe.description || '',
        ingredients: Array.isArray(parsedRecipe.ingredients) ? parsedRecipe.ingredients : [],
        instructions: Array.isArray(parsedRecipe.instructions) ? parsedRecipe.instructions : [],
        macros: parsedRecipe.macros || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        cookTime: parsedRecipe.cookTime,
        imageUrl: parsedRecipe.imageUrl,
        createdAt: new Date()
      };

      return recipe;
      
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return createEmptyRecipe();
    }
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw new Error('Failed to process recipe URL');
  }
} 