
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateDailyCalorieEntryInput } from '../../../server/src/schema';

interface CalorieEntryFormProps {
  onSubmit: (data: CreateDailyCalorieEntryInput) => Promise<void>;
  isLoading?: boolean;
}

export function CalorieEntryForm({ onSubmit, isLoading = false }: CalorieEntryFormProps) {
  const [formData, setFormData] = useState<CreateDailyCalorieEntryInput>({
    date: new Date(),
    total_calories: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Reset form after successful submission
    setFormData({
      date: new Date(),
      total_calories: 0
    });
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formatDateForInput(formData.date)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateDailyCalorieEntryInput) => ({ 
              ...prev, 
              date: new Date(e.target.value + 'T00:00:00') 
            }))
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="total_calories">Total Calories</Label>
        <Input
          id="total_calories"
          type="number"
          value={formData.total_calories}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateDailyCalorieEntryInput) => ({ 
              ...prev, 
              total_calories: parseInt(e.target.value) || 0 
            }))
          }
          placeholder="e.g., 2000"
          min="0"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? 'Creating...' : '📊 Create Entry'}
        </Button>
      </div>
    </form>
  );
}
