import axios from 'axios';
import { Recipe, createEmptyRecipe } from '../../../shared/Recipe.ts';
import { LangchainRecipe } from '../models/LangchainModels.ts';
import { ChatAnthropic } from "npm:@langchain/anthropic";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { StructuredOutputParser } from "npm:@langchain/core/output_parsers";


// Create LangChain model
const model = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  maxTokens: 1024,
  temperature: 0,
  anthropicApiKey: Deno.env.get('ANTHROPIC_API_KEY')
});

const parser = StructuredOutputParser.fromZodSchema(LangchainRecipe);

// Define prompt
const anthropicPrompt = new PromptTemplate({
  template: `
    You are a culinary analyst, who's goal is to transfer recipes from HTML content into a structured format for amateur chefs

    Context: {cleanHtml}

    Task: We want to extract the recipe information from the HTML content and return it in a structured format.
          Note that macro information (calories, protein, carbs, fat) should be per serving even if the recipe is not for multiple servings.
          The rating will usually be a number between 1 and 5, and the number of reviews will be associated with that rating.
          Return in the following format: {format_instructions}`,
  inputVariables: ["cleanHtml", "format_instructions"]
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

    // TODO: Allow user to select the best image
    const bestImageUrl = imageUrls.length > 0 ? imageUrls[0] : 'https://placehold.co/600x400';

    // Remove scripts, styles, and other non-content elements
    const cleanHtml = cleanPageHTML(rawHtml)

    // 
    const formattedPrompt = await anthropicPrompt.format({ 
      cleanHtml, 
      format_instructions: parser.getFormatInstructions() 
    });
    

    const modelResponse = await model.invoke(formattedPrompt);
    const result: Recipe = await parser.parse(modelResponse.content);
    console.log(result);
    return {
      ...result,
      imageUrl: bestImageUrl,
      recipeUrl: url,
      createdAt: new Date()
    };

  } catch (error) {
    console.error('Error processing URL:', error);
    throw new Error('Failed to process recipe URL');
    // TODO: Show user that there was an error
  }
} 