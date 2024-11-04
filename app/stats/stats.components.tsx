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
import { Calendar as CalendarIcon, Edit, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth } from "date-fns";
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
import { StatWithItems, StatItem, getItems } from "@/actions";
import { StatItemSchema } from "@/schemas";
import * as z from "zod";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface StatCardProps {
  stat: StatWithItems;
  onNewItemSubmit: (
    statId: string,
    newItemData: z.infer<typeof StatItemSchema>
  ) => Promise<void>;
  onEditItem: (
    statId: string,
    itemId: string,
    updatedData: {
      dateOfEntry: Date;
      numericValue: number;
      note: string;
    }
  ) => Promise<void>;
  onDeleteItem: (statId: string, itemId: string) => Promise<void>;
}

const StatCard = ({
  stat,
  onNewItemSubmit,
  onEditItem,
  onDeleteItem
}: StatCardProps) => {
  const [items, setItems] = useState<StatItem[]>(stat.statItems);
  const [newItemValue, setNewItemValue] = useState("");
  const [newItemNote, setNewItemNote] = useState("");
  const [newItemDate, setNewItemDate] = useState<Date>();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    statId: string;
    itemId: string;
    originalValue: string;
    originalNote: string;
    originalDate: Date;
  } | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const handleNewItemSubmit = async () => {
    if (!newItemDate) return;

    const newItemData = {
      dateOfEntry: newItemDate,
      numericValue: parseFloat(newItemValue.replace(",", ".")),
      note: newItemNote
    };

    await onNewItemSubmit(stat.id, newItemData);

    const result = await getItems(stat.id, dateRange);
    setItems(result.data);
    resetForm();
  };

  const handleEditItem = async (itemId: string) => {
    if (!editingItem || editingItem.itemId !== itemId) {
      const item = stat.statItems.find((i) => i.id === itemId);
      if (item) {
        setNewItemValue(item.numericValue.toString());
        setNewItemNote(item.note || "");
        setNewItemDate(new Date(item.dateOfEntry));
        setEditingItem({
          itemId,
          statId: stat.id,
          originalValue: item.numericValue.toString(),
          originalNote: item.note || "",
          originalDate: new Date(item.dateOfEntry)
        });
      }
    } else {
      const updatedData = {
        dateOfEntry: newItemDate!,
        numericValue: parseFloat(newItemValue.replace(",", ".")),
        note: newItemNote
      };
      await onEditItem(stat.id, itemId, updatedData);
      resetForm();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    await onDeleteItem(stat.id, itemId);
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    resetForm();
  };

  const resetForm = () => {
    setNewItemValue("");
    setNewItemNote("");
    setNewItemDate(undefined);
    setEditingItem(null);
    setIsPopoverOpen(false);
  };

  const isButtonDisabled = !(
    newItemValue ||
    newItemNote ||
    newItemDate ||
    editingItem
  );

  const handleGetItems = async () => {
    const result = await getItems(stat.id, dateRange);

    if (!result.hasErrors) {
      setItems(result.data);
    }
  };

  return (
    <Card key={stat.id} className="w-full">
      <CardHeader>
        <CardTitle>{stat.name}</CardTitle>
        <CardDescription>{stat.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {items.map((item: StatItem) => (
            <div
              key={item.id}
              className={cn(
                "flex justify-between items-center p-2 rounded-md",
                editingItem && editingItem.itemId === item.id
                  ? "bg-secondary-foreground/20"
                  : "bg-secondary"
              )}
            >
              <span className="w-1/4">
                {format(item.dateOfEntry, "yyyy-MM-dd")}
              </span>
              <span className="w-1/4 text-center font-bold">
                {item.numericValue} {stat.measurementLabel}
              </span>
              <span className="w-1/3 text-right text-sm text-muted-foreground">
                {item.note}
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditItem(item.id)}
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
                        Are you sure you want to delete stat for{" "}
                        {format(item.dateOfEntry, "yyyy-MM-dd")}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-black text-white hover:bg-black/90">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeleteItem(item.id)}
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
              ? handleEditItem(editingItem.itemId)
              : handleNewItemSubmit();
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
                placeholder={`Add new stat (${stat.measurementLabel})`}
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
            <Popover open={isPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  onClick={() => setIsPopoverOpen(true)}
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
                  onSelect={(date) => {
                    setNewItemDate(date);
                    setIsPopoverOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" disabled={isButtonDisabled}>
              {editingItem ? "Edit" : "Add"}
            </Button>
          </div>
        </form>

        <div className="flex space-x-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button onClick={handleGetItems}>Submit</Button>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dateOfEntry"
                tickFormatter={(date) => format(new Date(date), "yyyy-MM-dd")}
              />
              <YAxis domain={["dataMin / 2", "auto"]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="numericValue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
