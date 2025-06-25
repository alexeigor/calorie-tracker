
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyCalorieEntriesTable, foodItemsTable } from '../db/schema';
import { type UpdateFoodItemInput } from '../schema';
import { updateFoodItem } from '../handlers/update_food_item';
import { eq } from 'drizzle-orm';

describe('updateFoodItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a food item with new food name', async () => {
    // Create a daily calorie entry first
    const dailyEntry = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-01',
        total_calories: 2000
      })
      .returning()
      .execute();

    // Create a food item
    const foodItem = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry[0].id,
        food_name: 'Original Food',
        calories: 300
      })
      .returning()
      .execute();

    const updateInput: UpdateFoodItemInput = {
      id: foodItem[0].id,
      food_name: 'Updated Food'
    };

    const result = await updateFoodItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(foodItem[0].id);
    expect(result!.food_name).toEqual('Updated Food');
    expect(result!.calories).toEqual(300); // Should remain unchanged
    expect(result!.daily_entry_id).toEqual(dailyEntry[0].id);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update a food item with new calories', async () => {
    // Create a daily calorie entry first
    const dailyEntry = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-01',
        total_calories: 2000
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

    const updateInput: UpdateFoodItemInput = {
      id: foodItem[0].id,
      calories: 450
    };

    const result = await updateFoodItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(foodItem[0].id);
    expect(result!.food_name).toEqual('Test Food'); // Should remain unchanged
    expect(result!.calories).toEqual(450);
    expect(result!.daily_entry_id).toEqual(dailyEntry[0].id);
  });

  it('should update both food name and calories', async () => {
    // Create a daily calorie entry first
    const dailyEntry = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-01',
        total_calories: 2000
      })
      .returning()
      .execute();

    // Create a food item
    const foodItem = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry[0].id,
        food_name: 'Original Food',
        calories: 300
      })
      .returning()
      .execute();

    const updateInput: UpdateFoodItemInput = {
      id: foodItem[0].id,
      food_name: 'Updated Food',
      calories: 500
    };

    const result = await updateFoodItem(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(foodItem[0].id);
    expect(result!.food_name).toEqual('Updated Food');
    expect(result!.calories).toEqual(500);
    expect(result!.daily_entry_id).toEqual(dailyEntry[0].id);
  });

  it('should return null for non-existent food item', async () => {
    const updateInput: UpdateFoodItemInput = {
      id: 999,
      food_name: 'Updated Food'
    };

    const result = await updateFoodItem(updateInput);

    expect(result).toBeNull();
  });

  it('should return null when no fields are provided to update', async () => {
    // Create a daily calorie entry first
    const dailyEntry = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-01',
        total_calories: 2000
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

    const updateInput: UpdateFoodItemInput = {
      id: foodItem[0].id
    };

    const result = await updateFoodItem(updateInput);

    expect(result).toBeNull();
  });

  it('should persist changes to database', async () => {
    // Create a daily calorie entry first
    const dailyEntry = await db.insert(dailyCalorieEntriesTable)
      .values({
        date: '2024-01-01',
        total_calories: 2000
      })
      .returning()
      .execute();

    // Create a food item
    const foodItem = await db.insert(foodItemsTable)
      .values({
        daily_entry_id: dailyEntry[0].id,
        food_name: 'Original Food',
        calories: 300
      })
      .returning()
      .execute();

    const updateInput: UpdateFoodItemInput = {
      id: foodItem[0].id,
      food_name: 'Updated Food',
      calories: 400
    };

    await updateFoodItem(updateInput);

    // Verify changes were persisted
    const updatedFoodItems = await db.select()
      .from(foodItemsTable)
      .where(eq(foodItemsTable.id, foodItem[0].id))
      .execute();

    expect(updatedFoodItems).toHaveLength(1);
    expect(updatedFoodItems[0].food_name).toEqual('Updated Food');
    expect(updatedFoodItems[0].calories).toEqual(400);
    expect(updatedFoodItems[0].daily_entry_id).toEqual(dailyEntry[0].id);
  });
});
