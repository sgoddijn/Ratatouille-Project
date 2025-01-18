export interface Recipe {
    id: string;
    title: string;
    description: string;
    ingredients: [{
      ingredientName: string;
      quantity: string;
      conversions: string[];
    }];
    instructions: string[];
    cookTime?: string;
    imageUrl?: string;
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    rating: number;
    recipeUrl: string;
    numReviews: number;
    createdAt: Date;
  }

  export const createEmptyRecipe = (): Recipe => ({
    id: '',
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    cookTime: '',
    imageUrl: '',
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    rating: 0,
    recipeUrl: '',
    numReviews: 0,
    createdAt: new Date()
  }); 