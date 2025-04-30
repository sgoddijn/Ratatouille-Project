import axios from 'npm:axios';
import { Recipe } from '../../../shared/Recipe.ts';
import { LangchainRecipe, LangchainImage, LangchainIngredients } from '../models/LangchainModels.ts';
import { ChatAnthropic } from "npm:@langchain/anthropic";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { RunnableMap, RunnableSequence } from "npm:@langchain/core/runnables";
import { z } from 'npm:zod';
import { conversionTable } from '../helpers/conversionTable.ts';
import { OpenAI } from 'npm:openai';
import * as cheerio from 'npm:cheerio';
import fetch from "npm:node-fetch";

// Create LangChain model
const model = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  maxTokens: 1024,
  temperature: 0,
  anthropicApiKey: Deno.env.get('ANTHROPIC_API_KEY')
}).withStructuredOutput(LangchainRecipe, {
  method: "function_calling"
});

const imageGenerator = new OpenAI({
  baseURL: 'https://external.api.recraft.ai/v1',
  apiKey: Deno.env.get('RECRAFT_API_KEY'),
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
    console.log(`Attempting to fetch recipe from URL: ${url}`);
    
    // Check if URL is from a known problematic domain
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // List of known domains that often block scraping
    const problematicDomains = [
      'allrecipes.com',
      'foodnetwork.com',
      'epicurious.com',
      'thekitchn.com',
      'delish.com',
      'bonappetit.com',
      'seriouseats.com',
      'simplyrecipes.com'
    ];
    
    let response;
    const isProblematicDomain = problematicDomains.some(domain => hostname.includes(domain));
    
    // Use a different approach for problematic domains
    if (isProblematicDomain) {
      console.log(`Using specialized approach for potentially problematic domain: ${hostname}`);
      
      try {
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/search?q=recipe',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
        
        response = await axios.get(url, {
          headers,
          timeout: 30000,
          validateStatus: status => status >= 200 && status < 500
        });
      } catch (error) {
        console.log(`First attempt failed for ${hostname}, trying alternative approach...`);
        
        const fallbackHeaders = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        };
        
        response = await axios.get(url, {
          headers: fallbackHeaders,
          timeout: 30000,
          validateStatus: status => status >= 200 && status < 500
        });
      }
    } else {
      // Standard approach for normal domains
      const standardHeaders = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Referer': 'https://www.google.com/',
        'Upgrade-Insecure-Requests': '1'
      };
      
      response = await axios.get(url, {
        headers: standardHeaders,
        maxRedirects: 5,
        timeout: 10000
      });
    }
    
    // Check if we got a successful response
    if (response.status !== 200) {
      console.error(`Received status ${response.status} from ${url}`);
      if (response.status === 403) {
        throw new Error(`Access forbidden (403). The website at ${hostname} is blocking recipe scraping.`);
      } else {
        throw new Error(`Received non-success status code: ${response.status} from ${url}`);
      }
    }
    
    console.log(`Successfully fetched URL with status: ${response.status}`);
    const rawHtml = response.data;

    // Extract image URLs before cleaning HTML
    const imageUrls = extractImageUrls(rawHtml);

    // Remove scripts, styles, and other non-content elements
    const cleanHtml = cleanPageHTML(rawHtml);

    // Process the recipe data
    const parallelChain = RunnableMap.from([{
      recipe: recipePrompt.pipe(model)
    }]);

    const sequentialChain = RunnableSequence.from([
      parallelChain,
      (result: [{recipe: z.infer<typeof LangchainRecipe>, image: z.infer<typeof LangchainImage>}]) => {
        return {recipe: result[0].recipe, image: result[0].image};
      }, 
      async (result: {recipe: z.infer<typeof LangchainRecipe>, image: z.infer<typeof LangchainImage>}) => {
        // Run ingredient processing and image generation in parallel
        const [ingredients, image] = await Promise.all([
          ingredientPrompt.pipe(ingredientModel).invoke({
            ingredientList: result.recipe.ingredients, 
            conversionTable
          }),
          imageGenerator.images.generate({
            prompt: `An image of ${result.recipe.title}`,
            style: "natural",
          })
        ]);
        
        return {recipe: result.recipe, image: image.data[0], ingredients};
      }
    ]);

    // Run the chain and extract results
    const result = await sequentialChain.invoke({cleanHtml, imageUrls});
    
    // Return the formatted recipe
    return {
      ...result.recipe,
      ingredients: [{ 
        ingredientName: result.ingredients.ingredients && result.ingredients.ingredients.length > 0 
          ? result.ingredients.ingredients[0].ingredientName 
          : '',
        quantity: result.ingredients.ingredients && result.ingredients.ingredients.length > 0 
          ? result.ingredients.ingredients[0].quantity 
          : '',
        conversions: result.ingredients.ingredients && result.ingredients.ingredients.length > 0 
          ? result.ingredients.ingredients[0].conversions 
          : []
      }],
      imageUrl: result.image.url,
      recipeUrl: url,
      createdAt: new Date()
    };
  } catch (error: unknown) {
    console.error('Error processing URL:', error);
    
    // More detailed error logging
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as any;
      console.error(`Axios error details: 
        - Message: ${axiosError.message}
        - Code: ${axiosError.code}
        - Status: ${axiosError.response?.status}
        - Status Text: ${axiosError.response?.statusText}
        - URL: ${url}
      `);
      
      if (axiosError.response?.status === 403) {
        throw new Error(`Access forbidden (403). The website at ${url} is blocking recipe scraping.`);
      } else if (axiosError.response) {
        throw new Error(`Server responded with status ${axiosError.response.status} when accessing ${url}`);
      } else if (axiosError.request) {
        throw new Error(`No response received from ${url}. Please check the URL or try again later.`);
      }
    }
    
    // Generic fallback error if not an Axios error
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract recipe from ${url}: ${errorMessage}`);
  }
} 