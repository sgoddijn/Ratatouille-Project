import mongoose from 'mongoose';

const macrosSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
});

const recipeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: [{ type: [String], required: true }],
  instructions: [{ type: [String], required: true }],
  cookTime: String,
  imageUrl: String,
  macros: { type: macrosSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Recipe = mongoose.model('Recipe', recipeSchema);