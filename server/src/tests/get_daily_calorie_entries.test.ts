
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dailyCalorieEntriesTable } from '../db/schema';
import { getDailyCalorieEntries } from '../handlers/get_daily_calorie_entries';

describe('getDailyCalorieEntries', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no entries exist', async () => {
    const result = await getDailyCalorieEntries();
    expect(result).toEqual([]);
  });

  it('should return all daily calorie entries', async () => {
    // Create test entries
    const testEntries = [
      {
        date: '2024-01-15',
        total_calories: 2000
      },
      {
        date: '2024-01-16',
        total_calories: 2200
      }
    ];

    await db.insert(dailyCalorieEntriesTable)
      .values(testEntries)
      .execute();

    const result = await getDailyCalorieEntries();

    expect(result).toHaveLength(2);
    
    // Verify all required fields are present
    result.forEach(entry => {
      expect(entry.id).toBeDefined();
      expect(entry.date).toBeInstanceOf(Date);
      expect(typeof entry.total_calories).toBe('number');
      expect(entry.created_at).toBeInstanceOf(Date);
      expect(entry.updated_at).toBeInstanceOf(Date);
    });

    // Verify data matches what we inserted
    expect(result.some(entry => entry.total_calories === 2000)).toBe(true);
    expect(result.some(entry => entry.total_calories === 2200)).toBe(true);
  });

  it('should return entries ordered by date descending', async () => {
    // Create entries with different dates
    const testEntries = [
      {
        date: '2024-01-10',
        total_calories: 1800
      },
      {
        date: '2024-01-15',
        total_calories: 2000
      },
      {
        date: '2024-01-12',
        total_calories: 1900
      }
    ];

    await db.insert(dailyCalorieEntriesTable)
      .values(testEntries)
      .execute();

    const result = await getDailyCalorieEntries();

    expect(result).toHaveLength(3);
    
    // Verify descending order by date (most recent first)
    expect(result[0].date >= result[1].date).toBe(true);
    expect(result[1].date >= result[2].date).toBe(true);
    
    // Verify the actual order - should be 2024-01-15, 2024-01-12, 2024-01-10
    expect(result[0].total_calories).toBe(2000); // 2024-01-15
    expect(result[1].total_calories).toBe(1900); // 2024-01-12
    expect(result[2].total_calories).toBe(1800); // 2024-01-10
  });
});
