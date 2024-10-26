"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
// import { DatePickerWithRange } from "@/components/date-range-picker";
import { Calendar as CalendarIcon, Edit, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// Mock data for demonstration
const mockStats = [
  {
    id: 1,
    name: "Body Weight",
    description: "Daily body weight measurement",
    label: "kg",
    items: [
      { id: 1, date: "2023-06-01", value: 70, note: "After breakfast" },
      { id: 2, date: "2023-06-02", value: 69.5, note: "Before breakfast" },
      { id: 3, date: "2023-06-03", value: 69.8, note: "After workout" },
      { id: 4, date: "2023-06-04", value: 69.2, note: "Normal day" },
      { id: 5, date: "2023-06-05", value: 69.6, note: "After big dinner" }
    ]
  },
  {
    id: 2,
    name: "Supplement Intake",
    description: "Number of supplement tablets taken daily",
    label: "tablets",
    items: [
      { id: 6, date: "2023-06-01", value: 2, note: "Morning and evening" },
      { id: 7, date: "2023-06-02", value: 3, note: "Added afternoon dose" },
      { id: 8, date: "2023-06-03", value: 2, note: "Skipped afternoon" },
      { id: 9, date: "2023-06-04", value: 3, note: "All doses taken" },
      { id: 10, date: "2023-06-05", value: 2, note: "Skipped evening dose" }
    ]
  }
];

export default function StatsPage() {
  const [stats, setStats] = useState(mockStats);
  const [newItemValue, setNewItemValue] = useState("");
  const [newItemNote, setNewItemNote] = useState("");
  const [newItemDate, setNewItemDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<
    | {
        from: Date;
        to: Date;
      }
    | undefined
  >({
    from: new Date(2023, 5, 1),
    to: new Date(2023, 5, 5)
  });
  const [editingItem, setEditingItem] = useState<{
    statId: number;
    itemId: number;
  } | null>(null);

  const handleNewItemSubmit = (statId: number) => {
    if (!newItemDate) return;
    const newItem = {
      id: Date.now(),
      date: format(newItemDate, "yyyy-MM-dd"),
      value: parseFloat(newItemValue),
      note: newItemNote
    };
    setStats((prevStats) =>
      prevStats.map((stat) =>
        stat.id === statId ? { ...stat, items: [...stat.items, newItem] } : stat
      )
    );
    resetForm();
  };

  const handleEditItem = (statId: number, itemId: number) => {
    const stat = stats.find((s) => s.id === statId);
    const item = stat?.items.find((i) => i.id === itemId);
    if (item) {
      setNewItemValue(item.value.toString());
      setNewItemNote(item.note);
      setNewItemDate(new Date(item.date));
      setEditingItem({ statId, itemId });
    }
  };

  const handleUpdateItem = (statId: number) => {
    if (!newItemDate || !editingItem) return;
    setStats((prevStats) =>
      prevStats.map((stat) =>
        stat.id === statId
          ? {
              ...stat,
              items: stat.items.map((item) =>
                item.id === editingItem.itemId
                  ? {
                      ...item,
                      date: format(newItemDate, "yyyy-MM-dd"),
                      value: parseFloat(newItemValue),
                      note: newItemNote
                    }
                  : item
              )
            }
          : stat
      )
    );
    resetForm();
  };

  const handleDeleteItem = (statId: number, itemId: number) => {
    setStats((prevStats) =>
      prevStats.map((stat) =>
        stat.id === statId
          ? {
              ...stat,
              items: stat.items.filter((item) => item.id !== itemId)
            }
          : stat
      )
    );
  };

  const resetForm = () => {
    setNewItemValue("");
    setNewItemNote("");
    setNewItemDate(undefined);
    setEditingItem(null);
  };

  const filterItemsByDateRange = (items: (typeof mockStats)[0]["items"]) => {
    if (!dateRange) return items;
    return items.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= dateRange.from && itemDate <= dateRange.to;
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Stats</h1>

      {stats.map((stat) => (
        <Card key={stat.id} className="w-full">
          <CardHeader>
            <CardTitle>{stat.name}</CardTitle>
            <CardDescription>{stat.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {stat.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex justify-between items-center p-2 rounded-md",
                    editingItem && editingItem.itemId === item.id
                      ? "bg-secondary-foreground/20"
                      : "bg-secondary"
                  )}
                >
                  <span className="w-1/4">{item.date}</span>
                  <span className="w-1/4 text-center font-bold">
                    {item.value} {stat.label}
                  </span>
                  <span className="w-1/3 text-right text-sm text-muted-foreground">
                    {item.note}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditItem(stat.id, item.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete stat for {item.date}
                            ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-black text-white hover:bg-black/90">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteItem(stat.id, item.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingItem
                  ? handleUpdateItem(stat.id)
                  : handleNewItemSubmit(stat.id);
              }}
              className="space-y-2"
            >
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <Label htmlFor={`new-item-${stat.id}`}>New Item Value</Label>
                  <Input
                    id={`new-item-${stat.id}`}
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    placeholder={`Add new stat (${stat.label})`}
                  />
                </div>
                <div className="flex-grow">
                  <Label htmlFor={`new-item-note-${stat.id}`}>Note</Label>
                  <Input
                    id={`new-item-note-${stat.id}`}
                    value={newItemNote}
                    onChange={(e) => setNewItemNote(e.target.value)}
                    placeholder="Note"
                  />
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newItemDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newItemDate ? (
                        format(newItemDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newItemDate}
                      onSelect={setNewItemDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
                {editingItem && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            <div className="space-y-2">
              <Label>Select a date range</Label>
              {/* <DatePickerWithRange date={dateRange} setDate={setDateRange} /> */}
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filterItemsByDateRange(stat.items)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
