# Shopping List Flow

This document explains how shopping lists are generated from meal plans in the Ratatouille Project.

## Overview

The shopping list flow extracts ingredients from the current meal plan, consolidates similar items, standardizes measurements, and presents a clean, organized shopping list to the user.

## Frontend Components

### ShoppingList.tsx

The main component that:
- Displays the consolidated shopping list from the current meal plan
- Groups ingredients by category (produce, dairy, meat, etc.)
- Shows ingredient quantities with standardized units
- Allows checking off items while shopping
- Provides options to export or share the list

## Backend Services

### ingredientCleaner.ts

This service handles the processing and consolidation of ingredients:
- Extracts all ingredients from recipes in the meal plan
- Uses Claude to identify and merge similar ingredients
- Standardizes units and measurements
- Groups ingredients by category
- Handles ingredient conversions using conversion tables

### conversionTable.ts (helpers)

Helper utilities that provide:
- Conversion factors between different units (e.g., cups to ml)
- Standard units for different ingredient types
- Functions to normalize quantities

## Data Flow

1. **User Accesses Shopping List**:
   - User navigates to the Shopping List page
   - Frontend loads the current meal plan

2. **Ingredient Extraction**:
   - Frontend extracts all ingredients from all recipes in the meal plan
   - Creates a raw ingredient list with potential duplicates and inconsistent units

3. **Backend Processing**:
   - Frontend sends raw ingredient list to `/api/ingredients/clean` endpoint
   - Backend receives the ingredients
   - `ingredientCleaner.cleanIngredients()` is called
   - Claude analyzes the ingredients to:
     - Identify and consolidate similar items (e.g., "diced tomatoes" and "tomatoes")
     - Standardize measurements (e.g., converting tablespoons to cups)
     - Group ingredients by category
     - Handle special cases and conversions

4. **Measurement Standardization**:
   - Quantities are normalized using the conversion table
   - Consistent units are applied based on ingredient type
   - Fractions are converted to decimals for easier calculations

5. **Response to Frontend**:
   - Backend returns the cleaned and consolidated ingredient list
   - Frontend updates the UI to display the organized shopping list
   - Items are displayed with standardized quantities and units

## API Endpoints

- `POST /api/ingredients/clean` - Process and consolidate ingredients
  - Request body: `{ ingredients: Ingredient[] }`
  - Response: Cleaned and consolidated Ingredient array

- `GET /api/ingredients/fromplan/:planId` - Get shopping list for a specific meal plan
  - Response: Cleaned and consolidated Ingredient array

## Shared Models

The Ingredient interface in `shared/Ingredient.ts` is used by both frontend and backend:

```typescript
interface Ingredient {
  id?: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  notes?: string;
  recipeId?: string;
}
```

The `IngredientImpl` class provides additional functionality:
- `toString()` method for displaying the ingredient with quantity and unit
- Methods for conversion between different units
- Comparison functions for ingredient consolidation

## Example Flow

1. User creates or loads a meal plan
2. User navigates to the Shopping List page
3. Frontend extracts all ingredients from all recipes in the meal plan
4. Frontend sends the raw ingredients to the backend
5. Backend processes the ingredients:
   - Consolidates "2 cups milk" and "1/2 cup milk" into "2.5 cups milk"
   - Converts "1 tbsp olive oil" and "3 tsp olive oil" into "4 tsp olive oil"
   - Groups "apples", "bananas", and "oranges" under "Produce"
6. Backend returns the cleaned ingredient list
7. Frontend displays the organized shopping list grouped by category
8. User can check items while shopping or export the list

## Special Handling

The ingredient cleaning process handles various special cases:
- Ingredients with no specified quantity (e.g., "salt to taste")
- Ingredients with descriptive quantities (e.g., "a pinch of")
- Ingredients that appear in multiple forms (e.g., "diced onions" and "sliced onions")
- Conversion between volume and weight measurements when appropriate
- Fractional quantities (e.g., "1/2 cup", "1/4 tsp")

The system uses Claude's language understanding to handle these cases intelligently, ensuring a clean and usable shopping list.