import Anthropic from '@anthropic-ai/sdk';
import { Recipe, createEmptyRecipe } from '../../../shared/Recipe';
import { create } from 'domain';

const anthropic = new Anthropic({
  apiKey: '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',
});

const model = "claude-3-5-sonnet-20241022";
const max_tokens = 1024;
const temperature = 0;
const systemPrompt = "You are a chef that is providing recipes for new cooks to follow";

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