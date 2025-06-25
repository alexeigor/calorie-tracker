
import { serial, text, pgTable, timestamp, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const dailyCalorieEntriesTable = pgTable('daily_calorie_entries', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  total_calories: integer('total_calories').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const foodItemsTable = pgTable('food_items', {
  id: serial('id').primaryKey(),
  daily_entry_id: integer('daily_entry_id').notNull().references(() => dailyCalorieEntriesTable.id, { onDelete: 'cascade' }),
  food_name: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const dailyCalorieEntriesRelations = relations(dailyCalorieEntriesTable, ({ many }) => ({
  food_items: many(foodItemsTable),
}));

export const foodItemsRelations = relations(foodItemsTable, ({ one }) => ({
  daily_entry: one(dailyCalorieEntriesTable, {
    fields: [foodItemsTable.daily_entry_id],
    references: [dailyCalorieEntriesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type DailyCalorieEntry = typeof dailyCalorieEntriesTable.$inferSelect;
export type NewDailyCalorieEntry = typeof dailyCalorieEntriesTable.$inferInsert;
export type FoodItem = typeof foodItemsTable.$inferSelect;
export type NewFoodItem = typeof foodItemsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  dailyCalorieEntries: dailyCalorieEntriesTable,
  foodItems: foodItemsTable
};
