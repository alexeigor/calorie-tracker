
import { db } from '../db';
import { dailyCalorieEntriesTable, foodItemsTable } from '../db/schema';
import { type CreateFoodItemInput, type FoodItem } from '../schema';
import { eq } from 'drizzle-orm';

export const createFoodItem = async (input: CreateFoodItemInput): Promise<FoodItem> => {
  try {
    // Validate that the daily entry exists
    const dailyEntry = await db.select()
      .from(dailyCalorieEntriesTable)
      .where(eq(dailyCalorieEntriesTable.id, input.daily_entry_id))
      .execute();

    if (dailyEntry.length === 0) {
      throw new Error(`Daily calorie entry with id ${input.daily_entry_id} not found`);
    }

    // Insert food item record
    const result = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: input.daily_entry_id,
        food_name: input.food_name,
        calories: input.calories
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Food item creation failed:', error);
    throw error;
  }
};
