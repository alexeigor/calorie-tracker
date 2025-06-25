
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyCalorieEntriesTable } from '../db/schema';
import { type UpdateDailyCalorieEntryInput } from '../schema';
import { updateDailyCalorieEntry } from '../handlers/update_daily_calorie_entry';
import { eq } from 'drizzle-orm';

describe('updateDailyCalorieEntry', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a daily calorie entry', async () => {
    // Create a test entry first
    const createResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 1500
      })
      .returning()
      .execute();

    const createdEntry = createResult[0];

    // Update the entry
    const updateInput: UpdateDailyCalorieEntryInput = {
      id: createdEntry.id,
      total_calories: 2000
    };

    const result = await updateDailyCalorieEntry(updateInput);

    // Verify the update
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdEntry.id);
    expect(result!.total_calories).toEqual(2000);
    expect(result!.date).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(createdEntry.updated_at.getTime());
  });

  it('should save updated entry to database', async () => {
    // Create a test entry first
    const createResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 1500
      })
      .returning()
      .execute();

    const createdEntry = createResult[0];

    // Update the entry
    const updateInput: UpdateDailyCalorieEntryInput = {
      id: createdEntry.id,
      total_calories: 2500
    };

    await updateDailyCalorieEntry(updateInput);

    // Query the database to verify persistence
    const updatedEntries = await db.select()
      .from(dailyCalorieEntriesTable)
      .where(eq(dailyCalorieEntriesTable.id, createdEntry.id))
      .execute();

    expect(updatedEntries).toHaveLength(1);
    expect(updatedEntries[0].total_calories).toEqual(2500);
    expect(updatedEntries[0].updated_at).toBeInstanceOf(Date);
    expect(updatedEntries[0].updated_at.getTime()).toBeGreaterThan(createdEntry.updated_at.getTime());
  });

  it('should return null for non-existent entry', async () => {
    const updateInput: UpdateDailyCalorieEntryInput = {
      id: 99999,
      total_calories: 2000
    };

    const result = await updateDailyCalorieEntry(updateInput);

    expect(result).toBeNull();
  });

  it('should update only provided fields', async () => {
    // Create a test entry first
    const createResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 1500
      })
      .returning()
      .execute();

    const createdEntry = createResult[0];

    // Update with minimal input (only id provided)
    const updateInput: UpdateDailyCalorieEntryInput = {
      id: createdEntry.id
    };

    const result = await updateDailyCalorieEntry(updateInput);

    // Verify only updated_at changed
    expect(result).not.toBeNull();
    expect(result!.total_calories).toEqual(1500); // Should remain unchanged
    expect(result!.date).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(createdEntry.updated_at.getTime());
  });
});
