"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  getStatsWithItems,
  StatWithItems,
  StatItem,
  Resp,
  newStatItem as newStatItemAction,
  updateStatItem as updateStatItemAction,
  deleteStatItem as deleteStatItemAction
} from "@/actions";
import StatCard from "./stats.components";
import * as z from "zod";
import { StatItemSchema } from "@/schemas";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsPage() {
  const [stats, setStats] = useState<StatWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  const handleNewItemSubmit = async (
    statId: string,
    newItemData: z.infer<typeof StatItemSchema>
  ) => {
    try {
      const validatedData = StatItemSchema.parse(newItemData);
      const response: Resp<StatItem[]> = await newStatItemAction(
        statId,
        validatedData
      );
      if (response.hasErrors) {
        toast({ variant: "destructive", title: response.message });
      } else {
        setStats((prevStats) =>
          prevStats.map((stat) =>
            stat.id === statId
              ? { ...stat, statItems: [...stat.statItems, ...response.data] }
              : stat
          )
        );
        toast({ title: response.message });
      }
    } catch (error) {
      console.error("Error submitting new item:", error);
      toast({
        title: "Error submitting new item",
        variant: "destructive"
      });
    }
  };

  const handleEditItem = async (
    statId: string,
    itemId: string,
    updatedData: z.infer<typeof StatItemSchema>
  ) => {
    try {
      const validatedData = StatItemSchema.parse(updatedData);
      const response: Resp<StatItem[]> = await updateStatItemAction(
        statId,
        itemId,
        validatedData
      );
      if (response.hasErrors) {
        toast({ variant: "destructive", title: response.message });
      } else {
        setStats((prevStats) =>
          prevStats.map((stat) =>
            stat.id === statId
              ? {
                  ...stat,
                  statItems: stat.statItems.map((item) =>
                    item.id === itemId ? response.data[0] : item
                  )
                }
              : stat
          )
        );
        toast({ title: response.message });
      }
    } catch (error) {
      console.error("Error updating stat item:", error);
      toast({ title: "Error updating stat item", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (statId: string, itemId: string) => {
    try {
      const response: Resp<StatItem[]> = await deleteStatItemAction(
        statId,
        itemId
      );
      if (response.hasErrors) {
        toast({ variant: "destructive", title: response.message });
      } else {
        setStats((prevStats) =>
          prevStats.map((stat) =>
            stat.id === statId
              ? {
                  ...stat,
                  statItems: stat.statItems.filter((item) => item.id !== itemId)
                }
              : stat
          )
        );
        toast({ title: response.message });
      }
    } catch (error) {
      console.error("Error deleting stat item:", error);
      toast({ title: "Error deleting stat item", variant: "destructive" });
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const response: Resp<StatWithItems[]> = await getStatsWithItems();
      if (response.hasErrors) {
        toast({ variant: "destructive", title: response.message });
      } else {
        setStats(response.data);
      }
      setIsLoading(false);
    })();
  }, [toast]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* <h1 className="text-3xl font-bold">Stats</h1> */}
      {isLoading ? (
        <>
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </>
      ) : (
        stats.map((stat) => (
          <StatCard
            key={stat.id}
            stat={stat}
            onNewItemSubmit={handleNewItemSubmit}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        ))
      )}
    </div>
  );
}
