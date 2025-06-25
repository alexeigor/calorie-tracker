
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrashIcon } from 'lucide-react';
import type { FoodItem } from '../../../server/src/schema';

interface FoodItemsListProps {
  foodItems: FoodItem[];
  onDeleteFoodItem: (foodItemId: number) => Promise<void>;
}

export function FoodItemsList({ foodItems, onDeleteFoodItem }: FoodItemsListProps) {
  if (foodItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🍽️</div>
        <p className="text-gray-500">No food items added yet</p>
        <p className="text-gray-400 text-sm">Click "Add Food" to start tracking individual items</p>
      </div>
    );
  }

  const totalCalories = foodItems.reduce((sum: number, item: FoodItem) => sum + item.calories, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Food Items</h3>
        <Badge variant="outline" className="text-sm">
          Total: {totalCalories.toLocaleString()} cal
        </Badge>
      </div>
      
      <div className="space-y-2">
        {foodItems.map((item: FoodItem) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🍎</span>
                <div>
                  <h4 className="font-medium text-gray-800">{item.food_name}</h4>
                  <p className="text-sm text-gray-500">
                    Added: {item.created_at.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="px-2 py-1">
                {item.calories} cal
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteFoodItem(item.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
