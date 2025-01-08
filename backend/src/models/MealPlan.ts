import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
  weekPlan: { type: Object, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const MealPlan = mongoose.model('MealPlan', mealPlanSchema); 