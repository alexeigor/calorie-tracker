
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

import { 
  createDailyCalorieEntryInputSchema,
  updateDailyCalorieEntryInputSchema,
  createFoodItemInputSchema,
  updateFoodItemInputSchema
} from './schema';

import { createDailyCalorieEntry } from './handlers/create_daily_calorie_entry';
import { getDailyCalorieEntries } from './handlers/get_daily_calorie_entries';
import { getDailyCalorieEntryWithFoodItems } from './handlers/get_daily_calorie_entry_with_food_items';
import { updateDailyCalorieEntry } from './handlers/update_daily_calorie_entry';
import { createFoodItem } from './handlers/create_food_item';
import { getFoodItemsByDailyEntry } from './handlers/get_food_items_by_daily_entry';
import { updateFoodItem } from './handlers/update_food_item';
import { deleteFoodItem } from './handlers/delete_food_item';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Daily calorie entry routes
  createDailyCalorieEntry: publicProcedure
    .input(createDailyCalorieEntryInputSchema)
    .mutation(({ input }) => createDailyCalorieEntry(input)),
    
  getDailyCalorieEntries: publicProcedure
    .query(() => getDailyCalorieEntries()),
    
  getDailyCalorieEntryWithFoodItems: publicProcedure
    .input(z.object({ entryId: z.number() }))
    .query(({ input }) => getDailyCalorieEntryWithFoodItems(input.entryId)),
    
  updateDailyCalorieEntry: publicProcedure
    .input(updateDailyCalorieEntryInputSchema)
    .mutation(({ input }) => updateDailyCalorieEntry(input)),
    
  // Food item routes
  createFoodItem: publicProcedure
    .input(createFoodItemInputSchema)
    .mutation(({ input }) => createFoodItem(input)),
    
  getFoodItemsByDailyEntry: publicProcedure
    .input(z.object({ dailyEntryId: z.number() }))
    .query(({ input }) => getFoodItemsByDailyEntry(input.dailyEntryId)),
    
  updateFoodItem: publicProcedure
    .input(updateFoodItemInputSchema)
    .mutation(({ input }) => updateFoodItem(input)),
    
  deleteFoodItem: publicProcedure
    .input(z.object({ foodItemId: z.number() }))
    .mutation(({ input }) => deleteFoodItem(input.foodItemId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
