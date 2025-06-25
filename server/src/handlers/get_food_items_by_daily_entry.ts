
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { type FoodItem } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getFoodItemsByDailyEntry(dailyEntryId: number): Promise<FoodItem[]> {
  try {
    const results = await db.select()
      .from(foodItemsTable)
      .where(eq(foodItemsTable.daily_entry_id, dailyEntryId))
      .orderBy(asc(foodItemsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get food items by daily entry:', error);
    throw error;
  }
}
