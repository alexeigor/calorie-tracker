
import { db } from '../db';
import { dailyCalorieEntriesTable } from '../db/schema';
import { type CreateDailyCalorieEntryInput, type DailyCalorieEntry } from '../schema';
import { eq } from 'drizzle-orm';

export const createDailyCalorieEntry = async (input: CreateDailyCalorieEntryInput): Promise<DailyCalorieEntry> => {
  try {
    // Check if an entry for the same date already exists
    const existingEntry = await db.select()
      .from(dailyCalorieEntriesTable)
      .where(eq(dailyCalorieEntriesTable.date, input.date.toISOString().split('T')[0]))
      .execute();

    if (existingEntry.length > 0) {
      throw new Error(`Daily calorie entry for date ${input.date.toISOString().split('T')[0]} already exists`);
    }

    // Insert new daily calorie entry
    const result = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: input.date.toISOString().split('T')[0],
        total_calories: input.total_calories
      })
      .returning()
      .execute();

    const entry = result[0];
    return {
      ...entry,
      date: new Date(entry.date + 'T00:00:00.000Z') // Convert date string back to Date object
    };
  } catch (error) {
    console.error('Daily calorie entry creation failed:', error);
    throw error;
  }
};
