# Recipe Creation Flow

This document explains how recipes are added and processed in the Ratatouille Project.

## Overview

The recipe creation flow allows users to add new recipes to the system by either providing a URL to an existing recipe or uploading a recipe file. The system then uses AI to extract and process the recipe data.

## Frontend Components

### RecipeManagement.tsx

The main component that:
- Displays the list of saved recipes in a grid layout
- Provides options to add new recipes
- Handles recipe selection for viewing details

### AddRecipeDialog.tsx

A dialog component that:
- Provides input for recipe URLs
- Offers file upload functionality for recipe files
- Shows loading state during recipe processing

## Backend Services

### urlProcessor.ts

This service handles the extraction of recipe data from URLs:
- Fetches the HTML content from the provided URL
- Uses Claude to extract recipe details (title, description, ingredients, instructions)
- Processes ingredients through another AI model to standardize format
- Generates an image for the recipe using OpenAI/Recraft
- Returns structured recipe data

### Recipe Model (models/Recipe.ts)

The MongoDB schema for storing recipes with fields for:
- Title and description
- Ingredients list
- Preparation instructions
- Cooking time and servings
- Image URL
- Source URL

## Data Flow

1. **User Initiates Recipe Addition**:
   - User opens the AddRecipeDialog by clicking "Add Recipe" button
   - User enters a recipe URL or uploads a file

2. **Frontend Sends Request**:
   - Frontend sends URL to `/api/recipes/url` endpoint
   - For file uploads, file is sent to `/api/recipes/upload` endpoint

3. **Backend Processing**:
   - Backend receives URL or file
   - If URL: `urlProcessor.processUrl()` is called
   - HTML content is fetched
   - Claude analyzes the content to extract recipe data:
     - Title and description
     - List of ingredients with quantities and units
     - Step-by-step cooking instructions
     - Cooking time and servings information

4. **AI Enhancement**:
   - Ingredients are standardized and structured
   - Recipe image is generated using AI
   - Any missing information is inferred when possible

5. **Data Storage**:
   - Processed recipe is saved to MongoDB using the Recipe model
   - Recipe ID is generated

6. **Response to Frontend**:
   - Backend returns the processed and saved recipe
   - Frontend updates the recipe list to include the new recipe
   - Dialog is closed and success notification is shown

## API Endpoints

- `POST /api/recipes/url` - Process a recipe from a URL
  - Request body: `{ url: string }`
  - Response: Recipe object

- `POST /api/recipes/upload` - Process a recipe from an uploaded file
  - Request: Multipart form with file
  - Response: Recipe object

- `GET /api/recipes` - Get all saved recipes
  - Response: Array of Recipe objects

- `GET /api/recipes/:id` - Get a specific recipe by ID
  - Response: Recipe object

## Shared Models

The Recipe interface in `shared/Recipe.ts` is used by both frontend and backend:

```typescript
interface Recipe {
  id?: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  sourceUrl?: string;
}
```

## Example Flow

1. User navigates to the recipe management page
2. User clicks "Add Recipe" and enters a URL like "https://www.foodnetwork.com/recipes/carbonara"
3. Frontend sends URL to backend
4. Backend fetches the webpage content
5. Claude extracts the recipe details
6. Recipe is saved to database
7. Frontend displays the new recipe in the grid
8. User can now view the recipe details or add it to meal plans