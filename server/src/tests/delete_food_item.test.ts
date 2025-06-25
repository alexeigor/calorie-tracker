
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyCalorieEntriesTable, foodItemsTable } from '../db/schema';
import { deleteFoodItem } from '../handlers/delete_food_item';
import { eq } from 'drizzle-orm';

describe('deleteFoodItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing food item', async () => {
    // Create a daily entry first
    const dailyEntry = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 1800
      })
      .returning()
      .execute();

    // Create a food item
    const foodItem = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry[0].id,
        food_name: 'Test Food',
        calories: 300
      })
      .returning()
      .execute();

    const result = await deleteFoodItem(foodItem[0].id);

    expect(result).toBe(true);

    // Verify the food item was actually deleted from database
    const foodItems = await db.select()
      .from(foodItemsTable)
      .where(eq(foodItemsTable.id, foodItem[0].id))
      .execute();

    expect(foodItems).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent food item', async () => {
    const nonExistentId = 999999;

    const result = await deleteFoodItem(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other food items when deleting one', async () => {
    // Create a daily entry first
    const dailyEntry = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-15',
        total_calories: 1800
      })
      .returning()
      .execute();

    // Create multiple food items
    const foodItem1 = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry[0].id,
        food_name: 'Food 1',
        calories: 300
      })
      .returning()
      .execute();

    const foodItem2 = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry[0].id,
        food_name: 'Food 2',
        calories: 400
      })
      .returning()
      .execute();

    // Delete the first food item
    const result = await deleteFoodItem(foodItem1[0].id);

    expect(result).toBe(true);

    // Verify only the targeted food item was deleted
    const remainingFoodItems = await db.select()
      .from(foodItemsTable)
      .execute();

    expect(remainingFoodItems).toHaveLength(1);
    expect(remainingFoodItems[0].id).toBe(foodItem2[0].id);
    expect(remainingFoodItems[0].food_name).toBe('Food 2');
  });
});
