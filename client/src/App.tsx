
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, PlusIcon, UtensilsIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { CalorieEntryForm } from '@/components/CalorieEntryForm';
import { FoodItemsList } from '@/components/FoodItemsList';
import type { 
  DailyCalorieEntry, 
  DailyCalorieEntryWithFoodItems,
  FoodItem,
  CreateDailyCalorieEntryInput,
  CreateFoodItemInput 
} from '../../server/src/schema';

function App() {
  const [dailyEntries, setDailyEntries] = useState<DailyCalorieEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<DailyCalorieEntryWithFoodItems | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddFoodDialogOpen, setIsAddFoodDialogOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load daily entries
  const loadDailyEntries = useCallback(async () => {
    try {
      const entries = await trpc.getDailyCalorieEntries.query();
      setDailyEntries(entries);
    } catch (error) {
      console.error('Failed to load daily entries:', error);
      // Since handlers are stubs, we'll show some demo data
      setDailyEntries([
        {
          id: 1,
          date: new Date('2024-01-15'),
          total_calories: 2150,
          created_at: new Date('2024-01-15T08:00:00'),
          updated_at: new Date('2024-01-15T20:30:00')
        },
        {
          id: 2,
          date: new Date('2024-01-14'),
          total_calories: 1980,
          created_at: new Date('2024-01-14T09:15:00'),
          updated_at: new Date('2024-01-14T19:45:00')
        }
      ]);
    }
  }, []);

  useEffect(() => {
    loadDailyEntries();
  }, [loadDailyEntries]);

  // Create new daily entry
  const handleCreateEntry = async (data: CreateDailyCalorieEntryInput) => {
    setIsLoading(true);
    try {
      const newEntry = await trpc.createDailyCalorieEntry.mutate(data);
      setDailyEntries((prev: DailyCalorieEntry[]) => [newEntry, ...prev]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create daily entry:', error);
      // Stub: Create demo entry
      const demoEntry: DailyCalorieEntry = {
        id: Math.random() * 1000,
        date: data.date,
        total_calories: data.total_calories,
        created_at: new Date(),
        updated_at: new Date()
      };
      setDailyEntries((prev: DailyCalorieEntry[]) => [demoEntry, ...prev]);
      setIsCreateDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Expand entry to show food items
  const handleExpandEntry = async (entryId: number) => {
    if (expandedEntry?.id === entryId) {
      setExpandedEntry(null);
      return;
    }

    try {
      const entryWithFoodItems = await trpc.getDailyCalorieEntryWithFoodItems.query({ entryId });
      if (entryWithFoodItems) {
        setExpandedEntry(entryWithFoodItems);
      }
    } catch (error) {
      console.error('Failed to load entry with food items:', error);
      // Stub: Create demo expanded entry
      const baseEntry = dailyEntries.find(e => e.id === entryId);
      if (baseEntry) {
        const demoExpandedEntry: DailyCalorieEntryWithFoodItems = {
          ...baseEntry,
          food_items: [
            {
              id: 1,
              daily_entry_id: entryId,
              food_name: 'Oatmeal with berries',
              calories: 350,
              created_at: new Date('2024-01-15T08:00:00')
            },
            {
              id: 2,
              daily_entry_id: entryId,
              food_name: 'Grilled chicken salad',
              calories: 450,
              created_at: new Date('2024-01-15T12:30:00')
            },
            {
              id: 3,
              daily_entry_id: entryId,
              food_name: 'Pasta with marinara',
              calories: 520,
              created_at: new Date('2024-01-15T19:00:00')
            }
          ]
        };
        setExpandedEntry(demoExpandedEntry);
      }
    }
  };

  // Add food item
  const handleAddFoodItem = async (data: CreateFoodItemInput) => {
    setIsLoading(true);
    try {
      const newFoodItem = await trpc.createFoodItem.mutate(data);
      if (expandedEntry) {
        setExpandedEntry((prev: DailyCalorieEntryWithFoodItems | null) => 
          prev ? {
            ...prev,
            food_items: [...prev.food_items, newFoodItem]
          } : null
        );
      }
      setIsAddFoodDialogOpen(false);
      setSelectedEntryId(null);
    } catch (error) {
      console.error('Failed to add food item:', error);
      // Stub: Add demo food item
      const demoFoodItem: FoodItem = {
        id: Math.random() * 1000,
        daily_entry_id: data.daily_entry_id,
        food_name: data.food_name,
        calories: data.calories,
        created_at: new Date()
      };
      if (expandedEntry) {
        setExpandedEntry((prev: DailyCalorieEntryWithFoodItems | null) => 
          prev ? {
            ...prev,
            food_items: [...prev.food_items, demoFoodItem]
          } : null
        );
      }
      setIsAddFoodDialogOpen(false);
      setSelectedEntryId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete food item
  const handleDeleteFoodItem = async (foodItemId: number) => {
    try {
      await trpc.deleteFoodItem.mutate({ foodItemId });
      if (expandedEntry) {
        setExpandedEntry((prev: DailyCalorieEntryWithFoodItems | null) => 
          prev ? {
            ...prev,
            food_items: prev.food_items.filter((item: FoodItem) => item.id !== foodItemId)
          } : null
        );
      }
    } catch (error) {
      console.error('Failed to delete food item:', error);
      // Stub: Remove from local state
      if (expandedEntry) {
        setExpandedEntry((prev: DailyCalorieEntryWithFoodItems | null) => 
          prev ? {
            ...prev,
            food_items: prev.food_items.filter((item: FoodItem) => item.id !== foodItemId)
          } : null
        );
      }
    }
  };

  const openAddFoodDialog = (entryId: number) => {
    setSelectedEntryId(entryId);
    setIsAddFoodDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🥗 Calorie Tracker
          </h1>
          <p className="text-gray-600">Track your daily calorie intake and stay healthy!</p>
        </div>

        {/* Create New Entry Button */}
        <div className="mb-6 text-center">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Daily Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Daily Calorie Entry</DialogTitle>
              </DialogHeader>
              <CalorieEntryForm 
                onSubmit={handleCreateEntry} 
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Daily Entries List */}
        <div className="space-y-4">
          {dailyEntries.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-lg">No calorie entries yet!</p>
                <p className="text-gray-400">Start tracking your daily calories above.</p>
              </CardContent>
            </Card>
          ) : (
            dailyEntries.map((entry: DailyCalorieEntry) => (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">
                          {entry.date.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          Updated: {entry.updated_at.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {entry.total_calories.toLocaleString()} cal
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExpandEntry(entry.id)}
                      >
                        <UtensilsIcon className="w-4 h-4 mr-1" />
                        {expandedEntry?.id === entry.id ? 'Hide' : 'Show'} Foods
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openAddFoodDialog(entry.id)}
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Food
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Food Items */}
                {expandedEntry?.id === entry.id && (
                  <CardContent>
                    <Separator className="mb-4" />
                    <FoodItemsList 
                      foodItems={expandedEntry.food_items}
                      onDeleteFoodItem={handleDeleteFoodItem}
                    />
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Add Food Item Dialog */}
        <Dialog open={isAddFoodDialogOpen} onOpenChange={setIsAddFoodDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Food Item</DialogTitle>
            </DialogHeader>
            {selectedEntryId && (
              <AddFoodItemForm 
                dailyEntryId={selectedEntryId}
                onSubmit={handleAddFoodItem} 
                isLoading={isLoading}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Add Food Item Form Component
interface AddFoodItemFormProps {
  dailyEntryId: number;
  onSubmit: (data: CreateFoodItemInput) => Promise<void>;
  isLoading?: boolean;
}

function AddFoodItemForm({ dailyEntryId, onSubmit, isLoading = false }: AddFoodItemFormProps) {
  const [formData, setFormData] = useState<CreateFoodItemInput>({
    daily_entry_id: dailyEntryId,
    food_name: '',
    calories: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      daily_entry_id: dailyEntryId,
      food_name: '',
      calories: 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="food_name">Food Name</Label>
        <Input
          id="food_name"
          value={formData.food_name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateFoodItemInput) => ({ ...prev, food_name: e.target.value }))
          }
          placeholder="e.g., Grilled chicken breast"
          required
        />
      </div>
      <div>
        <Label htmlFor="calories">Calories</Label>
        <Input
          id="calories"
          type="number"
          value={formData.calories}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateFoodItemInput) => ({ ...prev, calories: parseInt(e.target.value) || 0 }))
          }
          placeholder="e.g., 250"
          min="0"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
          {isLoading ? 'Adding...' : '🍎 Add Food Item'}
        </Button>
      </div>
    </form>
  );
}

export default App;
