import axios from 'npm:axios';
import { Recipe } from '../../../shared/Recipe.ts';
import { ChatAnthropic } from "npm:@langchain/anthropic";
import { OpenAI } from 'npm:openai';
import { conversionTable } from '../helpers/conversionTable.ts';

// Initialize API clients
const anthropicClient = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  maxTokens: 1024,
  temperature: 0,
  anthropicApiKey: Deno.env.get('ANTHROPIC_API_KEY')
});

// Create a separate image generator client
const imageGenerator = new OpenAI({
  apiKey: Deno.env.get('RECRAFT_API_KEY'),
  baseURL: 'https://api.recraft.ai/v2', // Updated to v2 endpoint
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

// Step 1: Fetch HTML from URL
async function fetchUrlContent(url: string): Promise<string> {
  console.log(`Attempting to fetch URL: ${url}`);
  
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
  return response.data;
}

// Step 2: Extract recipe data using Claude
async function extractRecipeFromHtml(cleanHtml: string): Promise<any> {
  console.log("Extracting recipe data from HTML with Claude");
  
  try {
    const recipePrompt = `
      You are a culinary analyst, who's goal is to transfer recipes from HTML content into a structured format for amateur chefs

      Context: ${cleanHtml}

      Task: We want to extract the recipe information from the HTML content and return it in JSON format.
      Note that macro information (calories, protein, carbs, fat) should be per serving even if the recipe is not for multiple servings.
      The rating will usually be a number between 1 and 5, and the number of reviews will be associated with that rating.

      Format the response as a valid JSON object with the following schema:
      {
        "title": "Recipe title",
        "description": "Brief description of the recipe",
        "prepTime": "Preparation time in minutes (number)",
        "cookTime": "Cooking time in minutes (number)",
        "totalTime": "Total time in minutes (number)",
        "servings": "Number of servings (number)",
        "ingredients": ["list", "of", "ingredient", "strings"],
        "instructions": ["list", "of", "instruction", "steps"],
        "calories": "Calories per serving (number)",
        "protein": "Protein in grams per serving (number)",
        "carbs": "Carbohydrates in grams per serving (number)",
        "fat": "Fat in grams per serving (number)",
        "cuisine": "Type of cuisine (e.g., Italian, Mexican)",
        "mealType": "Type of meal (e.g., breakfast, dinner)",
        "difficulty": "Recipe difficulty (easy, medium, hard)",
        "rating": "Recipe rating (1-5)",
        "reviewCount": "Number of reviews (number)"
      }
    `;

    const response = await anthropicClient.invoke(recipePrompt);
    
    // Extract JSON from response
    const recipeJsonMatch = response.content.toString().match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    let recipeData;
    
    if (recipeJsonMatch) {
      const jsonStr = recipeJsonMatch[1] || recipeJsonMatch[0];
      recipeData = JSON.parse(jsonStr.trim());
    } else {
      throw new Error("Failed to extract valid JSON from Claude response");
    }
    
    console.log("Successfully extracted recipe data");
    return recipeData;
  } catch (error) {
    console.error("Error extracting recipe data:", error);
    throw new Error(`Failed to extract recipe data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Step 3: Normalize ingredients using Claude
async function normalizeIngredients(ingredients: string[]): Promise<any> {
  console.log("Normalizing ingredients with Claude");
  
  try {
    const ingredientPrompt = `
      You are a cooking ingredient and measurement specialist, who's job is to normalize ingredients and measurements.
      For each ingredient map it to a base ingredient and a measurement, for example chicken breast, or flour. 
      Then for each measurement, create a list of converted measurements, like grams, ounces, pounds, etc.

      Context: ${JSON.stringify(ingredients)}
      Conversion Table: ${conversionTable}

      Example Input: ['2 skinless chicken breasts', '1 cup flour', '1/2 cup sugar']
      Example Output: [{ "ingredientName": "chicken breast", quantity": "2", "conversions": ["2 whole", "400g"] },
                      { "ingredientName": "flour", "quantity": "120g", "conversions": ["1 cup", "120g"] },
                      { "ingredientName": "sugar", "quantity": "100g", "conversions": ["1/2 cup", "100g"] }
                      ]

      Format the response as a valid JSON object with the following schema:
      {
        "ingredients": [
          {
            "ingredientName": "string",
            "quantity": "string",
            "conversions": ["string"]
          }
        ]
      }
    `;

    const response = await anthropicClient.invoke(ingredientPrompt);
    
    // Extract JSON from response
    const ingredientsJsonMatch = response.content.toString().match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    let ingredientsData;
    
    if (ingredientsJsonMatch) {
      const jsonStr = ingredientsJsonMatch[1] || ingredientsJsonMatch[0];
      ingredientsData = JSON.parse(jsonStr.trim());
    } else {
      throw new Error("Failed to extract valid JSON from Claude response");
    }
    
    console.log("Successfully normalized ingredients");
    return ingredientsData;
  } catch (error) {
    console.error("Error normalizing ingredients:", error);
    return { ingredients: [] }; // Return empty ingredients on error
  }
}

// Step 4: Generate image using Recraft API directly with fetch
async function generateRecipeImage(title: string): Promise<string> {
  console.log(`Generating image for recipe: ${title}`);
  
  try {
    // Log API key status (safely)
    const apiKey = Deno.env.get('RECRAFT_API_KEY');
    if (!apiKey) {
      console.error("No RECRAFT_API_KEY found in environment variables");
      return "";
    }
    
    console.log("Making direct fetch request to Recraft API");
    
    // Direct fetch approach
    const response = await fetch("https://api.recraft.ai/v2/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: `A professional food photograph of ${title}, closeup, high quality`,
        width: 1024,
        height: 1024,
        num_images: 1
      })
    });
    
    if (!response.ok) {
      console.error(`Recraft API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return "";
    }
    
    const imageData = await response.json();
    console.log("Successfully generated image with direct fetch");
    
    // Check format of response and extract URL
    if (imageData && imageData.images && imageData.images.length > 0) {
      return imageData.images[0].url;
    } else {
      console.error("Unexpected response format from Recraft API");
      console.error("Response:", JSON.stringify(imageData));
      return "";
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return ""; // Return empty string instead of throwing
  }
}

// Process a URL and return a Recipe object
export async function processUrl(url: string): Promise<Recipe> {
  try {
    // Step 1: Fetch HTML from URL
    console.log(`Starting processing of URL: ${url}`);
    const rawHtml = await fetchUrlContent(url);
    
    // Extract image URLs before cleaning HTML
    const imageUrls = extractImageUrls(rawHtml);
    console.log(`Found ${imageUrls.length} potential image URLs`);
    
    // Remove scripts, styles, and other non-content elements
    const cleanHtml = cleanPageHTML(rawHtml);
    console.log("Cleaned HTML content");
    
    // Step 2: Extract recipe data using Claude
    const recipeData = await extractRecipeFromHtml(cleanHtml);
    console.log("Extracted recipe data:", recipeData.title);
    
    // Step 3: Normalize ingredients using Claude
    const ingredientsData = await normalizeIngredients(recipeData.ingredients);
    console.log(`Normalized ${ingredientsData.ingredients?.length || 0} ingredients`);
    
    // Step 4: Try to generate image using Recraft
    // Skip image generation for debugging if needed
    let imageUrl = "";
    try {
      imageUrl = await generateRecipeImage(recipeData.title);
      console.log(`Image URL: ${imageUrl ? "Generated successfully" : "Generation failed"}`);
    } catch (imageError) {
      console.error("Image generation failed, continuing without image:", imageError);
    }
    
    // Use first image from page if image generation failed
    if (!imageUrl && imageUrls.length > 0) {
      imageUrl = imageUrls[0];
      console.log(`Using image from page: ${imageUrl}`);
    }
    
    // Return the formatted recipe with required fields for Mongoose model
    const recipe: Recipe = {
      id: recipeData.title || "123123123", // Generate unique ID
      title: recipeData.title || "",
      description: recipeData.description || "",
      cookTime: recipeData.cookTime?.toString() || "0",
      ingredients: ingredientsData.ingredients || [{
        ingredientName: "",
        quantity: "",
        conversions: []
      }],
      instructions: recipeData.instructions || [],
      macros: {
        calories: recipeData.calories || 0,
        protein: recipeData.protein || 0,
        carbs: recipeData.carbs || 0,
        fat: recipeData.fat || 0
      },
      rating: recipeData.rating || 0,
      numReviews: recipeData.reviewCount || 0,
      imageUrl: imageUrl,
      recipeUrl: url,
      createdAt: new Date()
    };
    
    console.log("Recipe processing completed successfully");
    return recipe;
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