import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { Recipe, createEmptyRecipe } from '../../../shared/Recipe.ts';
import process from 'node:process';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const model = "claude-3-5-sonnet-20241022";
const max_tokens = 1024;
const temperature = 0;
const systemPrompt = "You are a culinary analyst, who's goal is to transfer recipes from HTML content into a structured format for amateur chefs";


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
    if (checkImageUrl(url)) urls.push(url);
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
    const bestImageUrl = imageUrls.length > 0 ? imageUrls[0] : undefined;

    // Remove scripts, styles, and other non-content elements
    const cleanHtml = cleanPageHTML(rawHtml)

    // Then ask Claude to parse the HTML
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
              "text": `Parse this HTML content and extract the recipe information into a JSON object. Return only the JSON object and nothing else.
              Note that macro information (calories, protein, carbs, fat) should be per serving.
              The rating will usually be a number between 1 and 5, and the number of reviews will be associated with that rating. 
              Also note that sometimes the recipe is for multiple servings, but macro information is already done per serving, so be aware of that. 
              HTML content:
              
              ${cleanHtml}
              
              Required JSON format:
              {
                id: string,
                title: string,
                description: string,
                ingredients: string[],
                instructions: string[],
                cookTime?: string,
                rating?: number,
                numReviews?: number,
                macros: {
                  calories: number,
                  protein: number,
                  carbs: number,
                  fat: number
                }
              }`
            }
          ]
        }
      ]
    });

    // Rest of the code stays the same
    const parsedRecipe = msg.content[0].type === 'text' ? JSON.parse(msg.content[0].text) : createEmptyRecipe();
    
    return {
      id: parsedRecipe.id || String(Date.now()),
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
      imageUrl: bestImageUrl || 'https://placehold.co/600x400',
      recipeUrl: url,
      rating: parsedRecipe.rating,
      numReviews: parsedRecipe.numReviews,
      createdAt: new Date()
    };

  } catch (error) {
    console.error('Error processing URL:', error);
    throw new Error('Failed to process recipe URL');
    // TODO: Show user that there was an error
  }
} 