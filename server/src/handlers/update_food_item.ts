
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { type UpdateFoodItemInput, type FoodItem } from '../schema';
import { eq } from 'drizzle-orm';

export const updateFoodItem = async (input: UpdateFoodItemInput): Promise<FoodItem | null> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<{
      food_name: string;
      calories: number;
    }> = {};

    if (input.food_name !== undefined) {
      updateData.food_name = input.food_name;
    }

    if (input.calories !== undefined) {
      updateData.calories = input.calories;
    }

    // If no fields to update, return null
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    // Update the food item
    const result = await db.update(foodItemsTable)
      .set(updateData)
      .where(eq(foodItemsTable.id, input.id))
      .returning()
      .execute();

    // Return the updated food item or null if not found
    return result[0] || null;
  } catch (error) {
    console.error('Food item update failed:', error);
    throw error;
  }
};
