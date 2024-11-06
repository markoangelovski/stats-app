import { ChangeEvent, FormEvent, useState } from "react";
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
import {
  Calendar as CalendarIcon,
  Edit,
  EllipsisVertical,
  LogOut,
  Settings,
  Trash2
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { capitalize, cn, withTrend } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip as SCNTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

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

export interface StatItemWithTrend extends StatItem {
  trend: number;
}

const StatCard = ({
  stat,
  onNewItemSubmit,
  onEditItem,
  onDeleteItem
}: StatCardProps) => {
  const [items, setItems] = useState<StatItemWithTrend[]>(
    withTrend(stat.statItems).data
  );
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
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const [isTrend, setIsTrend] = useState(false); // Added loading state

  const handleNewItemSubmit = async () => {
    if (!newItemDate) return;

    const newItemData = {
      dateOfEntry: newItemDate,
      numericValue: parseFloat(newItemValue.replace(",", ".")),
      note: newItemNote
    };

    await onNewItemSubmit(stat.id, newItemData);

    const result = await getItems(stat.id, dateRange);
    setItems(withTrend(result.data).data);
    resetForm();
  };

  const handleEditItem = async (itemId: string, editBtn: boolean = false) => {
    if (!editingItem || editingItem.itemId !== itemId || editBtn) {
      const item = items.find((i) => i.id === itemId);
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
      const result = await getItems(stat.id, dateRange);
      setItems(withTrend(result.data).data);
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
    setIsLoading(true); // Set loading to true
    const result = await getItems(stat.id, dateRange);

    if (!result.hasErrors) {
      setItems(withTrend(result.data).data as StatItemWithTrend[]);
    }
    setIsLoading(false); // Set loading to false after fetching
  };

  const numericValues = items.map((item) => item.numericValue);

  const total = numericValues.length;
  const totalPositives = numericValues.reduce(
    (acc, val) => (val > 0 ? acc + 1 : acc),
    0
  );
  const sum = numericValues.reduce((sum, val) => sum + val, 0);
  const min = Math.min(...numericValues.filter((val) => val > 0));
  const max = Math.max(...numericValues.filter((val) => val > 0));
  const avg = total > 0 ? sum / totalPositives : 0;
  const { slope, intercept, median, avgMode, modes } = withTrend(items);

  // Capitalize the first letter of a string

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
                {format(item.dateOfEntry, "dd.MM.yy")}
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
                  onClick={() => handleEditItem(item.id, true)}
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

            <Button
              type="button"
              disabled={isButtonDisabled}
              variant="destructive"
              onClick={resetForm}
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
          {[
            "Total",
            "Min",
            "Max",
            "Avg",
            "Slope (Trend)",
            "Intercept (Trend)",
            "Median",
            "Mode (avg)"
          ].map((label) => (
            <Card key={label} className="w-full">
              <CardHeader>
                <CardTitle>{label}:</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {label === "Total" ? (
                  total
                ) : label === "Min" ? (
                  min
                ) : label === "Max" ? (
                  max
                ) : label === "Avg" ? (
                  parseFloat(avg.toFixed(2))
                ) : label === "Slope (Trend)" ? (
                  slope
                ) : label === "Intercept (Trend)" ? (
                  intercept
                ) : label === "Median" ? (
                  median
                ) : (
                  <TooltipProvider>
                    <SCNTooltip>
                      <TooltipTrigger>{avgMode}</TooltipTrigger>
                      <TooltipContent>
                        <p>{modes.join(", ")}</p>
                      </TooltipContent>
                    </SCNTooltip>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:flex md:space-x-2 space-y-2 md:space-y-0">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <div className="flex space-x-2 justify-between w-full">
            <Button onClick={handleGetItems} disabled={isLoading}>
              {isLoading ? "Fetching..." : "Submit"}
            </Button>

            <div className="flex items-center space-x-2">
              <Switch
                id="trend"
                checked={isTrend}
                onCheckedChange={() => setIsTrend(!isTrend)}
              />
              <Label htmlFor="trend" className="cursor-pointer">
                Display Trend
              </Label>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={items.map((item) => ({
                ...item,
                value: item.numericValue ? item.numericValue : null,
                trend: item.numericValue ? item.trend : null
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dateOfEntry"
                tickFormatter={(date) => format(new Date(date), "dd.MM.yy")}
              />
              <YAxis domain={["auto"]} />
              <Tooltip
                labelStyle={{ color: "black" }}
                labelFormatter={(label) =>
                  `Date: ${format(new Date(label), "dd.MM.yy")}`
                }
                formatter={(value, name) => [
                  `${value} ${stat.measurementLabel}`,
                  name
                ]}
              />

              <Legend
                formatter={(value) =>
                  value === "value" ? stat.name : capitalize(value)
                }
              />
              <Line
                connectNulls
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
              />
              {isTrend && (
                <Line
                  connectNulls
                  type="monotone"
                  dataKey="trend"
                  stroke="#008000"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
