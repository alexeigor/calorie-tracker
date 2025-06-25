
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteFoodItem(foodItemId: number): Promise<boolean> {
  try {
    const result = await db.delete(foodItemsTable)
      .where(eq(foodItemsTable.id, foodItemId))
      .execute();

    // result.rowCount indicates how many rows were affected
    // Handle the case where rowCount might be null
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Food item deletion failed:', error);
    throw error;
  }
}
