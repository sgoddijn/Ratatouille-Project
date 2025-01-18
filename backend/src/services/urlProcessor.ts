import axios from 'axios';
import { Recipe } from '../../../shared/Recipe.ts';
import { LangchainRecipe, LangchainImage, LangchainIngredients } from '../models/LangchainModels.ts';
import { ChatAnthropic } from "npm:@langchain/anthropic";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { RunnableMap, RunnableSequence } from "npm:@langchain/core/runnables";
import { z } from 'zod';
import { conversionTable } from '../helpers/conversionTable.ts';

// Create LangChain model
const model = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  maxTokens: 1024,
  temperature: 0,
  anthropicApiKey: Deno.env.get('ANTHROPIC_API_KEY')
}).withStructuredOutput(LangchainRecipe, {
  method: "function_calling"
});

const imageModel = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  maxTokens: 1024,
  temperature: 0,
  anthropicApiKey: Deno.env.get('ANTHROPIC_API_KEY')
}).withStructuredOutput(LangchainImage, {
  method: "function_calling"
});

const ingredientModel = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  maxTokens: 1024,
  temperature: 0,
  anthropicApiKey: Deno.env.get('ANTHROPIC_API_KEY')
}).withStructuredOutput(LangchainIngredients, {
  method: "function_calling"
});

// Prompt to get a recipe object from HTML
const recipePrompt = new PromptTemplate({
  template: `
    You are a culinary analyst, who's goal is to transfer recipes from HTML content into a structured format for amateur chefs

    Context: {cleanHtml}

    Task: We want to extract the recipe information from the HTML content and return it in a structured format.
          Note that macro information (calories, protein, carbs, fat) should be per serving even if the recipe is not for multiple servings.
          The rating will usually be a number between 1 and 5, and the number of reviews will be associated with that rating.
  `,
  inputVariables: ["cleanHtml", "imageUrls"]
});

// Prompt to get the best image from the HTML content
const imagePrompt = new PromptTemplate({
  template: `
    You are a culinary analyst, who's goal is to extract the best image from the HTML content for the recipe in question. 

    Context: {imageUrls}

    Task: We want to extract the best image from the HTML content and return the URL.
  `,
  inputVariables: ["imageUrls"]
});

// Prompt to get the ingredients normalized from the initial list
const ingredientPrompt = new PromptTemplate({
  template: `
    You are an cooking ingredient and measurement specialist, who's job is to normalize ingredients and measurements.
    For each ingredient map it to a base ingredient and a measurement, for example chicken breast, or flour. 
    Then for each measurement, create a list of converted measurements, like grams, ounces, pounds, etc.

    Context: {ingredientList}
    Conversion Table: {conversionTable}

    Example Input: ['2 skinless chicken breasts', '1 cup flour', '1/2 cup sugar']
    Example Output: [{{ "ingredientName": "chicken breast", quantity": "2", "conversions": ["2 whole", "400g"] }},
                     {{ "ingredientName": "flour", "quantity": "120g", "conversions": ["1 cup", "120g"] }},
                     {{ "ingredientName": "sugar", "quantity": "100g", "conversions": ["1/2 cup", "100g"] }}
                    ]

  `,
  inputVariables: ["ingredientList", "conversionTable"]
});

// Logic to check for URLs in the html we have received
const checkImageUrl = (url: string): boolean => {
  return Boolean(url && 
    !url.includes('logo') && 
    !url.includes('icon') &&
    url.includes('https') &&
    (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png')));
}

// Logic to extract image URLs from the HTML we have received
const extractImageUrls = (html: string): string[] => {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const urls: string[] = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    
    const pngRegex = /^(.*?\.png)/g;
    const jpgRegex = /^(.*?\.jpg)/g;
    const jpegRegex = /^(.*?\.jpeg)/g;

    const urlToClean = pngRegex.exec(url)?.[0] || jpgRegex.exec(url)?.[0] || jpegRegex.exec(url)?.[0] || url;
    if (checkImageUrl(urlToClean)) urls.push(urlToClean);
  }
  return urls;
};

// Logic to clean HTML we have recieved before passing it to Claude
const cleanPageHTML = (html: string): string => {
  return html
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  .replace(/<[^>]*>/g, '\n') // Convert remaining HTML tags to newlines
  .replace(/&nbsp;/g, ' ') // Convert non-breaking spaces
  .replace(/&amp;/g, '&') // Convert HTML entities
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ') // Normalize whitespace
  .trim();
}

// Process a URL and return a Recipe object
export async function processUrl(url: string): Promise<Recipe> {
  try {
    // First fetch the HTML content
    const response = await axios.get(url);
    const rawHtml = response.data;

    // Extract image URLs before cleaning HTML
    const imageUrls = extractImageUrls(rawHtml);

    // Remove scripts, styles, and other non-content elements
    const cleanHtml = cleanPageHTML(rawHtml)

    // Do the recipe and image in parallel
    const parallelChain = RunnableMap.from([
      {
        recipe: recipePrompt.pipe(model),
        image: imagePrompt.pipe(imageModel)
      }
    ]);

    // Do the ingredients once we have the results from the recipe model
    const sequentialChain = RunnableSequence.from([
      parallelChain,
      (result: [{recipe: z.infer<typeof LangchainRecipe>, image: z.infer<typeof LangchainImage>}]) => {
        console.log(result);
        return {recipe: result[0].recipe, image: result[0].image,};
      }, 
      async (result: {recipe: z.infer<typeof LangchainRecipe>, image: z.infer<typeof LangchainImage>}) => {
        const ingredientList = result.recipe.ingredients;
        const ingredients = await ingredientPrompt.pipe(ingredientModel).invoke({ingredientList, conversionTable});
        return {recipe: result.recipe, image: result.image, ingredients};
      }
    ]);

    // Run the chain
    const result = await sequentialChain.invoke({cleanHtml, imageUrls});

    const recipe = result.recipe;
    const imageUrl = result.image.imageUrl;
    const ingredients = result.ingredients.ingredients;

    // Return the result
    return {
      ...recipe,
      ingredients,
      imageUrl,
      recipeUrl: url,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error processing URL:', error);
    throw new Error('Failed to process recipe URL');
    // TODO: Show user that there was an error
  }
} 