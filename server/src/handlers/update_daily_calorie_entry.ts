
import { db } from '../db';
import { dailyCalorieEntriesTable } from '../db/schema';
import { type UpdateDailyCalorieEntryInput, type DailyCalorieEntry } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDailyCalorieEntry = async (input: UpdateDailyCalorieEntryInput): Promise<DailyCalorieEntry | null> => {
  try {
    // Check if entry exists
    const existingEntry = await db.select()
      .from(dailyCalorieEntriesTable)
      .where(eq(dailyCalorieEntriesTable.id, input.id))
      .execute();

    if (existingEntry.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.total_calories !== undefined) {
      updateData.total_calories = input.total_calories;
    }

    // Update the entry
    const result = await db.update(dailyCalorieEntriesTable)
      .set(updateData)
      .where(eq(dailyCalorieEntriesTable.id, input.id))
      .returning()
      .execute();

    // Convert date string to Date object for schema compliance
    const updatedEntry = result[0];
    return {
      ...updatedEntry,
      date: new Date(updatedEntry.date)
    };
  } catch (error) {
    console.error('Daily calorie entry update failed:', error);
    throw error;
  }
};
