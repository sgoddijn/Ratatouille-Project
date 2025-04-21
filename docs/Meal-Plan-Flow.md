# Meal Plan Flow

This document explains how meal plans are generated and managed in the Ratatouille Project.

## Overview

The meal plan flow allows users to generate weekly meal plans using AI. The system considers nutritional balance, variety, and user preferences to create a complete plan with breakfast, lunch, and dinner for each day of the week.

## Frontend Components

### MealPlan.tsx

The main component that:
- Displays the weekly meal plan in a day/meal grid format
- Provides a button to generate new meal plans
- Shows each meal with recipe image, title, and basic information
- Allows navigation to recipe details

## Backend Services

### planBuilder.ts

This service handles the generation of meal plans:
- Fetches all available recipes from the database
- Uses Claude to create a balanced weekly meal plan
- Considers nutritional value, variety, and meal types
- Maps recipe IDs to full recipe objects
- Returns structured meal plan data

### MealPlan Model (models/MealPlan.ts)

The MongoDB schema for storing meal plans with fields for:
- Week start and end dates
- Structured plan with days and meal types
- Associated recipe references
- User preferences (if applicable)

## Data Flow

1. **User Initiates Plan Generation**:
   - User navigates to the Meal Plan page
   - User clicks "Generate Plan" button

2. **Frontend Sends Request**:
   - Frontend calls `/api/mealplan/generate` endpoint
   - May include optional preferences in the request

3. **Backend Processing**:
   - Backend receives the request
   - `planBuilder.buildPlan()` is called
   - All available recipes are fetched from the database
   - Claude analyzes the recipes and creates a balanced meal plan:
     - Ensures nutritional variety across the week
     - Alternates meal types and cuisines
     - Considers prep time for different days of the week
     - Assigns recipes to each meal slot (breakfast, lunch, dinner)

4. **Meal Plan Structure**:
   - Plan is structured by day and meal type
   - Each meal slot contains a recipe reference
   - Recipe details are included in the response

5. **Data Storage**:
   - Generated meal plan is saved to MongoDB using the MealPlan model
   - Previous meal plan (if exists) is archived or replaced

6. **Response to Frontend**:
   - Backend returns the complete meal plan with recipe details
   - Frontend updates the UI to display the new meal plan
   - Loading state is removed and success notification is shown

## API Endpoints

- `POST /api/mealplan/generate` - Generate a new meal plan
  - Request body: `{ preferences?: any }`
  - Response: MealPlan object with recipe details

- `GET /api/mealplan/current` - Get the current active meal plan
  - Response: MealPlan object with recipe details

- `POST /api/mealplan/save` - Save changes to the current meal plan
  - Request body: MealPlan object
  - Response: Updated MealPlan object

## Data Models

The meal plan structure follows this pattern:

```typescript
interface MealPlan {
  id?: string;
  startDate: Date;
  endDate: Date;
  days: {
    [day: string]: {
      breakfast: Recipe | null;
      lunch: Recipe | null;
      dinner: Recipe | null;
    }
  };
  createdAt?: Date;
  updatedAt?: Date;
}
```

Where `day` is one of: "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday".

## Example Flow

1. User navigates to the meal plan page
2. If a current meal plan exists, it is displayed
3. User clicks "Generate Plan" button
4. Loading indicator is shown
5. Backend processes the request:
   - Fetches all recipes
   - Uses Claude to create a balanced plan
   - Saves the plan to the database
6. Frontend receives the new plan and updates the UI
7. User can view the plan organized by day and meal type
8. User can click on any recipe to view its details
9. User can generate a shopping list based on the meal plan