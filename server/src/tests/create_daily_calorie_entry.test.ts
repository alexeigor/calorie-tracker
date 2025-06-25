
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyCalorieEntriesTable } from '../db/schema';
import { type CreateDailyCalorieEntryInput } from '../schema';
import { createDailyCalorieEntry } from '../handlers/create_daily_calorie_entry';
import { eq } from 'drizzle-orm';

// Test input
const testInput: CreateDailyCalorieEntryInput = {
  date: new Date('2024-01-15'),
  total_calories: 2000
};

describe('createDailyCalorieEntry', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a daily calorie entry', async () => {
    const result = await createDailyCalorieEntry(testInput);

    // Basic field validation
    expect(result.date).toEqual(new Date('2024-01-15'));
    expect(result.total_calories).toEqual(2000);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save entry to database', async () => {
    const result = await createDailyCalorieEntry(testInput);

    // Query database to verify entry was saved
    const entries = await db.select()
      .from(dailyCalorieEntriesTable)
      .where(eq(dailyCalorieEntriesTable.id, result.id))
      .execute();

    expect(entries).toHaveLength(1);
    expect(entries[0].date).toEqual('2024-01-15');
    expect(entries[0].total_calories).toEqual(2000);
    expect(entries[0].created_at).toBeInstanceOf(Date);
    expect(entries[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error if entry for same date already exists', async () => {
    // Create first entry
    await createDailyCalorieEntry(testInput);

    // Try to create another entry for the same date
    await expect(createDailyCalorieEntry(testInput))
      .rejects.toThrow(/already exists/i);
  });

  it('should allow entries for different dates', async () => {
    // Create first entry
    const firstEntry = await createDailyCalorieEntry(testInput);

    // Create second entry for different date
    const secondInput: CreateDailyCalorieEntryInput = {
      date: new Date('2024-01-16'),
      total_calories: 2200
    };
    const secondEntry = await createDailyCalorieEntry(secondInput);

    // Both entries should exist
    expect(firstEntry.id).not.toEqual(secondEntry.id);
    expect(firstEntry.date).toEqual(new Date('2024-01-15'));
    expect(secondEntry.date).toEqual(new Date('2024-01-16'));

    // Verify both entries are in database
    const allEntries = await db.select()
      .from(dailyCalorieEntriesTable)
      .execute();

    expect(allEntries).toHaveLength(2);
  });
});
