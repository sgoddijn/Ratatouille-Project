export interface Recipe {
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
    };
    createdAt: Date;
  }

  export const createEmptyRecipe = (): Recipe => ({
    id: '',
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    macros: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    createdAt: new Date()
  }); 