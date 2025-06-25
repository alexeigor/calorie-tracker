
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyCalorieEntriesTable, foodItemsTable } from '../db/schema';
import { type CreateFoodItemInput } from '../schema';
import { createFoodItem } from '../handlers/create_food_item';
import { eq } from 'drizzle-orm';

describe('createFoodItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a food item', async () => {
    // Create a daily entry first
    const dailyEntryResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 2000
      })
      .returning()
      .execute();

    const dailyEntryId = dailyEntryResult[0].id;

    const testInput: CreateFoodItemInput = {
      daily_entry_id: dailyEntryId,
      food_name: 'Apple',
      calories: 80
    };

    const result = await createFoodItem(testInput);

    // Basic field validation
    expect(result.daily_entry_id).toEqual(dailyEntryId);
    expect(result.food_name).toEqual('Apple');
    expect(result.calories).toEqual(80);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save food item to database', async () => {
    // Create a daily entry first
    const dailyEntryResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 2000
      })
      .returning()
      .execute();

    const dailyEntryId = dailyEntryResult[0].id;

    const testInput: CreateFoodItemInput = {
      daily_entry_id: dailyEntryId,
      food_name: 'Banana',
      calories: 120
    };

    const result = await createFoodItem(testInput);

    // Query using proper drizzle syntax
    const foodItems = await db.select()
      .from(foodItemsTable)
      .where(eq(foodItemsTable.id, result.id))
      .execute();

    expect(foodItems).toHaveLength(1);
    expect(foodItems[0].daily_entry_id).toEqual(dailyEntryId);
    expect(foodItems[0].food_name).toEqual('Banana');
    expect(foodItems[0].calories).toEqual(120);
    expect(foodItems[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when daily entry does not exist', async () => {
    const testInput: CreateFoodItemInput = {
      daily_entry_id: 999, // Non-existent ID
      food_name: 'Orange',
      calories: 60
    };

    await expect(createFoodItem(testInput)).rejects.toThrow(/Daily calorie entry with id 999 not found/i);
  });

  it('should create multiple food items for same daily entry', async () => {
    // Create a daily entry first
    const dailyEntryResult = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 2000
      })
      .returning()
      .execute();

    const dailyEntryId = dailyEntryResult[0].id;

    const testInput1: CreateFoodItemInput = {
      daily_entry_id: dailyEntryId,
      food_name: 'Chicken Breast',
      calories: 250
    };

    const testInput2: CreateFoodItemInput = {
      daily_entry_id: dailyEntryId,
      food_name: 'Rice',
      calories: 150
    };

    const result1 = await createFoodItem(testInput1);
    const result2 = await createFoodItem(testInput2);

    // Both should be created successfully
    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
    expect(result1.id).not.toEqual(result2.id);

    // Verify both are in database
    const foodItems = await db.select()
      .from(foodItemsTable)
      .where(eq(foodItemsTable.daily_entry_id, dailyEntryId))
      .execute();

    expect(foodItems).toHaveLength(2);
    expect(foodItems.map(item => item.food_name)).toContain('Chicken Breast');
    expect(foodItems.map(item => item.food_name)).toContain('Rice');
  });
});
