
import { z } from 'zod';

// Daily calorie entry schema
export const dailyCalorieEntrySchema = z.object({
  id: z.number(),
  date: z.coerce.date(),
  total_calories: z.number().int().nonnegative(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type DailyCalorieEntry = z.infer<typeof dailyCalorieEntrySchema>;

// Food item schema
export const foodItemSchema = z.object({
  id: z.number(),
  daily_entry_id: z.number(),
  food_name: z.string(),
  calories: z.number().int().nonnegative(),
  created_at: z.coerce.date()
});

export type FoodItem = z.infer<typeof foodItemSchema>;

// Input schema for creating daily calorie entries
export const createDailyCalorieEntryInputSchema = z.object({
  date: z.coerce.date(),
  total_calories: z.number().int().nonnegative()
});

export type CreateDailyCalorieEntryInput = z.infer<typeof createDailyCalorieEntryInputSchema>;

// Input schema for updating daily calorie entries
export const updateDailyCalorieEntryInputSchema = z.object({
  id: z.number(),
  total_calories: z.number().int().nonnegative().optional()
});

export type UpdateDailyCalorieEntryInput = z.infer<typeof updateDailyCalorieEntryInputSchema>;

// Input schema for creating food items
export const createFoodItemInputSchema = z.object({
  daily_entry_id: z.number(),
  food_name: z.string().min(1),
  calories: z.number().int().nonnegative()
});

export type CreateFoodItemInput = z.infer<typeof createFoodItemInputSchema>;

// Input schema for updating food items
export const updateFoodItemInputSchema = z.object({
  id: z.number(),
  food_name: z.string().min(1).optional(),
  calories: z.number().int().nonnegative().optional()
});

export type UpdateFoodItemInput = z.infer<typeof updateFoodItemInputSchema>;

// Combined schema for daily entry with food items
export const dailyCalorieEntryWithFoodItemsSchema = z.object({
  id: z.number(),
  date: z.coerce.date(),
  total_calories: z.number().int().nonnegative(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  food_items: z.array(foodItemSchema)
});

export type DailyCalorieEntryWithFoodItems = z.infer<typeof dailyCalorieEntryWithFoodItemsSchema>;
