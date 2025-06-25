
import { db } from '../db';
import { dailyCalorieEntriesTable, foodItemsTable } from '../db/schema';
import { type DailyCalorieEntryWithFoodItems } from '../schema';
import { eq } from 'drizzle-orm';

export async function getDailyCalorieEntryWithFoodItems(entryId: number): Promise<DailyCalorieEntryWithFoodItems | null> {
  try {
    // First, get the daily calorie entry
    const entryResult = await db.select()
      .from(dailyCalorieEntriesTable)
      .where(eq(dailyCalorieEntriesTable.id, entryId))
      .execute();

    if (entryResult.length === 0) {
      return null;
    }

    const entry = entryResult[0];

    // Then, get all food items for this entry
    const foodItemsResult = await db.select()
      .from(foodItemsTable)
      .where(eq(foodItemsTable.daily_entry_id, entryId))
      .execute();

    // Combine the data
    return {
      id: entry.id,
      date: new Date(entry.date), // Convert string to Date
      total_calories: entry.total_calories,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      food_items: foodItemsResult.map(item => ({
        id: item.id,
        daily_entry_id: item.daily_entry_id,
        food_name: item.food_name,
        calories: item.calories,
        created_at: item.created_at
      }))
    };
  } catch (error) {
    console.error('Failed to get daily calorie entry with food items:', error);
    throw error;
  }
}
