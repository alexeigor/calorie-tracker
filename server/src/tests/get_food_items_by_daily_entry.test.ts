
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyCalorieEntriesTable, foodItemsTable } from '../db/schema';
import { getFoodItemsByDailyEntry } from '../handlers/get_food_items_by_daily_entry';

describe('getFoodItemsByDailyEntry', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return food items for a specific daily entry ordered by creation date', async () => {
    // Create a daily calorie entry first
    const dailyEntryResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 2000
      })
      .returning()
      .execute();

    const dailyEntryId = dailyEntryResult[0].id;

    // Create multiple food items with slight delay to ensure different timestamps
    const foodItem1 = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntryId,
        food_name: 'Apple',
        calories: 95
      })
      .returning()
      .execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const foodItem2 = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntryId,
        food_name: 'Banana',
        calories: 105
      })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const foodItem3 = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntryId,
        food_name: 'Orange',
        calories: 62
      })
      .returning()
      .execute();

    const result = await getFoodItemsByDailyEntry(dailyEntryId);

    expect(result).toHaveLength(3);
    
    // Verify all items belong to the correct daily entry
    result.forEach(item => {
      expect(item.daily_entry_id).toEqual(dailyEntryId);
    });

    // Verify ordering by creation date (earliest first)
    expect(result[0].food_name).toEqual('Apple');
    expect(result[1].food_name).toEqual('Banana');
    expect(result[2].food_name).toEqual('Orange');

    // Verify timestamps are in ascending order
    expect(result[0].created_at <= result[1].created_at).toBe(true);
    expect(result[1].created_at <= result[2].created_at).toBe(true);

    // Verify field values
    expect(result[0].calories).toEqual(95);
    expect(result[1].calories).toEqual(105);
    expect(result[2].calories).toEqual(62);
  });

  it('should return empty array when no food items exist for daily entry', async () => {
    // Create a daily calorie entry first
    const dailyEntryResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 2000
      })
      .returning()
      .execute();

    const dailyEntryId = dailyEntryResult[0].id;

    const result = await getFoodItemsByDailyEntry(dailyEntryId);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should return empty array for non-existent daily entry', async () => {
    const nonExistentId = 9999;

    const result = await getFoodItemsByDailyEntry(nonExistentId);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should only return food items for the specified daily entry', async () => {
    // Create two different daily calorie entries
    const dailyEntry1 = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 2000
      })
      .returning()
      .execute();

    const dailyEntry2 = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-16',
        total_calories: 1800
      })
      .returning()
      .execute();

    // Create food items for both entries
    await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry1[0].id,
        food_name: 'Apple',
        calories: 95
      })
      .execute();

    await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry2[0].id,
        food_name: 'Banana',
        calories: 105
      })
      .execute();

    await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry1[0].id,
        food_name: 'Orange',
        calories: 62
      })
      .execute();

    // Get food items for first daily entry only
    const result = await getFoodItemsByDailyEntry(dailyEntry1[0].id);

    expect(result).toHaveLength(2);
    result.forEach(item => {
      expect(item.daily_entry_id).toEqual(dailyEntry1[0].id);
    });

    // Verify we get the correct items
    const foodNames = result.map(item => item.food_name);
    expect(foodNames).toContain('Apple');
    expect(foodNames).toContain('Orange');
    expect(foodNames).not.toContain('Banana');
  });
});
