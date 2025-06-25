
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyCalorieEntriesTable, foodItemsTable } from '../db/schema';
import { getDailyCalorieEntryWithFoodItems } from '../handlers/get_daily_calorie_entry_with_food_items';

describe('getDailyCalorieEntryWithFoodItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent entry', async () => {
    const result = await getDailyCalorieEntryWithFoodItems(999);
    expect(result).toBeNull();
  });

  it('should return daily entry with empty food items array', async () => {
    // Create a daily entry without food items
    const entryResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 0
      })
      .returning()
      .execute();

    const entryId = entryResult[0].id;
    const result = await getDailyCalorieEntryWithFoodItems(entryId);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(entryId);
    expect(result!.date).toEqual(new Date('2024-01-15'));
    expect(result!.total_calories).toBe(0);
    expect(result!.food_items).toEqual([]);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return daily entry with associated food items', async () => {
    // Create a daily entry
    const entryResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 1500
      })
      .returning()
      .execute();

    const entryId = entryResult[0].id;

    // Create food items for this entry
    const foodItemsData = [
      { daily_entry_id: entryId, food_name: 'Apple', calories: 95 },
      { daily_entry_id: entryId, food_name: 'Chicken Breast', calories: 231 },
      { daily_entry_id: entryId, food_name: 'Brown Rice', calories: 216 }
    ];

    await db.insert(foodItemsTable)
      .values(foodItemsData)
      .execute();

    const result = await getDailyCalorieEntryWithFoodItems(entryId);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(entryId);
    expect(result!.date).toEqual(new Date('2024-01-15'));
    expect(result!.total_calories).toBe(1500);
    expect(result!.food_items).toHaveLength(3);

    // Check food items are correctly included
    expect(result!.food_items[0].food_name).toBe('Apple');
    expect(result!.food_items[0].calories).toBe(95);
    expect(result!.food_items[0].daily_entry_id).toBe(entryId);
    expect(result!.food_items[0].created_at).toBeInstanceOf(Date);

    expect(result!.food_items[1].food_name).toBe('Chicken Breast');
    expect(result!.food_items[1].calories).toBe(231);

    expect(result!.food_items[2].food_name).toBe('Brown Rice');
    expect(result!.food_items[2].calories).toBe(216);
  });

  it('should only return food items for the specified entry', async () => {
    // Create two daily entries
    const entry1Result = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 800
      })
      .returning()
      .execute();

    const entry2Result = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-16',
        total_calories: 900
      })
      .returning()
      .execute();

    const entry1Id = entry1Result[0].id;
    const entry2Id = entry2Result[0].id;

    // Create food items for both entries
    await db.insert(foodItemsTable)
      .values([
        { daily_entry_id: entry1Id, food_name: 'Banana', calories: 105 },
        { daily_entry_id: entry1Id, food_name: 'Yogurt', calories: 150 },
        { daily_entry_id: entry2Id, food_name: 'Oatmeal', calories: 300 },
        { daily_entry_id: entry2Id, food_name: 'Berries', calories: 80 }
      ])
      .execute();

    const result = await getDailyCalorieEntryWithFoodItems(entry1Id);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(entry1Id);
    expect(result!.food_items).toHaveLength(2);
    expect(result!.food_items[0].food_name).toBe('Banana');
    expect(result!.food_items[1].food_name).toBe('Yogurt');

    // Verify no food items from entry2 are included
    const foodNames = result!.food_items.map(item => item.food_name);
    expect(foodNames).not.toContain('Oatmeal');
    expect(foodNames).not.toContain('Berries');
  });
});
