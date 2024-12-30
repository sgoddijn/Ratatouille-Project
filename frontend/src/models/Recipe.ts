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