
import { db } from '../db';
import { dailyCalorieEntriesTable } from '../db/schema';
import { type DailyCalorieEntry } from '../schema';
import { desc } from 'drizzle-orm';

export async function getDailyCalorieEntries(): Promise<DailyCalorieEntry[]> {
  try {
    const results = await db.select()
      .from(dailyCalorieEntriesTable)
      .orderBy(desc(dailyCalorieEntriesTable.date))
      .execute();

    // Convert date strings to Date objects to match schema
    return results.map(entry => ({
      ...entry,
      date: new Date(entry.date)
    }));
  } catch (error) {
    console.error('Failed to get daily calorie entries:', error);
    throw error;
  }
}
